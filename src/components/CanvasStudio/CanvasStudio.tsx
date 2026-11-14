import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Download,
  Plus,
  Grid,
  Settings2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { CANVAS_PRESETS } from '../../presets/canvasPresets';
import { compileCanvasCode } from '../../engine/canvasCompiler';
import type { CanvasDrawFunction } from '../../engine/canvasCompiler';
import { exportVideo } from '../../engine/videoExporter';
import { ExportModal } from '../ExportModal';
import type { AspectRatio, ResolutionPreset, ExportFormat, RenderProgress, QueueItem } from '../../types';

interface CanvasStudioProps {
  onAddToQueue: (item: Omit<QueueItem, 'id' | 'status' | 'progress'>) => void;
  externalCode?: string | null;
}

const RESOLUTION_MAP: Record<ResolutionPreset, Record<AspectRatio, { width: number; height: number }>> = {
  '720p': {
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '1:1': { width: 720, height: 720 },
    '4:3': { width: 960, height: 720 },
    '21:9': { width: 1680, height: 720 }
  },
  '1080p': {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:3': { width: 1440, height: 1080 },
    '21:9': { width: 2520, height: 1080 }
  },
  '2K': {
    '16:9': { width: 2560, height: 1440 },
    '9:16': { width: 1440, height: 2560 },
    '1:1': { width: 1440, height: 1440 },
    '4:3': { width: 1920, height: 1440 },
    '21:9': { width: 3440, height: 1440 }
  },
  '4K': {
    '16:9': { width: 3840, height: 2160 },
    '9:16': { width: 2160, height: 3840 },
    '1:1': { width: 2160, height: 2160 },
    '4:3': { width: 2880, height: 2160 },
    '21:9': { width: 5040, height: 2160 }
  }
};

