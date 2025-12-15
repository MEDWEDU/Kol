import type { AxiosProgressEvent } from 'axios';

import { http } from './http';
import type { User } from '../types';

export type UpdateMePayload = {
  email?: string;
  name?: string;
  organization?: string;
  position?: string;
  bio?: string;
  avatar?: File | null;
};

export async function getMe() {
  const res = await http.get<{ user: User }>('/users/me');
  return res.data;
}

export async function updateMe(
  payload: UpdateMePayload,
  opts?: { onUploadProgress?: (event: AxiosProgressEvent) => void },
) {
  const formData = new FormData();

  if (payload.email !== undefined) formData.set('email', payload.email);
  if (payload.name !== undefined) formData.set('name', payload.name);
  if (payload.organization !== undefined) formData.set('organization', payload.organization);
  if (payload.position !== undefined) formData.set('position', payload.position);
  if (payload.bio !== undefined) formData.set('bio', payload.bio);
  if (payload.avatar) formData.set('avatar', payload.avatar);

  const res = await http.put<{ user: User }>('/users/me', formData, {
    onUploadProgress: opts?.onUploadProgress,
  });

  return res.data;
}
