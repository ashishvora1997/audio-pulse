import { AudioAnalyserProvider } from './contexts/AudioAnalyserContext';
import { MediaStreamProvider } from './contexts/MediaStreamContext';
import { InputAudioProvider } from './contexts/InputAudioContext';
import AudioVisualizer from './components/AudioVisualizer';
import type { AudioPulseProps } from './types';

/**
 * AudioPulse — drop-in React audio recorder with real-time waveform visualization.
 *
 * @example
 * // Minimal usage
 * const { recordState, start, stop } = useAudioRecorder();
 * <AudioPulse state={recordState} onStop={(audio) => console.log(audio.url)} />
 */
const AudioPulse = ({
  smoothingTimeConstant = 1,
  ...props
}: AudioPulseProps) => (
  <MediaStreamProvider audio video={false}>
    <InputAudioProvider>
      <AudioAnalyserProvider smoothingTimeConstant={smoothingTimeConstant}>
        <AudioVisualizer {...props} />
      </AudioAnalyserProvider>
    </InputAudioProvider>
  </MediaStreamProvider>
);

export default AudioPulse;
