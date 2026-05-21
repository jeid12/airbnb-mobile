import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiBooking } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * Fetches the logged-in guest's bookings using GET /users/:id/bookings.
 */
export function useMyBookings(): UseQueryResult<ApiBooking[], Error> {
  const { token, user } = useAuth();

  return useQuery<ApiBooking[], Error>({
    queryKey: ['bookings', 'me', user?.id],
    queryFn: () => api.getUserBookings(token!, user!.id),
    enabled: !!token && !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Cancels a booking with DELETE /bookings/:id (sets status → CANCELLED).
 * Optimistically removes it from the list and rolls back on error.
 */
export function useCancelBooking(): { cancel: (id: string) => void; isPending: boolean } {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiBooking, Error, string>({
    mutationFn: (id) => {
      if (!token) throw new Error('Not authenticated');
      return api.cancelBooking(token, id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['bookings', 'me'] });
      const prev = qc.getQueryData<ApiBooking[]>(['bookings', 'me']);
      qc.setQueryData<ApiBooking[]>(['bookings', 'me'], (old) =>
        old?.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      const context = ctx as { prev?: ApiBooking[] };
      if (context?.prev) qc.setQueryData(['bookings', 'me'], context.prev);
      Toast.show({ type: 'error', text1: 'Cancel failed' });
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Booking cancelled' });
      qc.invalidateQueries({ queryKey: ['bookings', 'me'] });
    },
  });

  return { cancel: mutation.mutate, isPending: mutation.isPending };
}
