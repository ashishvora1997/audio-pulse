import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useMediaStream } from "./MediaStreamContext";
import type { InputAudioContextValue } from "../types";

// ─── Context ─────────────────────────────────────────────────────────────────

const InputAudioContext = createContext<InputAudioContextValue>({
  audioCtx: undefined,
  source: undefined,
});

export const useInputAudio = (): InputAudioContextValue =>
  useContext(InputAudioContext);

// ─── Provider ────────────────────────────────────────────────────────────────

interface InputAudioProviderProps {
  children: ReactNode;
}

export const InputAudioProvider = ({ children }: InputAudioProviderProps) => {
  const [context, setContext] = useState<AudioContext | undefined>();
  const [source, setSource] = useState<
    MediaStreamAudioSourceNode | undefined
  >();
  const { stream } = useMediaStream();

  const stop = useCallback(() => {
    try {
      if (source) {
        source.disconnect();
        setSource(undefined);
      }
    } catch (e) {
      if (e instanceof Error) console.error(e.name, e.message);
    }
  }, [source]);

  // Create AudioContext + source node when stream arrives
  useEffect(() => {
    if (stream) {
      const audioCtx = new AudioContext();
      setContext(audioCtx);
      setSource(audioCtx.createMediaStreamSource(stream));
    }
  }, [stream]);

  // Disconnect when stream ends
  useEffect(() => {
    if (!stream) stop();
    return () => stop();
  }, [stream, stop]);

  return (
    <InputAudioContext.Provider value={{ audioCtx: context, source }}>
      {children}
    </InputAudioContext.Provider>
  );
};

export default InputAudioContext;
