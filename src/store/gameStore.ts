import { create } from 'zustand';
import { GameState, Dolphin } from '../types/game';

const GROWTH_TIME = 60000;
const FOOD_COST = 10;
const MEDICINE_COST = 30;
const SLOT_COST = 200;
const DOLPHIN_COST = {
  spear: 100,
  sword: 150
};

export const useGameStore = create<GameState>((set, get) => ({
  coins: 500,
  food: 10,
  medicine: 2,
  maxSlots: 3,
  dolphins: [],

  addCoins: (amount: number) => {
    set(state => ({
      coins: state.coins + amount
    }));
  },

  addDolphin: (type) => {
    const { coins, dolphins, maxSlots } = get();
    const cost = DOLPHIN_COST[type];
    
    if (coins >= cost && dolphins.length < maxSlots) {
      set((state) => ({
        coins: state.coins - cost,
        dolphins: [...state.dolphins, {
          id: Math.random().toString(36).substr(2, 9),
          type,
          stage: 'baby',
          bornTime: Date.now(),
          lastFed: Date.now(),
          lastPetted: 0,
          satiety: 100,
          isIll: false,
          coins: 0,
          growthProgress: 0
        }]
      }));
    }
  },

  updateGrowthProgress: () => {
    set((state) => ({
      dolphins: state.dolphins.map(dolphin => {
        if (dolphin.stage === 'baby' && !dolphin.isIll && dolphin.satiety > 0) {
          const timePassed = Date.now() - dolphin.bornTime;
          const baseProgress = (timePassed / GROWTH_TIME) * 100;
          const totalProgress = Math.min(100, baseProgress);
          
          if (totalProgress >= 100) {
            return { ...dolphin, stage: 'warrior', growthProgress: 100 };
          }
          
          return { ...dolphin, growthProgress: totalProgress };
        }
        return dolphin;
      })
    }));
  },

  feedDolphin: (id) => {
    const { food } = get();
    if (food <= 0) return;

    set((state) => ({
      food: state.food - 1,
      dolphins: state.dolphins.map(dolphin => 
        dolphin.id === id 
          ? { ...dolphin, lastFed: Date.now(), satiety: Math.min(100, dolphin.satiety + 30) }
          : dolphin
      )
    }));
  },

  healDolphin: (id) => {
    const { medicine } = get();
    const dolphin = get().dolphins.find(d => d.id === id);
    if (!medicine || !dolphin?.isIll) return;

    set((state) => ({
      medicine: state.medicine - 1,
      dolphins: state.dolphins.map(d => 
        d.id === id 
          ? { ...dolphin, isIll: false, satiety: Math.max(20, d.satiety) }
          : d
      )
    }));
  },

  collectCoins: (id) => {
    const dolphin = get().dolphins.find(d => d.id === id);
    if (!dolphin || dolphin.stage !== 'warrior' || dolphin.isIll) return;

    const coinsToCollect = dolphin.coins;
    
    set((state) => ({
      coins: state.coins + coinsToCollect,
      dolphins: state.dolphins.map(d => 
        d.id === id 
          ? { ...d, coins: 0 }
          : d
      )
    }));
  },

  buyFood: (amount) => {
    const { coins } = get();
    const totalCost = amount * FOOD_COST;
    
    if (coins >= totalCost) {
      set((state) => ({
        coins: state.coins - totalCost,
        food: state.food + amount
      }));
    }
  },

  buyMedicine: (amount) => {
    const { coins } = get();
    const totalCost = amount * MEDICINE_COST;
    
    if (coins >= totalCost) {
      set((state) => ({
        coins: state.coins - totalCost,
        medicine: state.medicine + amount
      }));
    }
  },

  buySlot: () => {
    const { coins } = get();
    if (coins >= SLOT_COST) {
      set((state) => ({
        coins: state.coins - SLOT_COST,
        maxSlots: state.maxSlots + 1
      }));
    }
  },

  sellDolphin: (id: string) => {
    const dolphin = get().dolphins.find(d => d.id === id);
    if (!dolphin) return;
    
    const sellPrice = Math.floor(DOLPHIN_COST[dolphin.type] / 2);
    
    set(state => ({
      coins: state.coins + sellPrice,
      dolphins: state.dolphins.filter(d => d.id !== id)
    }));
  },

  collectAllCoins: () => {
    const { dolphins } = get();
    const totalCoins = dolphins.reduce((sum, dolphin) => {
      if (dolphin.stage === 'warrior' && !dolphin.isIll) {
        return sum + dolphin.coins;
      }
      return sum;
    }, 0);

    set((state) => ({
      coins: state.coins + totalCoins,
      dolphins: state.dolphins.map(d => ({
        ...d,
        coins: 0
      }))
    }));
  },
}));