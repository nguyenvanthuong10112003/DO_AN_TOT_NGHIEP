// src/hooks/useCanvasDraw.js
import { useEffect } from 'react';

/**
 * Draws the current image onto a <canvas> ref whenever dependencies change.
 * When rotated 90° or 270°, canvas dimensions are swapped so the image
 * isn't squished into the wrong aspect ratio.
 */
const useCanvasDraw = (canvasRef, imgEl, displaySize, adj, rotate, flipH, flipV) => {
  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const { w: dw, h: dh } = displaySize;

    // Normalise angle to 0-359
    const deg = ((rotate % 360) + 360) % 360;
    const swapped = deg === 90 || deg === 270;

    // Canvas physical size: swap if rotated 90/270
    const cw = swapped ? dh : dw;
    const ch = swapped ? dw : dh;
    canvas.width  = cw;
    canvas.height = ch;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);

    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    // After rotation the logical draw area is dw × dh
    ctx.translate(-dw / 2, -dh / 2);

    ctx.drawImage(imgEl, 0, 0, dw, dh);
    ctx.restore();
  }, [canvasRef, imgEl, displaySize, adj, rotate, flipH, flipV]);
};

export default useCanvasDraw;
