import { z } from 'zod';
import { ItemType, Poe2NinjaItemInsert } from '../db/schema';

export type SafeResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; reason: string; details?: unknown };

export const SparklineSchema = z.object({
  totalChange: z.number().nullable().optional(),
  data: z.array(z.number()).nullable().optional(),
});

export const LineSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  itemId: z.string().optional(),
  detailsId: z.string().optional(),
  icon: z.string().optional(),

  primaryValue: z.number().optional(),
  volumePrimaryValue: z.number().nullable().optional(),
  maxVolumeCurrency: z.string().nullable().optional(),
  maxVolumeRate: z.number().nullable().optional(),

  sparkLine: SparklineSchema.optional(),
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
  pairs: z.array(PairSchema).min(1, { message: 'empty_data' }),
});

export const LineItemResponseSchema = z.object({
  lines: z.array(LineSchema).min(1, { message: 'empty_data' }),
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
      name: z.string().optional(),
      itemId: z.string().optional(),
      image: z.string().optional(),
      icon: z.string().optional(),
      category: z.string().optional(),
      detailsId: z.string(),
    })
    .transform((raw): Poe2NinjaItemInsert => {
      const itemName = raw.name || raw.itemId || 'Unknown Item';

      let itemImage = raw.image || raw.icon || '';
      if (itemImage && !itemImage.startsWith('http')) {
        itemImage = `${baseUrl}${itemImage}`;
      }

      return {
        type,
        name: itemName,
        image: itemImage,
        category: raw.category || 'Unknown',
        detailsId: raw.detailsId,
      };
    });
