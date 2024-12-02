import { useState, useEffect } from 'react';
import { Player } from '../types/game';

export function useTimer(
  initialTime: number,
  isActive: boolean,
  onTimeEnd: () => void
) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            onTimeEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, onTimeEnd]);

  return time;
}