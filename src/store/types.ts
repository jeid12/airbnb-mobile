import type { ApiListingItem } from '../services/api';

export interface State {
  listings: ApiListingItem[];
  loading: boolean;
  filter: string;
  saved: string[];
}

export type Action =
  | { type: 'SET_LISTINGS'; payload: ApiListingItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string };
