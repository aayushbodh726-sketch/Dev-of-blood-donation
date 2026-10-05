import { z } from 'zod';

const BloodGroupEnum = z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']);
const UrgencyEnum = z.enum(['CRITICAL', 'HIGH', 'NORMAL']);

export const createRequestSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  hospitalName: z.string().min(1, "Hospital name is required"),
  hospitalAddr: z.string().optional(),
  bloodGroup: BloodGroupEnum,
  unitsNeeded: z.number().int().positive().min(1),
  urgency: UrgencyEnum,
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  contactPhone: z.string().min(1, "Contact phone is required")
});
