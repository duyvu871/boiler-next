import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseInfiniteQueryOptions,
  type QueryKey,
  type DefaultError,
  type QueryFunctionContext,
} from '@tanstack/react-query';

/**
 * Base generic hook for standard queries.
 * @param queryKey The unique key for the query (e.g. ['users', 'list'])
 * @param fetcher The function from your centralized API module
 * @param options Any overrides for UseQueryOptions (staleTime, enabled, etc.)
 */
export function useAppQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  fetcher: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}

/**
 * Base generic hook for mutations.
 * @param fetcher The function from your centralized API module
 * @param options Any overrides for UseMutationOptions (onSuccess, onError, mutates, etc.)
 */
export function useAppMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  fetcher: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: fetcher,
    ...options,
  });
}

/**
 * Base generic hook for infinite queries (load more, pagination).
 * @param queryKey The unique key for the query
 * @param fetcher The function that takes a pageParam and returns a page of data
 * @param options Overrides including getNextPageParam
 */
export function useAppInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  queryKey: TQueryKey,
  fetcher: (context: QueryFunctionContext<TQueryKey, TPageParam>) => Promise<TQueryFnData>,
  options: Omit<
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
    'queryKey' | 'queryFn'
  >
) {
  return useInfiniteQuery<TQueryFnData, TError, TData, TQueryKey, TPageParam>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}
