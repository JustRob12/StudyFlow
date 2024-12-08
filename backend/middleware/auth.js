import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth Middleware - Received token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = verified.id;
    console.log('Auth Middleware - User authenticated:', { userId: verified.id });
    next();
  } catch (err) {
    console.error('Auth Middleware - Token verification failed:', err.message);
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

export default auth;
