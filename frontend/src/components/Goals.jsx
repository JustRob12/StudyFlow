import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import BottomBar from './BottomBar';

const Goals = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState({
    dailyStudyHours: 2, // Default 2 hours per day
    weeklyStudyHours: 10, // Default 10 hours per week
    dailyTasks: 3, // Default 3 tasks per day
    weeklySubjects: 3, // Default 3 different subjects per week
  });
  const [progress, setProgress] = useState({
    todayStudyHours: 0,
    weekStudyHours: 0,
    todayTasksCompleted: 0,
    weekSubjectsStudied: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userResponse, historyResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userResponse.data);
      setHistory(historyResponse.data);
      calculateProgress(historyResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateProgress = (historyData) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Calculate today's study hours and tasks
    const todayEntries = historyData.filter(entry => 
      new Date(entry.endTime).toISOString().split('T')[0] === today
    );

    const todayStudyHours = todayEntries.reduce((acc, entry) => 
      acc + ((entry.timeSpent || 0) / 3600), 0
    );

    const todayTasksCompleted = todayEntries.length;

    // Calculate week's study hours and unique subjects
    const weekEntries = historyData.filter(entry => 
      new Date(entry.endTime) >= weekStart
    );

    const weekStudyHours = weekEntries.reduce((acc, entry) => 
      acc + ((entry.timeSpent || 0) / 3600), 0
    );

    const weekSubjects = new Set(
      weekEntries
        .filter(entry => entry.subject && entry.subject.trim() !== '')
        .map(entry => entry.subject)
    );

    setProgress({
      todayStudyHours: Number(todayStudyHours.toFixed(1)),
      weekStudyHours: Number(weekStudyHours.toFixed(1)),
      todayTasksCompleted,
      weekSubjectsStudied: weekSubjects.size,
    });
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculatePercentage = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Study Goals</h2>
          
          {/* Daily Goals */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Goals</h3>
            <div className="space-y-4">
              {/* Study Hours Goal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Study Hours</span>
                  <span className="text-gray-600">{progress.todayStudyHours}/{goals.dailyStudyHours}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(progress.todayStudyHours, goals.dailyStudyHours)}`}
                    style={{ width: `${calculatePercentage(progress.todayStudyHours, goals.dailyStudyHours)}%` }}
                  ></div>
                </div>
              </div>

              {/* Tasks Completed Goal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Tasks Completed</span>
                  <span className="text-gray-600">{progress.todayTasksCompleted}/{goals.dailyTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(progress.todayTasksCompleted, goals.dailyTasks)}`}
                    style={{ width: `${calculatePercentage(progress.todayTasksCompleted, goals.dailyTasks)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Goals</h3>
            <div className="space-y-4">
              {/* Weekly Study Hours */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Study Hours</span>
                  <span className="text-gray-600">{progress.weekStudyHours}/{goals.weeklyStudyHours}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(progress.weekStudyHours, goals.weeklyStudyHours)}`}
                    style={{ width: `${calculatePercentage(progress.weekStudyHours, goals.weeklyStudyHours)}%` }}
                  ></div>
                </div>
              </div>

              {/* Subject Variety */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Subject Variety</span>
                  <span className="text-gray-600">{progress.weekSubjectsStudied}/{goals.weeklySubjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(progress.weekSubjectsStudied, goals.weeklySubjects)}`}
                    style={{ width: `${calculatePercentage(progress.weekSubjectsStudied, goals.weeklySubjects)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};

export default Goals;
