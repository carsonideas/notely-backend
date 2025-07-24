
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

interface DecodedToken {
  userId: string;
}

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('Auth middleware - Headers:', {
      authorization: authHeader ? 'Bearer token present' : 'No authorization header',
      contentType: req.headers['content-type']
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Auth middleware - No valid authorization header');
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      console.error('Auth middleware - JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    console.log('Auth middleware - Token decoded for user:', decoded.userId);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      console.error('Auth middleware - User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    console.log('Auth middleware - User authenticated:', user.username);

    // Attach user to request body as requested
    req.body.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined
    });
    return res.status(401).json({ message: 'Unauthorized: Token error' });
  }
};

export default authenticate;