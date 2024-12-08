<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { tasksAPI } from '../utils/api';
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
import BottomBar from './BottomBar';
import Header from './Header';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    studyHours: 0,
    targetHours: 10,
    subjects: new Set(),
    targetSubjects: 3
  });
  const navigate = useNavigate();
<<<<<<< HEAD
<<<<<<< HEAD
  const { activeTimer, clearActiveTimer } = useTimer();
  const [streak, setStreak] = useState(0);
  const [completedTasksTotal, setCompletedTasksTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          todayResponse,
          completedResponse,
          statsResponse,
          streakResponse,
          totalResponse,
          userResponse,
          historyResponse
        ] = await Promise.all([
          tasksAPI.getTodayTasks(),
          tasksAPI.getCompletedTasks(),
          tasksAPI.getWeeklyStats(),
          tasksAPI.getStreak(),
          tasksAPI.getCompletedTotal(),
          tasksAPI.getUser(),
          tasksAPI.getHistory()
        ]);

        setUser(userResponse.data);
        setTodayTasks(todayResponse.data);
        setCompletedTasks(completedResponse.data);
        setWeeklyStats(statsResponse.data);
        setStreak(streakResponse.data.streak);
        setCompletedTasksTotal(totalResponse.data.total);

        // Calculate total completed tasks
        const completedCount = historyResponse.data.filter(entry => entry.completed).length;
        setCompletedTasksTotal(completedCount);
        setCompletedTasks(historyResponse.data);

        // Filter today's tasks
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = todayResponse.data.filter(task => 
          new Date(task.date).toISOString().split('T')[0] === today
        );
        setTodayTasks(todayEvents);

        // Process history for weekly stats
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekHistory = historyResponse.data.filter(entry => 
          new Date(entry.endTime) >= weekStart
        );
        
        const totalHours = weekHistory.reduce((acc, entry) => acc + (entry.timeSpent / 3600), 0);
        const uniqueSubjects = new Set(weekHistory.map(entry => entry.subject));
        
        setWeeklyStats(prev => ({
          ...prev,
          studyHours: Math.round(totalHours),
          subjects: uniqueSubjects
        }));

        // Calculate streak from history
        const currentStreak = calculateStreak(historyResponse.data);
        setStreak(currentStreak);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  // Add this function to calculate streak
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
=======
>>>>>>> parent of fabc826 (second commit)

  useEffect(() => {
    if (activeTimer?.taskId) {
      const fetchActiveTask = async () => {
        try {
          const response = await tasksAPI.getTask(activeTimer.taskId);
          
          if (response.data) {
            setTasks(prevTasks => [...prevTasks, response.data]);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // Task doesn't exist anymore, clean up the timer
            try {
              // Stop the timer on the backend
              await tasksAPI.pauseTimer(activeTimer.taskId);
              
              // Clear the active timer from context
              if (typeof clearActiveTimer === 'function') {
                clearActiveTimer();
              }
            } catch (cleanupError) {
              console.error('Error cleaning up timer:', cleanupError);
            }
          } else {
            console.error('Error fetching active task:', error);
          }
        }
      };
      fetchActiveTask();
    }
  }, [activeTimer?.taskId, tasks, clearActiveTimer]);
