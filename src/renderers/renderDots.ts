/**
 * DOTS — particle dot wave.
 * Dot radius and Y position both scale with amplitude for dramatic movement.
 */
export const renderDots = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
  foregroundColor: string,
  amplify = 2.5,
) => {
  const center = h / 2;
  const dotCount = Math.min(data.length, 80);
  const step = Math.floor(data.length / dotCount);
  const sliceWidth = w / dotCount;

  for (let i = 0; i < dotCount; i++) {
    const value = data[i * step];
    const deviation = (value - 128) / 128; // –1 to +1
    const y = center + deviation * center * amplify;
    const x = i * sliceWidth + sliceWidth / 2;
    const amp = Math.abs(deviation);
    const dotR = 2 + amp * 5;

    ctx.beginPath();
    ctx.arc(x, Math.max(dotR, Math.min(h - dotR, y)), dotR, 0, Math.PI * 2);
    ctx.fillStyle = foregroundColor;
    ctx.globalAlpha = 0.4 + amp * 0.6;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
};
