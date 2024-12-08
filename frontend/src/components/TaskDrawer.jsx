<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { useState } from 'react';
import { tasksAPI } from '../utils/api';
import { SUBJECT_ICONS } from '../utils/subjectIcons';
=======
import { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
=======
import { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
=======
import { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
=======
import { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)

const TaskDrawer = ({ isOpen, onClose }) => {
  const [task, setTask] = useState({
    title: '',
    subject: '',
    duration: {
      hours: 0,
      minutes: 0
    },
    date: new Date().toISOString().split('T')[0],
  });

  const subjects = [
    { id: 'math', icon: '📐', name: 'Mathematics' },
    { id: 'science', icon: '🔬', name: 'Science' },
    { id: 'literature', icon: '📚', name: 'Literature' },
    { id: 'history', icon: '🏛️', name: 'History' },
    { id: 'language', icon: '💭', name: 'Language' },
    { id: 'art', icon: '🎨', name: 'Art' },
    { id: 'music', icon: '🎵', name: 'Music' },
    { id: 'pe', icon: '⚽', name: 'Physical Education' },
  ];

  const [showSubjects, setShowSubjects] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowSubjects(false);
      setTask({
        title: '',
        subject: '',
        duration: {
          hours: 0,
          minutes: 0
        },
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
<<<<<<< HEAD
      await tasksAPI.createTask(task);
      onClose();
=======
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks`,
        task,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      handleClose();
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div 
        className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl transform transition-transform duration-300 ease-in-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
      >
        {/* Handle bar */}
        <div className="w-full flex justify-center pt-2 pb-4">
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 pb-6 max-h-[85vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">Add New Task</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <input
                type="text"
                placeholder="Task Title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                required
              />
            </div>

            {/* Subject Selection */}
            <div className="relative">
              <div
                className="w-full px-4 py-3 rounded-lg border border-gray-300 flex items-center cursor-pointer"
                onClick={() => setShowSubjects(!showSubjects)}
              >
                {task.subject ? (
                  <>
                    <span className="mr-2 text-xl">
                      {subjects.find(s => s.id === task.subject)?.icon}
                    </span>
                    <span>{subjects.find(s => s.id === task.subject)?.name}</span>
                  </>
                ) : (
                  <span className="text-gray-500">Select Subject</span>
                )}
              </div>

              {/* Subject Grid */}
              {showSubjects && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100"
                        onClick={() => {
                          setTask({ ...task, subject: subject.id });
                          setShowSubjects(false);
                        }}
                      >
                        <span className="text-2xl">{subject.icon}</span>
                        <span>{subject.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-gray-700 mb-2">Duration</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={task.duration.hours || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setTask({
                        ...task,
                        duration: { ...task.duration, hours: value }
                      });
                    }}
                  />
                  <span className="text-sm text-gray-500 mt-1 block">hrs</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={task.duration.minutes || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setTask({
                        ...task,
                        duration: { ...task.duration, minutes: value }
                      });
                    }}
                  />
                  <span className="text-sm text-gray-500 mt-1 block">min</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={task.date}
                onChange={(e) => setTask({ ...task, date: e.target.value })}
                required
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-[#2196F3] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDrawer;
