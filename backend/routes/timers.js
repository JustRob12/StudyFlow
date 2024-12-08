import express from 'express';
import auth from '../middleware/auth.js';
import Task from '../models/Task.js';
import Timer from '../models/Timer.js';

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
        lastCheckedAt: new Date(),
        isRunning: true,
        lastPausedAt: null
      });
    } else {
      timer.isRunning = true;
      timer.lastPausedAt = null;
      timer.lastCheckedAt = new Date();
      timer.updateTimeRemaining();
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
    const previousTime = timer.timeRemaining;
    timer.updateTimeRemaining();
    
    // Check if timer completed
    if (timer.timeRemaining <= 0) {
      timer.isRunning = false;
      timer.timeRemaining = 0;
      await timer.save();
      
      // Update task completion
      await Task.findByIdAndUpdate(timer.taskId, { completed: true });
      
      return res.json({ ...timer.toJSON(), completed: true });
    }

    // Only save if time has actually changed
    if (previousTime !== timer.timeRemaining) {
      await timer.save();
    }
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

    res.json(activeTimers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/timers/sync
router.post('/sync', auth, async (req, res) => {
  try {
    const { taskId, timeRemaining, isRunning } = req.body;
    
    // Input validation
    if (!taskId) {
      return res.status(400).json({ message: 'taskId is required' });
    }

    if (typeof timeRemaining !== 'number' || timeRemaining < 0) {
      return res.status(400).json({ message: 'Invalid timeRemaining value' });
    }

    // Verify task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find or create timer
    let timer = await Timer.findOne({ taskId: taskId, userId: req.userId });
    
    if (!timer) {
      timer = new Timer({
        taskId,
        userId: req.userId,
        timeRemaining,
        isRunning,
        lastCheckedAt: new Date()
      });
    } else {
      timer.timeRemaining = timeRemaining;
      timer.isRunning = isRunning;
      timer.lastCheckedAt = new Date();
    }

    await timer.save();

    res.json({
      _id: timer._id,
      taskId: timer.taskId,
      timeRemaining: timer.timeRemaining,
      isRunning: timer.isRunning,
      lastCheckedAt: timer.lastCheckedAt,
      duration: timer.duration
    });

  } catch (err) {
    console.error('Timer sync error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid taskId format' });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid timer data',
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      message: 'Timer sync failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.post('/pause', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const timer = await Timer.findOne({ 
      userId: req.userId,
      taskId: taskId,
      isRunning: true 
    });

    if (!timer) {
      return res.status(404).json({ message: 'No active timer found' });
    }

    timer.updateTimeRemaining();
    timer.isRunning = false;
    timer.lastPausedAt = new Date();
    timer.lastCheckedAt = new Date();

    await timer.save();

    res.json({
      _id: timer._id,
      taskId: timer.taskId,
      timeRemaining: timer.timeRemaining,
      isRunning: timer.isRunning,
      lastCheckedAt: timer.lastCheckedAt,
      duration: timer.duration
    });
  } catch (err) {
    console.error('Timer pause error:', err);
    res.status(500).json({ message: 'Failed to pause timer' });
  }
});

router.post('/reset', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const timer = await Timer.findOne({ 
      userId: req.userId,
      taskId: taskId
    });

    if (!timer) {
      return res.status(404).json({ message: 'Timer not found' });
    }

    timer.timeRemaining = timer.duration;
    timer.isRunning = false;
    timer.lastPausedAt = null;
    timer.lastCheckedAt = new Date();
    
    await timer.save();

    res.json({
      _id: timer._id,
      taskId: timer.taskId,
      timeRemaining: timer.timeRemaining,
      isRunning: timer.isRunning,
      lastCheckedAt: timer.lastCheckedAt,
      duration: timer.duration
    });
  } catch (err) {
    console.error('Timer reset error:', err);
    res.status(500).json({ message: 'Failed to reset timer' });
  }
});

// Resume a timer
router.post('/resume', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const timer = await Timer.findOne({ 
      userId: req.userId,
      taskId: taskId
    });

    if (!timer) {
      return res.status(404).json({ message: 'Timer not found' });
    }

    timer.isRunning = true;
    timer.lastCheckedAt = new Date();
    await timer.save();

    res.json(timer);
  } catch (error) {
    console.error('Error resuming timer:', error);
    res.status(500).json({ message: 'Error resuming timer' });
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

// Complete a timer
router.post('/complete', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    
    const timer = await Timer.findOne({
      userId: req.userId,
      taskId: taskId
    });

    if (!timer) {
      return res.status(404).json({ message: 'Timer not found' });
    }

    // Update timer state
    timer.isRunning = false;
    timer.timeRemaining = 0;
    timer.lastCheckedAt = new Date();
    await timer.save();

    // Update task completion
    await Task.findByIdAndUpdate(taskId, { completed: true });

    res.json({ message: 'Timer completed successfully', timer });
  } catch (err) {
    console.error('Error completing timer:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;