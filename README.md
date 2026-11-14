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
