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
  FileCode2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { SVG_PRESETS } from '../../presets/svgPresets';
import { compileSvgCode, rasterizeSvgToCanvas } from '../../engine/svgCompiler';
import type { SvgDrawFunction } from '../../engine/svgCompiler';
import { exportVideo } from '../../engine/videoExporter';
import { ExportModal } from '../ExportModal';
import type { AspectRatio, ResolutionPreset, ExportFormat, RenderProgress, QueueItem } from '../../types';

interface SvgStudioProps {
  onAddToQueue: (item: Omit<QueueItem, 'id' | 'status' | 'progress'>) => void;
}

const SVG_DIMENSIONS: Record<ResolutionPreset, Record<AspectRatio, { width: number; height: number }>> = {
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

export const SvgStudio: React.FC<SvgStudioProps> = ({ onAddToQueue }) => {
  const [selectedPreset, setSelectedPreset] = useState(SVG_PRESETS[0].id);
  const [code, setCode] = useState(SVG_PRESETS[0].code);
  const [duration, setDuration] = useState(SVG_PRESETS[0].defaultDuration || 4);
  const [fps, setFps] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [resolution, setResolution] = useState<ResolutionPreset>('1080p');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('webm_alpha');

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Export state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'completed' | 'error'>('idle');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState('');
  const isCancelledRef = useRef(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const compiledFnRef = useRef<SvgDrawFunction | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const currentDims = SVG_DIMENSIONS[resolution][aspectRatio];

  // Compile code
  useEffect(() => {
    const res = compileSvgCode(code);
    if (res.error) {
      setCompileError(res.error);
      compiledFnRef.current = null;
    } else {
      setCompileError(null);
      compiledFnRef.current = res.fn;
    }
  }, [code]);

  const handleSelectPreset = (id: string) => {
    const p = SVG_PRESETS.find((item) => item.id === id);
    if (p) {
      setSelectedPreset(p.id);
      setCode(p.code);
      if (p.defaultDuration) setDuration(p.defaultDuration);
      setCurrentTime(0);
    }
  };

  // Draw frame
  const drawSvgFrame = useCallback(
    (timeInSeconds: number) => {
      const svg = svgRef.current;
      if (!svg) return;

      const progress = (timeInSeconds % duration) / duration;
      const frame = Math.round(timeInSeconds * fps);
      const drawFn = compiledFnRef.current;

      if (drawFn) {
        try {
          drawFn(svg, currentDims.width, currentDims.height, frame, progress);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          setCompileError(`Runtime SVG Error: ${msg}`);
        }
      }
    },
    [currentDims, duration, fps]
  );

  // Player loop
  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;
      if (isPlaying) {
        const delta = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          let next = prev + delta;
          if (next >= duration) next = 0;
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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    drawSvgFrame(currentTime);
  }, [currentTime, drawSvgFrame]);

  // Export video from SVG
  const handleStartExport = async () => {
    const svgEl = svgRef.current;
    if (!svgEl || !compiledFnRef.current) {
      setRenderError('Kode SVG tidak dapat diekspor karena terdapat error.');
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
    setIsPlaying(false);

    try {
      const { width, height } = currentDims;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Gagal menginisialisasi canvas context.');

      // Create a virtual offscreen SVG container for isolated frame rendering
      const offscreenSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      offscreenSvg.setAttribute('width', width.toString());
      offscreenSvg.setAttribute('height', height.toString());
      offscreenSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      const drawFn = compiledFnRef.current;

      const res = await exportVideo({
        canvas,
        renderFrame: async (t, frame) => {
          const progress = (t % duration) / duration;
          drawFn(offscreenSvg, width, height, frame, progress);
          const svgMarkup = new XMLSerializer().serializeToString(offscreenSvg);
          await rasterizeSvgToCanvas(svgMarkup, ctx, width, height);
        },
        duration,
        fps,
        width,
        height,
        format: exportFormat,
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
    const p = SVG_PRESETS.find((item) => item.id === selectedPreset);
    onAddToQueue({
      name: p ? p.name : `SVG Motion (${aspectRatio})`,
      type: 'svg',
      code,
      duration,
      fps,
      width: currentDims.width,
      height: currentDims.height,
      format: exportFormat
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preset SVG Vektor:</span>
          <select
            value={selectedPreset}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700"
          >
            {SVG_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.category}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['1:1', '16:9', '9:16', '4:3'] as AspectRatio[]).map((ratio) => (
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
        </div>
      </div>

      {/* Editor & Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                SVG Motion Script Editor
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          {compileError && (
            <div className="p-3 bg-rose-950/50 border-b border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="break-all">{compileError}</span>
            </div>
          )}

          <div className="relative flex-1 min-h-[480px]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 font-mono text-xs leading-relaxed bg-slate-950 text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              placeholder="function draw(svg, width, height, frame, progress) { ... }"
            />
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
            Signature: <code>draw(svg, width, height, frame, progress)</code>
          </div>
        </div>

        {/* Live SVG Player */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex items-center justify-center min-h-[420px]">
            <div
              className={`absolute inset-0 transition-opacity ${
                showCheckerboard
                  ? 'opacity-100 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]'
                  : 'bg-slate-950'
              }`}
            />

            <div className="relative max-w-full max-h-[440px] p-2 flex items-center justify-center">
              <svg
                ref={svgRef}
                width={currentDims.width}
                height={currentDims.height}
                viewBox={`0 0 ${currentDims.width} ${currentDims.height}`}
                className="max-h-[420px] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800/80"
              />
            </div>

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

          {/* Player controls */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
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

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime((p) => Math.max(0, p - 1 / fps));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime((p) => Math.min(duration, p + 1 / fps));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Durasi:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 4))}
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

          {/* Export card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Ekspor Vektor ke Video Transparan</h4>
                <p className="text-xs text-slate-400">Format Alpha Transparan 32-bit RGBA.</p>
              </div>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="bg-slate-950 text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700"
              >
                <option value="webm_alpha">WebM (Alpha Transparan)</option>
                <option value="mp4">MP4 Video (H.264)</option>
                <option value="png_sequence">PNG Sequence (Lossless ZIP)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleStartExport}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Render SVG ke Video</span>
              </button>
              <button
                onClick={handleAddToQueue}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Tambah ke Antrean Bulk</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
