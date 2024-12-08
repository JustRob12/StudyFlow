import { useEffect, useState } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, variant = 'green' }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const buttonColors = {
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600'
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
      }}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div
        className={`fixed inset-x-0 bottom-0 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => onConfirm(), 300);
              }}
              className={`w-full py-3 text-white rounded-lg transition-colors font-semibold ${buttonColors[variant]}`}
            >
              Yes
            </button>
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(onClose, 300);
              }}
              className="w-full py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-gray-800"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 