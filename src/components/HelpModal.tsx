import React from 'react';
import { X, BookOpen, CheckCircle, Video, ShieldCheck, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Panduan Standar Video Microstock</h2>
            <p className="text-xs text-slate-400">
              Standar spesifikasi agar footage Anda diterima & laku di Shutterstock, Adobe Stock, Pond5 & Vecteezy.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>1. Syarat Wajib Seamless Loop</span>
            </div>
            <p>
              Footage background/animasi harus berupa <em>seamless loop</em> sempurna. Gunakan variabel <code>(t % duration) / duration</code> dan fungsi trigonometri <code>sin/cos</code> periodik. Frame terakhir pada detik ke-5 (misal) harus menyambung persis ke frame detik ke-0 tanpa ada lompatan atau kedipan frame.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Video className="w-4 h-4" />
              <span>2. Format Resolusi & Frame Rate</span>
            </div>
            <p>
              - <strong>Landscape:</strong> 1920×1080 (Full HD) atau 3840×2160 (4K Ultra HD), rasio 16:9.<br />
              - <strong>Vertical Reels/Shorts:</strong> 1080×1920 (9:16).<br />
              - <strong>Frame Rate:</strong> 30 FPS atau 60 FPS untuk gerakan ultra-smooth.<br />
              - <strong>Codec:</strong> MP4 (H.264) untuk video umum, atau WebM/ProRes dengan Alpha Channel (32-bit RGBA) untuk aset overlay transparan (seperti ikon dan HUD).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Kebersihan Visual & Hak Cipta</span>
            </div>
            <p>
              Platform microstock melarang keras adanya watermark, nama merek, logo, atau teks yang dilindungi hak cipta pada visual stock footage. Seluruh generator prompt di aplikasi ini sudah secara otomatis menyertakan aturan bebas watermark dan merek.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>4. WebCodecs Hardware Acceleration</span>
            </div>
            <p>
              Aplikasi ini merender video secara deterministik langsung menggunakan GPU perangkat Anda melalui WebCodecs API browser. Tidak ada penurunan kualitas (lossy capture) dan tidak membutuhkan rendering server di cloud.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Mengerti & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};
