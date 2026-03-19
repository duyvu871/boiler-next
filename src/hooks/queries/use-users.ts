import { useAppQuery, useAppMutation } from '../use-query-base';
import { usersApi } from '../../api/endpoints/user';
import { User, UpdateUserInput } from '../../types/user';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
};

export function useProfile(options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>) {
  return useAppQuery(
    userKeys.profile(),
    () => usersApi.getProfile(),
    options
  );
}

export function useUsersList(
  params: { page: number; limit: number },
  options?: Omit<UseQueryOptions<{ users: User[]; total: number }, Error>, 'queryKey' | 'queryFn'>
) {
  return useAppQuery(
    userKeys.list(JSON.stringify(params)),
    () => usersApi.getUsers(params),
    options
  );
}

export function useUpdateProfile(
  options?: Omit<UseMutationOptions<User, Error, UpdateUserInput>, 'mutationFn'>
) {
  return useAppMutation(
    (payload: UpdateUserInput) => usersApi.updateProfile(payload),
    options
  );
}
