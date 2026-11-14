import type { PresetItem } from '../types';

export const SVG_PRESETS: PresetItem[] = [
  {
    id: 'glow-pulse-wave',
    name: 'Glow Pulse Wave',
    category: 'Organic Waves',
    description: 'Sleek animated wave gradient with soft neon shadow glow effects',
    defaultDuration: 4,
    code: `// Animated SVG Wave - function draw(svg, width, height, frame, progress)
function draw(svg, width, height, frame, progress) {
  const waveY = height * 0.5;
  const loopAngle = progress * Math.PI * 2;
  
  let pathD = \`M 0 \${waveY}\`;
  const points = 16;
  const step = width / points;

  for (let i = 0; i <= points; i++) {
    const x = i * step;
    const y = waveY + 
      Math.sin(loopAngle + i * 0.5) * 80 + 
      Math.cos(loopAngle * 2 + i * 0.3) * 30;
    pathD += \` L \${x.toFixed(1)} \${y.toFixed(1)}\`;
  }
  pathD += \` L \${width} \${height} L 0 \${height} Z\`;

  svg.innerHTML = \`
    <defs>
      <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#06b6d4" />
        <stop offset="50%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- Background is transparent for alpha export or can have dark fill -->
    <path d="\${pathD}" fill="url(#waveGrad)" opacity="0.85" filter="url(#neonGlow)" />
    <path d="\${pathD}" fill="none" stroke="#e0e7ff" stroke-width="3" opacity="0.9" />
  \`;
}
`
  },
  {
    id: 'bento-metrics',
    name: 'Bento Tracker HUD',
    category: 'Corporate HUD',
    description: 'Premium dynamic dashboard widget with active circular meters and charts',
    defaultDuration: 5,
    code: `// Bento Tracker Widget - function draw(svg, width, height, frame, progress)
function draw(svg, width, height, frame, progress) {
  const cx = width / 2;
  const cy = height / 2;
  const percentage = Math.min(100, Math.floor(progress * 100));
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  svg.innerHTML = \`
    <defs>
      <linearGradient id="circleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <!-- Outer Card Background -->
    <rect x="\${cx - 160}" y="\${cy - 160}" width="320" height="320" rx="24" fill="#090d16" stroke="#1e293b" stroke-width="2" />
    
    <!-- Background Circle -->
    <circle cx="\${cx}" cy="\${cy}" r="\${radius}" fill="none" stroke="#1e293b" stroke-width="14" />
    
    <!-- Dynamic Progress Circle -->
    <circle cx="\${cx}" cy="\${cy}" r="\${radius}" fill="none" stroke="url(#circleGrad)" stroke-width="14"
      stroke-linecap="round"
      stroke-dasharray="\${circumference}"
      stroke-dashoffset="\${strokeDashoffset}"
      transform="rotate(-90 \${cx} \${cy})"
      filter="url(#softGlow)"
    />

    <!-- Centered Metric Text -->
    <text x="\${cx}" y="\${cy + 10}" fill="#ffffff" font-size="42" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">
      \${percentage}%
    </text>
    <text x="\${cx}" y="\${cy + 42}" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" text-anchor="middle">
      PROCESSING METRICS
    </text>
  \`;
}
`
  },
  {
    id: 'cyber-target-hud',
    name: 'Cyber Target HUD',
    category: 'Sci-Fi HUD',
    description: 'Futuristic military head-up target display overlay with rotating animated reticles',
    defaultDuration: 4,
    code: `// Cyber Target HUD - function draw(svg, width, height, frame, progress)
function draw(svg, width, height, frame, progress) {
  const cx = width / 2;
  const cy = height / 2;
  const rot = progress * 360;
  const counterRot = -progress * 720;

  svg.innerHTML = \`
    <defs>
      <filter id="hudGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Outer Rotating Segment Ring -->
    <g transform="rotate(\${rot} \${cx} \${cy})" filter="url(#hudGlow)">
      <circle cx="\${cx}" cy="\${cy}" r="120" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="25 45" />
      <circle cx="\${cx}" cy="\${cy}" r="105" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="8 12" />
    </g>

    <!-- Counter Rotating Inner Ring -->
    <g transform="rotate(\${counterRot} \${cx} \${cy})" filter="url(#hudGlow)">
      <circle cx="\${cx}" cy="\${cy}" r="80" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="40 20" />
    </g>

    <!-- Crosshair Target Center -->
    <g stroke="#38bdf8" stroke-width="2" filter="url(#hudGlow)">
      <line x1="\${cx - 40}" y1="\${cy}" x2="\${cx - 15}" y2="\${cy}" />
      <line x1="\${cx + 15}" y1="\${cy}" x2="\${cx + 40}" y2="\${cy}" />
      <line x1="\${cx}" y1="\${cy - 40}" x2="\${cx}" y2="\${cy - 15}" />
      <line x1="\${cx}" y1="\${cy + 15}" x2="\${cx}" y2="\${cy + 40}" />
      <circle cx="\${cx}" cy="\${cy}" r="5" fill="#38bdf8" />
    </g>

    <!-- Digital Status Readout -->
    <text x="\${cx}" y="\${cy + 155}" fill="#38bdf8" font-size="12" font-family="monospace" letter-spacing="3" text-anchor="middle">
      TARGET ACQUIRED // 00:\${Math.floor(progress * 100).toString().padStart(2, '0')}
    </text>
  \`;
}
`
  }
];
