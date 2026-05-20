import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(3, 'Location required'),
  pricePerNight: z.number().min(10, 'Minimum price is $10'),
  type: z.enum(['APARTMENT', 'VILLA', 'CABIN', 'HOUSE']),
  guests: z.number().int().min(1).max(20),
});

export type ListingFormData = z.infer<typeof listingSchema>;
