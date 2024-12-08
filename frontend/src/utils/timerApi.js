import api from './api';

export const timerAPI = {
  // Start or resume a timer for a task
  startTimer: (taskId) => api.post('/timers/start', { taskId }),
  
  // Pause a timer
  pauseTimer: (taskId) => api.post('/timers/pause', { taskId }),
  
  // Get timer status
  getTimerStatus: (taskId) => api.get(`/timers/${taskId}`),
  
  // Update timer progress
  updateProgress: (taskId, timeSpent) => api.post(`/timers/${taskId}/update`, { timeSpent }),
  
  // Complete a timer
  completeTimer: (taskId) => api.post(`/timers/${taskId}/complete`),
  
  // Get active timer
  getActiveTimer: () => api.get('/timers/active'),
  
  // Local timer state management
  saveLocalTimerState: (state) => {
    localStorage.setItem('timerState', JSON.stringify({
      ...state,
      lastTick: Date.now()
    }));
  },
  
  getLocalTimerState: () => {
    const storedState = localStorage.getItem('timerState');
    if (!storedState) return null;
    
    try {
      const state = JSON.parse(storedState);
      const now = Date.now();
      const elapsedTime = state.isPaused ? 0 : Math.floor((now - state.lastTick) / 1000);
      const newTimeLeft = Math.max(0, state.timeLeft - elapsedTime);
      
      return {
        ...state,
        timeLeft: newTimeLeft,
        lastTick: now
      };
    } catch (err) {
      console.error('Error parsing timer state:', err);
      return null;
    }
  },
  
  clearLocalTimerState: () => {
    localStorage.removeItem('timerState');
  }
};

export default timerAPI;
