/**
 * MIRROR — waveform reflected symmetrically top and bottom from centre.
 * Amplitude is boosted so the reflection is clearly visible.
 */
export const renderMirror = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
  foregroundColor: string,
  lineWidth: number,
  amplify = 2.5,
) => {
  const center = h / 2;
  const sliceWidth = w / (data.length - 1);

  const getAmp = (i: number) => {
    const deviation = (data[i] - 128) / 128; // –1 to +1
    return Math.abs(deviation) * center * amplify;
  };

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = foregroundColor;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Top stroke
  ctx.beginPath();
  ctx.moveTo(0, center);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = i * sliceWidth;
    const x2 = (i + 1) * sliceWidth;
    const midX = (x1 + x2) / 2;
    ctx.quadraticCurveTo(
      x1,
      center - getAmp(i),
      midX,
      center - (getAmp(i) + getAmp(i + 1)) / 2,
    );
  }
  ctx.lineTo(w, center);
  ctx.stroke();

  // Bottom stroke (mirror)
  ctx.beginPath();
  ctx.moveTo(0, center);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = i * sliceWidth;
    const x2 = (i + 1) * sliceWidth;
    const midX = (x1 + x2) / 2;
    ctx.quadraticCurveTo(
      x1,
      center + getAmp(i),
      midX,
      center + (getAmp(i) + getAmp(i + 1)) / 2,
    );
  }
  ctx.lineTo(w, center);
  ctx.stroke();

  // Filled area between top and bottom
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = foregroundColor;
  ctx.beginPath();
  ctx.moveTo(0, center);
  for (let i = 0; i < data.length; i++) {
    ctx.lineTo(i * sliceWidth, center - getAmp(i));
  }
  for (let i = data.length - 1; i >= 0; i--) {
    ctx.lineTo(i * sliceWidth, center + getAmp(i));
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
};
