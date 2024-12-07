import mongoose from 'mongoose';

const timerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,  // Total seconds
    required: true
  },
  timeRemaining: {
    type: Number,  // Seconds remaining
    required: true
  },
  isRunning: {
    type: Boolean,
    default: true
  },
  lastPausedAt: {
    type: Date
  },
  lastCheckedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add method to update time remaining
timerSchema.methods.updateTimeRemaining = function() {
  if (this.isRunning && !this.lastPausedAt) {
    const now = new Date();
    const elapsedSinceLastCheck = Math.floor((now - this.lastCheckedAt) / 1000);
    this.timeRemaining = Math.max(0, this.timeRemaining - elapsedSinceLastCheck);
    this.lastCheckedAt = now;
  }
  return this.timeRemaining;
};

export default mongoose.model('Timer', timerSchema); 