import express from 'express';
import auth from '../middleware/auth.js';
import History from '../models/History.js';

const router = express.Router();

// Get user's history
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })
      .sort({ startTime: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add history entry
router.post('/', auth, async (req, res) => {
  try {
    const { 
      taskId, 
      title, 
      description,
      icon,
      startTime, 
      endTime, 
      duration,
      timeSpent,
      completed,
      status 
    } = req.body;
    
    const historyEntry = new History({
      userId: req.userId,
      taskId,
      title,
      description,
      icon,
      startTime,
      endTime,
      duration,  // Original planned duration
      timeSpent, // Actual time spent
      completed,
      status: completed ? 'completed' : 'partial'
    });

    const savedEntry = await historyEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get history details
router.get('/:id', auth, async (req, res) => {
  try {
    const historyEntry = await History.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!historyEntry) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    res.json(historyEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this new route for deleting all history
router.delete('/', auth, async (req, res) => {
  try {
    await History.deleteMany({ userId: req.userId });
    res.status(200).json({ message: 'All history deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 