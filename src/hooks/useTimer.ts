import { useState, useEffect, useCallback } from 'react';

export function useTimer(
  initialTime: number,
  isActive: boolean,
  onTimeEnd: () => void
) {
  const [time, setTime] = useState(initialTime);

  const resetTimer = useCallback(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive && time > 0) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            onTimeEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, time, onTimeEnd]);

  useEffect(() => {
    resetTimer();
  }, [initialTime, resetTimer]);

  return time;
}