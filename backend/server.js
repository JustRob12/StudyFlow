import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import taskRoutes from './routes/tasks.js';
import timerRoutes from './routes/timers.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://studyflow-k4ec.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Origin',
    'X-Requested-With',
    'Accept',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['set-cookie']
};

// Add this before your routes
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/timers', timerRoutes);
app.use('/history', historyRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDB();
    
    // Prioritize Render's PORT over .env PORT
    const PORT = process.env.RENDER_PORT || process.env.PORT || 3000;
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Available routes:');
      console.log('- /auth');
      console.log('- /tasks');
      console.log('- /timers');
      console.log('- /history');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
