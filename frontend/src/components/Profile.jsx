import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessModal from './SuccessModal';

const Profile = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: ''
  });
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    hoursStudied: 0,
    streak: 0
  });
  const [successMessage, setSuccessMessage] = useState({ show: false, text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      fetchUserData();
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userResponse, historyResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userResponse.data);
      setEditedUser({
        username: userResponse.data.username,
        email: userResponse.data.email
      });

      const totalTasks = historyResponse.data.length;
      const totalHours = historyResponse.data.reduce((acc, entry) => 
        acc + ((entry.timeSpent || 0) / 3600), 0
      );

      setStats({
        tasksCompleted: totalTasks,
        hoursStudied: Number(totalHours.toFixed(1)),
        streak: userResponse.data.streak || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setEditing(false);
    setTimeout(onClose, 300);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/auth/user`,
        editedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(prev => ({ ...prev, ...editedUser }));
      setEditing(false);
      setSuccessMessage({
        show: true,
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 transform transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Handle bar */}
        <div className="w-full flex justify-center -mt-2 mb-4">
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between mb-6">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-[#2196F3]">{stats.tasksCompleted}</p>
            <p className="text-xs text-gray-600">Tasks</p>
          </div>
          <div className="text-center flex-1 border-x border-gray-200">
            <p className="text-lg font-bold text-[#2196F3]">{stats.hoursStudied}</p>
            <p className="text-xs text-gray-600">Hours</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-[#2196F3]">{stats.streak}</p>
            <p className="text-xs text-gray-600">Streak</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editedUser.username}
              onChange={(e) => setEditedUser(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2196F3]"
              placeholder="Username"
            />
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2196F3]"
              placeholder="Email"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-[#2196F3] text-white rounded-xl hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2196F3]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full py-3 bg-[#2196F3] text-white rounded-xl hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={successMessage.show}
        onClose={() => setSuccessMessage({ show: false, text: '' })}
        message={successMessage.text}
        variant="success"
        buttonText="Done"
      />
    </div>
  );
};

export default Profile; 