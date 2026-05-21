import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiListingItem, ApiBooking, ListingType } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

// ── GET /users/:id/listings ───────────────────────────────────────────────────

export function useMyListings(): UseQueryResult<ApiListingItem[], Error> {
  const { user, token } = useAuth();
  return useQuery<ApiListingItem[], Error>({
    queryKey: ['listings', 'mine', user?.id],
    queryFn: () => api.getUserListings(user!.id),
    enabled: !!user?.id && !!token,
    staleTime: 3 * 60 * 1000,
  });
}

// ── POST /listings ────────────────────────────────────────────────────────────

export function useCreateListing(): {
  create: (data: {
    title: string; description: string; location: string;
    pricePerNight: number; guests: number; type: ListingType; amenities: string[];
  }) => void;
  isPending: boolean;
} {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiListingItem, Error, Parameters<typeof api.createListing>[1]>({
    mutationFn: (data) => {
      if (!token) throw new Error('Not authenticated');
      return api.createListing(token, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({ type: 'success', text1: 'Listing created!' });
      router.back();
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: 'Failed to create listing', text2: err.message });
    },
  });

  return { create: mutation.mutate, isPending: mutation.isPending };
}

// ── PUT /listings/:id ─────────────────────────────────────────────────────────

export function useUpdateListing(id: string): {
  update: (data: Partial<ApiListingItem>) => void;
  isPending: boolean;
} {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiListingItem, Error, Partial<ApiListingItem>>({
    mutationFn: (data) => {
      if (!token) throw new Error('Not authenticated');
      return api.updateListing(token, id, data);
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['listing', id] });
      const prev = qc.getQueryData<ApiListingItem>(['listing', id]);
      qc.setQueryData<ApiListingItem>(['listing', id], (old) => old ? { ...old, ...data } : old);
      return { prev };
    },
    onError: (_err, _data, ctx) => {
      const context = ctx as { prev?: ApiListingItem };
      if (context?.prev) qc.setQueryData(['listing', id], context.prev);
      Toast.show({ type: 'error', text1: 'Update failed' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({ type: 'success', text1: 'Listing updated!' });
      router.back();
    },
  });

  return { update: mutation.mutate, isPending: mutation.isPending };
}

// ── DELETE /listings/:id ──────────────────────────────────────────────────────

export function useDeleteListing(): { remove: (id: string) => void; isPending: boolean } {
  const { token, user } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiListingItem, Error, string>({
    mutationFn: (id) => {
      if (!token) throw new Error('Not authenticated');
      return api.deleteListing(token, id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['listings', 'mine'] });
      const prev = qc.getQueryData<ApiListingItem[]>(['listings', 'mine', user?.id]);
      qc.setQueryData<ApiListingItem[]>(['listings', 'mine', user?.id],
        (old) => old?.filter((l) => l.id !== id) ?? [],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      const context = ctx as { prev?: ApiListingItem[] };
      if (context?.prev) qc.setQueryData(['listings', 'mine', user?.id], context.prev);
      Toast.show({ type: 'error', text1: 'Delete failed' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({ type: 'success', text1: 'Listing deleted' });
    },
  });

  return { remove: mutation.mutate, isPending: mutation.isPending };
}

// ── GET /bookings (all) ───────────────────────────────────────────────────────

export function useHostBookings(): UseQueryResult<ApiBooking[], Error> {
  const { token } = useAuth();
  return useQuery<ApiBooking[], Error>({
    queryKey: ['bookings', 'host'],
    queryFn: () => api.getAllBookings().then((r) => r.data),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}
