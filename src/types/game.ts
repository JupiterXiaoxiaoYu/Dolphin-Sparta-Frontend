import { Player } from "src/apis/api";

export type DolphinType = 'spear' | 'sword';
export type DolphinStage = 'baby' | 'warrior';

export interface Dolphin {
  id: string;
  type: DolphinType;
  stage: DolphinStage;
  bornTime: number;
  lastFed: number;
  lastPetted: number;
  satiety: number;
  isIll: boolean;
  coins: number;
  growthProgress: number;
  level: number;
}

export interface GameState {
  player: Player | null;
  loading: boolean;
  error: string | null;
  gameState: any;
  coins: number;
  food: number;
  medicine: number;
  maxSlots: number;
  dolphins: Dolphin[];
  dolphinCoins: number;

  // API methods
  initializePlayer: (key: string, rpcUrl: string) => Promise<void>;
  buyDolphin: (type: number) => Promise<void>;
  buyFood: (amount: number) => Promise<void>;
  buyMedicine: (amount: number) => Promise<void>;
  feedDolphin: (dolphinId: number) => Promise<void>;
  healDolphin: (dolphinId: number) => Promise<void>;
  attackEvilWhale: () => Promise<void>;
  addCoins: () => Promise<void>;
  buyPopulation: () => Promise<void>;
  collectCoins: () => Promise<void>;
  sellDolphin: (index: number) => Promise<void>;

  // Local state methods
  spendCoins: (amount: number) => void;
  addDolphinCoins: (amount: number) => void;
  updateGrowthProgress: () => void;
  updateCoinCollectionProgress: () => void;
  collectAllCoins: () => void;
  buySlot: () => void;
}