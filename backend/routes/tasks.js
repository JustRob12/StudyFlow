import express from 'express';
import auth from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, subject, duration, date, icon } = req.body;
    console.log('Creating task with data:', { title, subject, duration, date, icon });

    const newTask = new Task({
      userId: req.userId,
      title,
      subject,
      icon: icon || '📚',
      duration,
      date
    });

    console.log('New task object:', newTask);
    const savedTask = await newTask.save();
    console.log('Saved task:', savedTask);
    
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user's tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ date: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('GET /tasks/:id - Request received:', {
      taskId: req.params.id,
      userId: req.userId
    });

    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('GET /tasks/:id - Invalid task ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    console.log('GET /tasks/:id - Searching for task:', {
      taskId: req.params.id,
      userId: req.userId
    });

    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!task) {
      console.log('GET /tasks/:id - Task not found:', {
        taskId: req.params.id,
        userId: req.userId
      });
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('GET /tasks/:id - Task found successfully:', {
      taskId: task._id,
      title: task.title,
      userId: task.userId
    });
    res.json(task);
  } catch (err) {
    console.error('GET /tasks/:id - Error fetching task:', {
      taskId: req.params.id,
      userId: req.userId,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Error fetching task',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update a task
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.keys(req.body).forEach(key => {
      task[key] = req.body[key];
    });

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this route to your existing tasks routes
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = true;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
