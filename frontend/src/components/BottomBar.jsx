import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TaskDrawer from './TaskDrawer';

const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');

  const handleNavigation = (path) => {
    // Determine slide direction based on current and next path
    const currentPath = location.pathname;
    if (currentPath === '/dashboard' && path === '/tasks') {
      setSlideDirection('right');
    } else if (currentPath === '/tasks' && path === '/dashboard') {
      setSlideDirection('left');
    }
    navigate(path);
  };

  const handleAddClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    handleCloseConfirmation();
    setTimeout(() => {
      setIsTaskDrawerOpen(true);
    }, 300); // Wait for confirmation to close before opening drawer
  };

  const handleCloseConfirmation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#90e0ef] shadow-lg"
      >
        <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className={`flex flex-col items-center transition-all duration-200 hover:scale-110 ${
              location.pathname === '/dashboard' 
                ? 'text-[#0077b6] font-semibold' 
                : 'text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            onClick={handleAddClick}
            className="relative -top-6 bg-[#0077b6] text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-110 hover:brightness-110 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <button
            onClick={() => handleNavigation('/tasks')}
            className={`flex flex-col items-center transition-all duration-200 hover:scale-110 ${
              location.pathname === '/tasks' 
                ? 'text-[#0077b6] font-semibold' 
                : 'text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <span className="text-xs mt-1">Tasks</span>
          </button>
        </div>
      </div>

      {/* Confirmation Popup */}
      {(showConfirmation || isClosing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div 
            className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl transform transition-all duration-300 ease-out
              ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
            style={{ 
              transform: isClosing ? 'translateY(100%)' : 'translateY(0)',
              transition: 'transform 0.3s ease-out'
            }}
          >
            {/* Handle bar */}
            <div className="w-full flex justify-center pt-2 pb-4">
              <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-6 pb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#0077b6" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Add New Task</h3>
                <p className="text-gray-600">Would you like to add a new study task?</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseConfirmation}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 text-white bg-[#0077b6] rounded-lg hover:bg-[#005d91] transition-colors duration-200"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TaskDrawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
      />

      <style>
        {`
          .slide-left {
            animation: slideLeft 0.3s ease-out forwards;
          }
          
          .slide-right {
            animation: slideRight 0.3s ease-out forwards;
          }
          
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          
          @keyframes slideRight {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </>
  );
};

export default BottomBar;
