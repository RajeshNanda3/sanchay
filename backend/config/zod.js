import {z} from 'zod';

export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(3, "Name must be at least 3 characters long").max(100),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  mobile: z.string().min(10).max(15).optional(),
  role: z.enum(['USER','VENDOR']).optional(),
  referred_by: z.string().uuid().optional().nullable(),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});