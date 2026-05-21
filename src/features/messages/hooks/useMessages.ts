import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/auth';
import type { ApiMessage } from '../../../services/api';
import type { UseQueryResult } from '@tanstack/react-query';

export function useConversations(): UseQueryResult<ApiMessage[], Error> {
  const { token } = useAuth();
  return useQuery<ApiMessage[], Error>({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(token!),
    enabled: !!token,
    refetchInterval: 30_000, // poll every 30s — 304s mean no data is transferred
    staleTime: 20_000,
  });
}

export function useThread(peerId: string): UseQueryResult<ApiMessage[], Error> {
  const { token } = useAuth();
  return useQuery<ApiMessage[], Error>({
    queryKey: ['thread', peerId],
    queryFn: () => api.getThread(token!, peerId),
    enabled: !!token && !!peerId,
    refetchInterval: 10_000, // poll every 10s inside an active thread
    staleTime: 0,
  });
}

export function useSendMessage(): { send: (receiverId: string, content: string, listingId?: string) => void; isPending: boolean } {
  const { token } = useAuth();
  const qc = useQueryClient();

  const mutation = useMutation<ApiMessage, Error, { receiverId: string; content: string; listingId?: string }>({
    mutationFn: (data) => {
      if (!token) throw new Error('Not authenticated');
      return api.sendMessage(token, data);
    },
    onSuccess: (msg) => {
      // Optimistically add to thread cache
      qc.setQueryData<ApiMessage[]>(['thread', msg.receiverId], (old) =>
        old ? [...old, msg] : [msg],
      );
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: 'Send failed', text2: err.message });
    },
  });

  return {
    send: (receiverId, content, listingId) => mutation.mutate({ receiverId, content, listingId }),
    isPending: mutation.isPending,
  };
}

export function useUnreadCount(): number {
  const { token } = useAuth();
  const { data } = useQuery<{ count: number }, Error>({
    queryKey: ['unread-count'],
    queryFn: () => api.getUnreadCount(token!),
    enabled: !!token,
    refetchInterval: 60_000, // badge check every 60s
    staleTime: 30_000,
  });
  return data?.count ?? 0;
}
