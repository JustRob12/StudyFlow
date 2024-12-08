import { useState, useEffect } from 'react';
import { tasksAPI } from '../utils/api';
import { SUBJECT_ICONS } from '../utils/subjectIcons';

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    duration: { hours: 0, minutes: 0 }
  });
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        subject: task.subject,
        date: new Date(task.date).toISOString().split('T')[0],
        duration: task.duration
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a subject</option>
              {Object.entries(SUBJECT_ICONS).map(([value, { name }]) => (
                <option key={value} value={value}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Hours</label>
              <input
                type="number"
                min="0"
                value={formData.duration.hours}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: { ...formData.duration, hours: parseInt(e.target.value) || 0 }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.duration.minutes}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: { ...formData.duration, minutes: parseInt(e.target.value) || 0 }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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