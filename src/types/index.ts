// ─── Record State ────────────────────────────────────────────────────────────

export const RecordState = Object.freeze({
  START: 'start',
  PAUSE: 'pause',
  STOP:  'stop',
  NONE:  'none',
} as const);

export type RecordStateType = (typeof RecordState)[keyof typeof RecordState];

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
  /** Waveform stroke color. @default '#3b82f6' */
  foregroundColor?: string;
  /** Canvas background fill. @default 'transparent' */
  backgroundColor?: string;
  /** Stroke line width in px. @default 2 */
  lineWidth?: number;
  /** Canvas height in px. @default 60 */
  height?: number;
  /**
   * AnalyserNode.smoothingTimeConstant (0–1).
   * Lower = more reactive, higher = smoother.
   * @default 1
   */
  smoothingTimeConstant?: number;
  /** Extra CSS class on the outer wrapper div */
  className?: string;
  /** Inline style on the outer wrapper div */
  style?: React.CSSProperties;
  /** Inline style on the <canvas> element */
  canvasStyle?: React.CSSProperties;
  /**
   * Custom render prop — replaces the default canvas entirely.
   * You receive the canvasRef and are responsible for rendering it.
   *
   * @example
   * renderVisualizer={(ref) => (
   *   <canvas ref={ref} width={400} height={100} style={{ background: '#000' }} />
   * )}
   */
  renderVisualizer?: (canvasRef: React.RefObject<HTMLCanvasElement>) => React.ReactNode;
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
  /** Toggle between START and PAUSE (starts if NONE/STOP) */
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