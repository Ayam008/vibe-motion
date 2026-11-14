export type CanvasDrawFunction = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  frame: number,
  duration: number,
  fps: number
) => void;

export interface CompilationResult {
  fn: CanvasDrawFunction | null;
  error: string | null;
}

export function compileCanvasCode(rawCode: string): CompilationResult {
  if (!rawCode || !rawCode.trim()) {
    return { fn: null, error: 'Kode script canvas masih kosong.' };
  }

  try {
    let cleanCode = rawCode
      // remove ES module exports
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+function\s+/g, 'function ')
      .replace(/export\s+const\s+/g, 'const ')
      .replace(/export\s+let\s+/g, 'let ')
      .replace(/export\s+var\s+/g, 'var ');

    // Check if code contains `function draw`
    if (/function\s+draw\s*\(/.test(cleanCode)) {
      const wrapped = `
        ${cleanCode}
        if (typeof draw !== 'function') {
          throw new Error("Fungsi 'draw' tidak ditemukan.");
        }
        return draw;
      `;
      const constructorFn = new Function(wrapped);
      const drawFn = constructorFn();
      
      // Adapt parameters to standard (ctx, width, height, t, frame, duration, fps)
      const adapted: CanvasDrawFunction = (ctx, width, height, t, frame, duration, fps) => {
        // Some user scripts use draw(ctx, time, width, height)
        // Some use draw(ctx, width, height, t, frame, duration, fps)
        if (drawFn.length <= 4) {
          drawFn(ctx, t, width, height);
        } else {
          drawFn(ctx, width, height, t, frame, duration, fps);
        }
      };
      return { fn: adapted, error: null };
    } else {
      // Code is an inline body
      const bodyFn = new Function('ctx', 'width', 'height', 't', 'frame', 'duration', 'fps', cleanCode);
      const adapted: CanvasDrawFunction = (ctx, width, height, t, frame, duration, fps) => {
        bodyFn(ctx, width, height, t, frame, duration, fps);
      };
      return { fn: adapted, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { fn: null, error: `Kompilasi Gagal: ${message}` };
  }
}
