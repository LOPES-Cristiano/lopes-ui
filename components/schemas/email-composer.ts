import { z } from 'zod';

export const emailRecipientSchema = z.object({
  email: z.string().trim().email('E-mail do destinatário inválido'),
  name: z.string().optional(),
});

export type EmailRecipient = z.infer<typeof emailRecipientSchema>;

export const emailAttachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  type: z.string(),
  url: z.string().optional(),
});

export type EmailAttachment = z.infer<typeof emailAttachmentSchema>;

export const emailPayloadSchema = z.object({
  to: z
  .array(emailRecipientSchema)
  .min(1, 'Informe ao menos um destinatário válido no campo Para'),
  cc: z.array(emailRecipientSchema).default([]),
  bcc: z.array(emailRecipientSchema).default([]),
  subject: z.string(),
  body: z.string(),
  attachments: z.array(emailAttachmentSchema).default([]),
});

export type EmailPayload = z.infer<typeof emailPayloadSchema>;
