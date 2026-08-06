import { z } from 'zod';

export const gstInvoiceSchema = z.object({
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  sellerName: z.string().nullable(),
  sellerGSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).nullable().or(z.literal(null)),
  buyerName: z.string().nullable(),
  buyerGSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).nullable().or(z.literal(null)),
  lineItems: z.array(z.object({
    description: z.string().nullable(),
    hsnSac: z.string().nullable(),
    goodsQuantity: z.string().nullable(),
    goodsRate: z.number().nullable(),
    amount: z.number().nullable(),
  })),
  taxableValue: z.number().nullable(),
  cgstAmount: z.number().nullable(),
  sgstAmount: z.number().nullable(),
  igstAmount: z.number().nullable(),
  totalInvoiceAmount: z.number().nullable(),
});

export type GSTInvoice = z.infer<typeof gstInvoiceSchema>;
