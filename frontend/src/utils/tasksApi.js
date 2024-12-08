import api from './api';

export const tasksAPI = {
  // Get all tasks
  getTasks: () => api.get('/tasks'),
  
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
  }
};

export default tasksAPI;
