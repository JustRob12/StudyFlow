import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../utils/api';
import Header from './Header';
import BottomBar from './BottomBar';
import TaskTimer from './TaskTimer';
import EditTaskModal from './EditTaskModal';
import ConfirmModal from './ConfirmModal';
import { SuccessModal } from './SuccessModal';

const ViewTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [successMessage, setSuccessMessage] = useState({
    show: false,
    text: '',
    title: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userResponse, tasksResponse] = await Promise.all([
        tasksAPI.getUser(),
        tasksAPI.getTasks()
      ]);
      setUser(userResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    try {
      const response = await tasksAPI.updateTask(taskId, updatedData);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      setEditingTask(null);
      showSuccessMessage('Task Updated', 'Task has been successfully updated!');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      setDeletingTask(null);
      showSuccessMessage('Task Deleted', 'Task has been successfully deleted!');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await tasksAPI.completeTask(taskId);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
      setCompletingTask(null);
      showSuccessMessage('Task Completed', 'Congratulations on completing your task!');
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const showSuccessMessage = (title, text) => {
    setSuccessMessage({
      show: true,
      title,
      text
    });
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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
          <p className="mt-2 text-gray-600">View and manage your study tasks</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tasks available. Create a new task to get started!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {task.subject}
                        </span>
                        {task.completed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!task.completed && (
                        <>
                          <button
                            onClick={() => setCompletingTask(task)}
                            className="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-gray-100"
                            title="Complete task"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100"
                            title="Edit task"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeletingTask(task)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                        title="Delete task"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {activeTimer?._id === task._id && !task.completed && (
                    <div className="mt-4">
                      <TaskTimer
                        task={task}
                        onComplete={(duration) => {
                          setActiveTimer(null);
                          handleEditTask(task._id, {
                            ...task,
                            timeSpent: (task.timeSpent || 0) + duration
                          });
                        }}
                      />
                    </div>
                  )}

                  {!task.completed && !activeTimer && (
                    <button
                      onClick={() => setActiveTimer(task)}
                      className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Start Timer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomBar />

      {/* Modals */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={(updatedData) => handleEditTask(editingTask._id, updatedData)}
      />

      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => handleDeleteTask(deletingTask._id)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        variant="red"
      />

      <ConfirmModal
        isOpen={!!completingTask}
        onClose={() => setCompletingTask(null)}
        onConfirm={() => handleCompleteTask(completingTask._id)}
        title="Complete Task"
        message="Are you sure you want to mark this task as complete?"
        variant="green"
      />

      <SuccessModal
        isOpen={successMessage.show}
        onClose={() => setSuccessMessage({ show: false, text: '', title: '' })}
        title={successMessage.title}
        message={successMessage.text}
      />
    </div>
  );
};

export default ViewTask;
