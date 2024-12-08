<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { statsAPI, tasksAPI } from '../utils/api';
import BottomBar from './BottomBar';
import ConfirmModal from './ConfirmModal';
=======
import { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
import Header from './Header';
import BottomBar from './BottomBar';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const fetchData = async () => {
=======
  const fetchUser = async () => {
>>>>>>> parent of fabc826 (second commit)
    try {
      setLoading(true);
      const [userResponse, historyResponse, statsResponse] = await Promise.all([
        statsAPI.getUser(),
        statsAPI.getHistory(),
        tasksAPI.getCompletedTotal()
      ]);

      setUser(userResponse.data);
      setHistory(historyResponse.data);
      setTotalCompleted(statsResponse.data.total);
      setFilteredHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
<<<<<<< HEAD
      setIsDeleting(true);
      await statsAPI.clearHistory();
      setHistory([]);
      setFilteredHistory([]);
      setTotalCompleted(0);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
=======
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Just use the stored title from history entries
      const historyEntries = response.data.map(entry => ({
        ...entry,
        taskTitle: entry.title // Use the stored title directly
      }));

      setHistory(historyEntries);
>>>>>>> parent of fabc826 (second commit)
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

<<<<<<< HEAD
  const SUBJECT_ICONS = {
    'Mathematics': '',
    'Science': '',
    'Literature': '',
    'History': '',
    'Language': '',
    'Art': '',
    'Music': '',
    'Physical Education': '',
    'Computer Science': '',
    'Biology': '',
    'Chemistry': '',
    'Physics': '',
    'Geography': '',
    'Economics': '',
    'Psychology': '',
    'Engineering': '',
    'Default': ''
  };

  const getSubjectIcon = (subject) => {
    return SUBJECT_ICONS[subject] || SUBJECT_ICONS['Default'];
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

=======
>>>>>>> parent of fabc826 (second commit)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Task History</h1>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No history available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry._id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {entry.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatDate(entry.startTime)} - {formatDate(entry.endTime)}
                    </p>
                    <p className="text-gray-500 mt-1">
                      Duration: {formatDuration(entry.duration)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      entry.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {entry.completed ? 'Completed' : 'Partial'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomBar />
<<<<<<< HEAD

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleClearHistory}
        title="Delete All History"
        message="Are you sure you want to delete all task history? This action cannot be undone."
        variant="red"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="History Deleted Successfully"
        icon={
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        }
        variant="success"
        buttonText="Done"
      />
=======
>>>>>>> parent of fabc826 (second commit)
    </div>
  );
};

export default History;