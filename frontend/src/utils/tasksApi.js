import api from './api';

export const tasksAPI = {
  // Get all tasks
  getTasks: () => api.get('/tasks'),
  
  // Get today's tasks
  getTodayTasks: () => api.get('/tasks/today'),
  
  // Get completed tasks
  getCompletedTasks: () => api.get('/tasks/completed'),
  
  // Create a new task
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // Update a task
  updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  
  // Delete a task
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  
  // Complete a task
  completeTask: (taskId) => api.put(`/tasks/${taskId}/complete`),
  
  // Get weekly stats
  getWeeklyStats: () => api.get('/tasks/stats/weekly'),
  
  // Get user streak
  getStreak: () => api.get('/tasks/stats/streak'),
  
  // Get total completed tasks
  getCompletedTotal: () => api.get('/tasks/stats/completed-total')
};

export default tasksAPI;
