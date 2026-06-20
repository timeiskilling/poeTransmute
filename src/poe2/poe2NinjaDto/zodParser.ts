import { z } from 'zod';
import { ItemType, Poe2NinjaItemInsert } from '../db/schema';

export const SparklineSchema = z.object({
  totalChange: z.number().nullable().optional(),
  data: z.array(z.number()).nullable().optional(),
});

export const LineSchema = z.object({
  id: z.string(),
  primaryValue: z.number().optional(),
  volumePrimaryValue: z.number().nullable().optional(),
  maxVolumeCurrency: z.string().nullable().optional(),
  maxVolumeRate: z.number().nullable().optional(),
  sparkline: SparklineSchema.optional(),
});

export const HistorySchema = z.object({
  timestamp: z.string(),
  rate: z.number(),
  volumePrimaryValue: z.number(),
});

export const PairSchema = z.object({
  id: z.string(),
  rate: z.number(),
  volumePrimaryValue: z.number(),
  history: z.array(HistorySchema),
});

export const DetailPriceResponseSchema = z.object({
  pairs: z.array(PairSchema),
});

export const LineItemResponseSchema = z.object({
  lines: z.array(LineSchema),
});

export type Sparkline = z.infer<typeof SparklineSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Pair = z.infer<typeof PairSchema>;
export type LineItem = z.infer<typeof LineItemResponseSchema>;
export type History = z.infer<typeof HistorySchema>;
export type DetailPriceResponse = z.infer<typeof DetailPriceResponseSchema>;

export const createItemParser = (type: ItemType, baseUrl: string) =>
  z
    .object({
      name: z.string(),
      image: z.string(),
      category: z.string(),
      detailsId: z.string(),
    })
    .transform(
      (raw): Poe2NinjaItemInsert => ({
        type,
        name: raw.name,
        image: `${baseUrl}${raw.image}`,
        category: raw.category,
        detailsId: raw.detailsId,
      }),
    );
