import client from '@/lib/api/client';

export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface AdminUserListItem {
  id: string;
  role: UserRole;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  banned_reason: string | null;
  email: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListParams {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface AdminUserListResponse {
  message: string;
  users: AdminUserListItem[];
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface AdminUserDetailResponse {
  message: string;
  user: AdminUserListItem;
}

export interface UpdateAdminUserRequest {
  full_name?: string;
  display_name?: string;
  phone_number?: string;
  role?: UserRole;
  is_active?: boolean;
  is_banned?: boolean;
  banned_reason?: string | null;
}

/**
 * Retrieve all user profiles with administrative details
 */
export async function getAllUsersAdmin(params?: AdminUserListParams): Promise<AdminUserListResponse> {
  const response = await client.get<AdminUserListResponse>('/admin/users', { params });
  return response.data;
}

/**
 * Retrieve detailed profile of a single user
 */
export async function getUserByIdAdmin(id: string): Promise<AdminUserDetailResponse> {
  const response = await client.get<AdminUserDetailResponse>(`/admin/users/${id}`);
  return response.data;
}

/**
 * Update a user profile, role, active status, or ban status
 */
export async function updateUserAdmin(
  id: string,
  data: UpdateAdminUserRequest
): Promise<AdminUserDetailResponse> {
  const response = await client.patch<AdminUserDetailResponse>(`/admin/users/${id}`, data);
  return response.data;
}
