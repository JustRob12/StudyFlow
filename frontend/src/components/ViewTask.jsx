import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomBar from './BottomBar';

const ViewTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getSubjectIcon(task.subject)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <p className="text-sm text-gray-500">{formatDate(task.date)}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                    {formatDuration(task.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomBar />
    </div>
  );
};

export default ViewTask;
