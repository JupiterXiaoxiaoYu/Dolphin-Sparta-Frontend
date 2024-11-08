import { create } from 'zustand';
import { GameState, Dolphin } from '../types/game';
import { Player } from '../apis/api';

const GROWTH_TIME = 3000;
const FOOD_COST = 10;
const MEDICINE_COST = 30;
const SLOT_COST = 200;
const DOLPHIN_COST = {
  spear: 100,
  sword: 150
};
const MAX_COINS = 1000;
const COIN_RATE = {
  spear: 2,
  sword: 3
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  player: null,
  loading: false,
  error: null,
  gameState: null,
  coins: 500,
  food: 10,
  medicine: 2,
  maxSlots: 3,
  dolphins: [],
  dolphinCoins: 0,

  // API methods
  initializePlayer: async (key: string, rpcUrl: string) => {
    try {
      set({ loading: true, error: null });
      const player = new Player(key, rpcUrl);
      await player.installPlayer();
      const state = await player.getState();
      set({ player, gameState: state, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  buyDolphin: async (type?: number) => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      
      const state = type !== undefined 
        ? await player.buyDolphin(type)
        : await player.buyDolphin(0);
      
      set({ gameState: state, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  buyFood: async (amount: number) => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyFood();
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  buyMedicine: async (amount: number) => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyMedicine();
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  feedDolphin: async (dolphinId: number) => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.feedDolphin(dolphinId);
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  healDolphin: async (dolphinId: number) => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.healDolphin(dolphinId);
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  attackEvilWhale: async () => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.attackEvilWhale();
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  buyPopulation: async () => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyPopulation();
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  collectCoins: async () => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.collectCoins();
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  sellDolphin: async (index: number) => {
    try {
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.sellDolphin(index);
      set({ gameState: state });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Local state methods
  addCoins: (amount) => {
    set(state => ({
      coins: state.coins + amount
    }));
  },

  spendCoins: (amount) => {
    set(state => ({
      coins: state.coins - amount
    }));
  },

  addDolphinCoins: (amount) => {
    set(state => ({
      dolphinCoins: state.dolphinCoins + amount
    }));
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

  updateCoinCollectionProgress: () => {
    set((state) => ({
      dolphins: state.dolphins.map(dolphin => {
        if (dolphin.stage === 'warrior' && !dolphin.isIll) {
          const timeSinceLastFed = Date.now() - dolphin.lastFed;
          if (timeSinceLastFed < 300000) {
            const coinIncrement = COIN_RATE[dolphin.type];
            const newCoins = Math.min(dolphin.coins + coinIncrement, MAX_COINS);
            return {
              ...dolphin,
              coins: newCoins
            };
          }
        }
        return dolphin;
      })
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

  buySlot: () => {
    const { coins } = get();
    if (coins >= SLOT_COST) {
      set((state) => ({
        coins: state.coins - SLOT_COST,
        maxSlots: state.maxSlots + 1
      }));
    }
  },
}));