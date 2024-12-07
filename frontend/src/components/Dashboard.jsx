import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />

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

      <BottomBar />
    </div>
  );
};

export default Dashboard;
