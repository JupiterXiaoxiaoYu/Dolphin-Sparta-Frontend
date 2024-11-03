import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Shop } from './components/Shop';
import { Dolphin } from './components/Dolphin';
import { AnimatedDolphin } from './components/AnimatedDolphin';

function App() {
  const { 
    coins, 
    food, 
    medicine,
    maxSlots,
    dolphins, 
    addDolphin, 
    feedDolphin,
    petDolphin,
    healDolphin,
    collectCoins, 
    buyFood,
    buyMedicine,
    buySlot,
    updateGrowthProgress
  } = useGameStore();

  useEffect(() => {
    const interval = setInterval(() => {
      dolphins.forEach(dolphin => {
        if (dolphin.stage === 'warrior' && !dolphin.isIll) {
          const timeSinceLastFed = Date.now() - dolphin.lastFed;
          if (timeSinceLastFed < 300000) {
            dolphin.coins += dolphin.type === 'spear' ? 2 : 3;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dolphins]);

  useEffect(() => {
    const interval = setInterval(() => {
      dolphins.forEach(dolphin => {
        dolphin.satiety = Math.max(0, dolphin.satiety - 5);
        
        if (dolphin.satiety === 0 && !dolphin.isIll && Math.random() < 0.3) {
          dolphin.isIll = true;
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [dolphins]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateGrowthProgress();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateGrowthProgress]);

  return (
    <div className="ocean-bg min-h-screen p-8 relative">
      <div className="wave-container">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>
      <div className="water-caustics" />
      <div className="floating-bubbles" />
      
      <h1 
        className="text-4xl font-bold text-center mb-8 text-white relative"
        style={{
          textShadow: "0 0 10px #4a9eff, 0 0 20px #4a9eff, 0 2px 0 #000"
        }}
      >
        海豚斯巴达牧场
      </h1>
      
      <Shop
        coins={coins}
        food={food}
        medicine={medicine}
        maxSlots={maxSlots}
        dolphins={dolphins.length}
        onBuyFood={buyFood}
        onBuyMedicine={buyMedicine}
        onBuyDolphin={addDolphin}
        onBuySlot={buySlot}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {dolphins.map(dolphin => (
          <Dolphin
            key={dolphin.id}
            dolphin={dolphin}
            onFeed={() => feedDolphin(dolphin.id)}
            onPet={() => petDolphin(dolphin.id)}
            onHeal={() => healDolphin(dolphin.id)}
            onCollect={() => collectCoins(dolphin.id)}
          />
        ))}
      </div>
      
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="seaweed"
          style={{
            left: `${(i + 1) * 15}%`,
            animationDelay: `${-i * 0.5}s`
          }}
        />
      ))}
      <div className="coral-decoration" />
      <AnimatedDolphin />
    </div>
  );
}

export default App;