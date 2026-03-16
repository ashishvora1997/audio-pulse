// Minimal type shim for audio-recorder-polyfill

declare module 'audio-recorder-polyfill' {
  class AudioRecorder extends EventTarget {
    static encoder: unknown;
    mimeType: string;
    state: 'inactive' | 'recording' | 'paused';
    constructor(stream: MediaStream);
    start(timeslice?: number): void;
    stop(): void;
    pause(): void;
    resume(): void;
    addEventListener(type: 'dataavailable', listener: (event: { data: Blob }) => void): void;
    removeEventListener(type: 'dataavailable', listener: (event: { data: Blob }) => void): void;
  }
  export = AudioRecorder;
}

declare module 'audio-recorder-polyfill/mpeg-encoder' {
  const encoder: unknown;
  export = encoder;
}
