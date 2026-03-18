import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import AudioRecorder from "audio-recorder-polyfill";
import mpegEncoder from "audio-recorder-polyfill/mpeg-encoder";
import type { MediaStreamContextValue, AudioResult } from "../types";

// ─── Context ─────────────────────────────────────────────────────────────────

const MediaStreamContext = createContext<MediaStreamContextValue>({
  stream: undefined,
  url: null,
  isPause: false,
  isStop: false,
  isError: "",
  start: async () => {},
  stop: async () => {},
  pause: () => {},
  resume: () => {},
});

export const useMediaStream = (): MediaStreamContextValue =>
  useContext(MediaStreamContext);

// ─── Provider ────────────────────────────────────────────────────────────────

interface MediaStreamProviderProps {
  children: ReactNode;
  audio?: boolean;
  video?: boolean;
}

export const MediaStreamProvider = ({
  children,
  audio = true,
  video = false,
}: MediaStreamProviderProps) => {
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [url, setUrl] = useState<AudioResult | null>(null);
  const [isPause, setIsPaused] = useState(false);
  const [isStop, setIsStop] = useState(false);
  const [isError, setIsError] = useState("");

  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<InstanceType<typeof AudioRecorder> | null>(
    null,
  );

  // Cleanup stream tracks on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const handleDataAvailable = (event: { data: Blob }) => {
    if (event.data.size > 0) {
      audioChunks.current = [...audioChunks.current, event.data];
      const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
      setUrl({
        blob: audioBlob,
        url: URL.createObjectURL(audioBlob),
        type: "audio/mp3",
      });
    }
  };

  const start = useCallback(async () => {
    try {
      setIsStop(false);
      setIsError("");
      setUrl(null);

      // Configure polyfill for MP3 output
      AudioRecorder.encoder = mpegEncoder;
      AudioRecorder.prototype.mimeType = "audio/mpeg";
      audioChunks.current = [];

      const mediaStream = await navigator?.mediaDevices?.getUserMedia({
        audio,
        video,
      });

      mediaRecorderRef.current = new AudioRecorder(mediaStream);
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable,
      );
      mediaRecorderRef.current.start();
      setStream(mediaStream);
    } catch {
      const msg =
        "Microphone permission denied. Please allow mic access to record.";
      setIsError(msg);
    }
  }, [audio, video]);

  const stop = useCallback(async () => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.removeEventListener(
      "dataavailable",
      handleDataAvailable,
    );
    setStream(undefined);
    setIsStop(true);
  }, [stream]);

  const pause = () => {
    if (mediaRecorderRef.current) {
      setIsPaused(true);
      mediaRecorderRef.current.pause();
    }
  };

  const resume = () => {
    if (mediaRecorderRef.current) {
      setIsPaused(false);
      mediaRecorderRef.current.resume();
    }
  };

  return (
    <MediaStreamContext.Provider
      value={{
        stream,
        start,
        stop,
        url,
        pause,
        resume,
        isPause,
        isStop,
        isError,
      }}
    >
      {children}
    </MediaStreamContext.Provider>
  );
};

export default MediaStreamContext;
