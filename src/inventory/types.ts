export type Price = {
    finalPrice: number;
    currencyCode: string;
    originalPrice: number;
  };
  
  export type PaxAvailability = {
    type: string;
    name?: string;
    description?: string;
    price: Price;
    min?: number;
    max?: number;
    remaining: number;
  };
  
  export type Slot = {
    startTime: string;
    startDate: string;
    price: Price;
    remaining: number;
    paxAvailability: PaxAvailability[];
  };
  
  export type DateAvailability = {
    date: string;
    price: Price;
  };
  