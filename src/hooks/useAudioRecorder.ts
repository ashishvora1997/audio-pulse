import { useState, useCallback } from 'react';
import { RecordState } from '../types';
import type { RecordStateType, UseAudioRecorderReturn } from '../types';

/**
 * Convenience hook for controlling a single AudioPulse recorder.
 *
 * @example
 * const { recordState, start, pause, stop, toggle } = useAudioRecorder();
 * <AudioPulse state={recordState} onStop={handleStop} />
 */
const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recordState, setRecordState] = useState<RecordStateType>(RecordState.NONE);

  const start = useCallback(() => setRecordState(RecordState.START), []);
  const pause = useCallback(() => setRecordState(RecordState.PAUSE), []);
  const stop  = useCallback(() => setRecordState(RecordState.STOP),  []);
  const reset = useCallback(() => setRecordState(RecordState.NONE),  []);

  const toggle = useCallback(() => {
    setRecordState((prev) =>
      prev === RecordState.START ? RecordState.PAUSE : RecordState.START
    );
  }, []);

  return { recordState, start, pause, stop, toggle, reset };
};

export default useAudioRecorder;