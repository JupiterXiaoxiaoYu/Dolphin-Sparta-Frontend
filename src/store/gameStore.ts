import { create } from 'zustand';
import { GameState, Dolphin } from '../types/game';
import { Player } from '../apis/api';
import { updateStateFromBackend } from '../utils/stateUtils';

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  player: null,
  loading: false,
  error: null,
  gameState: null,
  coins: 0,
  food: 0,
  medicine: 0,
  maxSlots: 3,
  dolphins: [],
  population: 0,
  evilWhaleHealth: 0,
  lastCollectTime: 0,
  lastAttackTime: 0,

  // Add these new methods
  dolphinCoins: 0,

  spendCoins: (amount: number) => set(state => ({ coins: state.coins - amount })),
  addDolphinCoins: (amount: number) => set(state => ({ dolphinCoins: state.dolphinCoins + amount })),
  spendDolphinCoins: (amount: number) => set(state => ({ dolphinCoins: state.dolphinCoins - amount })),
  addFood: (amount: number) => set(state => ({ food: state.food + amount })),
  spendFood: (amount: number) => set(state => ({ food: state.food - amount })),
  addMedicine: (amount: number) => set(state => ({ medicine: state.medicine + amount })),
  spendMedicine: (amount: number) => set(state => ({ medicine: state.medicine - amount })),

  // API methods
  initializePlayer: async (key: string, rpcUrl: string) => {
    console.log("Initializing player with key:", key, "and RPC URL:", rpcUrl);
    try {
      set({ loading: true, error: null });
      const player = new Player(key.split("0x")[1], rpcUrl);
      await player.installPlayer();
      const state = await player.getState();
      console.log("Player state:", state);
      
      // Update all relevant state fields
      set({ 
        player,
        gameState: state,
        coins: state.player.data.coins_balance || 0,
        food: state.player.data.food_number || 0,
        medicine: state.player.data.medicine_number || 0,
        maxSlots: state.player.data.population_number || 3,
        dolphins: state.player.data.dolphins || [],
        dolphinCoins: state.player.data.dolphin_token_balance || 0,
        loading: false 
      });
      
      return state;
    } catch (error) {
      console.error("Error initializing player:", error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  buyDolphin: async (type: number) => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyDolphin(type);
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  buyFood: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyFood();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  buyMedicine: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyMedicine();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  feedDolphin: async (dolphinId: number) => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.feedDolphin(dolphinId);
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  healDolphin: async (dolphinId: number) => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.healDolphin(dolphinId);
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  attackEvilWhale: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.attackEvilWhale();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  buyPopulation: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyPopulation();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  collectCoins: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.collectCoins();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  sellDolphin: async (index: number) => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      console.log("Sell dolphin index", index);
      if (!player) throw new Error('Player not initialized');
      const state = await player.sellDolphin(index);
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Computed getters from gameState
  getCoins: () => get().gameState?.player?.data?.coins || 0,
  getFood: () => get().gameState?.player?.data?.food_number || 0,
  getMedicine: () => get().gameState?.player?.data?.medicine_number || 0,
  getMaxSlots: () => get().gameState?.player?.data?.max_slots || 3,
  getDolphins: () => get().gameState?.player?.data?.dolphins || [],
  getDolphinCoins: () => get().gameState?.player?.data?.dolphin_token_balance || 0,

  // Add these missing methods
  updateGrowthProgress: () => set(state => ({ ...state })), // Implement actual logic as needed
  updateCoinCollectionProgress: () => set(state => ({ ...state })), // Implement actual logic as needed
  collectAllCoins: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.collectCoins();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  buySlot: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.buyPopulation();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  installPlayer: async (key: string, rpcUrl: string) => {
    try {
      set({ loading: true, error: null });
      const player = new Player(key, rpcUrl);
      await player.installPlayer();
      const state = await player.getState();
      
      set({ 
        player,
        gameState: {
          player: {
            nonce: state.nonce,
            data: {
              pid: state.data.pid,
              coins_balance: state.data.coins_balance,
              dolphin_token_balance: state.data.dolphin_token_balance,
              dolphin_index: state.data.dolphin_index,
              food_number: state.data.food_number,
              medicine_number: state.data.medicine_number,
              population_number: state.data.population_number,
              dolphins: state.data.dolphins
            }
          },
          state: {}
        },
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addCoins: async () => {
    try {
      set({ loading: true, error: null });
      const { player } = get();
      if (!player) throw new Error('Player not initialized');
      const state = await player.addCoins();
      set(updateStateFromBackend(state));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));