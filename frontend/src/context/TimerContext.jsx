import { createContext, useContext, useState, useEffect } from 'react';
import { timerAPI } from '../utils/api';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);

  useEffect(() => {
    // Load timer state from localStorage on mount
    const savedState = timerAPI.getLocalTimerState();
    if (savedState) {
      setActiveTimer(savedState);
    }
  }, []);

  const startTimer = (taskId) => {
    const newTimer = {
      taskId,
      startTime: Date.now(),
      isRunning: true
    };
    setActiveTimer(newTimer);
    timerAPI.saveLocalTimerState(newTimer);
  };

  const pauseTimer = () => {
    if (activeTimer) {
      const pausedTimer = {
        ...activeTimer,
        isRunning: false,
        pauseTime: Date.now()
      };
      setActiveTimer(pausedTimer);
      timerAPI.saveLocalTimerState(pausedTimer);
    }
  };

  const resumeTimer = () => {
    if (activeTimer) {
      const resumedTimer = {
        ...activeTimer,
        isRunning: true,
        startTime: Date.now() - (activeTimer.pauseTime - activeTimer.startTime)
      };
      setActiveTimer(resumedTimer);
      timerAPI.saveLocalTimerState(resumedTimer);
    }
  };

  const clearActiveTimer = () => {
    setActiveTimer(null);
    timerAPI.clearLocalTimerState();
  };

  return (
    <TimerContext.Provider value={{
      activeTimer,
      startTimer,
      pauseTimer,
      resumeTimer,
      clearActiveTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
}; 