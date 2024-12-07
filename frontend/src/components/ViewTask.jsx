import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomBar from './BottomBar';
import Header from './Header';
import EditTaskModal from './EditTaskModal';
import TaskTimer from './TaskTimer';

const ViewTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);

  useEffect(() => {
    fetchUserAndTasks();
  }, []);

  const fetchUserAndTasks = async () => {
    try {
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Calculate remaining days
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubjectIcon = (subjectId) => {
    const subjects = {
      math: '📐',
      science: '🔬',
      literature: '📚',
      history: '🏛️',
      language: '💭',
      art: '🎨',
      music: '🎵',
      pe: '⚽'
    };
    return subjects[subjectId] || '📚';
  };

  const formatDuration = (duration) => {
    const hours = duration.hours > 0 ? `${duration.hours}h` : '';
    const minutes = duration.minutes > 0 ? `${duration.minutes}m` : '';
    return `${hours} ${minutes}`.trim() || '0m';
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskComplete = async (taskId) => {
    if (window.confirm('Are you sure you want to mark this task as complete?')) {
      try {
        const token = localStorage.getItem('token');
        const task = tasks.find(t => t._id === taskId);
        
        // First, create history entry
        await axios.post(
          `${import.meta.env.VITE_API_URL}/history`,
          {
            taskId: task._id,
            title: task.title,
            description: task.description,
            subject: task.subject || 'General',  
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: task.duration.hours * 3600 + task.duration.minutes * 60,
            timeSpent: task.duration.hours * 3600 + task.duration.minutes * 60,
            completed: true,
            status: 'completed'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Then delete the task
        await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update local state
        setTasks(tasks.filter(t => t._id !== taskId));
        setActiveTimer(null);
      } catch (error) {
        console.error('Error completing task:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header user={user} />
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Tasks</h1>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks yet. Add your first task!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white rounded-xl p-4 shadow-sm border ${
                  new Date(task.date).toDateString() === new Date().toDateString()
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSubjectIcon(task.subject)}</span>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                    </div>
                    <p className="text-gray-500 mt-1">
                      Duration: {formatDuration(task.duration)}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(task.date)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTaskComplete(task._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Complete Task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
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
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete Task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {new Date(task.date).toDateString() === new Date().toDateString() && !task.completed && (
                  <div className="mt-4 border-t pt-4">
                    <TaskTimer 
                      taskId={task._id}
                      duration={task.duration}
                      onComplete={() => handleTaskComplete(task._id)}
                    />
                  </div>
                )}
                
                {task.completed && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomBar />
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
        />
      )}
    </div>
  );
};

export default ViewTask;
