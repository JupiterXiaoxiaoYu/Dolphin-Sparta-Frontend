import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Alert } from './Alert';

interface Props {
  coins: number;
  food: number;
  medicine: number;
  maxSlots: number;
  dolphins: number;
  showEvilWhale: boolean;
  dolphinCoins: number;
  pendingCoins: number;
  onBuyFood: (amount: number) => void;
  onBuyMedicine: (amount: number) => void;
  onBuyDolphin: (type: 'spear' | 'sword') => void;
  onBuySlot: () => void;
  onCollectAllCoins: () => void;
  onFightEvilWhale: () => void;
  onToggleDolphinStatus: () => void;
  showDolphinStatus: boolean;
}

export const Shop: React.FC<Props> = ({ 
  coins, 
  food, 
  medicine,
  maxSlots,
  dolphins,
  showEvilWhale,
  dolphinCoins,
  pendingCoins,
  onBuyFood, 
  onBuyMedicine,
  onBuyDolphin,
  onBuySlot,
  onCollectAllCoins,
  onFightEvilWhale,
  onToggleDolphinStatus,
  showDolphinStatus
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const showAlert = (message: string) => {
    setAlert(message);
  };

  const handleBuyFood = () => {
    if (coins < 50) {
      showAlert('Insufficient coins to buy food');
      return;
    }
    onBuyFood(5);
  };

  const handleBuyMedicine = () => {
    if (coins < 150) {
      showAlert('Insufficient coins to buy medicine');
      return;
    }
    onBuyMedicine(5);
  };

  const handleBuySlot = () => {
    if (coins < 200) {
      showAlert('Insufficient coins to buy slot');
      return;
    }
    onBuySlot();
  };

  const handleBuyDolphin = (type: 'spear' | 'sword') => {
    const cost = type === 'spear' ? 100 : 150;
    if (coins < cost) {
      showAlert(`Insufficient coins to buy ${type === 'spear' ? 'Spear' : 'Sword'} Dolphin`);
      return;
    }
    onBuyDolphin(type);
  };

  const handleFightEvilWhale = async () => {
    if (coins < 1000) {
      showAlert('Insufficient coins to request Dolphin God power to fight Evil Whale');
      return;
    }
    try {
      await useGameStore.getState().attackEvilWhale();
      onFightEvilWhale();
    } catch (error) {
      showAlert((error as Error).message);
    }
  };

  const handleAddCoins = async () => {
    try {
      await useGameStore.getState().addCoins();
    } catch (error) {
      showAlert((error as Error).message);
    }
  };

  if (isMinimized) {
    return (
      <div 
        className="rpg-panel rpg-border p-3 rounded-lg cursor-pointer inline-block"
        onClick={() => setIsMinimized(false)}
        style={{zIndex: 10}}
      >
        <img 
          src="/temple.png" 
          alt="temple" 
          className="w-8 h-8"
        />
      </div>
    );
  }

  return (
    <>
      {alert && <Alert message={alert} onClose={() => setAlert(null)} />}
      <div className="rpg-panel rpg-border p-6 rounded-lg" style={{zIndex: 10}}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-100 text-shadow flex items-center justify-start">
            <img 
              src="/temple.png" 
              alt="temple" 
              className="w-8 h-8 mr-2 inline-block align-middle"
            />
            <span className="align-middle">Artemis Otia Dolphin Temple</span>
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleDolphinStatus}
              className="rpg-button px-3 py-1 rounded text-sm"
            >
              {showDolphinStatus ? 'Hide' : 'Show'} Dolphin Status
            </button>
            <button 
              onClick={() => setIsMinimized(true)}
              className="rpg-button px-2 py-1 rounded hover:bg-gray-700/50"
            >
              <span className="text-xl">−</span>
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="rpg-panel p-3 rounded">
              <p className="font-bold text-yellow-100 flex items-center">
                <span className="inline-block w-5 h-5 mr-1 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('/coin.png')"}}></span>
                Coins: {coins}
                <button
                  onClick={handleAddCoins}
                  className="rpg-button px-2 py-1 rounded ml-2 text-xs"
                >
                  +100
                </button>
              </p>
            </div>
            <div className="rpg-panel p-3 rounded">
              <p className="font-bold text-yellow-100 flex items-center">
                <span className="inline-block w-5 h-5 mr-1 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('/dolphin-coin.png')"}}></span>
                Dolphin Token: {dolphinCoins}
              </p>
            </div>
            <div className="rpg-panel p-3 rounded flex items-center justify-between">
              <p className="font-bold text-yellow-100 flex items-center">
                <span className="inline-block w-5 h-5 mr-1 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('/food.png')"}}></span>
                Food: {food}
              </p>
              <button
                onClick={() => handleBuyFood()}
                className="rpg-button px-2 py-1 rounded text-xs ml-2"
              >
                Buy 5 (50 Coins)
              </button>
            </div>
            <div className="rpg-panel p-3 rounded flex items-center justify-between">
              <p className="font-bold text-yellow-100 flex items-center">
                <span className="inline-block w-5 h-5 mr-1 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('/medicine.png')"}}></span>
                Medicine: {medicine}
              </p>
              <button
                onClick={() => handleBuyMedicine()}
                className="rpg-button px-2 py-1 rounded text-xs ml-2"
              >
                Buy 5 (150 Coins)
              </button>
            </div>
            <div className="rpg-panel p-3 rounded flex items-center justify-between">
              <p className="font-bold text-yellow-100 flex items-center">
                <span className="inline-block w-5 h-5 mr-1 bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('/slot.png')"}}></span>
                Population: {dolphins}/{maxSlots}
              </p>
              <button
                onClick={() => handleBuySlot()}
                className="rpg-button px-2 py-1 rounded text-xs ml-2"
              >
                Add 1 (200 Coins)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={() => handleBuyDolphin('spear')}
              disabled={dolphins >= maxSlots}
              className={`rpg-button px-4 py-2 rounded ${
                dolphins >= maxSlots ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Buy Spear Dolphin (150 Coins) 
            </button>
            <button
              onClick={() => handleBuyDolphin('sword')}
              disabled={dolphins >= maxSlots}
              className={`rpg-button px-4 py-2 rounded ${
                dolphins >= maxSlots ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Buy Sword Dolphin (100 Coins)
            </button>
            <button
              onClick={onCollectAllCoins}
              className="rpg-button px-4 py-2 rounded flex items-center"
            >
              Collect All Coins
              {pendingCoins > 0 && (
                <span className="ml-2 bg-yellow-500/30 px-2 py-0.5 rounded-full text-sm">
                  {pendingCoins}
                </span>
              )}
            </button>
            <button
              onClick={handleFightEvilWhale}
              disabled={showEvilWhale}
              className={`rpg-button px-4 py-2 rounded bg-red-900/50 hover:bg-red-800/50 ${
                showEvilWhale ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Fight Evil Whale (1000 Coins)
            </button>
          </div>
        </div>
      </div>
    </>
  );
};