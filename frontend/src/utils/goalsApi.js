import api from './api';

export const goalsAPI = {
  // Get user goals
  getGoals: () => api.get('/goals'),
  
  // Update user goals
  updateGoals: (goalsData) => api.put('/goals', goalsData),
  
  // Calculate progress from history
  calculateProgress: (historyData) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Filter today's and week's entries
    const todayEntries = historyData.filter(entry => 
      new Date(entry.date).toISOString().split('T')[0] === today
    );
    const weekEntries = historyData.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    // Calculate daily progress
    const todayStudyHours = Number((todayEntries.reduce((acc, entry) => 
      acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1));
    const todayTasksCompleted = todayEntries.filter(entry => entry.completed).length;
    const todaySubjectsStudied = new Set(todayEntries.map(entry => entry.subject)).size;
    const todayBreaksTaken = todayEntries.filter(entry => entry.isBreak).length;
    const todayFocusTime = Number((todayEntries.filter(entry => !entry.isBreak)
      .reduce((acc, entry) => acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1));

    // Calculate weekly progress
    const weekStudyHours = Number((weekEntries.reduce((acc, entry) => 
      acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1));
    const weekSubjectsStudied = new Set(weekEntries.map(entry => entry.subject)).size;
    const weekAssignmentsCompleted = weekEntries.filter(entry => 
      entry.completed && entry.isAssignment
    ).length;
    const weekRevisionsCompleted = weekEntries.filter(entry => 
      entry.completed && entry.isRevision
    ).length;
    const weekReadingHours = Number((weekEntries.filter(entry => entry.isReading)
      .reduce((acc, entry) => acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1));

    return {
      todayStudyHours,
      todayTasksCompleted,
      todayFocusTime,
      todayBreaksTaken,
      todaySubjectsStudied,
      weekStudyHours,
      weekSubjectsStudied,
      weekAssignmentsCompleted,
      weekRevisionsCompleted,
      weekReadingHours,
    };
  }
};
