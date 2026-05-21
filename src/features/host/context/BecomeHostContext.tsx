import React, { createContext, useContext, useState } from 'react';
import type { ListingType } from '../../../services/api';

export interface BecomeHostDraft {
  type: ListingType;
  location: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  title: string;
  description: string;
  pricePerNight: number;
}

interface BecomeHostContextValue {
  draft: BecomeHostDraft;
  update: (partial: Partial<BecomeHostDraft>) => void;
  reset: () => void;
}

const DEFAULT: BecomeHostDraft = {
  type: 'APARTMENT',
  location: '',
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  title: '',
  description: '',
  pricePerNight: 50,
};

const BecomeHostContext = createContext<BecomeHostContextValue | null>(null);

export function BecomeHostProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<BecomeHostDraft>(DEFAULT);

  const update = (partial: Partial<BecomeHostDraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const reset = () => setDraft(DEFAULT);

  return (
    <BecomeHostContext.Provider value={{ draft, update, reset }}>
      {children}
    </BecomeHostContext.Provider>
  );
}

export function useBecomeHost(): BecomeHostContextValue {
  const ctx = useContext(BecomeHostContext);
  if (!ctx) throw new Error('useBecomeHost must be used inside <BecomeHostProvider>');
  return ctx;
}
