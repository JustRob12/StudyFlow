import axios from 'axios';
import { useEffect, useState } from 'react';
import { statsAPI } from '../utils/statsApi';

const Profile = ({ user, onClose, isOpen, onUserUpdate }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    hoursStudied: 0,
    goalsCompleted: 0
  });
  
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      const historyResponse = await statsAPI.getHistory();
      const calculatedStats = statsAPI.calculateStats(historyResponse.data);
      
      setStats({
        tasksCompleted: calculatedStats.completedTasks,
        hoursStudied: calculatedStats.studyHours,
        goalsCompleted: Math.floor(calculatedStats.completedTasks / 5) // Example goal metric
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values in case of error
      setStats({
        tasksCompleted: 0,
        hoursStudied: 0,
        goalsCompleted: 0
      });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await statsAPI.uploadProfileImage(formData);
        setProfileImage(response.data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      await statsAPI.updateProfile({
        username: event.target.username.value,
        email: event.target.email.value
      });
      onUserUpdate({
        username: event.target.username.value,
        email: event.target.email.value
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Enhanced error handling
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        // Optionally redirect to login
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || 'Username or email already taken');
      } else {
        alert('Error updating profile. Please try again.');
      }
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl transform transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Close Button */}
        <div className="absolute right-4 top-4">
          <button onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }} className="text-gray-400 hover:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture and Name */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#00b4d8] flex items-center justify-center mb-4 overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <label className="absolute bottom-4 right-0 bg-[#0077b6] rounded-full p-2 cursor-pointer hover:bg-[#006299] transition-colors">
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </label>
            </div>
            <h2 className="text-xl font-semibold">{user?.username}</h2>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 py-4 border-b border-t border-[#00b4d8]/30">
            <div className="text-center">
              <div className="font-semibold text-lg text-[#00b4d8]">{stats.tasksCompleted}</div>
              <div className="text-gray-500 text-sm">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-[#00b4d8]">{stats.hoursStudied}h</div>
              <div className="text-gray-500 text-sm">Hours Studied</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-[#00b4d8]">{stats.goalsCompleted}</div>
              <div className="text-gray-500 text-sm">Goals Completed</div>
            </div>
          </div>

          {/* User Information Form */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                defaultValue={user?.username}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8]"
                placeholder="Username"
                minLength="3"
                maxLength="20"
                required
              />
              <input
                type="email"
                name="email"
                defaultValue={user?.email}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8]"
                placeholder="Email"
                maxLength="50"
                required
              />
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#00b4d8] text-white rounded-lg py-2 hover:bg-[#0090ad] transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>{user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 py-2 bg-[#00b4d8] text-white rounded-lg hover:bg-[#0090ad] transition-colors"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;