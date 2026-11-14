import type { PresetItem } from '../types';

export const CANVAS_PRESETS: PresetItem[] = [
  {
    id: 'cyber-plexus-wave',
    name: 'Cyber Plexus Grid',
    category: 'Abstract Tech',
    description: 'Futuristic glowing connected particle network with floating nodes and energy beams',
    defaultDuration: 5,
    code: `// Cyber Plexus Grid - Seamless Loop Microstock Footage
function draw(ctx, width, height, t, frame, duration, fps) {
  // Clear background with deep space dark gradient
  const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.8);
  bgGrad.addColorStop(0, '#0c0f24');
  bgGrad.addColorStop(1, '#020308');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const loopProgress = (t % duration) / duration;
  const loopAngle = loopProgress * Math.PI * 2;

  // Draw perspective cyber floor grid
  ctx.save();
  ctx.strokeStyle = 'rgba(79, 142, 255, 0.15)';
  ctx.lineWidth = 1.5;
  const horizon = height * 0.65;
  
  for (let x = -width; x < width * 2; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(loopAngle) * 40, height);
    ctx.lineTo(width * 0.5 + (x - width * 0.5) * 0.1, horizon);
    ctx.stroke();
  }
  ctx.restore();

  // Floating particles
  const numNodes = 45;
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    const seed = i * 137.5;
    const speed = 1 + (i % 3) * 0.5;
    const x = ((Math.sin(loopAngle * speed + seed) * 0.5 + 0.5) * width * 0.8) + width * 0.1;
    const y = ((Math.cos(loopAngle * speed + seed * 2) * 0.5 + 0.5) * height * 0.6) + height * 0.15;
    const radius = 3 + (i % 4) * 1.5;
    nodes.push({ x, y, radius, id: i });
  }

  // Draw connecting laser plexus lines
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const alpha = (1 - dist / 140) * 0.45;
        ctx.strokeStyle = \`rgba(56, 189, 248, \${alpha})\`;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw glowing nodes
  for (const node of nodes) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
`
  },
  {
    id: 'liquid-aurora-gradient',
    name: 'Liquid Aurora Wave',
    category: 'Fluid Gradients',
    description: 'Smooth luxury iridescent fluid waves with chromatic color shifting',
    defaultDuration: 6,
    code: `// Liquid Aurora Wave - Seamless Loop Microstock Background
function draw(ctx, width, height, t, frame, duration, fps) {
  const loopT = (t % duration) / duration;
  const angle = loopT * Math.PI * 2;

  // Dark background base
  ctx.fillStyle = '#05030a';
  ctx.fillRect(0, 0, width, height);

  // Render 3 undulating harmonic waves
  const waveLayers = [
    { color1: '#6366f1', color2: '#a855f7', speed: 1, amp: 90, freq: 0.003, yOffset: height * 0.45 },
    { color1: '#ec4899', color2: '#f43f5e', speed: 1.5, amp: 70, freq: 0.004, yOffset: height * 0.55 },
    { color1: '#06b6d4', color2: '#3b82f6', speed: 0.8, amp: 110, freq: 0.002, yOffset: height * 0.65 }
  ];

  ctx.globalCompositeOperation = 'screen';

  for (const wave of waveLayers) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x += 15) {
      const y = wave.yOffset +
        Math.sin(x * wave.freq + angle * wave.speed) * wave.amp +
        Math.cos(x * wave.freq * 1.5 - angle) * (wave.amp * 0.4);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, wave.yOffset - wave.amp, width, wave.yOffset + wave.amp);
    grad.addColorStop(0, wave.color1);
    grad.addColorStop(1, wave.color2);

    ctx.fillStyle = grad;
    ctx.filter = 'blur(35px)';
    ctx.fill();
    ctx.filter = 'none';
  }

  ctx.globalCompositeOperation = 'source-over';
}
`
  },
  {
    id: 'quantum-particle-tunnel',
    name: 'Quantum Hyper-Tunnel',
    category: 'Sci-Fi VJ Loop',
    description: 'Hypnotic infinite warp tunnel zoom with chromatic light rings',
    defaultDuration: 4,
    code: `// Quantum Hyper-Tunnel - Seamless Infinite Loop
function draw(ctx, width, height, t, frame, duration, fps) {
  ctx.fillStyle = '#010204';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const loopT = (t % duration) / duration;
  const numRings = 24;

  ctx.save();
  ctx.translate(cx, cy);

  for (let i = 0; i < numRings; i++) {
    const ringProgress = (i / numRings + loopT) % 1;
    const radius = Math.pow(ringProgress, 2.5) * Math.max(width, height) * 0.8;
    const alpha = Math.sin(ringProgress * Math.PI);
    const rot = ringProgress * Math.PI * 4;

    if (radius > 2) {
      ctx.save();
      ctx.rotate(rot);
      ctx.lineWidth = 2 + ringProgress * 4;
      ctx.strokeStyle = \`hsla(\${(ringProgress * 360 + 200) % 360}, 90%, 65%, \${alpha * 0.85})\`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      const points = 6; // Hexagonal tunnel
      for (let p = 0; p < points; p++) {
        const theta = (p / points) * Math.PI * 2;
        const px = Math.cos(theta) * radius;
        const py = Math.sin(theta) * radius;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}
`
  },
  {
    id: 'golden-bokeh-particles',
    name: 'Luxury Golden Bokeh',
    category: 'Cinematic Particles',
    description: 'Warm cinematic floating light particles with depth of field blur for luxury background',
    defaultDuration: 6,
    code: `// Luxury Golden Bokeh - Microstock Stock Video Background
function draw(ctx, width, height, t, frame, duration, fps) {
  // Rich warm dark vignette background
  const bg = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width*0.7);
  bg.addColorStop(0, '#1c1308');
  bg.addColorStop(1, '#070502');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const loopT = (t % duration) / duration;
  const loopAngle = loopT * Math.PI * 2;
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const seed = i * 73.1;
    const depth = (i % 5) + 1; // 1 (far) to 5 (near)
    const baseRadius = depth * 8;
    
    // Smooth vertical drift with loop
    const ySpeed = 0.5 + depth * 0.3;
    const rawY = (height + 100) - (((loopT * ySpeed * height + seed * 10) % (height + 200)));
    const rawX = (seed * 19.3 + Math.sin(loopAngle + seed) * (40 * depth)) % width;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const grad = ctx.createRadialGradient(rawX, rawY, 0, rawX, rawY, baseRadius * 2.5);
    const alpha = (0.2 + (depth / 5) * 0.4) * (0.8 + Math.sin(loopAngle * 2 + seed) * 0.2);
    
    grad.addColorStop(0, \`rgba(255, 223, 140, \${alpha})\`);
    grad.addColorStop(0.4, \`rgba(245, 158, 11, \${alpha * 0.5})\`);
    grad.addColorStop(1, 'rgba(217, 119, 6, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rawX, rawY, baseRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
`
  },
  {
    id: 'cyberpunk-matrix-rain',
    name: 'Cyberpunk Code Stream',
    category: 'Abstract Tech',
    description: 'Digital cyber stream with glowing green monospace characters and velocity streaks',
    defaultDuration: 5,
    code: `// Cyberpunk Code Stream - Seamless Vertical Loop
function draw(ctx, width, height, t, frame, duration, fps) {
  ctx.fillStyle = 'rgba(2, 6, 4, 1)';
  ctx.fillRect(0, 0, width, height);

  const columns = Math.floor(width / 32);
  const loopT = (t % duration) / duration;
  const chars = '0123456789ABCDEFアイウエオカキクケコサシスセソタチツテト';

  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';

  for (let c = 0; c < columns; c++) {
    const colX = c * 32 + 16;
    const speed = 1.2 + (c % 4) * 0.4;
    const seed = c * 17.8;

    for (let r = 0; r < 25; r++) {
      const yOffset = (loopT * speed * height + seed * 30 + r * 30) % (height + 60) - 30;
      const charIndex = Math.floor((seed + r + Math.floor(loopT * 10)) % chars.length);
      const char = chars[charIndex];

      const isLeader = r === 0;
      if (isLeader) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22c55e';
      } else {
        const fade = 1 - (r / 25);
        ctx.fillStyle = \`rgba(34, 197, 94, \${fade * 0.8})\`;
        ctx.shadowBlur = 0;
      }

      ctx.fillText(char, colX, yOffset);
    }
  }
}
`
  }
];
