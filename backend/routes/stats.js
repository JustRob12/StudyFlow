import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

const router = express.Router();

// Get user streak
router.get('/streak', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId, completed: true })
      .sort({ completedAt: -1 });
    
    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    
    for (let i = 0; i < tasks.length; i++) {
      const taskDate = new Date(tasks[i].completedAt).setHours(0, 0, 0, 0);
      if (taskDate === today - (streak * 86400000)) {
        streak++;
      } else {
        break;
      }
    }
    
    res.json({ streak });
  } catch (err) {
    console.error('Error getting streak:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly stats
router.get('/weekly', auth, async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const tasks = await Task.find({
      userId: req.userId,
      createdAt: { $gte: weekAgo }
    });
    
    const stats = {
      completed: tasks.filter(task => task.completed).length,
      total: tasks.length,
      studyHours: tasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0) / 3600
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error getting weekly stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 