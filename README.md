# 🎙️ audio-pulse

**React audio recorder** with real-time waveform visualization. Record MP3 audio from the microphone, visualize live sound waves on a canvas, and control recording state with a simple hook — fully typed with TypeScript.

[![npm version](https://img.shields.io/npm/v/audio-pulse)](https://www.npmjs.com/package/audio-pulse)
[![bundle size](https://img.shields.io/bundlephobia/minzip/audio-pulse)](https://bundlephobia.com/package/audio-pulse)
[![license](https://img.shields.io/npm/l/audio-pulse)](LICENSE)

---

- ✅ **Zero config** — one component, plug in and record
- 🎨 **5 built-in variants** — line, bars, circle, mirror, dots
- 🪝 **Hook included** — `useAudioRecorder` for clean state management
- 🔷 **TypeScript-first** — full types, no `@types/` package needed
- 📦 **Tiny bundle** — built with tsup + esbuild, tree-shakeable ESM + CJS
- 🌐 **Cross-browser** — MP3 output via `audio-recorder-polyfill` (Safari & Firefox)

---

## Installation

```bash
npm install audio-pulse
# or
yarn add audio-pulse
# or
pnpm add audio-pulse
```

> **Peer deps:** `react >= 17` and `react-dom >= 17` must already be in your project.

---

## Variants

Switch between visualizer styles using the `variant` prop.

### `line` (default)
![line](./waveform-line.gif)

### `bars`
![bars](./waveform-bars.gif)

### `mirror`
![mirror](./waveform-mirror.gif)

### `dots`
![dots](./waveform-dots.gif)

### `circle`
![circle](./waveform-circle.gif)

---

## Full Example

Complete recorder with correct button visibility at every state.

**State flow:**
- `NONE` → **Start** only
- `START` (recording) → **Pause** + **Stop**
- `PAUSE` → **Resume** + **Stop**
- After stop → audio player + **Start Again**

> ⚠️ Keep `<AudioPulse>` always mounted — use `display: none` to hide it rather
> than conditionally rendering it. Unmounting tears down the internal audio
> contexts, which breaks "Start Again".

```tsx
import { useState } from 'react';
import AudioPulse, { useAudioRecorder, RecordState, AudioResult, VisualizerVariant } from 'audio-pulse';

export default function Recorder() {
  const { recordState, start, pause, stop, reset } = useAudioRecorder();
  const [audio, setAudio] = useState<AudioResult | null>(null);

  const handleStop = (result: AudioResult) => {
    setAudio(result);
  };

  const handleStartAgain = () => {
    setAudio(null);
    reset();
    setTimeout(start, 0);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>

      {/* Always mounted — hide with display:none, never unmount */}
      <div style={{ display: audio ? 'none' : 'block' }}>
        <AudioPulse
          state={recordState}
          onStop={handleStop}
          onError={(err) => console.error(err)}
          variant={VisualizerVariant.BARS}
          foregroundColor="#3b82f6"
          backgroundColor="#0f172a"
          lineWidth={2}
          height={80}
          style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>

        {/* IDLE */}
        {recordState === RecordState.NONE && !audio && (
          <button onClick={start}>🎙 Start</button>
        )}

        {/* RECORDING */}
        {recordState === RecordState.START && (
          <>
            <button onClick={pause}>⏸ Pause</button>
            <button onClick={stop}>⏹ Stop</button>
          </>
        )}

        {/* PAUSED */}
        {recordState === RecordState.PAUSE && (
          <>
            <button onClick={start}>▶ Resume</button>
            <button onClick={stop}>⏹ Stop</button>
          </>
        )}

        {/* STOPPED — show player */}
        {audio && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <audio controls src={audio.url} style={{ width: '100%' }} />
            <button onClick={handleStartAgain}>🎙 Start Again</button>
          </div>
        )}

      </div>
    </div>
  );
}
```

---

## `variant` Prop

```tsx
import { VisualizerVariant } from 'audio-pulse';

<AudioPulse variant={VisualizerVariant.LINE}   ... />  // smooth bezier wave (default)
<AudioPulse variant={VisualizerVariant.BARS}   ... />  // frequency bar chart
<AudioPulse variant={VisualizerVariant.MIRROR} ... />  // wave mirrored top + bottom
<AudioPulse variant={VisualizerVariant.DOTS}   ... />  // dot particle wave
<AudioPulse variant={VisualizerVariant.CIRCLE} ... />  // radial circular wave
```

Or use the string values directly:

```tsx
<AudioPulse variant="bars" ... />
```

---

## Light Theme Example

```tsx
<AudioPulse
  state={recordState}
  onStop={handleStop}
  variant="mirror"
  foregroundColor="#3b82f6"
  backgroundColor="#f0f5ff"
  lineWidth={2}
  height={80}
  style={{
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #b4c8e6',
  }}
/>
```

---

## Quick Start (minimal)

```tsx
import { useState } from 'react';
import AudioPulse, { RecordState, RecordStateType, AudioResult } from 'audio-pulse';

export default function App() {
  const [state, setState] = useState<RecordStateType>(RecordState.NONE);

  const handleStop = (audio: AudioResult) => {
    console.log(audio.url);   // object URL → use in <audio src={...} />
    console.log(audio.blob);  // Blob (audio/mp3)
  };

  return (
    <>
      <AudioPulse state={state} onStop={handleStop} />
      <button onClick={() => setState(RecordState.START)}>Start</button>
      <button onClick={() => setState(RecordState.PAUSE)}>Pause</button>
      <button onClick={() => setState(RecordState.STOP)}>Stop</button>
    </>
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `RecordStateType` | — | **Required.** Current recording state |
| `onStop` | `(result: AudioResult) => void` | — | Called with audio data when recording stops |
| `onError` | `(error: string) => void` | — | Called when mic access is denied |
| `variant` | `VisualizerVariantType` | `'line'` | Visualizer style — `line`, `bars`, `circle`, `mirror`, `dots` |
| `foregroundColor` | `string` | `'#3b82f6'` | Waveform stroke / fill color |
| `backgroundColor` | `string` | `'transparent'` | Canvas background fill |
| `lineWidth` | `number` | `2` | Stroke width in px (line, mirror, circle) |
| `height` | `number` | `60` | Canvas height in px |
| `smoothingTimeConstant` | `number` | `0.8` | Analyser smoothing 0–1. Lower = more reactive |
| `fftSize` | `number` | `512` | FFT size (power of 2). Lower = more dramatic movement |
| `barSkipBins` | `number` | `4` | `bars` only — low-frequency bins to skip (removes DC offset hum) |
| `barSilenceThreshold` | `number` | `20` | `bars` only — minimum bin value 0–255 to draw a bar (hides idle noise) |
| `className` | `string` | `''` | CSS class on the outer wrapper |
| `style` | `CSSProperties` | `{}` | Inline style on the outer wrapper |
| `canvasStyle` | `CSSProperties` | `{}` | Inline style on `<canvas>` |
| `renderVisualizer` | `(ref) => ReactNode` | — | Custom render prop — replaces default canvas |

---

## `RecordState`

```ts
import { RecordState } from 'audio-pulse';

RecordState.START  // 'start'  — recording
RecordState.PAUSE  // 'pause'  — paused
RecordState.STOP   // 'stop'   — stopped, onStop fires
RecordState.NONE   // 'none'   — initial / reset
```

## `VisualizerVariant`

```ts
import { VisualizerVariant } from 'audio-pulse';

VisualizerVariant.LINE    // 'line'
VisualizerVariant.BARS    // 'bars'
VisualizerVariant.CIRCLE  // 'circle'
VisualizerVariant.MIRROR  // 'mirror'
VisualizerVariant.DOTS    // 'dots'
```

---

## `AudioResult`

```ts
interface AudioResult {
  blob: Blob;    // Raw MP3 Blob
  url:  string;  // Object URL — use in <audio src={url} />
  type: string;  // 'audio/mp3'
}
```

---

## `useAudioRecorder` Hook

```ts
const { recordState, start, pause, stop, toggle, reset } = useAudioRecorder();
```

| Return | Type | Description |
|--------|------|-------------|
| `recordState` | `RecordStateType` | Current state |
| `start` | `() => void` | Start or resume recording |
| `pause` | `() => void` | Pause recording |
| `stop` | `() => void` | Stop and trigger `onStop` |
| `toggle` | `() => void` | Toggle START ↔ PAUSE |
| `reset` | `() => void` | Reset back to NONE |

---

## Custom Canvas Renderer

Full control — you render the canvas, audio-pulse drives it:

```tsx
<AudioPulse
  state={recordState}
  onStop={handleStop}
  renderVisualizer={(ref) => (
    <div style={{ background: '#000', padding: 16, borderRadius: 8 }}>
      <canvas ref={ref} width={500} height={120} style={{ display: 'block', width: '100%' }} />
    </div>
  )}
/>
```

---

## Advanced: Raw Context Access

```tsx
import {
  MediaStreamProvider, InputAudioProvider,
  AudioAnalyserProvider, useAudioAnalyser, useMediaStream,
} from 'audio-pulse';

function MyVisualizer() {
  const { analyser } = useAudioAnalyser();
  const { start, stop } = useMediaStream();
  return <canvas />;
}

function App() {
  return (
    <MediaStreamProvider audio video={false}>
      <InputAudioProvider>
        <AudioAnalyserProvider>
          <MyVisualizer />
        </AudioAnalyserProvider>
      </InputAudioProvider>
    </MediaStreamProvider>
  );
}
```

---

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Native |
| Edge | ✅ Native |
| Firefox | ✅ via polyfill |
| Safari | ✅ via polyfill |

> Mic access requires **HTTPS** in production.

---

## License

MIT © [Ashish Vora](https://github.com/ashishvora1997)