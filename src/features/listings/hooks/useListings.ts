import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useStore } from '../../../store/StoreContext';
import type { ApiListingItem } from '../../../services/api';

export function useListings(params: {
  page?: number;
  limit?: number;
  type?: string;
  location?: string;
  maxPrice?: number;
} = {}): void {
  const { dispatch } = useStore();

  const { data, isFetching } = useQuery<ApiListingItem[]>({
    queryKey: ['listings', params],
    queryFn: () =>
      api.getListings({
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        type: params.type,
        location: params.location,
        maxPrice: params.maxPrice,
      }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isFetching });
  }, [isFetching, dispatch]);

  useEffect(() => {
    if (data) dispatch({ type: 'SET_LISTINGS', payload: data });
  }, [data, dispatch]);
}
