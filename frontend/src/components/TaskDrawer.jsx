import axios from 'axios';
import { useState } from 'react';
import { SUBJECT_ICONS } from '../utils/subjectIcons';

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

  const [showSubjects, setShowSubjects] = useState(false);
  const subjects = Object.keys(SUBJECT_ICONS).filter(subject => subject !== 'Default');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Task Title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            required
          />

          {/* Custom Subject Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSubjects(!showSubjects)}
              className="w-full px-4 py-3 rounded-lg border text-left flex justify-between items-center"
            >
              {task.subject ? (
                <span>
                  {SUBJECT_ICONS[task.subject]} {task.subject}
                </span>
              ) : (
                <span className="text-gray-400">Select Subject</span>
              )}
              <span>▼</span>
            </button>

            {/* Subject Dropdown */}
            {showSubjects && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => {
                      setTask({ ...task, subject });
                      setShowSubjects(false);
                    }}
                  >
                    <span>{SUBJECT_ICONS[subject]}</span>
                    <span>{subject}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration inputs */}
          <div className="flex space-x-4">
            <div className="relative w-1/2">
              <input
                type="number"
                placeholder="Hours"
                value={task.duration.hours}
                onChange={(e) => setTask({
                  ...task,
                  duration: { ...task.duration, hours: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-4 py-3 rounded-lg border pr-12"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">hr</span>
            </div>
            <div className="relative w-1/2">
              <input
                type="number"
                placeholder="Minutes"
                value={task.duration.minutes}
                onChange={(e) => setTask({
                  ...task,
                  duration: { ...task.duration, minutes: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-4 py-3 rounded-lg border pr-14"
                min="0"
                max="59"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">min</span>
            </div>
          </div>

          <input
            type="date"
            value={task.date}
            onChange={(e) => setTask({ ...task, date: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            required
          />

          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDrawer;
