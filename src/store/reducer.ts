import { produce } from 'immer';
import type { State, Action } from './types';

export const initialState: State = {
  listings: [],
  loading: false,
  filter: '',
  saved: [],
};

export const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case 'SET_LISTINGS':
      draft.listings = action.payload;
      break;
    case 'SET_LOADING':
      draft.loading = action.payload;
      break;
    case 'SET_FILTER':
      draft.filter = action.payload;
      break;
    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      const idx = draft.saved.indexOf(id);
      if (idx === -1) draft.saved.push(id);
      else draft.saved.splice(idx, 1);
      break;
    }
  }
});