export const CanvasStudio: React.FC<CanvasStudioProps> = ({ onAddToQueue, externalCode }) => {
  const [selectedPreset, setSelectedPreset] = useState(CANVAS_PRESETS[0].id);
  const [code, setCode] = useState(CANVAS_PRESETS[0].code);
  const [duration, setDuration] = useState(CANVAS_PRESETS[0].defaultDuration || 5);
  const [fps, setFps] = useState<number>(30);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<ResolutionPreset>('1080p');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('mp4');
  const [bitrateMbps, setBitrateMbps] = useState(16);

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCheckerboard, setShowCheckerboard] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Render modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'completed' | 'error'>('idle');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState('');
  const isCancelledRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compiledFnRef = useRef<CanvasDrawFunction | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const currentDims = RESOLUTION_MAP[resolution][aspectRatio];

  useEffect(() => {
    if (externalCode) {
      setCode(externalCode);
      setCurrentTime(0);
    }
  }, [externalCode]);

  // Compile code on change
  useEffect(() => {
    const res = compileCanvasCode(code);
    if (res.error) {
      setCompileError(res.error);
      compiledFnRef.current = null;
    } else {
      setCompileError(null);
      compiledFnRef.current = res.fn;
    }
  }, [code]);

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset.id);
      setCode(preset.code);
      if (preset.defaultDuration) {
        setDuration(preset.defaultDuration);
      }
      setCurrentTime(0);
    }
  };

  // Draw a specific frame to canvas
  const drawAtTime = useCallback(
    (timeInSeconds: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = currentDims;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const frameNumber = Math.round(timeInSeconds * fps);
      const drawFn = compiledFnRef.current;

      if (drawFn) {
        try {
          ctx.save();
          drawFn(ctx, width, height, timeInSeconds, frameNumber, duration, fps);
          ctx.restore();
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          setCompileError(`Runtime Error saat render: ${msg}`);
        }
      } else {
        // Fallback placeholder
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#64748b';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Menunggu kode valid...', width / 2, height / 2);
      }
    },
    [currentDims, duration, fps]
  );

  // Playback loop
  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;

      if (isPlaying) {
        const delta = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          let next = prev + delta;
          if (next >= duration) {
            next = 0; // loop
          }
          return next;
        });
      }

      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Update canvas rendering whenever currentTime or dependencies change
  useEffect(() => {
    drawAtTime(currentTime);
  }, [currentTime, drawAtTime]);

  // Handle Export Video
  const handleStartExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !compiledFnRef.current) {
      setRenderError('Kode tidak dapat diekspor karena terdapat error sintaks.');
      setIsModalOpen(true);
      setRenderStatus('error');
      return;
    }

    setIsModalOpen(true);
    setRenderStatus('rendering');
    setRenderProgress(null);
    setRenderError(null);
    setResultBlob(null);
    isCancelledRef.current = false;

    // Pause player during export
    setIsPlaying(false);

    try {
      const { width, height } = currentDims;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width;
      exportCanvas.height = height;
      const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });

      if (!exportCtx) throw new Error('Gagal menginisialisasi export canvas context');

      const drawFn = compiledFnRef.current;

      const res = await exportVideo({
        canvas: exportCanvas,
        renderFrame: (t, frame) => {
          exportCtx.save();
          drawFn(exportCtx, width, height, t, frame, duration, fps);
          exportCtx.restore();
        },
        duration,
        fps,
        width,
        height,
        format: exportFormat,
        bitrateMbps,
        onProgress: (p) => setRenderProgress(p),
        isCancelled: () => isCancelledRef.current
      });

      setResultBlob(res.blob);
      setResultFilename(res.filename);
      setRenderStatus('completed');
    } catch (err: unknown) {
      if (!isCancelledRef.current) {
        setRenderStatus('error');
        setRenderError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleAddToQueue = () => {
    const currentPreset = CANVAS_PRESETS.find((p) => p.id === selectedPreset);
    onAddToQueue({
      name: currentPreset ? currentPreset.name : `Canvas Motion (${aspectRatio})`,
      type: 'canvas',
      code,
      duration,
      fps,
      width: currentDims.width,
      height: currentDims.height,
      format: exportFormat
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preset Koleksi:</span>
          <select
            value={selectedPreset}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {CANVAS_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.category}]
              </option>
            ))}
          </select>
        </div>

        {/* Dimension & Aspect Ratio Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['16:9', '9:16', '1:1', '4:3'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  aspectRatio === ratio
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as ResolutionPreset)}
            className="bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700"
          >
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="2K">2K Quad HD</option>
            <option value="4K">4K Ultra HD</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span>{currentDims.width}</span>
            <span>×</span>
            <span>{currentDims.height}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Editor, Right Live Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Code Editor */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                JavaScript Canvas Code Editor
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                title="Salin Kode"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Syntax Error Notice */}
          {compileError && (
            <div className="p-3 bg-rose-950/50 border-b border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="break-all">{compileError}</span>
            </div>
          )}

          {/* Text Area */}
          <div className="relative flex-1 min-h-[480px]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 font-mono text-xs leading-relaxed bg-slate-950 text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              placeholder="Ketik fungsi: function draw(ctx, width, height, t, frame, duration, fps) { ... }"
            />
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Signature: <code>draw(ctx, width, height, t, frame, duration, fps)</code></span>
            <span>{code.split('\n').length} Baris Kode</span>
          </div>
        </div>

        {/* RIGHT: Canvas Player & Timeline */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Canvas Viewport */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex items-center justify-center min-h-[420px]">
            {/* Background Checkerboard Toggle */}
            <div
              className={`absolute inset-0 transition-opacity ${
                showCheckerboard
                  ? 'opacity-100 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]'
                  : 'bg-slate-950'
              }`}
            />

            {/* Canvas Frame */}
            <div className="relative max-w-full max-h-[440px] p-2 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[420px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800/80"
              />
            </div>

            {/* Canvas Overlay Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setShowCheckerboard(!showCheckerboard)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showCheckerboard ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Latar Belakang Transparan / Checkerboard"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timeline & Player Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            {/* Scrubber slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-bold">{currentTime.toFixed(2)}s</span>
                <span>{duration.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.033"
                value={currentTime}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentTime(parseFloat(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime((prev) => Math.max(0, prev - 1 / fps));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Mundur 1 Frame"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime((prev) => Math.min(duration, prev + 1 / fps));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Maju 1 Frame"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Kembali ke Frame 0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Duration and FPS Settings */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Durasi:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 5))}
                    className="w-14 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-center text-white"
                  />
                  <span className="text-xs text-slate-500">detik</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">FPS:</span>
                  <select
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-900/40 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  <span>Pengaturan Ekspor Video</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Didukung WebCodecs GPU acceleration untuk render deterministik.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="bg-slate-950 text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700"
                >
                  <option value="mp4">MP4 Video (H.264 Microstock)</option>
                  <option value="webm_alpha">WebM (Alpha Transparan 32-bit)</option>
                  <option value="png_sequence">PNG Sequence (ZIP Lossless Alpha)</option>
                </select>
              </div>
            </div>

            {/* Bitrate slider for MP4 */}
            {exportFormat === 'mp4' && (
              <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                <span>Bitrate: {bitrateMbps} Mbps</span>
                <input
                  type="range"
                  min="6"
                  max="40"
                  step="2"
                  value={bitrateMbps}
                  onChange={(e) => setBitrateMbps(parseInt(e.target.value))}
                  className="w-48 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleStartExport}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Render & Unduh Sekarang</span>
              </button>

              <button
                onClick={handleAddToQueue}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Tambah ke Antrean Bulk Render</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Progress Modal */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        progress={renderProgress}
        status={renderStatus}
        errorMessage={renderError}
        resultBlob={resultBlob}
        filename={resultFilename}
        onCancel={() => {
          isCancelledRef.current = true;
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
