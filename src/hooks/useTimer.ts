/**
 * Custom hook for managing game timer
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMER_UPDATE_INTERVAL } from '@/lib/constants';

interface UseTimerReturn {
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => number;
}

export function useTimer(): UseTimerReturn {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      setIsRunning(true);
    }
  }, [isRunning]);

  // Pause the timer
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      pausedTimeRef.current = elapsed;
    }
  }, [isRunning, elapsed]);

  // Reset the timer to zero
  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Stop the timer and return the final elapsed time
  const stop = useCallback(() => {
    const finalTime = elapsed;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return finalTime;
  }, [elapsed]);

  // Update elapsed time while running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsed(Date.now() - startTimeRef.current);
        }
      }, TIMER_UPDATE_INTERVAL);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    elapsed,
    isRunning,
    start,
    pause,
    reset,
    stop,
  };
}
