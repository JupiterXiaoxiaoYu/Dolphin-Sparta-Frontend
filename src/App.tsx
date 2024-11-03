import React, { useEffect, useCallback, useState, useMemo } from 'react';
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
        isIll: dolphin.satiety <= 0 ? true : dolphin.isIll
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

  const spriteConfigs = useMemo(() => 
    dolphins.map((dolphin, index) => ({
      ...SPRITE_CONFIG,
      id: dolphin.id,
      name: `Starphin-${dolphin.id}`
    })), 
    [dolphins]
  );

  return (
    <div className="ocean-bg min-h-screen p-8 relative">
      {/* 背景元素 */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="wave-container">
          <div className="wave" />
          <div className="wave" />
          <div className="wave" />
        </div>
        <div className="water-caustics" />
        <div className="floating-bubbles" />
      </div>

      {/* UI元素 */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1 className="text-4xl font-bold text-center mb-8 text-white relative">
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {/* 精灵层 */}
      <PetPreview configs={spriteConfigs} />
    </div>
  );
}

export default App;