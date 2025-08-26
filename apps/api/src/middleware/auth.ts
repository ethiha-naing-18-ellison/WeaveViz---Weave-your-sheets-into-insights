import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { db } from '@/lib/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      errorCode: 'UNAUTHORIZED',
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    
    // Verify user still exists
    const user = await db.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        errorCode: 'UNAUTHORIZED',
        message: 'Invalid token'
      });
    }

    req.user = {
      id: user.id,
      email: user.email
    };
    next();
  } catch (error) {
    return res.status(403).json({
      errorCode: 'FORBIDDEN',
      message: 'Invalid or expired token'
    });
  }
}
