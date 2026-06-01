import client from '@/lib/api/client';
import { User } from '@/lib/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface MeResponse {
  message: string;
  user: User;
}

export interface UpdateProfileRequest {
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/auth/login', data);
  return response.data;
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await client.post<RegisterResponse>('/auth/register', data);
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getMe(): Promise<MeResponse> {
  const response = await client.get<MeResponse>('/auth/me');
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await client.patch<UpdateProfileResponse>('/auth/profile', data);
  return response.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<{ message: string }> {
  const response = await client.post('/auth/logout');
  return response.data;
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const response = await client.post('/auth/refresh');
  return response.data;
}

/**
 * Change password
 */
export async function changePassword(data: {
  newPassword: string;
  confirmPassword: string;
  refreshToken: string;
}) {
  const response = await client.post('/auth/change-password', data);
  return response.data;
}

/**
 * Forgot password
 */
export async function forgotPassword(email: string) {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data;
}

/**
 * Reset password
 */
export async function resetPassword(data: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await client.post('/auth/reset-password', data);
  return response.data;
}

/**
 * Get Google OAuth Login URL
 */
export async function getGoogleLoginUrl(): Promise<{ url: string }> {
  const response = await client.get<{ url: string }>('/auth/oauth/google');
  return response.data;
}

/**
 * Exchange Google OAuth code for session
 */
export async function exchangeGoogleCode(code: string): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/auth/oauth/google/callback', { code });
  return response.data;
}
