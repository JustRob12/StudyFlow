import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth Middleware - Received token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Extract userId (support both id and userId for backward compatibility)
      req.userId = verified.userId || verified.id;
      
      if (!req.userId) {
        console.error('Auth Middleware - No user ID in token');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      console.log('Auth Middleware - User authenticated:', { userId: req.userId });
      next();
    } catch (verifyError) {
      console.error('Auth Middleware - Token verification failed:', verifyError.message);
      
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
  } catch (err) {
    console.error('Auth Middleware - Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error in authentication' });
  }
};

export default auth;
