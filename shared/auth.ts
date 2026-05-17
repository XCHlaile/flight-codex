export type UserRole = 'user' | 'admin';

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  username: string;
  password: string;
  displayName: string;
}

export interface AuthSession {
  token: string;
  user: PublicUser;
}
