import type { AxiosProgressEvent } from 'axios';

import { http } from './http';
import type { User } from '../types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  organization?: string;
  position?: string;
  bio?: string;
  avatar?: File | null;
};

export async function login(payload: LoginPayload) {
  const res = await http.post<{ user: User }>('/auth/login', payload);
  return res.data;
}

export async function register(
  payload: RegisterPayload,
  opts?: { onUploadProgress?: (event: AxiosProgressEvent) => void },
) {
  const formData = new FormData();

  formData.set('email', payload.email);
  formData.set('password', payload.password);
  if (payload.name !== undefined) formData.set('name', payload.name);
  if (payload.organization !== undefined) formData.set('organization', payload.organization);
  if (payload.position !== undefined) formData.set('position', payload.position);
  if (payload.bio !== undefined) formData.set('bio', payload.bio);
  if (payload.avatar) formData.set('avatar', payload.avatar);

  const res = await http.post<{ user: User }>('/auth/register', formData, {
    onUploadProgress: opts?.onUploadProgress,
  });
  return res.data;
}

export async function logout() {
  const res = await http.post<{ ok: true }>('/auth/logout');
  return res.data;
}

export async function session() {
  const res = await http.get<{ user: User }>('/auth/session');
  return res.data;
}

export async function refresh() {
  const res = await http.post<{ user: User }>('/auth/refresh');
  return res.data;
}
