// ─── Main Component ───────────────────────────────────────────────────────────
export { default } from './AudioPulse';
export { default as AudioPulse } from './AudioPulse';

// ─── Types & Constants ────────────────────────────────────────────────────────
export { RecordState } from './types';
export type {
  RecordStateType,
  AudioResult,
  AudioPulseProps,
  UseAudioRecorderReturn,
  MediaStreamContextValue,
  InputAudioContextValue,
  AudioAnalyserContextValue,
} from './types';

// ─── Hook ─────────────────────────────────────────────────────────────────────
export { default as useAudioRecorder } from './hooks/useAudioRecorder';

// ─── Contexts (advanced usage) ────────────────────────────────────────────────
export { useAudioAnalyser, AudioAnalyserProvider } from './contexts/AudioAnalyserContext';
export { useMediaStream,   MediaStreamProvider   } from './contexts/MediaStreamContext';
export { useInputAudio,    InputAudioProvider    } from './contexts/InputAudioContext';

// ─── Sub-component (for custom layouts) ──────────────────────────────────────
export { default as AudioVisualizer } from './components/AudioVisualizer';
