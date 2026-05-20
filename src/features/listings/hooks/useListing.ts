import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import type { ApiListingDetail } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

export function useListing(id: string): UseQueryResult<ApiListingDetail, Error> {
  return useQuery<ApiListingDetail, Error>({
    queryKey: ['listing', id],
    queryFn: () => api.getListing(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
