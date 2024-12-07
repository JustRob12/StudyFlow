import { useEffect, useState } from 'react';
import { useTimer } from '../context/TimerContext';

const TaskTimer = ({ taskId, duration, onComplete }) => {
  const { activeTimer, timeLeft, isPaused, startTimer, pauseTimer, resumeTimer } = useTimer();
  const [displayTime, setDisplayTime] = useState(duration.hours * 3600 + duration.minutes * 60);

  const isThisTimerActive = activeTimer && activeTimer.taskId === taskId;

  useEffect(() => {
    if (isThisTimerActive) {
      setDisplayTime(timeLeft);
    }
  }, [isThisTimerActive, timeLeft]);  

  const toggleTimer = async () => {
    if (!isThisTimerActive) {
      await startTimer(taskId);
    } else if (isPaused) {
      await resumeTimer(taskId);
    } else {
      await pauseTimer(taskId);
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