# MotionForge Studio 🚀
### In-Browser Deterministic Microstock Canvas & SVG Video Studio

MotionForge Studio adalah platform studio animasi dan generator video deterministik berbasis **HTML5 Canvas 2D**, **SVG Motion**, dan **WebCodecs GPU Acceleration**. Didesain khusus untuk kreator Microstock (Shutterstock, Adobe Stock, Pond5, Storyblocks, Vecteezy) untuk menghasilkan footage stock video berkualitas tinggi, seamless loop, serta asset overlay dengan alpha transparency 32-bit RGBA.

---

## ✨ Fitur Unggulan

1. **Canvas Motion Studio**
   - Live script editor dengan validasi sintaks & error boundary.
   - Preset microstock bawaan (*Cyber Plexus Grid, Liquid Aurora Wave, Quantum Hyper-Tunnel, Luxury Golden Bokeh, Cyberpunk Code Stream*).
   - Scrubber timeline presisi frame-by-frame, auto-looping, kontrol durasi dan FPS (30 & 60 FPS).
   - Multi-aspek rasio: **16:9** (Landscape), **9:16** (Vertical Reels/Shorts), **1:1** (Square), **4:3**, dan **21:9**.
   - Resolusi ekspor: **720p HD**, **1080p Full HD**, **2K QHD**, hingga **4K Ultra HD**.

2. **SVG Motion Studio**
   - Mendukung skrip animasi vektor SVG: `draw(svg, width, height, frame, progress)`.
   - Preset bawaan: *Glow Pulse Wave, Bento Tracker HUD, Cyber Target HUD*.
   - Pratinjau background transparan (checkerboard grid) dan ekspor langsung ke video transparan.

3. **High-Performance WebCodecs Video Engine**
   - **MP4 (H.264 / AVC):** Standar utama platform microstock dengan bitrate dinamis (6 - 40 Mbps).
   - **WebM Alpha Transparan:** Format 32-bit RGBA dengan channel transparansi (VP9).
   - **PNG Sequence (ZIP):** Kumpulan frame PNG lossless untuk pengeditan profesional di Adobe Premiere Pro, After Effects, atau Final Cut Pro.
   - 100% Client-Side menggunakan akselerasi GPU browser tanpa server rendering luar.

4. **AI Microstock Prompt Studio**
   - Generator prompt terstruktur untuk LLM (ChatGPT, Claude, Gemini).
   - Pengaturan parameter: Tema, Gerakan Kamera (*Smooth Orbit, Cinematic Zoom, Parallax Pan*), Mood, Palet Warna Microstock, Kecepatan, dan Kepadatan Detail.
   - **Mode Single Prompt** & **Mode 10 Konsep Batch**.
   - **Direct Gemini AI Generator:** Masukkan Google Gemini API Key Anda untuk generate kode animasi langsung dari aplikasi dalam 1 klik!

5. **Bulk Render & ZIP Massal**
   - Tambahkan animasi dari Canvas Studio maupun SVG Studio ke dalam antrean render.
   - Render antrean secara otomatis satu per satu di background.
   - Mengunduh seluruh hasil video sekaligus dalam format satu file **.ZIP** tanpa batasan lisensi.

---

## 🛠️ Menjalankan Project

### 1. Jalankan Development Server:
```bash
npm run dev
```
Buka browser di alamat yang muncul di terminal (biasanya `http://localhost:5173`).

### 2. Build untuk Produksi:
```bash
npm run build
```
File siap di-deploy ada di direktori `dist/` (bisa di-hosting di Netlify, Vercel, Cloudflare Pages, atau GitHub Pages secara gratis).

### 3. Pratinjau Hasil Build:
```bash
npm run preview
```

---

## 📋 Struktur Folder

```
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types.ts                     # Definisi tipe TypeScript
│   ├── components/
│   │   ├── Header.tsx               # Header status WebCodecs GPU
│   │   ├── StudioTabs.tsx           # Navigasi tab utama
│   │   ├── ExportModal.tsx          # Modal progress render & download
│   │   ├── HelpModal.tsx            # Panduan standar microstock
│   │   ├── CanvasStudio/            # Studio Canvas 2D
│   │   ├── SvgStudio/               # Studio SVG Vektor Animasi
│   │   ├── PromptStudio/            # AI Prompt Generator & Direct Gemini API
│   │   └── BulkQueue/               # Antrean render massal & ZIP
│   ├── engine/
│   │   ├── canvasCompiler.ts        # Compiler & runtime evaluasi script canvas
│   │   ├── svgCompiler.ts           # Compiler & rasterizer SVG ke Canvas
│   │   └── videoExporter.ts         # Pipeline WebCodecs & Muxer (MP4/WebM/ZIP)
│   └── presets/
│       ├── canvasPresets.ts         # Koleksi animasi canvas siap pakai
│       ├── svgPresets.ts            # Koleksi animasi SVG siap pakai
│       └── promptTemplates.ts       # Template prompt microstock
```

---

## 💡 Format Penulisan Skrip

### 1. Skrip Canvas:
```javascript
function draw(ctx, width, height, t, frame, duration, fps) {
  // Latar belakang
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, width, height);

  // Seamless Loop Math:
  const loopT = (t % duration) / duration;
  const angle = loopT * Math.PI * 2;

  // Objek bergerak
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(width/2 + Math.cos(angle) * 100, height/2 + Math.sin(angle) * 100, 20, 0, Math.PI * 2);
  ctx.fill();
}
```

### 2. Skrip SVG:
```javascript
function draw(svg, width, height, frame, progress) {
  const rot = progress * 360;
  svg.innerHTML = `
    <circle cx="${width/2}" cy="${height/2}" r="60" fill="none" stroke="#06b6d4" stroke-width="8"
      transform="rotate(${rot} ${width/2} ${height/2})" />
  `;
}
```
