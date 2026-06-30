export interface DetailPriceDto {
  item: DetailItem;
  pairs: Pair[];
  core: Core;
}

export interface DetailItem {
  id: string;
  name: string;
  image: string;
  category: string;
  detailsId: string;
}

export interface Pair {
  id: string;
  rate: number;
  volumePrimaryValue: number;
  history: History[];
}

export interface History {
  timestamp: string;
  rate: number;
  volumePrimaryValue: number;
}

export interface Core {
  items: Item2[];
  rates: Rates;
  primary: string;
  secondary: string;
}

export interface Item2 {
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
