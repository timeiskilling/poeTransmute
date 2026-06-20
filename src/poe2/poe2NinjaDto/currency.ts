import { Line } from './zodParser';

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
