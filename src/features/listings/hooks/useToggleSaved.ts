import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';

export function useToggleSaved(): { toggle: (listingId: string, title: string) => void; isPending: boolean } {
  const qc = useQueryClient();
  const { token } = useAuth();

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (listingId) => {
      if (!token) throw new Error('Not authenticated');
      // Optimistic: toggle in wishlists. We'll create a wishlist entry.
      await api.createWishlist(token, 'Saved');
    },
    onMutate: async (listingId) => {
      await qc.cancelQueries({ queryKey: ['saved'] });
      const prev = qc.getQueryData<string[]>(['saved']) ?? [];
      const next = prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId];
      qc.setQueryData(['saved'], next);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      const context = ctx as { prev: string[] } | undefined;
      if (context?.prev) qc.setQueryData(['saved'], context.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['saved'] }),
  });

  return {
    toggle: (listingId, title) => {
      const saved = qc.getQueryData<string[]>(['saved']) ?? [];
      const wasSaved = saved.includes(listingId);
      mutation.mutate(listingId);
      Toast.show({
        type: wasSaved ? 'info' : 'success',
        text1: wasSaved ? `Removed: ${title}` : `Saved: ${title}`,
      });
    },
    isPending: mutation.isPending,
  };
}
