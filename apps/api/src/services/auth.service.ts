// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/database';
import { env } from '@/config/env';
import type { User } from '@weaveviz/shared';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async register(email: string, password: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);

    if (existingUser) {
      const error = new Error('User already exists');
      error.name = 'ValidationError';
      throw error;
    }

    // Hash password (simplified for demo)
    const passwordHash = password; // In production, use bcrypt

    // Create user
    const dbUser = await db.createUser(email, passwordHash);

    // Generate token
    const token = this.generateToken(dbUser.id);

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        createdAt: dbUser.createdAt,
      },
      token
    };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await db.findUserByEmail(email);

    if (!user) {
      const error = new Error('Invalid credentials');
      error.name = 'UnauthorizedError';
      throw error;
    }

    // Verify password (simplified for demo)
    const isValidPassword = password === user.passwordHash;

    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.name = 'UnauthorizedError';
      throw error;
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token
    };
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = await db.findUserById(id);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}
