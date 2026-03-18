import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useInputAudio } from "./InputAudioContext";
import type { AudioAnalyserContextValue } from "../types";

// ─── Context ─────────────────────────────────────────────────────────────────

const AudioAnalyserContext = createContext<AudioAnalyserContextValue>({
  analyser: undefined,
});

export const useAudioAnalyser = (): AudioAnalyserContextValue =>
  useContext(AudioAnalyserContext);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AudioAnalyserProviderProps {
  children: ReactNode;
  /**
   * AnalyserNode.smoothingTimeConstant (0–1).
   * Lower = more reactive / taller waves.
   * @default 0.8
   */
  smoothingTimeConstant?: number;
  /**
   * AnalyserNode.fftSize — must be power of 2 (32–32768).
   * Lower = fewer samples = more dramatic movement per sample.
   * @default 512
   */
  fftSize?: number;
}

export const AudioAnalyserProvider = ({
  children,
  smoothingTimeConstant = 0.8, // was 1 — too smooth, kills amplitude
  fftSize = 512, // was default 2048 — too many samples, flattens wave
}: AudioAnalyserProviderProps) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | undefined>();
  const { source } = useInputAudio();

  // Create analyser node when source is ready
  useEffect(() => {
    if (!source) return;

    const node = source.context.createAnalyser();
    node.fftSize = fftSize;
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
