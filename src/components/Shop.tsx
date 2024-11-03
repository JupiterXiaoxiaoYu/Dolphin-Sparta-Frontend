import React from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  coins: number;
  food: number;
  medicine: number;
  maxSlots: number;
  dolphins: number;
  onBuyFood: (amount: number) => void;
  onBuyMedicine: (amount: number) => void;
  onBuyDolphin: (type: 'spear' | 'sword') => void;
  onBuySlot: () => void;
  onCollectAllCoins: () => void;
}

export const Shop: React.FC<Props> = ({ 
  coins, 
  food, 
  medicine,
  maxSlots,
  dolphins,
  onBuyFood, 
  onBuyMedicine,
  onBuyDolphin,
  onBuySlot,
  onCollectAllCoins
}) => {
  const addCoins = useGameStore(state => state.addCoins);

  return (
    <div className="rpg-panel rpg-border p-6 rounded-lg" style={{zIndex: 10}}>
      <h2 className="text-2xl font-bold mb-4 text-yellow-100 text-shadow">商店</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="rpg-panel p-3 rounded">
            <p className="font-bold text-yellow-100">
              <span className="coin-icon"></span>
              金币: {coins}
              <button
                onClick={() => addCoins(100)}
                className="rpg-button px-2 py-1 rounded ml-2 text-xs"
              >
                +100
              </button>
            </p>
          </div>
          <div className="rpg-panel p-3 rounded">
            <p className="font-bold text-yellow-100">
              <span className="inline-block w-4 h-4 mr-1 bg-contain" style={{backgroundImage: "url('/food.png')"}}></span>
              食物: {food}
            </p>
          </div>
          <div className="rpg-panel p-3 rounded">
            <p className="font-bold text-yellow-100">
              <span className="inline-block w-4 h-4 mr-1 bg-contain" style={{backgroundImage: "url('/medicine.png')"}}></span>
              药品: {medicine}
            </p>
          </div>
          <div className="rpg-panel p-3 rounded">
            <p className="font-bold text-yellow-100">
              <span className="inline-block w-4 h-4 mr-1 bg-contain" style={{backgroundImage: "url('/slot.png')"}}></span>
              栏位: {dolphins}/{maxSlots}
            </p>
          </div>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => onBuyFood(5)}
            className="rpg-button px-4 py-2 rounded"
          >
            购买5个食物 (50金币)
          </button>
          <button
            onClick={() => onBuyMedicine(1)}
            className="rpg-button px-4 py-2 rounded"
          >
            购买1个药品 (30金币)
          </button>
          <button
            onClick={onBuySlot}
            className="rpg-button px-4 py-2 rounded"
          >
            购买栏位 (200金币)
          </button>
          <button
            onClick={onCollectAllCoins}
            className="rpg-button px-4 py-2 rounded bg-red-900/50 hover:bg-red-800/50"
          >
            对抗邪恶巨鲸
          </button>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => onBuyDolphin('spear')}
            disabled={dolphins >= maxSlots}
            className={`rpg-button px-4 py-2 rounded ${
              dolphins >= maxSlots ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            购买长矛海豚 (100金币)
          </button>
          <button
            onClick={() => onBuyDolphin('sword')}
            disabled={dolphins >= maxSlots}
            className={`rpg-button px-4 py-2 rounded ${
              dolphins >= maxSlots ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            购买剑盾海豚 (150金币)
          </button>
        </div>
      </div>
    </div>
  );
};