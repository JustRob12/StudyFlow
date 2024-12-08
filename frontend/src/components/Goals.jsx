import axios from 'axios';
import React, { useEffect, useState } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';

const Goals = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState({
    dailyStudyHours: 2,
    dailyTasks: 3,
    dailyFocusTime: 1,
    dailyBreaks: 4,
    dailySubjects: 2,
    weeklyStudyHours: 10,
    weeklySubjects: 3,
    weeklyAssignments: 5,
    weeklyRevisions: 3,
    weeklyReadingHours: 5,
  });
  const [progress, setProgress] = useState({
    todayStudyHours: 0,
    todayTasksCompleted: 0,
    todayFocusTime: 0,
    todayBreaksTaken: 0,
    todaySubjectsStudied: 0,
    weekStudyHours: 0,
    weekSubjectsStudied: 0,
    weekAssignmentsCompleted: 0,
    weekRevisionsCompleted: 0,
    weekReadingHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (historyData) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Daily calculations
    const todayEntries = historyData.filter(entry => 
      new Date(entry.endTime).toISOString().split('T')[0] === today
    );

    const todaySubjects = new Set(
      todayEntries
        .filter(entry => entry.subject && entry.subject.trim() !== '')
        .map(entry => entry.subject)
    );

    // Calculate daily progress
    const dailyProgress = {
      todayStudyHours: Number((todayEntries.reduce((acc, entry) => 
        acc + ((entry.timeSpent || 0) / 3600), 0)).toFixed(1)),
      todayTasksCompleted: todayEntries.length,
      todayFocusTime: Number((todayEntries.filter(entry => entry.isFocused).reduce((acc, entry) => 
        acc + ((entry.timeSpent || 0) / 3600), 0)).toFixed(1)),
      todayBreaksTaken: todayEntries.filter(entry => entry.isBreak).length,
      todaySubjectsStudied: todaySubjects.size,
    };

    // Weekly calculations
    const weekEntries = historyData.filter(entry => 
      new Date(entry.endTime) >= weekStart
    );

    const weekSubjects = new Set(
      weekEntries
        .filter(entry => entry.subject && entry.subject.trim() !== '')
        .map(entry => entry.subject)
    );

    // Calculate weekly progress
    const weeklyProgress = {
      weekStudyHours: Number((weekEntries.reduce((acc, entry) => 
        acc + ((entry.timeSpent || 0) / 3600), 0)).toFixed(1)),
      weekSubjectsStudied: weekSubjects.size,
      weekAssignmentsCompleted: weekEntries.filter(entry => entry.isAssignment).length,
      weekRevisionsCompleted: weekEntries.filter(entry => entry.isRevision).length,
      weekReadingHours: Number((weekEntries.filter(entry => entry.isReading).reduce((acc, entry) => 
        acc + ((entry.timeSpent || 0) / 3600), 0)).toFixed(1)),
    };

    // Update progress state with both daily and weekly progress
    setProgress({
      ...dailyProgress,
      ...weeklyProgress
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
    <div className="min-h-screen bg-gray-100 animate-slideFromRight">
      <Header user={user} />
      
      {/* Sticky Header Section */}
      <div className="sticky top-[72px] bg-white shadow z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          </div>
          <p className="text-sm text-gray-500">Track your progress towards your study goals</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Daily Goals */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Goals</h3>
              <div className="space-y-4">
                {/* Study Hours Goal */}
                <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Study Hours</span>
                    <span className="text-gray-600">{progress.todayStudyHours}/{goals.dailyStudyHours}h</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(progress.todayStudyHours, goals.dailyStudyHours)}`}
                      style={{ width: `${calculatePercentage(progress.todayStudyHours, goals.dailyStudyHours)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tasks Completed Goal */}
                <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Tasks Completed</span>
                    <span className="text-gray-600">{progress.todayTasksCompleted}/{goals.dailyTasks}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(progress.todayTasksCompleted, goals.dailyTasks)}`}
                      style={{ width: `${calculatePercentage(progress.todayTasksCompleted, goals.dailyTasks)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Focus Time Goal */}
                <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Focus Time</span>
                    <span className="text-gray-600">{progress.todayFocusTime}/{goals.dailyFocusTime}h</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(progress.todayFocusTime, goals.dailyFocusTime)}`}
                      style={{ width: `${calculatePercentage(progress.todayFocusTime, goals.dailyFocusTime)}%` }}
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
                <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Study Hours</span>
                    <span className="text-gray-600">{progress.weekStudyHours}/{goals.weeklyStudyHours}h</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(progress.weekStudyHours, goals.weeklyStudyHours)}`}
                      style={{ width: `${calculatePercentage(progress.weekStudyHours, goals.weeklyStudyHours)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Subject Variety */}
                <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Subject Variety</span>
                    <span className="text-gray-600">{progress.weekSubjectsStudied}/{goals.weeklySubjects}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(progress.weekSubjectsStudied, goals.weeklySubjects)}`}
                      style={{ width: `${calculatePercentage(progress.weekSubjectsStudied, goals.weeklySubjects)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Weekly Assignments */}
                <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Assignments Completed</span>
                    <span className="text-gray-600">{progress.weekAssignmentsCompleted}/{goals.weeklyAssignments}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(progress.weekAssignmentsCompleted, goals.weeklyAssignments)}`}
                      style={{ width: `${calculatePercentage(progress.weekAssignmentsCompleted, goals.weeklyAssignments)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomBar />
    </div>
  );
};

export default Goals;
