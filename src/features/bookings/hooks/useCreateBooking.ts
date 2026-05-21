import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiBooking } from '../../../services/api';

interface BookingPayload {
  listingId: string;
  checkIn: string;    // ISO datetime e.g. "2027-07-01T12:00:00Z"
  checkOut: string;
  guests?: number;
}

export function useCreateBooking(): {
  mutate: (payload: BookingPayload) => void;
  isPending: boolean;
} {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiBooking, Error, BookingPayload>({
    mutationFn: (data) => {
      if (!token) throw new Error('You must be logged in to book a listing.');
      return api.createBooking(token, data);
    },
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['listing', booking.listingId] });
      Toast.show({ type: 'success', text1: 'Booking confirmed!', text2: 'View it in your Trips tab.' });
      router.replace('/(tabs)/trips');
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: 'Booking failed', text2: err.message });
    },
  });

  return { mutate: mutation.mutate, isPending: mutation.isPending };
}
