import axios from 'axios';
import { useEffect, useState } from 'react';
import BottomBar from './BottomBar';
import ConfirmModal from './ConfirmModal';
import Header from './Header';
import SuccessModal from './SuccessModal';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    fetchHistory();
    fetchUser();
  }, []);

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

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const historyEntries = response.data.map(entry => ({
        ...entry,
        taskTitle: entry.title
      }));

      // Calculate total completed tasks
      const completedCount = historyEntries.filter(entry => entry.completed).length;
      setTotalCompleted(completedCount);
      setHistory(historyEntries);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
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

  const SUBJECT_ICONS = {
    'Mathematics': '📐',
    'Science': '🔬',
    'Literature': '📚',
    'History': '🏛️',
    'Language': '💭',
    'Art': '🎨',
    'Music': '🎵',
    'Physical Education': '⚽',
    'Computer Science': '💻',
    'Biology': '🧬',
    'Chemistry': '⚗️',
    'Physics': '⚛️',
    'Geography': '🌍',
    'Economics': '📊',
    'Psychology': '🧠',
    'Engineering': '⚙️',
    'Default': '📚'
  };

  const getSubjectIcon = (subject) => {
    return SUBJECT_ICONS[subject] || SUBJECT_ICONS['Default'];
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHistory([]);
      setFilteredHistory([]);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('Failed to delete history. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} />
      
      {/* Sticky Header Section with Search */}
      <div className="sticky top-[72px] bg-white shadow z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
              <p className="text-sm text-gray-600">
                Total Completed: {totalCompleted} tasks
              </p>
            </div>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting || history.length === 0}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors
                ${isDeleting || history.length === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-700'}`}
              title="Delete All History"
            >
              {isDeleting ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <svg 
                  className="h-6 w-6" 
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
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="mt-2 text-gray-500">
                {searchQuery ? 'No matching tasks found.' : 'No history available yet.'}
              </p>
              <p className="text-sm text-gray-400">
                {searchQuery ? 'Try a different search term.' : 'Complete some tasks to see them here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-16">
              {filteredHistory.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-[#d0efff] rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{entry.title}</h3>
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
      </div>

      <BottomBar />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
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
    </div>
  );
};

export default History; 
    