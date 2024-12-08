import { useEffect, useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { timerAPI } from '../utils/api';

const TaskTimer = ({ taskId, duration, onComplete }) => {
  const { activeTimer, timeLeft, isPaused, startTimer, pauseTimer, resumeTimer } = useTimer();
  const [displayTime, setDisplayTime] = useState(duration.hours * 3600 + duration.minutes * 60);

  const isThisTimerActive = activeTimer && activeTimer.taskId === taskId;

  useEffect(() => {
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
    if (isThisTimerActive) {
      setDisplayTime(timeLeft);
    }
  }, [isThisTimerActive, timeLeft]);  

=======
    if (isThisTimerActive) {
      setDisplayTime(timeLeft);
    }
  }, [isThisTimerActive, timeLeft]);  

>>>>>>> parent of fabc826 (second commit)
  const toggleTimer = async () => {
    if (!isThisTimerActive) {
      await startTimer(taskId);
    } else if (isPaused) {
      await resumeTimer(taskId);
    } else {
      await pauseTimer(taskId);
<<<<<<< HEAD
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-2xl font-mono font-bold text-blue-600">
        {formatTime(displayTime)}
      </div>
      <button
        onClick={toggleTimer}
        className={`px-4 py-2 rounded-full font-medium ${
          isThisTimerActive && !isPaused
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isThisTimerActive 
          ? (isPaused ? 'Resume' : 'Pause') 
          : 'Start'}
      </button>
    </div>
  );
};

export default TaskTimer; 