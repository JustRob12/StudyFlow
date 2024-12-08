import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
    const storedState = localStorage.getItem('timerState');
    if (storedState) {
      try {
        const state = JSON.parse(storedState);
        const now = Date.now();
        const elapsedTime = state.isPaused ? 0 : Math.floor((now - state.lastTick) / 1000);
        const newTimeLeft = Math.max(0, state.timeLeft - elapsedTime);

        setLocalTimeLeft(newTimeLeft);
        setIsPaused(state.isPaused);
        if (state.taskId && state.duration) {
          setActiveTimer({
            taskId: state.taskId,
            duration: state.duration
          });
        }
        lastTickRef.current = now;
      } catch (err) {
        console.error('Failed to restore timer state:', err);
        localStorage.removeItem('timerState');
      }
    }
  }, []);

  // Save timer state
  const saveTimerState = useCallback(() => {
    if (activeTimer) {
      localStorage.setItem('timerState', JSON.stringify({
        timeLeft: localTimeLeft,
        isPaused,
        taskId: activeTimer.taskId,
        duration: activeTimer.duration,
        lastTick: Date.now()
      }));
    }
  }, [activeTimer, localTimeLeft, isPaused]);

  // Handle timer countdown
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (activeTimer && !isPaused && localTimeLeft > 0) {
      lastTickRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        
        if (elapsed >= 1) {
          setLocalTimeLeft(prev => {
            const newTimeLeft = Math.max(0, prev - elapsed);
            lastTickRef.current = now;
            return newTimeLeft;
          });
          saveTimerState();
        }
      }, 1000);
    } else {
      saveTimerState();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTimer?.taskId, isPaused, saveTimerState]);

  // Check for completion
  useEffect(() => {
    if (localTimeLeft === 0 && activeTimer) {
      completeTimer();
    }
  }, [localTimeLeft]);

  const startTimer = async (taskId, duration) => {
    try {
      const durationInSeconds = (duration.hours * 3600) + (duration.minutes * 60);
      
      setActiveTimer({
        taskId,
        duration: durationInSeconds
      });
      setLocalTimeLeft(durationInSeconds);
      setIsPaused(false);
      lastTickRef.current = Date.now();
      
      localStorage.setItem('timerState', JSON.stringify({
        timeLeft: durationInSeconds,
        isPaused: false,
        taskId,
        duration: durationInSeconds,
        lastTick: Date.now()
      }));
      
      return true;
    } catch (error) {
      console.error('Error starting timer:', error);
      setError('Failed to start timer');
      return false;
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
    saveTimerState();
  };

  const resumeTimer = () => {
    setIsPaused(false);
    lastTickRef.current = Date.now();
    saveTimerState();
  };

  const completeTimer = () => {
    try {
      setActiveTimer(null);
      setLocalTimeLeft(0);
      setIsPaused(false);
      localStorage.removeItem('timerState');
      return true;
    } catch (error) {
      console.error('Error completing timer:', error);
      return false;
    }
  };

  const value = {
    activeTimer,
    timeLeft: localTimeLeft,
    isPaused,
    error,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer
  };

  return (
    <TimerContext.Provider value={value}>
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