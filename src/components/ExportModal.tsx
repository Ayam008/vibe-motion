import { Download, X, AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { RenderProgress } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: RenderProgress | null;
  status: 'idle' | 'rendering' | 'completed' | 'error';
  errorMessage: string | null;
  resultBlob: Blob | null;
  filename: string;
  onCancel: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  progress,
  status,
  errorMessage,
  resultBlob,
  filename,
  onCancel
}) => {
  if (!isOpen) return null;

  const triggerDownload = () => {
    if (!resultBlob) return;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {status !== 'rendering' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-slate-800 border border-slate-700">
            {status === 'rendering' && <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />}
            {status === 'completed' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
            {status === 'error' && <AlertTriangle className="w-6 h-6 text-rose-400" />}
          </div>

          <h3 className="text-lg font-bold text-white">
            {status === 'rendering' && 'Merender Video Frame-by-Frame'}
            {status === 'completed' && 'Render Berhasil Selesai!'}
            {status === 'error' && 'Gagal Memproses Render'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {status === 'rendering' && 'WebCodecs GPU Worker sedang memproses encoding deterministik...'}
            {status === 'completed' && 'File siap diunduh dan dipasarkan ke platform Microstock.'}
            {status === 'error' && 'Terjadi kendala saat proses kompilasi atau encoding.'}
          </p>
        </div>

        {/* Progress Display */}
        {status === 'rendering' && progress && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Progress: {progress.percentage}%</span>
                <span>{progress.currentFrame} / {progress.totalFrames} Frame</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-500 text-[10px]">Kecepatan Render</div>
                <div className="font-semibold text-cyan-300">{progress.fps} FPS</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-500 text-[10px]">Perkiraan Selesai (ETA)</div>
                <div className="font-semibold text-indigo-300">{progress.etaSeconds} detik</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Batalkan Proses Render
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs leading-relaxed">
              {errorMessage || 'Terjadi kesalahan tidak terduga saat proses encoding.'}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Tutup & Perbaiki Kode
            </button>
          </div>
        )}

        {/* Completed Display */}
        {status === 'completed' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-200 text-xs">
              <div className="font-medium text-emerald-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kualitas Frame-Perfect Siap Diunduh</span>
              </div>
              Nama file: <code className="text-slate-300 text-[11px] break-all">{filename}</code>
            </div>

            <button
              onClick={triggerDownload}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Hasil Render</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
