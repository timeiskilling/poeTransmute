export interface Root {
  core: Core;
  lines: Line[];
  items: Items[];
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

export interface Items {
  id: string;
  name: string;
  image: string;
  category: string;
  detailsId: string;
}
