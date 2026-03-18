/**
 * BARS — frequency bar chart
 * Uses frequency-domain data (getByteFrequencyData)
 *
 * Fix: skip the first 4 bins (DC offset + sub-bass hardware noise that
 * causes leftmost bars to jump even during silence), and apply a silence
 * threshold so micro-noise below ~10% doesn't render.
 */
export const renderBars = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
  foregroundColor: string,
  // Skip this many low-frequency bins — they contain DC offset / hardware hum
  skipBins: number = 4,
  // Values below this 0–255 threshold are treated as silence and not drawn
  silenceThreshold: number = 20,
) => {
  // Work only with the lower half of bins (most musical content lives here),
  // minus the noisy DC-offset bins at the bottom.
  const totalUsable = Math.floor(data.length / 2) - skipBins;
  const barCount = Math.min(totalUsable, 64);
  const barWidth = (w / barCount) * 0.7;
  const gap = (w / barCount) * 0.3;

  for (let i = 0; i < barCount; i++) {
    // Map bar index to a bin, offset by skipBins
    const binIndex = skipBins + Math.floor((i / barCount) * totalUsable);
    const value = data[binIndex];

    // Don't draw anything for near-silent bins — eliminates idle jumping
    if (value < silenceThreshold) continue;

    const barH = (value / 255) * h;
    const x = i * (barWidth + gap);
    const y = h - barH;

    const grad = ctx.createLinearGradient(x, y, x, h);
    grad.addColorStop(0, foregroundColor);
    grad.addColorStop(1, foregroundColor + "55");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, 2);
    ctx.fill();
  }
};
