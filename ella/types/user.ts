import { BaseEntity } from './index';

export interface City extends BaseEntity {
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
}

export interface User extends BaseEntity {
  email: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  cityId?: number;
  city?: City;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  cityId?: number;
}

export interface GoogleLoginRequest {
  idToken: string;
}
