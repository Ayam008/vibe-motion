import { useState } from 'react';
import {
  Wand2,
  Copy,
  Check,
  Send,
  Sparkles,
  Bot,
  Sliders,
  Key
} from 'lucide-react';
import type { PromptOptions } from '../../presets/promptTemplates';
import {
  CAMERA_OPTIONS,
  MOOD_OPTIONS,
  SPEED_OPTIONS,
  DENSITY_OPTIONS,
  PALETTE_OPTIONS,
  buildSystemPrompt,
  buildBatchPrompt
} from '../../presets/promptTemplates';

interface PromptStudioProps {
  onSendCodeToStudio: (code: string, duration: number) => void;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({ onSendCodeToStudio }) => {
  const [theme, setTheme] = useState('Abstract Cyberpunk Quantum Grid with Glowing Plexus Laser Lines');
  const [category, setCategory] = useState('Sci-Fi / Abstract Technology');
  const [cameraMovement, setCameraMovement] = useState(CAMERA_OPTIONS[0]);
  const [mood, setMood] = useState(MOOD_OPTIONS[0]);
  const [speed, setSpeed] = useState(SPEED_OPTIONS[1]);
  const [density, setDensity] = useState(DENSITY_OPTIONS[1]);
  const [palette, setPalette] = useState(PALETTE_OPTIONS[0]);
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const [activeSubTab, setActiveSubTab] = useState<'single' | 'batch' | 'direct_ai'>('single');
  const [copied, setCopied] = useState(false);

  // Direct AI state
  const [apiKey, setApiKey] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiOutputCode, setAiOutputCode] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);

  const promptOptions: PromptOptions = {
    theme,
    category,
    cameraMovement,
    mood,
    speed,
    density,
    palette,
    duration,
    aspectRatio
  };

  const singlePromptText = buildSystemPrompt(promptOptions);

  const batchThemes = [
    'Deep Space Nebula Hologram with Stardust',
    'Futuristic Digital HUD Cyber Target Reticle',
    'Liquid Chrome Iridescent Organic Blobs',
    'Minimalist Golden Wave Ribbons on Obsidian',
    'Audio Equalizer Radial Pulse with Frequency Waves',
    'Glitch Data Matrix Rain Stream',
    'Geometric Hexagonal Isometric Grid Shift',
    'Infinite Sci-Fi Hyperspace Light Warp',
    'Bioluminescent Floating Deep Sea Particles',
    'Kinetic Typography Cyberpunk Dynamic Intro'
  ];

  const batchPromptText = buildBatchPrompt(batchThemes, promptOptions);

  const activePromptText = activeSubTab === 'batch' ? batchPromptText : singlePromptText;

  const handleCopy = () => {
    navigator.clipboard.writeText(activePromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct AI Generation via Google Gemini API
  const handleGenerateDirectAi = async () => {
    if (!apiKey.trim()) {
      setAiError('Masukkan Gemini API Key Anda terlebih dahulu.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);
    setAiOutputCode('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: singlePromptText + '\n\nKembalikan HANYA KODE JavaScript murni tanpa backticks markdown.' }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Gagal berkomunikasi dengan Gemini API');
      }

      let generated = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Clean backticks if any
      generated = generated.replace(/```(?:javascript|js)?/g, '').replace(/```/g, '').trim();

      setAiOutputCode(generated);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSendToCanvas = () => {
    if (aiOutputCode) {
      onSendCodeToStudio(aiOutputCode, duration);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Microstock Prompt Studio</h2>
            <p className="text-xs text-slate-400">
              Generator prompt khusus untuk membuat animasi JavaScript Canvas siap jual di platform Microstock.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Configuration Form */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Parameter Visual Footage</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tema / Subjek Video:</label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Contoh: Luxury Golden Bokeh Particle Floating with Depth Blur"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Kategori:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Rasio:</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="16:9">16:9 (Landscape / YouTube / Stock)</option>
                  <option value="9:16">9:16 (Vertical Reels / TikTok)</option>
                  <option value="1:1">1:1 (Square Feed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Gerakan Kamera (Camera Movement):</label>
              <select
                value={cameraMovement}
                onChange={(e) => setCameraMovement(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
              >
                {CAMERA_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Mood & Atmosfer:</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
              >
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Palet Warna Microstock:</label>
              <select
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
              >
                {PALETTE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Kecepatan Gerak:</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                >
                  {SPEED_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kepadatan Detail:</label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                >
                  {DENSITY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Durasi Seamless Loop:</span>
                <span className="text-cyan-400 font-bold">{duration} Detik</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Output Tabs (Single / Batch / Direct AI) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          {/* Subtabs */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSubTab === 'single'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Single Prompt
              </button>
              <button
                onClick={() => setActiveSubTab('batch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSubTab === 'batch'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. 10 Konsep Batch
              </button>
              <button
                onClick={() => setActiveSubTab('direct_ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'direct_ai'
                    ? 'bg-indigo-500 text-white font-bold'
                    : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>3. Direct Gemini AI</span>
              </button>
            </div>

            {activeSubTab !== 'direct_ai' && (
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Prompt'}</span>
              </button>
            )}
          </div>

          {/* Subtab Content: Single & Batch */}
          {activeSubTab !== 'direct_ai' ? (
            <div className="flex-1 p-4 bg-slate-950 min-h-[460px] overflow-y-auto">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {activePromptText}
              </pre>
            </div>
          ) : (
            /* Subtab Content: Direct Gemini AI Generation */
            <div className="flex-1 p-5 bg-slate-950 flex flex-col space-y-4 min-h-[460px]">
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                  <Key className="w-4 h-4" />
                  <span>Google Gemini API Key (Opsional / Client-Side)</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Masukkan Google Gemini API Key Anda untuk meng-generate kode canvas secara instan tanpa perlu bolak-balik copy-paste ke ChatGPT/Claude!
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2 bg-slate-900 border border-indigo-900/60 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
                  {aiError}
                </div>
              )}

              <button
                onClick={handleGenerateDirectAi}
                disabled={isGeneratingAi}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingAi ? 'Sedang Menghasilkan Kode via Gemini...' : 'Generate Kode Animasi dengan AI'}</span>
              </button>

              {aiOutputCode && (
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Hasil Kode Generated:</span>
                    <button
                      onClick={handleSendToCanvas}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim ke Canvas Studio</span>
                    </button>
                  </div>
                  <textarea
                    value={aiOutputCode}
                    readOnly
                    className="flex-1 w-full min-h-[200px] p-3 font-mono text-xs bg-slate-900 text-emerald-300 border border-slate-800 rounded-xl resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
