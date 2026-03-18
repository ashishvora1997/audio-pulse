/**
 * LINE — smooth bezier waveform
 * Amplifies deviation from centre (128) so the wave is tall and visible.
 */
export const renderLine = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
  foregroundColor: string,
  lineWidth: number,
  amplify = 2.5, // boost factor — how much to exaggerate the wave
) => {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = foregroundColor;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();

  const center = h / 2;
  const sliceWidth = w / (data.length - 1);

  const getY = (i: number) => {
    const deviation = (data[i] - 128) / 128; // –1 to +1
    return center + deviation * center * amplify; // amplified, clamped visually
  };

  ctx.moveTo(0, getY(0));

  for (let i = 1; i < data.length - 1; i++) {
    const x1 = (i - 1) * sliceWidth;
    const x2 = i * sliceWidth;
    const midX = (x1 + x2) / 2;
    ctx.quadraticCurveTo(x1, getY(i - 1), midX, (getY(i - 1) + getY(i)) / 2);
  }

  ctx.lineTo(w, getY(data.length - 1));
  ctx.stroke();
};
