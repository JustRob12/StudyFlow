import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { timerAPI } from '../utils/timerApi';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  // Initialize timer state
  useEffect(() => {
    const storedState = timerAPI.getLocalTimerState();
    if (storedState) {
      setLocalTimeLeft(storedState.timeLeft);
      setIsPaused(storedState.isPaused);
      if (storedState.taskId && storedState.duration) {
        setActiveTimer({
          taskId: storedState.taskId,
          duration: storedState.duration
        });
      }
      lastTickRef.current = storedState.lastTick;
    }
  }, []);

  // Save timer state
  const saveTimerState = useCallback(() => {
    if (activeTimer) {
      timerAPI.saveLocalTimerState({
        timeLeft: localTimeLeft,
        isPaused,
        taskId: activeTimer.taskId,
        duration: activeTimer.duration
      });
    }
  }, [activeTimer, localTimeLeft, isPaused]);

  // Start timer
  const startTimer = useCallback(async (taskId, duration) => {
    try {
      await timerAPI.startTimer(taskId);
      setActiveTimer({ taskId, duration });
      setLocalTimeLeft(duration);
      setIsPaused(false);
      lastTickRef.current = Date.now();
      saveTimerState();
    } catch (err) {
      setError('Failed to start timer');
      console.error('Timer start error:', err);
    }
  }, [saveTimerState]);

  // Pause timer
  const pauseTimer = useCallback(async () => {
    if (!activeTimer?.taskId) return;
    try {
      await timerAPI.pauseTimer(activeTimer.taskId);
      setIsPaused(true);
      saveTimerState();
    } catch (err) {
      setError('Failed to pause timer');
      console.error('Timer pause error:', err);
    }
  }, [activeTimer, saveTimerState]);

  // Resume timer
  const resumeTimer = useCallback(async () => {
    if (!activeTimer?.taskId) return;
    try {
      await timerAPI.resumeTimer(activeTimer.taskId);
      setIsPaused(false);
      lastTickRef.current = Date.now();
      saveTimerState();
    } catch (err) {
      setError('Failed to resume timer');
      console.error('Timer resume error:', err);
    }
  }, [activeTimer, saveTimerState]);

  // Stop timer
  const stopTimer = useCallback(async () => {
    if (!activeTimer?.taskId) return;
    try {
      await timerAPI.stopTimer(activeTimer.taskId);
      setActiveTimer(null);
      setLocalTimeLeft(null);
      setIsPaused(false);
      timerAPI.clearLocalTimerState();
    } catch (err) {
      setError('Failed to stop timer');
      console.error('Timer stop error:', err);
    }
  }, [activeTimer]);

  // Timer tick effect
  useEffect(() => {
    if (activeTimer && !isPaused && localTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        lastTickRef.current = now;

        setLocalTimeLeft(prev => {
          const newTimeLeft = Math.max(0, prev - elapsed);
          if (newTimeLeft === 0) {
            clearInterval(intervalRef.current);
            timerAPI.completeTimer(activeTimer.taskId).catch(err => {
              console.error('Failed to complete timer:', err);
            });
          }
          return newTimeLeft;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [activeTimer, isPaused, localTimeLeft]);

  // Save state on changes
  useEffect(() => {
    saveTimerState();
  }, [localTimeLeft, isPaused, saveTimerState]);

  const clearActiveTimer = useCallback(() => {
    setActiveTimer(null);
    setLocalTimeLeft(null);
    setIsPaused(false);
    timerAPI.clearLocalTimerState();
  }, []);

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        localTimeLeft,
        isPaused,
        error,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        clearActiveTimer
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export default TimerContext;