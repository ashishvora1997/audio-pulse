import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useInputAudio } from './InputAudioContext';
import type { AudioAnalyserContextValue } from '../types';

// ─── Context ─────────────────────────────────────────────────────────────────

const AudioAnalyserContext = createContext<AudioAnalyserContextValue>({
  analyser: undefined,
});

export const useAudioAnalyser = (): AudioAnalyserContextValue =>
  useContext(AudioAnalyserContext);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AudioAnalyserProviderProps {
  children: ReactNode;
  /** AnalyserNode.smoothingTimeConstant (0–1). @default 1 */
  smoothingTimeConstant?: number;
}

export const AudioAnalyserProvider = ({
  children,
  smoothingTimeConstant = 1,
}: AudioAnalyserProviderProps) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | undefined>();
  const { source }              = useInputAudio();

  // Create analyser node when source is ready
  useEffect(() => {
    if (!source) return;

    const node = source.context.createAnalyser();
    node.smoothingTimeConstant = smoothingTimeConstant;
    source.connect(node);
    setAnalyser(node);
  }, [source]);

  // Disconnect + clean up when source disappears
  useEffect(() => {
    if (!source && analyser) {
      analyser.disconnect();
      setAnalyser(undefined);
    }
    return () => {
      if (analyser) {
        analyser.disconnect();
        setAnalyser(undefined);
      }
    };
  }, [source]);

  return (
    <AudioAnalyserContext.Provider value={{ analyser }}>
      {children}
    </AudioAnalyserContext.Provider>
  );
};

export default AudioAnalyserContext;
