import { useEffect, useState } from 'react';
import { tasksAPI } from '../utils/api';
import { SUBJECT_ICONS } from '../utils/subjectIcons';

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    duration: { hours: 0, minutes: 0 }
  });

  const subjects = Object.keys(SUBJECT_ICONS).filter(subject => subject !== 'Default');

  useEffect(() => {
    if (task) {
      setIsAnimating(true);
      setFormData({
        ...task,
        date: new Date(task.date).toISOString().split('T')[0]
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(false);
    const updatedTask = {
      ...task,
      ...formData,
      duration: {
        hours: parseInt(formData.duration.hours) || 0,
        minutes: parseInt(formData.duration.minutes) || 0
      }
    };
    try {
      await tasksAPI.updateTask(task._id, updatedTask);
      setTimeout(() => onSave(updatedTask), 300);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!task && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 transform transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Task Title"
            required
          />

          <select
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {SUBJECT_ICONS[subject]} {subject}
              </option>
            ))}
          </select>

          <div className="flex space-x-4">
            <div className="relative w-1/2">
              <input
                type="number"
                value={formData.duration.hours}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: { ...formData.duration, hours: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-4 py-2 border rounded-lg pr-12"
                placeholder="Hours"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">hr</span>
            </div>
            <div className="relative w-1/2">
              <input
                type="number"
                value={formData.duration.minutes}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: { ...formData.duration, minutes: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-4 py-2 border rounded-lg pr-14"
                placeholder="Minutes"
                min="0"
                max="59"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">min</span>
            </div>
          </div>

          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;