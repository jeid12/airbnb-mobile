import { z } from 'zod';

// API requires ISO datetime strings for checkIn/checkOut
// e.g. "2027-07-01T12:00:00Z"
const isoDate = z.string().min(1, 'Date required').refine(
  (v) => !isNaN(Date.parse(v)),
  'Enter a valid date (YYYY-MM-DD)',
);

export const step1Schema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.number().int().min(1, 'At least 1 guest').max(16, 'Max 16 guests'),
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

export const step2Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone must be at least 7 characters'),
});

export const step3Schema = z.object({
  card: z.string().regex(/^\d{16}$/, 'Enter 16 digits'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'MM/YY format required'),
  cvv: z.string().regex(/^\d{3}$/, 'Enter 3 digits'),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
