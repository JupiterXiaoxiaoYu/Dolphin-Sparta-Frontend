import React, { useEffect, useCallback, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Shop } from './components/Shop';
import { Dolphin } from './components/Dolphin';
import { PetPreview } from './components/PetPreview';
import { ISpriteConfig } from './types/ISpriteConfig';

// 在 App.tsx 组件外部定义
const SPRITE_CONFIG: ISpriteConfig = {
  "name": "Starphin Shimeji",
  "imageSrc": "Starphin Shimeji.png",
  "frameSize": 128,
  "credit": {
      "link": "https://www.dropbox.com/sh/r1ofen1npg78vyp/AAAoCzy51pRvaFDMmNs_fngSa?dl=0"
  },
  "states": {
      "stand": {
          "spriteLine": 1,
          "frameMax": 1
      },
      "walk": {
          "spriteLine": 2,
          "frameMax": 4
      },
      "sit": {
          "spriteLine": 3,
          "frameMax": 1
      },
      "greet": {
          "spriteLine": 4,
          "frameMax": 4
      },
      "crawl": {
          "spriteLine": 8,
          "frameMax": 8
      },
      "climb": {
          "spriteLine": 9,
          "frameMax": 8
      },
      "jump": {
          "spriteLine": 5,
          "frameMax": 1
      },
      "fall": {
          "spriteLine": 6,
          "frameMax": 3
      },
      "drag": {
          "spriteLine": 7,
          "frameMax": 1
      }
  }
};

function App() {
  const { 
    coins, 
    food, 
    medicine,
    maxSlots,
    dolphins, 
    addDolphin, 
    feedDolphin,
    healDolphin,
    collectCoins, 
    buyFood,
    buyMedicine,
    buySlot,
    updateGrowthProgress,
    sellDolphin,
    collectAllCoins
  } = useGameStore();

  const updateCoins = useCallback(() => {
    useGameStore.setState(state => ({
      dolphins: state.dolphins.map(dolphin => {
        if (dolphin.stage === 'warrior' && !dolphin.isIll) {
          const timeSinceLastFed = Date.now() - dolphin.lastFed;
          if (timeSinceLastFed < 300000) {
            return {
              ...dolphin,
              coins: dolphin.coins + (dolphin.type === 'spear' ? 2 : 3)
            };
          }
        }
        return dolphin;
      })
    }));
  }, []);

  const updateSatiety = useCallback(() => {
    useGameStore.setState(state => ({
      dolphins: state.dolphins.map(dolphin => ({
        ...dolphin,
        satiety: Math.max(0, dolphin.satiety - 5),
        isIll: dolphin.satiety === 0 && !dolphin.isIll && Math.random() < 0.3
      }))
    }));
  }, []);

  useEffect(() => {
    const coinsInterval = setInterval(updateCoins, 1000);
    const satietyInterval = setInterval(updateSatiety, 30000);
    const growthInterval = setInterval(() => {
      useGameStore.getState().updateGrowthProgress();
    }, 1000);

    return () => {
      clearInterval(coinsInterval);
      clearInterval(satietyInterval);
      clearInterval(growthInterval);
    };
  }, []);

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
        onCollectAllCoins={collectAllCoins}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {dolphins.map(dolphin => (
          <Dolphin
            key={dolphin.id}
            dolphin={dolphin}
            onFeed={() => feedDolphin(dolphin.id)}
            onHeal={() => healDolphin(dolphin.id)}
            onCollect={() => collectCoins(dolphin.id)}
            onSell={() => sellDolphin(dolphin.id)}
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
      {dolphins.map((dolphin) => (
        <PetPreview 
          key={`pet-${dolphin.id}`}
          spriteConfig={{
            ...SPRITE_CONFIG,
            name: `${SPRITE_CONFIG.name}-${dolphin.id}`
          }}
        />
      ))}
    </div>
  );
}

export default App;