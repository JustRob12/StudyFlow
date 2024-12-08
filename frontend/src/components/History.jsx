import React, { useState, useEffect } from 'react';
import { statsAPI } from '../utils/api';
import Header from './Header';
import BottomBar from './BottomBar';
import ConfirmModal from './ConfirmModal';
import { getSubjectIcon } from '../utils/subjectIcons';

const History = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalTasks: 0,
    averageTime: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userResponse, historyResponse, statsResponse] = await Promise.all([
        statsAPI.getUser(),
        statsAPI.getHistory(),
        statsAPI.getWeeklyStats()
      ]);

      setUser(userResponse.data);
      setHistory(historyResponse.data);
      
      // Calculate stats
      const totalHours = historyResponse.data.reduce(
        (acc, entry) => acc + entry.timeSpent / 3600,
        0
      );
      const totalTasks = historyResponse.data.length;
      const averageTime = totalTasks > 0 ? totalHours / totalTasks : 0;

      setStats({
        totalHours: Math.round(totalHours * 10) / 10,
        totalTasks,
        averageTime: Math.round(averageTime * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await statsAPI.deleteHistoryEntry(entryId);
      setHistory(history.filter(entry => entry._id !== entryId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting history entry:', error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study History</h1>
          <p className="mt-2 text-gray-600">Track your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              title: 'Total Study Time',
              value: `${stats.totalHours}h`,
              description: 'Hours spent studying'
            },
            {
              title: 'Completed Tasks',
              value: stats.totalTasks,
              description: 'Tasks finished'
            },
            {
              title: 'Average Time',
              value: `${stats.averageTime}h`,
              description: 'Per task'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-500">
                {stat.title}
              </h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* History List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Study Sessions
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No study sessions recorded yet
              </div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getSubjectIcon(entry.subject)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDuration(entry.timeSpent)} ·{' '}
                          {formatDate(entry.endTime)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteConfirm(entry)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                      title="Delete entry"
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
              ))
            )}
          </div>
        </div>
      </main>

      <BottomBar />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteEntry(deleteConfirm?._id)}
        title="Delete History Entry"
        message="Are you sure you want to delete this study session? This action cannot be undone."
        variant="red"
      />
    </div>
  );
};

export default History;