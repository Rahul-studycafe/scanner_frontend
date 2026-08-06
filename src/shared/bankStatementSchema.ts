import { z } from 'zod';

export const bankStatementTransactionSchema = z.object({
  serialNo: z.string().nullable(),
  date: z.string().nullable(),
  description: z.string().nullable(),
  withdrawal: z.number().nullable(),
  deposit: z.number().nullable(),
  balance: z.number().nullable(),
});

export const bankStatementSchema = z.object({
  accountHolderName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  bankName: z.string().nullable(),
  statementPeriod: z.string().nullable(),
  openingBalance: z.number().nullable(),
  closingBalance: z.number().nullable(),
  transactions: z.array(bankStatementTransactionSchema),
});

export type BankStatement = z.infer<typeof bankStatementSchema>;
export type BankStatementTransaction = z.infer<typeof bankStatementTransactionSchema>;
