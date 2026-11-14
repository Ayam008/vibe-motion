import { useState, useRef } from 'react';
import {
  Layers,
  Trash2,
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  FileVideo,
  FileCode2
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import type { QueueItem } from '../../types';
import { compileCanvasCode } from '../../engine/canvasCompiler';
import { compileSvgCode, rasterizeSvgToCanvas } from '../../engine/svgCompiler';
import { exportVideo } from '../../engine/videoExporter';

interface BulkQueueProps {
  queue: QueueItem[];
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onUpdateItemStatus: (id: string, status: QueueItem['status'], progress: number, error?: string) => void;
}

export const BulkQueue: React.FC<BulkQueueProps> = ({
  queue,
  onRemoveItem,
  onClearQueue,
  onUpdateItemStatus
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentRenderingItem, setCurrentRenderingItem] = useState<string | null>(null);
  const isCancelledRef = useRef(false);

  const handleStartBulkRender = async () => {
    if (queue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    isCancelledRef.current = false;
    setOverallProgress(0);

    const zip = new JSZip();
    let completedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      if (isCancelledRef.current) break;

      const item = queue[i];
      setCurrentRenderingItem(item.name);
      onUpdateItemStatus(item.id, 'rendering', 0);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = item.width;
        canvas.height = item.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas context error');

        if (item.type === 'canvas') {
          const comp = compileCanvasCode(item.code);
          if (!comp.fn) throw new Error(comp.error || 'Gagal kompilasi canvas');
          const drawFn = comp.fn;

          const res = await exportVideo({
            canvas,
            renderFrame: (t, frame) => {
              ctx.save();
              drawFn(ctx, item.width, item.height, t, frame, item.duration, item.fps);
              ctx.restore();
            },
            duration: item.duration,
            fps: item.fps,
            width: item.width,
            height: item.height,
            format: item.format,
            onProgress: (p) => {
              onUpdateItemStatus(item.id, 'rendering', p.percentage);
            },
            isCancelled: () => isCancelledRef.current
          });

          const ext = item.format === 'webm_alpha' ? 'webm' : item.format === 'png_sequence' ? 'zip' : 'mp4';
          const filename = `${String(i + 1).padStart(2, '0')}_${item.name.replace(/\s+/g, '_')}.${ext}`;
          zip.file(filename, res.blob);
        } else {
          // SVG Type
          const comp = compileSvgCode(item.code);
          if (!comp.fn) throw new Error(comp.error || 'Gagal kompilasi SVG');
          const drawFn = comp.fn;

          const offscreenSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          offscreenSvg.setAttribute('width', item.width.toString());
          offscreenSvg.setAttribute('height', item.height.toString());

          const res = await exportVideo({
            canvas,
            renderFrame: async (t, frame) => {
              const progress = (t % item.duration) / item.duration;
              drawFn(offscreenSvg, item.width, item.height, frame, progress);
              const svgMarkup = new XMLSerializer().serializeToString(offscreenSvg);
              await rasterizeSvgToCanvas(svgMarkup, ctx, item.width, item.height);
            },
            duration: item.duration,
            fps: item.fps,
            width: item.width,
            height: item.height,
            format: item.format,
            onProgress: (p) => {
              onUpdateItemStatus(item.id, 'rendering', p.percentage);
            },
            isCancelled: () => isCancelledRef.current
          });

          const ext = item.format === 'webm_alpha' ? 'webm' : 'mp4';
          const filename = `${String(i + 1).padStart(2, '0')}_${item.name.replace(/\s+/g, '_')}.${ext}`;
          zip.file(filename, res.blob);
        }

        onUpdateItemStatus(item.id, 'completed', 100);
        completedCount++;
        setOverallProgress(Math.round((completedCount / queue.length) * 100));
      } catch (err: unknown) {
        onUpdateItemStatus(item.id, 'error', 0, err instanceof Error ? err.message : String(err));
      }
    }

    if (!isCancelledRef.current && completedCount > 0) {
      // Download Bulk ZIP
      const bulkZipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(bulkZipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MotionForge_Bulk_Render_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }

    setIsProcessing(false);
    setCurrentRenderingItem(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bulk Queue & Batch ZIP Render</h2>
            <p className="text-xs text-slate-400">
              Antrean render massal multi-item tanpa batasan lisensi. Semua video otomatis digabung menjadi satu file ZIP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {queue.length > 0 && !isProcessing && (
            <button
              onClick={onClearQueue}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Kosongkan Antrean</span>
            </button>
          )}

          <button
            onClick={handleStartBulkRender}
            disabled={queue.length === 0 || isProcessing}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Antrean ({overallProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Render Massal ({queue.length} Item)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress banner during bulk processing */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-800/60 space-y-2">
          <div className="flex justify-between items-center text-xs text-indigo-300">
            <span>Sedang merender: <strong>{currentRenderingItem}</strong></span>
            <span>Total Progress: {overallProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-200"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Queue Item List */}
      {queue.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Layers className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">Antrean Render Masih Kosong</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Buka Canvas Studio atau SVG Studio, lalu klik tombol <strong>"Tambah ke Antrean Bulk Render"</strong> untuk menambahkan animasi ke sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                    {item.type === 'canvas' ? <FileVideo className="w-4 h-4" /> : <FileCode2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                      {index + 1}. {item.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {item.width}×{item.height} • {item.duration}s • {item.fps} FPS
                    </span>
                  </div>
                </div>

                {!isProcessing && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Hapus dari antrean"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Item Status */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">
                    Format: <strong className="text-slate-200">{item.format.toUpperCase()}</strong>
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    {item.status === 'idle' && <span className="text-slate-500">Menunggu</span>}
                    {item.status === 'rendering' && (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> {item.progress}%
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Siap
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Error
                      </span>
                    )}
                  </span>
                </div>

                {item.status === 'rendering' && (
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {item.error && (
                  <p className="text-[10px] text-rose-400 break-all">{item.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
