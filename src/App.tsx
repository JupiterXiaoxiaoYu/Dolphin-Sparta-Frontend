import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useGameStore } from './store/gameStore';
import { Shop } from './components/Shop';
import { Dolphin } from './components/Dolphin';
import { PetPreview } from './components/PetPreview';
import { ISpriteConfig } from './types/ISpriteConfig';
import { MusicPlayer } from './components/MusicPlayer';
import { ConnectButton } from "thirdweb/react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client } from './client';

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

const EVIL_WHALE_CONFIG: ISpriteConfig = {
  "name": "Evil Whale",
  "imageSrc": "Evil Whale.png",
  "frameSize": 128,
  "states": {
    "drop": {
      "spriteLine": 1,
      "frameMax": 4
    },
    "walk": {
      "spriteLine": 2,
      "frameMax": 4
    },
    "attack": {
      "spriteLine": 3,
      "frameMax": 4
    },
    "cry": {
      "spriteLine": 4,
      "frameMax": 4
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
    dolphinCoins,
    feedDolphin,
    healDolphin,
    collectCoins, 
    buyFood,
    buyMedicine,
    buySlot,
    buyDolphin,
    updateGrowthProgress,
    updateCoinCollectionProgress,
    sellDolphin,
    collectAllCoins
  } = useGameStore();

  const account = useActiveAccount();
  const [showEvilWhale, setShowEvilWhale] = useState(false);
  const [showDolphinStatus, setShowDolphinStatus] = useState(true);

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
    if (account?.address) {
      useGameStore.getState().initializePlayer(account.address, "http://localhost:3000");
      console.log("Player initialized successfully");
    }
  }, [account]);

  useEffect(() => {
    const coinsInterval = setInterval(() => {
      useGameStore.getState().updateCoinCollectionProgress();
    }, 1000);
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

  const spriteConfigs = useMemo(() => [
    ...dolphins.map((dolphin, index) => ({
      ...SPRITE_CONFIG,
      id: dolphin.id,
      name: `Starphin-${dolphin.id}`
    })),
    ...(showEvilWhale ? [{
      ...EVIL_WHALE_CONFIG,
      id: 'evil-whale',
      name: 'Evil-Whale'
    }] : [])
  ], [dolphins, showEvilWhale]);

  const pendingCoins = dolphins.reduce((sum, dolphin) => {
    if (dolphin.stage === 'warrior' && !dolphin.isIll) {
      return sum + dolphin.coins;
    }
    return sum;
  }, 0);

  return (
    <div className="ocean-bg">
      {/* Add ConnectButton */}
      <div className="absolute top-4 right-1 z-20">
      <ConnectButton
      client={client}
      // onConnect={async (wallet) => {
      //   try {
      //     if (account?.address) {
      //       await useGameStore.getState().initializePlayer(
      //         account.address,
      //       "http://localhost:3000" // Your RPC URL
      //       );
      //       console.log("Player installed successfully");
      //     }
      //   } catch (error) {
      //     console.error("Failed to install player:", error);
      //   }
      // }}
      />
      </div>

      {/* 添加音乐放器 */}
      <MusicPlayer />
      
      {/* 背景层 */}
      <div className="absolute inset-0">
        {/* 波浪 */}
        <div className="wave-container">
          <div className="wave" />
          <div className="wave" />
          <div className="wave" />
        </div>
        
        {/* 增加更多波纹，使用不同大小和动画延迟 */}
        <div 
          className="ripple ripple-small" 
          style={{ 
            left: '20%', 
            top: '30%',
          }} 
        />
        <div 
          className="ripple ripple-medium" 
          style={{ 
            left: '70%', 
            top: '25%',
            animationDelay: '-2s'
          }} 
        />
        <div 
          className="ripple ripple-large" 
          style={{ 
            left: '40%', 
            top: '60%',
            animationDelay: '-4s'
          }} 
        />
        <div 
          className="ripple ripple-small" 
          style={{ 
            left: '85%', 
            top: '70%',
            animationDelay: '-1s'
          }} 
        />
        <div 
          className="ripple ripple-medium" 
          style={{ 
            left: '15%', 
            top: '80%',
            animationDelay: '-3s'
          }} 
        />
        <div 
          className="ripple ripple-large" 
          style={{ 
            left: '60%', 
            top: '45%',
            animationDelay: '-5s'
          }} 
        />

        <div className="water-caustics" />
        <div className="floating-bubbles" />
      </div>

      {/* UI层 */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          海豚斯巴达牧场
        </h1>
        
        <Shop
          coins={coins}
          food={food}
          medicine={medicine}
          maxSlots={maxSlots}
          dolphinCoins={dolphinCoins}
          dolphins={dolphins.length}
          showEvilWhale={showEvilWhale}
          onBuyFood={buyFood}
          onBuyMedicine={buyMedicine}
          onBuyDolphin={(type: "spear" | "sword") => buyDolphin(type === "spear" ? 1 : 2)}
          onBuySlot={buySlot}
          onCollectAllCoins={collectAllCoins}
          onFightEvilWhale={() => {
            setShowEvilWhale(true);
            useGameStore.getState().spendCoins(1000);
          }}
          showDolphinStatus={showDolphinStatus}
          onToggleDolphinStatus={() => setShowDolphinStatus(!showDolphinStatus)}
          pendingCoins={pendingCoins}
        />

        {showDolphinStatus && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {dolphins.map(dolphin => (
              <Dolphin
                key={dolphin.id}
                dolphin={dolphin}
                onFeed={() => feedDolphin(Number(dolphin.id))}
                onHeal={() => healDolphin(Number(dolphin.id))}
                onSell={() => sellDolphin(Number(dolphin.id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* 精灵层 */}
      <PetPreview 
        configs={spriteConfigs} 
        onEvilWhaleRemoved={() => setShowEvilWhale(false)} 
      />
    </div>
  );
}

export default App;