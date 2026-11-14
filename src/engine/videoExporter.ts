import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from 'webm-muxer';
import JSZip from 'jszip';
import type { ExportFormat, RenderProgress } from '../types';

export interface ExportOptions {
  canvas: HTMLCanvasElement;
  renderFrame: (t: number, frame: number) => void | Promise<void>;
  duration: number; // in seconds
  fps: number;
  width: number;
  height: number;
  format: ExportFormat;
  bitrateMbps?: number;
  onProgress?: (progress: RenderProgress) => void;
  isCancelled?: () => boolean;
}

export interface ExportResult {
  blob: Blob;
  mimeType: string;
  filename: string;
  durationSeconds: number;
  totalFrames: number;
}

/**
 * Checks if WebCodecs VideoEncoder is available in the current browser.
 */
export function isWebCodecsSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.VideoEncoder === 'function';
}

/**
 * Renders the animation frame-by-frame and exports to MP4, WebM (Alpha), or PNG Sequence ZIP.
 */
export async function exportVideo(options: ExportOptions): Promise<ExportResult> {
  const {
    canvas,
    renderFrame,
    duration,
    fps,
    width,
    height,
    format,
    bitrateMbps = 12,
    onProgress,
    isCancelled = () => false
  } = options;

  const totalFrames = Math.max(1, Math.round(duration * fps));
  const startTime = performance.now();

  // 1. PNG SEQUENCE ZIP EXPORT (Lossless Alpha transparent)
  if (format === 'png_sequence') {
    const zip = new JSZip();
    const folder = zip.folder('sequence') || zip;

    for (let frame = 0; frame < totalFrames; frame++) {
      if (isCancelled()) {
        throw new Error('Proses render dibatalkan oleh pengguna.');
      }

      const t = frame / fps;
      await renderFrame(t, frame);

      // Convert canvas to PNG Blob
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const paddedIndex = String(frame).padStart(5, '0');
        folder.file(`frame_${paddedIndex}.png`, blob);
      }

      if (onProgress) {
        const elapsed = (performance.now() - startTime) / 1000;
        const currentFps = (frame + 1) / Math.max(0.001, elapsed);
        const eta = (totalFrames - (frame + 1)) / Math.max(0.001, currentFps);
        onProgress({
          currentFrame: frame + 1,
          totalFrames,
          percentage: Math.round(((frame + 1) / totalFrames) * 100),
          fps: Math.round(currentFps),
          etaSeconds: Math.max(0, Math.round(eta))
        });
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return {
      blob: zipBlob,
      mimeType: 'application/zip',
      filename: `motion_sequence_${width}x${height}_${Date.now()}.zip`,
      durationSeconds: duration,
      totalFrames
    };
  }

  // 2. VIDEO ENCODING VIA WEBCODECS
  if (!isWebCodecsSupported()) {
    throw new Error('Browser Anda belum mendukung WebCodecs API. Silakan gunakan Google Chrome, Microsoft Edge, atau browser berbasis Chromium terbaru.');
  }

  let muxer: Mp4Muxer<Mp4Target> | WebmMuxer<WebmTarget>;
  let videoCodec: string;
  let mimeType: string;
  let extension: string;

  if (format === 'webm_alpha') {
    muxer = new WebmMuxer({
      target: new WebmTarget(),
      video: {
        codec: 'V_VP9',
        width,
        height,
        alpha: true
      }
    });
    videoCodec = 'vp09.00.10.08';
    mimeType = 'video/webm';
    extension = 'webm';
  } else {
    // Default MP4 (avc / H.264)
    muxer = new Mp4Muxer({
      target: new Mp4Target(),
      video: {
        codec: 'avc',
        width,
        height
      },
      fastStart: 'in-memory'
    });
    videoCodec = 'avc1.640028'; // H.264 High Profile
    mimeType = 'video/mp4';
    extension = 'mp4';
  }

  // Check codec support, fallback if needed
  try {
    const isSupported = await VideoEncoder.isConfigSupported({
      codec: videoCodec,
      width,
      height,
      bitrate: bitrateMbps * 1_000_000,
      framerate: fps
    });
    if (!isSupported.supported && format === 'mp4') {
      videoCodec = 'avc1.42001f'; // Baseline profile fallback
    }
  } catch {
    // Continue with standard config
  }

  let encodeError: Error | null = null;

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      (muxer as { addVideoChunk: (c: EncodedVideoChunk, m?: EncodedVideoChunkMetadata) => void }).addVideoChunk(chunk, meta);
    },
    error: (e) => {
      encodeError = e;
      console.error('VideoEncoder error:', e);
    }
  });

  videoEncoder.configure({
    codec: videoCodec,
    width,
    height,
    bitrate: bitrateMbps * 1_000_000,
    framerate: fps,
    ...(format === 'webm_alpha' ? { alpha: 'keep' } : {})
  });

  const frameDurationUs = Math.round(1_000_000 / fps);

  for (let frame = 0; frame < totalFrames; frame++) {
    if (isCancelled()) {
      try {
        videoEncoder.close();
      } catch {}
      throw new Error('Proses render dibatalkan.');
    }
    if (encodeError) {
      throw encodeError;
    }

    const t = frame / fps;
    await renderFrame(t, frame);

    const timestampUs = Math.round(frame * frameDurationUs);

    // Create VideoFrame from current canvas state
    const videoFrame = new VideoFrame(canvas, {
      timestamp: timestampUs,
      duration: frameDurationUs
    });

    const isKeyFrame = frame % (fps * 2) === 0;
    videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
    videoFrame.close();

    // Prevent buffer bloat
    if (videoEncoder.encodeQueueSize > 5) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    if (onProgress) {
      const elapsed = (performance.now() - startTime) / 1000;
      const currentFps = (frame + 1) / Math.max(0.001, elapsed);
      const eta = (totalFrames - (frame + 1)) / Math.max(0.001, currentFps);
      onProgress({
        currentFrame: frame + 1,
        totalFrames,
        percentage: Math.round(((frame + 1) / totalFrames) * 100),
        fps: Math.round(currentFps),
        etaSeconds: Math.max(0, Math.round(eta))
      });
    }
  }

  await videoEncoder.flush();
  videoEncoder.close();

  muxer.finalize();
  const buffer = muxer.target.buffer;
  const resultBlob = new Blob([buffer], { type: mimeType });

  return {
    blob: resultBlob,
    mimeType,
    filename: `motion_render_${width}x${height}_${Date.now()}.${extension}`,
    durationSeconds: duration,
    totalFrames
  };
}
