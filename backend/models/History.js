import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: '📚'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['completed', 'partial'],
    default: 'completed'
  }
}, { timestamps: true });

export default mongoose.model('History', historySchema); 