=======

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userResponse, tasksResponse, historyResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/history`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUser(userResponse.data);

        // Filter today's tasks
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = tasksResponse.data.filter(task => 
          new Date(task.date).toISOString().split('T')[0] === today
        );
        setTodayTasks(todayEvents);

        // Process history for weekly stats
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekHistory = historyResponse.data.filter(entry => 
          new Date(entry.endTime) >= weekStart
        );
        
        const totalHours = weekHistory.reduce((acc, entry) => acc + (entry.timeSpent / 3600), 0);
        const uniqueSubjects = new Set(weekHistory.map(entry => entry.subject));
        
        setWeeklyStats(prev => ({
          ...prev,
          studyHours: Math.round(totalHours),
          subjects: uniqueSubjects
        }));

        setCompletedTasks(weekHistory);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
<<<<<<< HEAD
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)

  const DashboardCard = ({ icon, title, description, onClick, color, children }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-xl shadow-sm cursor-pointer transition-transform hover:scale-105 ${color} flex flex-col h-full`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {children}
    </div>
  );

  const GoalItem = ({ icon, text, status }) => (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
      <span className="text-gray-600">{icon}</span>
      <span className="flex-grow text-gray-700">{text}</span>
      <span className="text-sm text-gray-500">{status}</span>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="flex flex-col h-screen bg-[#f8f9fb]">
      <style>
        {`
          @keyframes bellRing {
            0% { transform: rotate(0); }
            20% { transform: rotate(15deg); }
            40% { transform: rotate(-15deg); }
            60% { transform: rotate(7deg); }
            80% { transform: rotate(-7deg); }
            100% { transform: rotate(0); }
          }
          .bell-ring {
            animation: bellRing 1s ease infinite;
            display: inline-block;
          }
        `}
      </style>
      
      {/* Fixed Header */}
      <div className="flex-none">
        <Header user={user} />
      </div>
=======
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
>>>>>>> parent of fabc826 (second commit)
=======
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
>>>>>>> parent of fabc826 (second commit)

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            icon="📚"
            title="Study Tasks"
            description="Organize and track your study progress"
            onClick={() => navigate('/tasks')}
            color="bg-blue-100"
          />
          
          <DashboardCard
            icon="📊"
            title="Progress Analytics"
            description="Track your learning journey"
            onClick={() => navigate('/progress')}
            color="bg-blue-50"
          >
            <div className="mt-2 text-sm text-gray-600">
              Completed: {completedTasks.length} tasks this week
            </div>
          </DashboardCard>

<<<<<<< HEAD
<<<<<<< HEAD
            <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Active Session</p>
                <span className="text-purple-500">⏱️</span>
              </div>
              {activeTimer ? (
                <div>
                  <div className="text-lg font-bold text-purple-600 truncate mb-1">
                    {tasks.find(t => t._id === activeTimer.taskId)?.title || 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tasks.find(t => t._id === activeTimer.taskId)?.subject || ''}
                  </div>
                  <TaskTimer
                    taskId={activeTimer.taskId}
                    duration={tasks.find(t => t._id === activeTimer.taskId)?.duration}
                    onComplete={() => {
                      // Handle timer completion if needed
                    }}
                  />
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-purple-600 mb-1">No active session</p>
                  <p className="text-xs text-gray-400">Start a task to begin</p>
                </div>
              )}
=======
=======
>>>>>>> parent of fabc826 (second commit)
          <DashboardCard
            icon="🎯"
            title="Goals"
            description="Track your study goals"
            onClick={() => navigate('/goals')}
            color="bg-green-50"
          >
            <div className="mt-2 text-sm text-gray-600">
              {/* Display current progress */}
              <div>Daily: {completedTasks.length} tasks completed</div>
              <div>Weekly: {weeklyStats.studyHours} study hours</div>
<<<<<<< HEAD
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
            </div>
          </DashboardCard>

          <DashboardCard
            icon="🔔"
            title="Reminders"
            description="Stay on top of your schedule"
            color="bg-pink-50"
          >
            {todayTasks.length > 0 ? (
              <div className="mt-2">
                <p className="text-blue-600 text-sm">
                  You have {todayTasks.length} active {todayTasks.length === 1 ? 'reminder' : 'reminders'}
                </p>
                <div className="mt-2 space-y-2">
                  {todayTasks.map(task => (
                    <div key={task._id} className="text-sm text-gray-600 flex items-center space-x-2">
                      <span>•</span>
                      <span>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No active reminders</p>
            )}
          </DashboardCard>
        </div>
      </main>

<<<<<<< HEAD
<<<<<<< HEAD
            <DashboardCard
              icon="🎯"
              title="Study Goals"
              description="Monitor your study targets"
              onClick={() => navigate('/goals')}
              color="bg-[#66b2b2]"
            >
              <div className="mt-3 space-y-2">
                <div className="bg-white/50 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-sm">Daily Goal</span>
                  <span className="text-sm font-medium text-green-600">{completedTasks.length} / 5 tasks</span>
                </div>
                <div className="bg-white/50 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-sm">Study Time</span>
                  <span className="text-sm font-medium text-green-600">{weeklyStats.studyHours}h / {weeklyStats.targetHours}h</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              icon="📚"
              title="Study History"
              description="Review your completed tasks"
              onClick={() => navigate('/history')}
              color="bg-[#FFB6C1]"
            >
              <div className="mt-3">
                <div className="bg-white/50 p-3 rounded-lg text-center">
                  <span className="text-2xl font-bold text-gray-800">{completedTasksTotal}</span>
                  <p className="text-sm text-gray-600">Total Tasks Completed</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </main>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="flex-none">
        <BottomBar />
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showTaskConfirm}
        onClose={() => setShowTaskConfirm(false)}
        onConfirm={() => {
          setShowTaskConfirm(false);
          navigate('/tasks');
        }}
        title="View Tasks"
        message="Do you want to proceed to your tasks?"
        variant="blue"
      />

      <style>
        {`
          @keyframes slideFromRight {
            0% { 
              transform: translateX(20px);
              opacity: 0;
            }
            100% { 
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideFromLeft {
            0% { 
              transform: translateX(-20px);
              opacity: 0;
            }
            100% { 
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slideFromRight {
            animation: slideFromRight 0.3s ease-out forwards;
          }

          .animate-slideFromLeft {
            animation: slideFromLeft 0.3s ease-out forwards;
          }
        `}
      </style>
=======
      <BottomBar />
>>>>>>> parent of fabc826 (second commit)
=======
      <BottomBar />
>>>>>>> parent of fabc826 (second commit)
    </div>
  );
};

export default Dashboard;
