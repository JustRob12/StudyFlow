import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { getSubjectIcon } from '../utils/subjectIcons';
import BottomBar from './BottomBar';
import ConfirmModal from './ConfirmModal';
import EditTaskModal from './EditTaskModal';
import Header from './Header';
import SuccessModal from './SuccessModal';
import TaskTimer from './TaskTimer';

const ViewTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [successMessage, setSuccessMessage] = useState({ show: false, text: '', icon: null, variant: null, buttonText: null });
  const navigate = useNavigate();
  const { startTimer, activeTimer, completeTimer } = useTimer();
  const [taskProgress, setTaskProgress] = useState({
    todayCompleted: 0,
    weeklyCompleted: 0,
    totalTasks: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchUser();
    const intervalId = setInterval(() => {
      fetchTasks();
      if (activeTimer?.taskId) {
        const activeTask = tasks.find(task => task._id === activeTimer.taskId);
        if (activeTask && !activeTask.isStarted) {
          setTasks(prevTasks => 
            prevTasks.map(t => ({
              ...t,
              isStarted: t._id === activeTimer.taskId
            }))
          );
        }
      }
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, [activeTimer?.taskId]);

  useEffect(() => {
    if (activeTimer?.taskId) {
      setTasks(prevTasks => {
        if (prevTasks.some(t => t._id === activeTimer.taskId && !t.isStarted)) {
          return prevTasks.map(t => ({
            ...t,
            isStarted: t._id === activeTimer.taskId
          }));
        }
        return prevTasks;
      });
    }
  }, [activeTimer]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [userResponse, tasksResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userResponse.data);
      setTasks(tasksResponse.data);
      calculateTaskProgress(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task) => {
    try {
      if (activeTimer?.taskId === task._id) return;
      
      const success = await startTimer(task._id, task.duration);
      if (success) {
        setTasks(prevTasks => 
          prevTasks.map(t => ({
            ...t,
            isStarted: t._id === task._id
          }))
        );
      }
    } catch (error) {
      console.error('Error starting task:', error);
      await fetchTasks();
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t._id === taskId);
      
      if (!task) return;

      if (activeTimer?.taskId === taskId) {
        const timerCompleted = await completeTimer();
        if (!timerCompleted) {
          console.error('Failed to complete timer');
          return;
        }
        localStorage.removeItem('activeTask');
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/history`,
        {
          taskId: task._id,
          title: task.title,
          subject: task.subject,
          icon: task.icon,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: (task.duration.hours * 3600) + (task.duration.minutes * 60),
          timeSpent: (task.duration.hours * 3600) + (task.duration.minutes * 60),
          completed: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompletingTask(null);
      setSuccessMessage({
        show: true,
        text: 'Task Completed Successfully',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        variant: 'success',
        buttonText: 'Continue'
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleEditTask = async (editedTask) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${editedTask._id}`,
        editedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeletingTask(null);
      setSuccessMessage({
        show: true,
        text: 'Task Deleted Successfully',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        variant: 'error',
        buttonText: 'Continue'
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
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

  const isTaskPending = (date) => {
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate > today;
  };

  const calculateTaskProgress = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const todayTasks = tasks.filter(task => 
      new Date(task.date).toISOString().split('T')[0] === today
    );

    const weeklyTasks = tasks.filter(task => 
      new Date(task.date) >= weekStart
    );

    setTaskProgress({
      todayCompleted: todayTasks.filter(task => task.completed).length,
      weeklyCompleted: weeklyTasks.filter(task => task.completed).length,
      totalTasks: tasks.length
    });
  };

  const getProgressColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculatePercentage = (current, total) => {
    return Math.min(Math.round((current / total) * 100), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="flex-none">
        <Header user={user} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="animate-slideFromRight">
          <div className="sticky top-0 bg-white shadow z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              </div>
              <p className="text-sm text-gray-500">
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} available
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
            {/* Task list content */}
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task._id} className="bg-[#d0efff] rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSubjectIcon(task.subject)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <p className="text-gray-500 mt-1">
                          Duration: {formatDuration(task.duration)}
                        </p>
                        <p className="text-gray-500">
                          {formatDate(task.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Edit Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingTask(task)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Delete Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCompletingTask(task)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Complete Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <div>
                      {isTaskPending(task.date) ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="text-gray-600">
                            Starts {formatDate(task.date)}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartTask(task)}
                          className={`px-4 py-2 ${
                            task.isStarted || activeTimer?.taskId === task._id
                              ? 'bg-[#90e0ef] text-black cursor-default animate-ellipsis'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          } rounded-lg transition-colors`}
                          disabled={task.isStarted || activeTimer?.taskId === task._id}
                        >
                          {task.isStarted || activeTimer?.taskId === task._id ? 'Task Running' : 'Start Task'}
                        </button>
                      )}
                    </div>
                    {(task.isStarted || activeTimer?.taskId === task._id) && (
                      <TaskTimer
                        taskId={task._id}
                        duration={task.duration}
                        onComplete={() => handleTaskComplete(task._id)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="flex-none">
        <BottomBar />
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl transform transition-transform duration-300 ease-out">
            <EditTaskModal
              task={editingTask}
              onClose={() => setEditingTask(null)}
              onSave={handleEditTask}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => handleDeleteTask(deletingTask?._id)}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        variant="red"
      />

      {/* Complete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!completingTask}
        onClose={() => setCompletingTask(null)}
        onConfirm={() => handleTaskComplete(completingTask?._id)}
        title="Complete Task"
        message="Are you sure you want to mark this task as complete?"
        variant="green"
      />

      {/* Success Message Modal */}
      <SuccessModal
        isOpen={successMessage.show}
        onClose={() => setSuccessMessage({ ...successMessage, show: false })}
        message={successMessage.text}
        icon={successMessage.icon}
        variant={successMessage.variant}
        buttonText={successMessage.buttonText}
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

          @keyframes ellipsis {
            0% { content: ''; }
            25% { content: '.'; }
            50% { content: '..'; }
            75% { content: '...'; }
            100% { content: ''; }
          }

          .animate-slideFromRight {
            animation: slideFromRight 0.3s ease-out forwards;
          }

          .animate-slideFromLeft {
            animation: slideFromLeft 0.3s ease-out forwards;
          }

          .animate-ellipsis::after {
            content: '';
            display: inline-block;
            animation: ellipsis 2s infinite;
            width: 12px;
            text-align: left;
          }
        `}
      </style>
    </div>
  );
};

export default ViewTask;
