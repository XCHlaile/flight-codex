import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { PublicUser, UserRecord, UserRole } from '../../shared/auth.js';

type SessionEntry = {
  token: string;
  user: PublicUser;
};

const sessions = new Map<string, SessionEntry>();

export interface AuthedRequest extends Request {
  authUser?: PublicUser;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

export function createSession(user: PublicUser) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { token, user });
  return {
    token,
    user,
  };
}

export function removeSession(token?: string | null) {
  if (!token) {
    return;
  }

  sessions.delete(token);
}

export function getTokenFromRequest(req: Request) {
  const value = req.headers.authorization || '';
  if (!value.startsWith('Bearer ')) {
    return null;
  }

  return value.slice('Bearer '.length);
}

export function getSessionFromRequest(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);

  if (!session) {
    res.status(401).json({
      success: false,
      error: '请先登录后再继续操作。',
    });
    return;
  }

  req.authUser = session.user;
  next();
}

export function requireRole(role: UserRole) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const session = getSessionFromRequest(req);

    if (!session) {
      res.status(401).json({
        success: false,
        error: '请先登录后再继续操作。',
      });
      return;
    }

    if (session.user.role !== role) {
      res.status(403).json({
        success: false,
        error: '当前账号没有该功能权限。',
      });
      return;
    }

    req.authUser = session.user;
    next();
  };
}
