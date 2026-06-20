import { Pair } from './detailPriceDto';
import { Line } from './zodParser';

export type Poe2NinjaItemPairResponse =
  | { itemId: string; status: 'success'; count: number; items: Pair[] }
  | { itemId: string; status: 'error' | 'skipped'; reason: string };

export type Poe2NinjaItemLineResponse =
  | { type: string; status: 'success'; count: number; items: Line[] }
  | { type: string; status: 'error' | 'skipped'; reason: string };
