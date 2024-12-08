import express from 'express';
import Timer from '../models/Timer.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Start or resume a timer
router.post('/start', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    
    // Check for any active timer for this user
    let activeTimer = await Timer.findOne({ 
      userId: req.userId,
      isRunning: true 
    });

    if (activeTimer) {
      // Pause the current active timer
      activeTimer.isRunning = false;
      activeTimer.lastPausedAt = new Date();
      await activeTimer.save();
    }

    // Check for existing timer for this task
    let timer = await Timer.findOne({ 
      userId: req.userId, 
      taskId: taskId
    });

    if (!timer) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const totalSeconds = (task.duration.hours * 3600) + (task.duration.minutes * 60);
      
      timer = new Timer({
        userId: req.userId,
        taskId: taskId,
        startTime: new Date(),
        duration: totalSeconds,
        timeRemaining: totalSeconds,
        lastCheckedAt: new Date()
      });
    } else {
      timer.isRunning = true;
      timer.lastPausedAt = null;
      timer.lastCheckedAt = new Date();
    }

    await timer.save();
    res.json(timer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all active timers for user
router.get('/active', auth, async (req, res) => {
  try {
    const timer = await Timer.findOne({ 
      userId: req.userId, 
      isRunning: true 
    }).populate('taskId');

    if (!timer) {
      return res.json(null);
    }

    // Update time remaining
    timer.updateTimeRemaining();
    
    // Check if timer completed
    if (timer.timeRemaining <= 0) {
      timer.isRunning = false;
      await timer.save();
      
      // Update task completion
      await Task.findByIdAndUpdate(timer.taskId, { completed: true });
      
      return res.json({ ...timer.toJSON(), completed: true });
    }

    await timer.save();
    res.json(timer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's timer status
router.get('/status', auth, async (req, res) => {
  try {
    const timers = await Timer.find({ 
      userId: req.userId 
    }).populate('taskId');
    
    const activeTimers = timers.map(timer => {
      if (timer.isRunning) {
        timer.updateTimeRemaining();
      }
      return timer;
    });

    await Promise.all(activeTimers.map(timer => timer.save()));
    
    res.json(activeTimers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pause timer
router.post('/pause', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const timer = await Timer.findOne({ 
      userId: req.userId, 
      taskId: taskId,
      isRunning: true 
    });

    if (!timer) {
      return res.status(404).json({ message: 'Active timer not found' });
    }

    timer.updateTimeRemaining();
    timer.isRunning = false;
    timer.lastPausedAt = new Date();

    await timer.save();
    res.json(timer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this new route to get timer status for a specific task
router.get('/status/:taskId', auth, async (req, res) => {
  try {
    const timer = await Timer.findOne({ 
      userId: req.userId,
      taskId: req.params.taskId
    });
    
    if (timer) {
      if (timer.isRunning) {
        timer.updateTimeRemaining();
        await timer.save();
      }
      res.json(timer);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this new route
router.post('/sync', auth, async (req, res) => {
  try {
    const { taskId, timeRemaining } = req.body;
    const timer = await Timer.findOne({ 
      userId: req.userId,
      taskId: taskId,
      isRunning: true 
    });

    if (timer) {
      timer.timeRemaining = timeRemaining;
      timer.lastCheckedAt = new Date();
      await timer.save();
      res.json(timer);
    } else {
      res.status(404).json({ message: 'Timer not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 