import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import BottomBar from './BottomBar';
import ConfirmModal from './ConfirmModal';
import Header from './Header';
import TaskTimer from './TaskTimer';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    studyHours: 0,
    targetHours: 10,
    subjects: new Set(),
    targetSubjects: 3
  });
  const [showTaskConfirm, setShowTaskConfirm] = useState(false);
  const navigate = useNavigate();
  const { activeTimer, clearActiveTimer } = useTimer();
  const [streak, setStreak] = useState(0);
  const [completedTasksTotal, setCompletedTasksTotal] = useState(0);

  // Add CSS animation for the bell
  const bellAnimation = `
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
  `;

  const formatTimeLeft = (endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Ending soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
  };

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
        setTasks(tasksResponse.data);

        // Calculate total completed tasks
        const completedCount = historyResponse.data.filter(entry => entry.completed).length;
        setCompletedTasksTotal(completedCount);
        setCompletedTasks(historyResponse.data);

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

        // Calculate streak from history
        const currentStreak = calculateStreak(historyResponse.data);
        setStreak(currentStreak);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Add this effect to sync with active timer
  useEffect(() => {
    if (activeTimer?.taskId) {
      const fetchActiveTask = async () => {
        try {
          const token = localStorage.getItem('token');
          
          // First, check if the task exists in our current tasks array
          const existingTask = tasks.find(t => t._id === activeTimer.taskId);
          if (existingTask) {
            return; // Task already exists in our state, no need to fetch
          }

          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/tasks/${activeTimer.taskId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (response.data) {
            setTasks(prevTasks => [...prevTasks, response.data]);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // Task doesn't exist anymore, clean up the timer
            const token = localStorage.getItem('token');
            try {
              // Stop the timer on the backend
              await axios.post(
                `${import.meta.env.VITE_API_URL}/timers/pause`,
                { taskId: activeTimer.taskId },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
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

  const DashboardCard = ({ icon, title, description, onClick, color, children }) => (
    <div 
      onClick={onClick}
      className={`${color} p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 
      hover:shadow-xl hover:translate-y-[-4px] flex flex-col h-full border border-gray-100 relative`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{icon}</div>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
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
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fb]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fb]">
      <style>{bellAnimation}</style>
      
      {/* Fixed Header */}
      <div className="flex-none">
        <Header user={user} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="animate-slideFromRight max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Today's Focus</p>
                <span className="text-blue-500">⏰</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">{todayTasks.length}</p>
              <p className="text-xs text-gray-400">Tasks Remaining</p>
            </div>
            
            <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Current Streak</p>
                <span className="text-orange-500">🔥</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 mb-1">{streak}</p>
              <p className="text-xs text-gray-400">Days</p>
            </div>

            <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Active Session</p>
                <span className="text-purple-500">⏱️</span>
              </div>
              {activeTimer ? (
                <>
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
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-purple-600 mb-1">No active session</p>
                  <p className="text-xs text-gray-400">Start a task to begin</p>
                </>
              )}
            </div>

            <div className="bg-[#d0efff] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Weekly Goal</p>
                <span className="text-green-500">🎯</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((weeklyStats.studyHours / weeklyStats.targetHours) * 100)}%
              </p>
              <p className="text-xs text-gray-400">Progress</p>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardCard
              icon={
                <div className="relative inline-block">
                  <span className={`bell-ring ${todayTasks.length > 0 ? 'text-3xl' : ''}`}>🔔</span>
                </div>
              }
              title="Today's Schedule"
              description="Your upcoming study sessions"
              color="bg-[#AFDCEB]"
              onClick={() => todayTasks.length > 0 && setShowTaskConfirm(true)}
            >
              <div className="relative">
                {todayTasks.length > 0 && (
                  <div className="absolute -top-20 -right-2">
                    <div className="relative">
                      <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    </div>
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  {todayTasks.length > 0 ? (
                    todayTasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="bg-white/50 p-3 rounded-lg">
                        <div className="font-medium text-gray-800">{task.title}</div>
                        <div className="text-xs text-gray-500">{task.subject}</div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/50 p-3 rounded-lg text-sm text-gray-500">
                      No scheduled tasks for today
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
            
            <DashboardCard
              icon="📊"
              title="Progress Analytics"
              description="Track your learning journey"
              onClick={() => navigate('/progress')}
              color="bg-[#cbc9ff]"
            >
              <div className="mt-3 space-y-2">
                <div className="bg-white/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Weekly Progress</span>
                    <span className="text-sm text-[#8884ff]">{Math.round((weeklyStats.studyHours / weeklyStats.targetHours) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div 
                      className="bg-[#8884ff] h-2 rounded-full" 
                      style={{ width: `${Math.min((weeklyStats.studyHours / weeklyStats.targetHours) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </DashboardCard>

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

          ${bellAnimation}
        `}
      </style>
    </div>
  );
};

export default Dashboard;
