import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Function to fetch timer from server
  const fetchActiveTimer = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/timers/active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setActiveTimer(response.data);
        setLocalTimeLeft(response.data.timeRemaining);
        setIsPaused(false);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Error fetching timer:', error);
    }
  }, []);

  // Update timer when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (activeTimer && !isPaused) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
        setLocalTimeLeft(prev => Math.max(0, prev - elapsedSeconds));
        setLastUpdate(now);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTimer, isPaused, lastUpdate]);

  // Local countdown effect
  useEffect(() => {
    let intervalId;
    
    if (activeTimer?.isRunning && localTimeLeft > 0 && !isPaused) {
      intervalId = setInterval(() => {
        setLocalTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          // Store current state in localStorage
          const timerState = {
            timeLeft: newTime,
            lastUpdate: Date.now(),
            isPaused: false,
            timerId: activeTimer._id,
            taskId: activeTimer.taskId
          };
          localStorage.setItem('timerState', JSON.stringify(timerState));
          return newTime;
        });
        setLastUpdate(Date.now());
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimer?.isRunning, activeTimer?._id, isPaused]);

  // Restore timer state on mount and after page changes
  useEffect(() => {
    const storedState = localStorage.getItem('timerState');
    if (storedState) {
      const state = JSON.parse(storedState);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - state.lastUpdate) / 1000);
      const adjustedTimeLeft = Math.max(0, state.timeLeft - (state.isPaused ? 0 : elapsedSeconds));

      setLocalTimeLeft(adjustedTimeLeft);
      setIsPaused(state.isPaused);
      setLastUpdate(now);

      // Fetch fresh timer data from server
      fetchActiveTimer();
    }
  }, [fetchActiveTimer]);

  // Sync with server periodically
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (activeTimer && !isPaused) {
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `${import.meta.env.VITE_API_URL}/timers/sync`,
            {
              taskId: activeTimer.taskId,
              timeRemaining: localTimeLeft
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error('Error syncing timer:', error);
        }
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [activeTimer, localTimeLeft, isPaused]);

  const startTimer = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/timers/start`,
        { taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveTimer(response.data);
      setLocalTimeLeft(response.data.timeRemaining);
      setIsPaused(false);
      setLastUpdate(Date.now());
      
      localStorage.setItem('timerState', JSON.stringify({
        timeLeft: response.data.timeRemaining,
        lastUpdate: Date.now(),
        isPaused: false,
        timerId: response.data._id,
        taskId: response.data.taskId
      }));
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const pauseTimer = async (taskId) => {
    try {
      setIsPaused(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/timers/pause`,
        { taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      localStorage.setItem('timerState', JSON.stringify({
        timeLeft: localTimeLeft,
        lastUpdate: Date.now(),
        isPaused: true,
        timerId: activeTimer._id,
        taskId: activeTimer.taskId
      }));
      
      setActiveTimer(response.data);
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  };

  const resumeTimer = async (taskId) => {
    try {
      setIsPaused(false);
      setLastUpdate(Date.now());
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/timers/start`,
        { taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveTimer(response.data);
      
      localStorage.setItem('timerState', JSON.stringify({
        timeLeft: localTimeLeft,
        lastUpdate: Date.now(),
        isPaused: false,
        timerId: response.data._id,
        taskId: response.data.taskId
      }));
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  };

  const completeTimer = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const timer = activeTimer;
      
      if (!timer) {
        console.error('No active timer found');
        return;
      }

      try {
        // Get the task details first
        const taskResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const task = taskResponse.data;
        const timeSpent = timer.duration - timer.timeRemaining;
        const endTime = new Date();

        // Create history entry with all details
        await axios.post(
          `${import.meta.env.VITE_API_URL}/history`,
          {
            taskId,
            title: task.title,
            description: task.description,
            startTime: timer.startTime,
            endTime: endTime,
            duration: timer.duration,
            timeSpent: timeSpent,
            completed: true,
            status: 'completed'
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }
        );

        // Delete the task
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
          { 
            headers: { 
              Authorization:`Bearer ${token}` 
            } 
          }
        );

        //  Clear timer state
        setActiveTimer(null);
        setLocalTimeLeft(null);
        setIsPaused(false);
        localStorage.removeItem('timerState');

      } catch (error) {
        console.error('Error in completion process:', error);
      }

    } catch (error) {
      console.error('Error completing timer:', error);
    }
  };

  return (
    <TimerContext.Provider value={{ 
      activeTimer, 
      timeLeft: localTimeLeft,
      isPaused,
      startTimer, 
      pauseTimer,
      resumeTimer,
      completeTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext); 