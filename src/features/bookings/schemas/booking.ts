import { z } from 'zod';

export const step1Schema = z
  .object({
    checkIn: z.string().min(1, 'Check-in date required'),
    checkOut: z.string().min(1, 'Check-out date required'),
    guests: z.number().int().min(1, 'At least 1 guest').max(16, 'Max 16 guests'),
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

export const step2Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Phone must be at least 7 characters'),
});

export const step3Schema = z.object({
  card: z.string().regex(/^\d{16}$/, '16 digits required'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'MM/YY format required'),
  cvv: z.string().regex(/^\d{3}$/, '3 digits required'),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
