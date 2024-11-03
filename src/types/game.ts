export interface Dolphin {
  id: string;
  type: 'spear' | 'sword';
  stage: 'baby' | 'warrior';
  bornTime: number;
  lastFed: number;
  lastPetted: number;
  satiety: number;
  isIll: boolean;
  coins: number;
  growthProgress: number;
}

export interface GameState {
  coins: number;
  food: number;
  medicine: number;
  maxSlots: number;
  dolphins: Dolphin[];
  addCoins: (amount: number) => void;
  addDolphin: (type: 'spear' | 'sword') => void;
  updateGrowthProgress: () => void;
  feedDolphin: (id: string) => void;
  healDolphin: (id: string) => void;
  collectCoins: (id: string) => void;
  buyFood: (amount: number) => void;
  buyMedicine: (amount: number) => void;
  buySlot: () => void;
  sellDolphin: (id: string) => void;
  collectAllCoins: () => void;
}