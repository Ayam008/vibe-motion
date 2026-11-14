export type SvgDrawFunction = (
  svgElement: SVGSVGElement,
  width: number,
  height: number,
  frame: number,
  progress: number
) => void;

export interface SvgCompilationResult {
  fn: SvgDrawFunction | null;
  error: string | null;
}

export function compileSvgCode(rawCode: string): SvgCompilationResult {
  if (!rawCode || !rawCode.trim()) {
    return { fn: null, error: 'Kode script SVG masih kosong.' };
  }

  try {
    const cleanCode = rawCode
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+function\s+/g, 'function ')
      .replace(/export\s+const\s+/g, 'const ');

    const wrapped = `
      ${cleanCode}
      if (typeof draw !== 'function') {
        throw new Error("Wajib mendeklarasikan fungsi: function draw(svg, width, height, frame, progress)");
      }
      return draw;
    `;

    const constructorFn = new Function(wrapped);
    const drawFn = constructorFn();
    return { fn: drawFn, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { fn: null, error: `Sintaks SVG Error: ${message}` };
  }
}

/**
 * Rasterizes an SVG string onto a 2D Canvas context.
 */
export async function rasterizeSvgToCanvas(
  svgString: string,
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      targetCtx.clearRect(0, 0, width, height);
      targetCtx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal merasterisasi elemen SVG ke Canvas.'));
    };

    img.src = url;
  });
}
