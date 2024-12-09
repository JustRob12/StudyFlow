import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Profile from './Profile';
import Settings from './Settings';
import SuccessModal from './SuccessModal';

const Header = ({ user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setShowLogoutConfirm(false);
    setShowLogoutSuccess(true);
    setTimeout(() => {
      setShowLogoutSuccess(false);
      navigate('/login');
    }, 1500);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsProfileOpen(true);
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <header className="bg-[#90e0ef] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 hover:text-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard')}>
                StudyFlow
              </h1>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 transition-all rounded-full px-4 py-2 focus:outline-none"
              >
                <span className="text-gray-800 text-sm">{user?.username}</span>
                <div className="w-8 h-8 rounded-full bg-white/30 text-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </button>

              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 backdrop-blur-sm 
                transform transition-all duration-200 ease-in-out ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                    onClick={handleProfileClick}
                  >
                    Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                    onClick={handleSettingsClick}
                  >
                    Settings
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t"
                    role="menuitem"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Profile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      
      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        variant="red"
      />

      <SuccessModal
        isOpen={showLogoutSuccess}
        onClose={() => setShowLogoutSuccess(false)}
        message="Successfully logged out!"
        buttonText="Close"
        variant="info"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        }
      />
    </>
  );
};

export default Header;