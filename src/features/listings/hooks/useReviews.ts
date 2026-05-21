import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiReview } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

export function useListingReviews(
  listingId: string,
  params: { page?: number; limit?: number } = {},
): UseQueryResult<{ data: ApiReview[]; meta: import('../../../services/api').ApiMeta }, Error> {
  return useQuery({
    queryKey: ['reviews', listingId, params],
    queryFn: () => api.getListingReviews(listingId, params),
    enabled: !!listingId,
    staleTime: 30 * 1000, // cached 30s per API docs
  });
}

export function useAddReview(listingId: string): {
  submit: (rating: number, comment: string) => void;
  isPending: boolean;
} {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiReview, Error, { rating: number; comment: string }>({
    mutationFn: ({ rating, comment }) => {
      if (!token) throw new Error('Not authenticated');
      return api.addReview(token, listingId, { rating, comment });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', listingId] });
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
      Toast.show({ type: 'success', text1: 'Review submitted!' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: 'Could not submit review', text2: err.message });
    },
  });

  return {
    submit: (rating, comment) => mutation.mutate({ rating, comment }),
    isPending: mutation.isPending,
  };
}

export function useDeleteReview(): { remove: (reviewId: string) => void; isPending: boolean } {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (reviewId) => {
      if (!token) throw new Error('Not authenticated');
      return api.deleteReview(token, reviewId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      Toast.show({ type: 'success', text1: 'Review deleted' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: 'Delete failed', text2: err.message });
    },
  });

  return { remove: mutation.mutate, isPending: mutation.isPending };
}
