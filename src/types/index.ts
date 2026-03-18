// ─── Record State ────────────────────────────────────────────────────────────

export const RecordState = Object.freeze({
  START: "start",
  PAUSE: "pause",
  STOP: "stop",
  NONE: "none",
} as const);

export type RecordStateType = (typeof RecordState)[keyof typeof RecordState];

// ─── Visualizer Variants ──────────────────────────────────────────────────────

export const VisualizerVariant = Object.freeze({
  LINE: "line",
  BARS: "bars",
  CIRCLE: "circle",
  MIRROR: "mirror",
  DOTS: "dots",
} as const);

export type VisualizerVariantType =
  (typeof VisualizerVariant)[keyof typeof VisualizerVariant];

// ─── Audio Result (returned via onStop) ──────────────────────────────────────

export interface AudioResult {
  /** Raw MP3 Blob */
  blob: Blob;
  /** Object URL — use directly in <audio src={url} /> */
  url: string;
  /** MIME type — 'audio/mp3' */
  type: string;
}

// ─── AudioPulse Props ─────────────────────────────────────────────────────────

export interface AudioPulseProps {
  /** Current recording state — drive this with useState or useAudioRecorder() */
  state: RecordStateType;
  /** Called with the audio result when recording stops */
  onStop?: (result: AudioResult) => void;
  /** Called with an error message string if mic access is denied */
  onError?: (error: string) => void;
  /**
   * Visualizer style variant.
   * - 'line'   — smooth bezier waveform (default)
   * - 'bars'   — frequency bar chart
   * - 'circle' — radial / circular waveform
   * - 'mirror' — waveform mirrored top and bottom
   * - 'dots'   — dot particle wave
   * @default 'line'
   */
  variant?: VisualizerVariantType;
  /** Waveform stroke / fill color. @default '#3b82f6' */
  foregroundColor?: string;
  /** Canvas background fill. @default 'transparent' */
  backgroundColor?: string;
  /** Stroke line width in px (line, mirror, circle variants). @default 2 */
  lineWidth?: number;
  /** Canvas height in px. @default 60 */
  height?: number;
  /**
   * AnalyserNode.smoothingTimeConstant (0–1).
   * Lower = more reactive / taller waves. Higher = smoother.
   * @default 0.8
   */
  smoothingTimeConstant?: number;
  /**
   * AnalyserNode.fftSize — must be power of 2 (32–32768).
   * Lower = more dramatic wave movement. Higher = more detail.
   * @default 512
   */
  fftSize?: number;
  /**
   * `bars` variant only — number of low-frequency bins to skip.
   * The first few bins contain DC offset / hardware hum that causes
   * leftmost bars to jump in silence.
   * @default 4
   */
  barSkipBins?: number;
  /**
   * `bars` variant only — minimum bin value (0–255) to render a bar.
   * Bins below this threshold are hidden, eliminating idle noise bars.
   * @default 20
   */
  barSilenceThreshold?: number;
  /** Extra CSS class on the outer wrapper div */
  className?: string;
  /** Inline style on the outer wrapper div */
  style?: React.CSSProperties;
  /** Inline style on the <canvas> element */
  canvasStyle?: React.CSSProperties;
  /**
   * Custom render prop — replaces the built-in canvas entirely.
   * You receive the canvasRef and are responsible for rendering it.
   */
  renderVisualizer?: (
    canvasRef: React.RefObject<HTMLCanvasElement>,
  ) => React.ReactNode;
}

// ─── useAudioRecorder hook return ────────────────────────────────────────────

export interface UseAudioRecorderReturn {
  recordState: RecordStateType;
  /** Set state to START */
  start: () => void;
  /** Set state to PAUSE */
  pause: () => void;
  /** Set state to STOP */
  stop: () => void;
  /** Toggle between START and PAUSE */
  toggle: () => void;
  /** Reset state back to NONE */
  reset: () => void;
}

// ─── Context shapes ───────────────────────────────────────────────────────────

export interface MediaStreamContextValue {
  stream: MediaStream | undefined;
  url: AudioResult | null;
  isPause: boolean;
  isStop: boolean;
  isError: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  pause: () => void;
  resume: () => void;
}

export interface InputAudioContextValue {
  audioCtx: AudioContext | undefined;
  source: MediaStreamAudioSourceNode | undefined;
}

export interface AudioAnalyserContextValue {
  analyser: AnalyserNode | undefined;
}
