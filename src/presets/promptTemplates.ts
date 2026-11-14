export interface PromptOptions {
  theme: string;
  category: string;
  cameraMovement: string;
  mood: string;
  speed: string;
  density: string;
  palette: string;
  duration: number;
  aspectRatio: string;
}

export const CAMERA_OPTIONS = [
  'Halus Orbit 360° (Smooth Orbit)',
  'Slow Cinematic Zoom-In',
  'Parallax Multilayer Pan Horizontal',
  'Infinite Forward Dolly Warp',
  'Static Cam with Dynamic Flow'
];

export const MOOD_OPTIONS = [
  'Futuristic & High-Tech Cyberpunk',
  'Luxury Elegance & Premium Gold',
  'Chill Lo-Fi Pastel Glow',
  'Dark Ambient & Minimalist Deep',
  'Energetic Neon EDM Cyber'
];

export const SPEED_OPTIONS = [
  'Sangat Halus & Lambat (Slow-Mo Ambient)',
  'Sedang / Natural Flow (Harmonic)',
  'Cepat & Energetik (Dynamic Beat)'
];

export const DENSITY_OPTIONS = [
  'Minimalis (Clean & Breathable)',
  'Seimbang (Balanced Microstock Standard)',
  'Kompleks & Padat (Rich Multilayered)'
];

export const PALETTE_OPTIONS = [
  'Cyber Blue & Neon Cyan (#06b6d4, #3b82f6, #0284c7)',
  'Luxury Deep Gold & Obsidian (#fbbf24, #d97706, #0f0a02)',
  'Synthwave Violet & Hot Pink (#a855f7, #ec4899, #f43f5e)',
  'Matrix Emerald & Tech Lime (#10b981, #22c55e, #052e16)',
  'Monochrome Silver & Pure Titanium (#f8fafc, #94a3b8, #0f172a)'
];

export function buildSystemPrompt(options: PromptOptions): string {
  return `Kamu adalah Motion Graphics Designer profesional dan Senior JavaScript Canvas API Developer untuk video microstock premium (Shutterstock, Adobe Stock, Pond5, Storyblocks).

TUGAS:
Buat kode JavaScript Canvas lengkap dan siap pakai yang mendefinisikan fungsi:
function draw(ctx, width, height, t, frame, duration, fps) { ... }

PENGATURAN VISUAL:
- TEMA: ${options.theme}
- KATEGORI: ${options.category}
- GERAKAN KAMERA: ${options.cameraMovement}
- MOOD: ${options.mood}
- KECEPATAN: ${options.speed}
- KEPADATAN DETAIL: ${options.density}
- PALET WARNA: ${options.palette}
- DURASI LOOP: ${options.duration} Detik
- ASPEK RASIO TARGET: ${options.aspectRatio}

ATURAN WAJIB MICROSTOCK:
1. SEAMLESS PERFECT LOOP:
   - Gunakan \`const loopProgress = (t % duration) / duration;\` dan sudut periodik \`const angle = loopProgress * Math.PI * 2;\`.
   - Frame terakhir (${options.duration} detik) harus menyambung persis ke frame 0 detik tanpa lompatan (zero glitch).
2. KUALITAS TINGGI (4K / 1080p READY):
   - Gunakan gradient, shadow glow (\`ctx.shadowBlur\`), atau composite operations (\`screen\` / \`lighter\`).
   - Hindari objek tunggal polos tanpa detail; gunakan multilayer depth (latar, tengah, depan).
3. ATURAN KODE:
   - JANGAN ada teks statis, watermark, atau logo merek apapun.
   - Kembalikan HANYA fungsi \`function draw(ctx, width, height, t, frame, duration, fps) { ... }\` tanpa markup HTML atau penjelasan berlebih.
`;
}

export function buildBatchPrompt(themes: string[], options: PromptOptions): string {
  return `Kamu adalah Motion Graphics Designer & JavaScript Canvas Developer.

Buat 10 variasi kode animasi JavaScript Canvas untuk koleksi Stock Footage bertema:
${options.theme}

Daftar 10 Konsep:
${themes.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Setiap variasi harus memiliki fungsi:
function draw(ctx, width, height, t, frame, duration, fps) { ... }
Dengan durasi ${options.duration} detik, rasio ${options.aspectRatio}, dan SEAMLESS LOOP.
`;
}
