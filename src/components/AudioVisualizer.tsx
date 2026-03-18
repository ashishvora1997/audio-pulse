import { useRef, useEffect, useState } from "react";
import { useAudioAnalyser } from "../contexts/AudioAnalyserContext";
import { useMediaStream } from "../contexts/MediaStreamContext";
import { RecordState, VisualizerVariant } from "../types";
import type { AudioPulseProps } from "../types";
import {
  renderLine,
  renderBars,
  renderCircle,
  renderMirror,
  renderDots,
} from "../renderers";

const AudioVisualizer = ({
  state,
  onStop,
  onError,
  variant = VisualizerVariant.LINE,
  foregroundColor = "#3b82f6",
  backgroundColor = "transparent",
  lineWidth = 2,
  height = 60,
  className = "",
  style = {},
  canvasStyle = {},
  barSkipBins = 4,
  barSilenceThreshold = 20,
  renderVisualizer,
}: AudioPulseProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyser } = useAudioAnalyser();
  const { start, stop, pause, resume, isPause, isStop, isError, url } =
    useMediaStream();
  const [wave, setWave] = useState(false);

  // ── Notify parent when recording stops ──────────────────────────────────
  useEffect(() => {
    if (isStop && onStop && url && state === RecordState.STOP) {
      onStop(url);
    }
  }, [isStop, url]);

  // ── Notify parent on mic error ───────────────────────────────────────────
  useEffect(() => {
    if (isError && onError) onError(isError);
  }, [isError]);

  // ── Canvas drawing loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (!analyser) return;

    let raf: number;
    const isFrequencyVariant = variant === VisualizerVariant.BARS;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const drawBackground = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
    ) => {
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    const drawIdle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Faint centre line when not actively recording
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = foregroundColor;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);

      if (isFrequencyVariant) {
        analyser.getByteFrequencyData(data);
      } else {
        analyser.getByteTimeDomainData(data);
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const { width: w, height: h } = canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawBackground(ctx, w, h);

      if (!wave) {
        drawIdle(ctx, w, h);
        return;
      }

      switch (variant) {
        case VisualizerVariant.BARS:
          renderBars(
            ctx,
            data,
            w,
            h,
            foregroundColor,
            barSkipBins,
            barSilenceThreshold,
          );
          break;
        case VisualizerVariant.CIRCLE:
          renderCircle(ctx, data, w, h, foregroundColor, lineWidth);
          break;
        case VisualizerVariant.MIRROR:
          renderMirror(ctx, data, w, h, foregroundColor, lineWidth);
          break;
        case VisualizerVariant.DOTS:
          renderDots(ctx, data, w, h, foregroundColor);
          break;
        case VisualizerVariant.LINE:
        default:
          renderLine(ctx, data, w, h, foregroundColor, lineWidth);
          break;
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [
    analyser,
    wave,
    variant,
    foregroundColor,
    backgroundColor,
    lineWidth,
    barSkipBins,
    barSilenceThreshold,
  ]);

  // ── State machine ────────────────────────────────────────────────────────
  useEffect(() => {
    switch (state) {
      case RecordState.START:
        isPause ? resume() : start();
        setWave(true);
        break;
      case RecordState.PAUSE:
        pause();
        setWave(false);
        break;
      case RecordState.STOP:
        stop();
        setWave(false);
        break;
      case RecordState.NONE:
        setWave(false);
        break;
      default:
        break;
    }
  }, [state]);

  // ── Custom render prop ───────────────────────────────────────────────────
  if (renderVisualizer) {
    return (
      <div className={`audio-pulse__wrapper ${className}`} style={style}>
        {renderVisualizer(canvasRef)}
      </div>
    );
  }

  return (
    <div
      className={`audio-pulse__wrapper ${className}`}
      style={{ width: "100%", ...style }}
    >
      <canvas
        ref={canvasRef}
        height={height}
        className="audio-pulse__canvas"
        style={{ width: "100%", display: "block", ...canvasStyle }}
      />
    </div>
  );
};

export default AudioVisualizer;
