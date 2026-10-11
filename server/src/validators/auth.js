import { z } from 'zod';

const BloodGroupEnum = z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']);
const RoleEnum = z.enum(['DONOR', 'RECIPIENT']);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  bloodGroup: BloodGroupEnum,
  role: RoleEnum,
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
});
