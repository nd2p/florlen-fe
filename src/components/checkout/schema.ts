import { z } from 'zod';

/**
 * Checkout form schema.
 * The Information section now uses a selectedAddressId (required).
 * Only the note and payment option remain as manual form inputs.
 */
export const getCheckoutSchema = (t: (key: string) => string) => {
  return z.object({
    selectedAddressId: z
      .string({ message: t('address.selectRequired') })
      .uuid({ message: t('address.selectRequired') }),
    note: z.string().optional(),
  });
};

export type CheckoutSchemaType = ReturnType<typeof getCheckoutSchema>;
export type CheckoutValues = z.infer<CheckoutSchemaType>;
