import api from './api';

export const tasksAPI = {
  // Get all tasks
  getTasks: () => api.get('/tasks'),
  
  // Get today's tasks
  getTodayTasks: async () => {
    const response = await api.get('/tasks');
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = response.data.filter(task => 
      new Date(task.date).toISOString().split('T')[0] === today
    );
    return { data: todayTasks };
  },
  
  // Get completed tasks
  getCompletedTasks: () => api.get('/history?completed=true'),
  
  // Get weekly stats
  getWeeklyStats: async () => {
    const response = await api.get('/history');
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekHistory = response.data.filter(entry => 
      new Date(entry.endTime) >= weekStart
    );
    
    const todayCompleted = weekHistory.filter(entry => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(entry.endTime).toISOString().split('T')[0] === today;
    }).length;
    
    const weeklyCompleted = weekHistory.length;
    
    return {
      data: {
        todayCompleted,
        weeklyCompleted,
        studyHours: Math.round(weekHistory.reduce((acc, entry) => acc + (entry.timeSpent / 3600), 0)),
        subjects: new Set(weekHistory.map(entry => entry.subject))
      }
    };
  },
  
  // Get streak
  getStreak: async () => {
    const response = await api.get('/history');
    const streak = calculateStreak(response.data);
    return { data: { streak } };
  },
  
  // Get completed total
  getCompletedTotal: async () => {
    const response = await api.get('/history?completed=true');
    return { data: { total: response.data.length } };
  },
  
  // Get user
  getUser: () => api.get('/auth/user'),
  
  // Get history
  getHistory: () => api.get('/history'),
  
  // Get a single task
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  
  // Create a new task
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // Update a task
  updateTask: (taskId, taskData) => api.patch(`/tasks/${taskId}`, taskData),
  
  // Delete a task
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  
  // Complete a task and create history entry
  completeTask: async (taskId) => {
    const task = await api.get(`/tasks/${taskId}`);
    const totalSeconds = (task.data.duration.hours * 3600) + (task.data.duration.minutes * 60);
    
    // Create history entry
    await api.post('/history', {
      taskId,
      title: task.data.title,
      subject: task.data.subject,
      icon: task.data.icon,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: totalSeconds,
      timeSpent: totalSeconds,
      completed: true,
      status: 'completed'
    });
    
    // Delete the completed task
    return api.delete(`/tasks/${taskId}`);
  },
  
  // Pause timer
  pauseTimer: (taskId) => api.post(`/timers/${taskId}/pause`),
};

// Helper function to calculate streak
const calculateStreak = (historyData) => {
  if (!historyData.length) return 0;
  
  const today = new Date().setHours(0, 0, 0, 0);
  const sortedDates = historyData
    .map(entry => new Date(entry.endTime).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a); // Sort in descending order
  
  let currentStreak = 0;
  let currentDate = today;
  
  // Check if there's activity today
  const hasActivityToday = sortedDates.includes(today);
  if (!hasActivityToday) {
    // If no activity today, check if there was activity yesterday
    const yesterday = today - 86400000; // 24 hours in milliseconds
    if (!sortedDates.includes(yesterday)) return 0;
    currentDate = yesterday;
  }

  // Calculate streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i] === currentDate) {
      currentStreak++;
      currentDate -= 86400000; // Move to previous day
    } else if (sortedDates[i] < currentDate) {
      break; // Break if we find a gap
    }
  }

  return currentStreak;
};

export default tasksAPI;
