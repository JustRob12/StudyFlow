import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyflow-k4ec.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log('Making request to:', config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints grouped by feature
const apiEndpoints = {
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  },
  stats: {
    getUser: () => api.get('/api/user'),
    getStats: () => api.get('/api/stats'),
    updateStats: (statsData) => api.post('/api/stats', statsData),
    getWeeklyStats: () => api.get('/api/stats/weekly'),
    getDailyStats: () => api.get('/api/stats/daily'),
    getHistory: () => api.get('/api/history'),
    updateProfile: (userData) => api.put('/api/user/profile', userData),
    uploadProfileImage: (formData) => api.post('/api/user/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    calculateStats: (historyData) => {
      const completedTasks = historyData.filter(entry => entry.completed).length || 0;
      const studyHours = Number((historyData.reduce((acc, entry) => {
        return acc + (entry.timeSpent || 0);
      }, 0) / 3600).toFixed(1)) || 0;
      return { completedTasks, studyHours };
    }
  },
  tasks: {
    getTasks: () => api.get('/api/tasks'),
    getTodayTasks: async () => {
      const response = await api.get('/api/tasks');
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = response.data.filter(task => 
        new Date(task.date).toISOString().split('T')[0] === today
      );
      return { data: todayTasks };
    },
    getCompletedTasks: () => api.get('/api/history?completed=true'),
    getStreak: () => api.get('/api/stats/streak'),
    getCompletedTotal: () => api.get('/api/stats/completed'),
    getHistory: () => api.get('/api/history'),
    getTask: (taskId) => api.get(`/api/tasks/${taskId}`),
    createTask: (taskData) => api.post('/api/tasks', taskData),
    updateTask: (taskId, taskData) => api.put(`/api/tasks/${taskId}`, taskData),
    deleteTask: (taskId) => api.delete(`/api/tasks/${taskId}`),
    completeTask: (taskId) => api.post(`/api/tasks/${taskId}/complete`),
    pauseTimer: (taskId) => api.post(`/api/tasks/${taskId}/pause`)
  },
  goals: {
    getGoals: () => api.get('/api/goals'),
    updateGoals: (goalsData) => api.put('/api/goals', goalsData),
    calculateProgress: (historyData) => {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const todayEntries = historyData.filter(entry => 
        new Date(entry.date).toISOString().split('T')[0] === today
      );
      const weekEntries = historyData.filter(entry => 
        new Date(entry.date) >= weekStart
      );

      return {
        today: {
          studyHours: Number((todayEntries.reduce((acc, entry) => 
            acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1)),
          tasksCompleted: todayEntries.filter(entry => entry.completed).length,
          subjectsStudied: new Set(todayEntries.map(entry => entry.subject)).size,
          breaksTaken: todayEntries.filter(entry => entry.isBreak).length,
          focusTime: Number((todayEntries.filter(entry => !entry.isBreak)
            .reduce((acc, entry) => acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1))
        },
        week: {
          studyHours: Number((weekEntries.reduce((acc, entry) => 
            acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1)),
          tasksCompleted: weekEntries.filter(entry => entry.completed).length,
          subjectsStudied: new Set(weekEntries.map(entry => entry.subject)).size,
          breaksTaken: weekEntries.filter(entry => entry.isBreak).length,
          focusTime: Number((weekEntries.filter(entry => !entry.isBreak)
            .reduce((acc, entry) => acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1))
        }
      };
    }
  },
  timer: {
    startTimer: (taskId) => api.post('/api/timers/start', { taskId }),
    pauseTimer: (taskId) => api.post('/api/timers/pause', { taskId }),
    getTimerStatus: (taskId) => api.get(`/api/timers/${taskId}`),
    updateProgress: (taskId, timeSpent) => api.post(`/api/timers/${taskId}/update`, { timeSpent }),
    completeTimer: (taskId) => api.post(`/api/timers/${taskId}/complete`),
    getActiveTimer: () => api.get('/api/timers/active'),
    saveLocalTimerState: (state) => {
      localStorage.setItem('timerState', JSON.stringify({
        ...state,
        lastTick: Date.now()
      }));
    },
    getLocalTimerState: () => {
      const storedState = localStorage.getItem('timerState');
      if (!storedState) return null;
      return JSON.parse(storedState);
    },
    clearLocalTimerState: () => {
      localStorage.removeItem('timerState');
    }
  }
};

// Export individual APIs for backward compatibility
export const authAPI = apiEndpoints.auth;
export const statsAPI = apiEndpoints.stats;
export const tasksAPI = apiEndpoints.tasks;
export const goalsAPI = apiEndpoints.goals;
export const timerAPI = apiEndpoints.timer;

// Export the grouped endpoints
export { apiEndpoints };

// Export the base axios instance
export default api;
