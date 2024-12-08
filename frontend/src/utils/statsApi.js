import api from './api';

export const statsAPI = {
  // Get user history
  getHistory: () => api.get('/history'),
  
  // Get user stats
  getUserStats: () => api.get('/stats'),
  
  // Get weekly stats
  getWeeklyStats: () => api.get('/stats/weekly'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/user/profile', userData),
  
  // Upload profile image
  uploadProfileImage: (formData) => api.post('/user/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Calculate stats from history
  calculateStats: (historyData) => {
    const completedTasks = historyData.filter(entry => entry.completed).length || 0;
    
    const studyHours = Number((historyData.reduce((acc, entry) => {
      return acc + (entry.timeSpent || 0);
    }, 0) / 3600).toFixed(1)) || 0;
    
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const todayEntries = historyData.filter(entry => 
      new Date(entry.endTime).toISOString().split('T')[0] === today
    );
    
    const weekEntries = historyData.filter(entry => 
      new Date(entry.endTime) >= weekStart
    );
    
    return {
      completedTasks,
      studyHours,
      todayEntries,
      weekEntries
    };
  }
};
