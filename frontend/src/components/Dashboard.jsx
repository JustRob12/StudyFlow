import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, tasksAPI } from '../utils/api';
import Header from './Header';
import BottomBar from './BottomBar';
import TaskTimer from './TaskTimer';
import { getSubjectIcon } from '../utils/subjectIcons';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    todayCompleted: 0,
    weeklyCompleted: 0,
    monthlyCompleted: 0,
    totalTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userResponse, tasksResponse, statsResponse] = await Promise.all([
        statsAPI.getUser(),
        tasksAPI.getTasks(),
        statsAPI.getWeeklyStats()
      ]);

      setUser(userResponse.data);
      setTasks(tasksResponse.data);
      setStats({
        todayCompleted: statsResponse.data.todayCompleted,
        weeklyCompleted: statsResponse.data.weeklyCompleted,
        monthlyCompleted: statsResponse.data.monthlyCompleted,
        totalTasks: tasksResponse.data.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task) => {
    try {
      setActiveTimer({ taskId: task._id, duration: task.duration });
      setTasks(prevTasks =>
        prevTasks.map(t => ({
          ...t,
          isStarted: t._id === task._id
        }))
      );
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '0m';
    let result = '';
    if (duration.hours > 0) result += `${duration.hours}h `;
    if (duration.minutes > 0) result += `${duration.minutes}m`;
    return result.trim() || '0m';
  };

  const formatDate = (date) => {
    const taskDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (taskDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return taskDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your study progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              title: "Today's Tasks",
              value: stats.todayCompleted,
              total: stats.totalTasks,
              color: 'bg-blue-500'
            },
            {
              title: 'Weekly Progress',
              value: stats.weeklyCompleted,
              total: stats.totalTasks * 7,
              color: 'bg-green-500'
            },
            {
              title: 'Monthly Progress',
              value: stats.monthlyCompleted,
              total: stats.totalTasks * 30,
              color: 'bg-purple-500'
            },
            {
              title: 'Total Tasks',
              value: stats.totalTasks,
              isTotal: true,
              color: 'bg-gray-500'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </span>
                {!stat.isTotal && (
                  <span className="ml-2 text-sm text-gray-500">
                    / {stat.total}
                  </span>
                )}
              </div>
              {!stat.isTotal && (
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${stat.color}`}
                    style={{
                      width: `${Math.min(
                        (stat.value / stat.total) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Tasks
              </h2>
              <Link
                to="/tasks"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No tasks scheduled for today
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getSubjectIcon(task.subject)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDuration(task.duration)} ·{' '}
                          {formatDate(task.date)}
                        </p>
                      </div>
                    </div>

                    {!task.completed && (
                      <button
                        onClick={() => handleStartTask(task)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          task.isStarted
                            ? 'bg-gray-100 text-gray-600 cursor-default'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={task.isStarted}
                      >
                        {task.isStarted ? 'In Progress' : 'Start'}
                      </button>
                    )}
                  </div>

                  {task.isStarted && (
                    <div className="mt-4">
                      <TaskTimer
                        taskId={task._id}
                        duration={task.duration}
                        onComplete={() => fetchData()}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};

export default Dashboard;
