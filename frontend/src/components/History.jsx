import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import BottomBar from './BottomBar';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchHistory();
    fetchUser();
  }, []);

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

      // Just use the stored title from history entries
      const historyEntries = response.data.map(entry => ({
        ...entry,
        taskTitle: entry.title // Use the stored title directly
      }));

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
    </div>
  );
};

export default History; 
    