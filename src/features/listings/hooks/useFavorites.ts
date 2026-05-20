import Toast from 'react-native-toast-message';
import { useStore } from '../../../store/StoreContext';
import type { ApiListingItem } from '../../../services/api';

interface UseFavoritesResult {
  saved: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string, title: string) => void;
  count: number;
  savedListings: ApiListingItem[];
}

export function useFavorites(): UseFavoritesResult {
  const { state, dispatch } = useStore();

  const isSaved = (id: string): boolean => state.saved.includes(id);

  const toggle = (id: string, title: string): void => {
    const wasSaved = isSaved(id);
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
    if (wasSaved) {
      Toast.show({ type: 'info', text1: `Removed: ${title}` });
    } else {
      Toast.show({ type: 'success', text1: `Saved: ${title}` });
    }
  };

  const savedListings = state.listings.filter((l) => state.saved.includes(l.id));

  return { saved: state.saved, isSaved, toggle, count: state.saved.length, savedListings };
}
