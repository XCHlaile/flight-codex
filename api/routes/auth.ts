import { Router, type Request, type Response } from 'express';
import { createSession, getSessionFromRequest, removeSession, toPublicUser } from '../lib/auth.js';
import { buildRecordId, readCollection, writeCollection } from '../lib/repository.js';
import type { LoginRequest, RegisterRequest, UserRecord } from '../../shared/auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const body = req.body as RegisterRequest;
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const displayName = String(body.displayName || '').trim();

  if (!displayName || !username || !password) {
    res.status(400).json({
      success: false,
      error: '请完整填写昵称、账号和密码。',
    });
    return;
  }

  if (username.length < 3) {
    res.status(400).json({
      success: false,
      error: '账号至少需要 3 个字符。',
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      error: '密码至少需要 6 个字符。',
    });
    return;
  }

  const users = await readCollection<UserRecord>('users.json');
  const exists = users.some((item) => item.username.toLowerCase() === username.toLowerCase());

  if (exists) {
    res.status(409).json({
      success: false,
      error: '该账号已存在，请更换账号名后重试。',
    });
    return;
  }

  const newUser: UserRecord = {
    id: buildRecordId(`user-${username}`),
    username,
    password,
    displayName,
    role: 'user',
  };

  users.push(newUser);
  await writeCollection('users.json', users);

  res.status(201).json({
    success: true,
    data: createSession(toPublicUser(newUser)),
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const body = req.body as LoginRequest;
  const users = await readCollection<UserRecord>('users.json');
  const user = users.find((item) => item.username === body.username);

  if (!user || user.password !== body.password) {
    res.status(401).json({
      success: false,
      error: '账号或密码错误。',
    });
    return;
  }

  if (user.role !== body.role) {
    res.status(403).json({
      success: false,
      error: '当前账号不属于所选身份，请切换登录入口。',
    });
    return;
  }

  res.json({
    success: true,
    data: createSession(toPublicUser(user)),
  });
});

router.get('/me', async (req: Request, res: Response) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    res.status(401).json({
      success: false,
      error: '登录状态已失效，请重新登录。',
    });
    return;
  }

  res.json({
    success: true,
    data: session,
  });
});

router.post('/logout', async (req: Request, res: Response) => {
  removeSession(req.headers.authorization?.replace('Bearer ', '') || null);
  res.json({
    success: true,
    data: {
      loggedOut: true,
    },
  });
});

export default router;
