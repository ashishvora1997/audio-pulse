import { useRef, useEffect, useState } from 'react';
import { useAudioAnalyser } from '../contexts/AudioAnalyserContext';
import { useMediaStream } from '../contexts/MediaStreamContext';
import { RecordState } from '../types';
import type { AudioPulseProps } from '../types';

const AudioVisualizer = ({
  state,
  onStop,
  onError,
  foregroundColor   = '#3b82f6',
  backgroundColor   = 'transparent',
  lineWidth         = 2,
  height            = 60,
  className         = '',
  style             = {},
  canvasStyle       = {},
  renderVisualizer,
}: AudioPulseProps) => {
  const canvasRef                         = useRef<HTMLCanvasElement>(null);
  const { analyser }                      = useAudioAnalyser();
  const { start, stop, pause, resume,
          isPause, isStop, isError, url } = useMediaStream();
  const [wave, setWave]                   = useState(false);

  // Notify parent when recording stops
  useEffect(() => {
    if (isStop && onStop && url && state === RecordState.STOP) {
      onStop(url);
    }
  }, [isStop, url]);

  // Notify parent on mic error
  useEffect(() => {
    if (isError && onError) onError(isError);
  }, [isError]);

  // Canvas waveform drawing loop
  useEffect(() => {
    if (!analyser) return;

    let raf: number;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    // Faint flat line when idle or paused
    const drawFlatLine = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.lineWidth   = lineWidth;
      ctx.strokeStyle = foregroundColor;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // Smooth bezier waveform during recording
    const drawWave = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.lineWidth   = lineWidth;
      ctx.strokeStyle = foregroundColor;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.beginPath();

      const sliceWidth = w / (data.length - 1);
      ctx.moveTo(0, (data[0] / 255) * h);

      for (let i = 1; i < data.length - 1; i++) {
        const x1   = (i - 1) * sliceWidth;
        const x2   = i * sliceWidth;
        const midX = (x1 + x2) / 2;
        const y1   = (data[i - 1] / 255) * h;
        const y2   = (data[i] / 255) * h;
        ctx.quadraticCurveTo(x1, y1, midX, (y1 + y2) / 2);
      }

      ctx.lineTo(w, (data[data.length - 1] / 255) * h);
      ctx.stroke();
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const { width: w, height: h } = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawBackground(ctx, w, h);
      wave ? drawWave(ctx, w, h) : drawFlatLine(ctx, w, h);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, wave, foregroundColor, backgroundColor, lineWidth]);

  // State machine — drives wave flag and media stream
  useEffect(() => {
    switch (state) {
      case RecordState.START:
        // Always call start() — MediaStreamContext handles
        // whether this is a fresh start or a resume from pause
        if (isPause) {
          resume();
        } else {
          start();
        }
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
        // Reset wave when consumer resets state to NONE
        setWave(false);
        break;
      default:
        break;
    }
  }, [state]);

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
      style={{ width: '100%', ...style }}
    >
      <canvas
        ref={canvasRef}
        height={height}
        className="audio-pulse__canvas"
        style={{ width: '100%', display: 'block', ...canvasStyle }}
      />
    </div>
  );
};

export default AudioVisualizer;