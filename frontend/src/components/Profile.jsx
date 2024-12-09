import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    hoursStudied: 0,
    tasksCompleted: 0,
    goalsCompleted: 0
  });
  const [successMessage, setSuccessMessage] = useState({ show: false, text: '' });
  const [selectedImage, setSelectedImage] = useState(null);
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

      const historyData = historyResponse.data;

      // Calculate total hours studied
      const totalHours = historyData.reduce((acc, entry) => 
        acc + ((entry.timeSpent || 0) / 3600), 0
      );

      // Get completed tasks count
      const completedTasks = historyData.filter(entry => entry.completed).length;

      // Calculate goals completed (tasks that met their target duration)
      const goalsCompleted = historyData.filter(entry => {
        const targetDuration = (entry.duration?.hours || 0) * 3600 + (entry.duration?.minutes || 0) * 60;
        const actualDuration = entry.timeSpent || 0;
        return entry.completed && actualDuration >= targetDuration;
      }).length;

      setStats({
        hoursStudied: Number(totalHours.toFixed(1)),
        tasksCompleted: completedTasks,
        goalsCompleted: goalsCompleted
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profileImage', file);
        
        const token = localStorage.getItem('token');
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/upload-profile-image`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );

        setSuccessMessage({
          show: true,
          text: 'Profile photo updated successfully!'
        });
        fetchUserData();
      } catch (error) {
        console.error('Error uploading image:', error);
      }
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

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl transform transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ height: '55vh' }}>
        {/* Handle bar */}
        <div className="w-full flex justify-center -mt-2 mb-4">
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Close Button */}
        <div className="absolute right-4 top-4">
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
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
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
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
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
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
                  onClick={() => setEditing(false)}
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
                onClick={() => setEditing(true)}
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