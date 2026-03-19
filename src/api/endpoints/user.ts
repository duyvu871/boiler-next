import { api } from '../../lib/api';
import { User, UpdateUserInput } from '../../types/user';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  getUsers: async (params?: { page: number; limit: number }): Promise<{ users: User[], total: number }> => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  updateProfile: async (payload: UpdateUserInput): Promise<User> => {
    const { data } = await api.put('/users/me', payload);
    return data;
  },
};
