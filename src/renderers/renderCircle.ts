/**
 * CIRCLE — radial waveform plotted around a circle.
 * Amplitude boost makes the shape clearly pulsate.
 */
export const renderCircle = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
  foregroundColor: string,
  lineWidth: number,
  amplify = 2.5,
) => {
  const cx = w / 2;
  const cy = h / 2;
  const baseRadius = Math.min(cx, cy) * 0.5;
  const sliceAngle = (2 * Math.PI) / data.length;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = foregroundColor;
  ctx.lineJoin = "round";
  ctx.beginPath();

  for (let i = 0; i <= data.length; i++) {
    const idx = i % data.length;
    const deviation = (data[idx] - 128) / 128; // –1 to +1
    const r = baseRadius + deviation * baseRadius * amplify * 0.5;
    const angle = idx * sliceAngle - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.stroke();

  // Subtle fill
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = foregroundColor;
  ctx.fill();
  ctx.globalAlpha = 1;
};
