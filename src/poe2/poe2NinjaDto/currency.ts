import { z } from 'zod';
import { CurrencyType, Poe2NinjaItemInsert } from '../db/schema';

export interface Root {
  core: Core;
  lines: Line[];
  items: Poe2NinjaItem[];
}

export interface Core {
  items: Item[];
  rates: Rates;
  primary: string;
  secondary: string;
}

export interface Item {
  id: string;
  name: string;
  image: string;
  category: string;
  detailsId: string;
}

export interface Rates {
  exalted: number;
  chaos: number;
}

export interface Line {
  id: string;
  primaryValue: number;
  volumePrimaryValue: number;
  maxVolumeCurrency: string;
  maxVolumeRate: number;
  sparkline: Sparkline;
}

export interface Sparkline {
  totalChange: number;
  data: number[];
}

export interface Poe2NinjaItem {
  id: string;
  name: string;
  image: string;
  category: string;
  detailsId: string;
}

export interface Poe2NinjaResponse {
  items: Poe2NinjaItem[];
}

export const createItemParser = (type: CurrencyType, baseUrl: string) =>
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
