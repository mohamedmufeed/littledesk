import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { RegisterInputSchema, LoginInputSchema } from '@littledesk/shared';
import { UserModel } from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../services/tokenService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getDbStatus } from '../config/db.js';

// In-memory fallback user store when MongoDB is not connected
const fallbackUsers: Map<string, any> = new Map();

export async function register(req: Request, res: Response) {
  try {
    const parseResult = RegisterInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parseResult.error.flatten() });
    }

    const { name, email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    if (getDbStatus()) {
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        name,
        email: normalizedEmail,
        passwordHash,
        refreshTokens: [],
      });

      const tokens = generateTokens(user._id.toString(), user.email);
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      return res.status(201).json({
        user: { id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt },
        tokens,
      });
    }

    // In-memory fallback mode
    if (fallbackUsers.has(normalizedEmail)) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;
    const user = { id: userId, name, email: normalizedEmail, passwordHash, createdAt: new Date().toISOString() };
    fallbackUsers.set(normalizedEmail, user);

    const tokens = generateTokens(userId, normalizedEmail);
    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      tokens,
    });
  } catch (err: any) {
    console.error('[Auth Register Error]', err);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parseResult = LoginInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parseResult.error.flatten() });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    if (getDbStatus()) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const tokens = generateTokens(user._id.toString(), user.email);
      user.refreshTokens.push(tokens.refreshToken);
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      await user.save();

      return res.json({
        user: { id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt },
        tokens,
      });
    }

    // Fallback mode
    const user = fallbackUsers.get(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokens = generateTokens(user.id, user.email);
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      tokens,
    });
  } catch (err: any) {
    console.error('[Auth Login Error]', err);
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Missing refresh token' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokens = generateTokens(payload.userId, payload.email);

    return res.json({ tokens });
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true, message: 'Logged out successfully' });
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (getDbStatus()) {
      const user = await UserModel.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt });
    }

    return res.json({ id: req.userId, name: 'Mufeed', email: req.userEmail });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
}
