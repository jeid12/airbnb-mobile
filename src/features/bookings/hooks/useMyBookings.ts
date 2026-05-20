import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiBooking } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

export function useMyBookings(): UseQueryResult<ApiBooking[], Error> {
  const { token, user } = useAuth();

  return useQuery<ApiBooking[], Error>({
    queryKey: ['bookings', 'me'],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await api.getBookings(token);
      return res.data.filter((b) => b.guestId === user?.id);
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCancelBooking(): { cancel: (id: string) => void; isPending: boolean } {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      // Optimistic: remove from cache immediately
      qc.setQueryData<ApiBooking[]>(['bookings', 'me'], (prev) =>
        prev?.filter((b) => b.id !== id) ?? [],
      );
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Booking cancelled' });
    },
    onError: (err) => {
      qc.invalidateQueries({ queryKey: ['bookings', 'me'] });
      Toast.show({ type: 'error', text1: 'Cancel failed', text2: err.message });
    },
  });

  return { cancel: mutation.mutate, isPending: mutation.isPending };
}
