import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiListingItem, ApiListingDetail } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

export function useMyListings(): UseQueryResult<ApiListingItem[], Error> {
  const { token } = useAuth();
  return useQuery<ApiListingItem[], Error>({
    queryKey: ['listings', 'mine'],
    queryFn: async () => {
      const res = await api.getListings({}, token);
      return res.data;
    },
    enabled: !!token,
  });
}

export function useDeleteListing(): { remove: (id: string) => void; isPending: boolean } {
  const qc = useQueryClient();
  const mutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      // Optimistic removal
      qc.setQueryData<ApiListingItem[]>(['listings', 'mine'], (prev) =>
        prev?.filter((l) => l.id !== id) ?? [],
      );
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Listing deleted' });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (err) => {
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
      Toast.show({ type: 'error', text1: 'Delete failed', text2: err.message });
    },
  });
  return { remove: mutation.mutate, isPending: mutation.isPending };
}

export function useHostBookings(): UseQueryResult<import('../../../services/api').ApiBooking[], Error> {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['bookings', 'host'],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const res = await api.getBookings(token);
      return res.data;
    },
    enabled: !!token,
  });
}
