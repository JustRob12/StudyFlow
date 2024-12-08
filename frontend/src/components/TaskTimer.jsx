import { useCallback, useEffect, useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { timerAPI } from '../utils/api';

const TaskTimer = ({ taskId, onComplete }) => {
  const { timeLeft, isPaused, pauseTimer, resumeTimer, activeTimer, error: contextError } = useTimer();
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const isThisTimerActive = activeTimer?.taskId === taskId;

  useEffect(() => {
    setIsVisible(isThisTimerActive);
  }, [isThisTimerActive]);

  const formatTime = useCallback((seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00:00";
    const hours = Math.floor(Math.max(0, seconds) / 3600);
    const minutes = Math.floor((Math.max(0, seconds) % 3600) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (isThisTimerActive && timeLeft === 0) {
      handleTimerComplete();
    }
  }, [timeLeft, isThisTimerActive]);

  const handleTimerComplete = async () => {
    try {
      await timerAPI.completeTimer(taskId);
      onComplete?.();
    } catch (err) {
      setError('Failed to complete timer');
      console.error('Timer completion error:', err);
    }
  };

  const handleTimerAction = async () => {
    try {
      setError(null);
      if (isPaused) {
        await timerAPI.resumeTimer(taskId);
        resumeTimer();
      } else {
        await timerAPI.pauseTimer(taskId);
        pauseTimer();
      }
    } catch (err) {
      setError('Failed to control timer');
      console.error('Timer action error:', err);
    }
  };

  if (error || contextError) {
    return (
      <div className="text-red-500 p-2 rounded-md bg-red-50 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{error || contextError}</span>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleTimerAction}
        className="p-2 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full"
        aria-label={isPaused ? "Resume Timer" : "Pause Timer"}
      >
        {isPaused ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        )}
      </button>
      <div className="text-lg font-semibold text-gray-700 tabular-nums select-none">
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default TaskTimer;