import { z } from 'zod';

const createOrderZodSchema = z.object({
  body: z.object({
    buyer: z
      .string({
        required_error: 'buyer is required',
      })
      .optional(),
    cow: z
      .string({
        required_error: 'cow is required',
      })
      .optional(),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
};
