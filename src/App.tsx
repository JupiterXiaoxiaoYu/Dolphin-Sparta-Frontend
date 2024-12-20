import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useGameStore } from './store/gameStore';
import { Shop } from './components/Shop';
import { Dolphin } from './components/Dolphin';
import { PetPreview } from './components/PetPreview';
import { ISpriteConfig } from './types/ISpriteConfig';
import { MusicPlayer } from './components/MusicPlayer';
import { ConnectButton } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import { client } from './client';
import { lightTheme } from "thirdweb/react";
import { SPEAR_DOLPHIN_CONFIG,SWORD_DOLPHIN_CONFIG, EVIL_WHALE_CONFIG } from './types/spriteConfigs';
import { updateStateFromBackend } from './utils/stateUtils';

const customTheme = lightTheme({
 colors: {
  connectedButtonBg: '#4a9eff',
 }
})

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
      useGameStore.getState().initializePlayer(account.address, "http://localhost:3000")
        .then(result => {
          console.log("Player initialized successfully:", result);
        })
        .catch(error => {
          console.error("Failed to initialize player:", error);
        });
    }
  }, [account]);

  useEffect(() => {
    // Initial state update
    const updatePlayerState = async () => {
      const player = useGameStore.getState().player;
      if (player) {
        const state = await player.getState();
        useGameStore.setState(updateStateFromBackend(state));
      }
    };
    // Set up 5-second interval for state updates
    const stateInterval = setInterval(updatePlayerState, 2000);

    // Clean up interval on unmount
    return () => {
      clearInterval(stateInterval);
    };
  }, []);

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
      ...(dolphin.type === 'spear' ? SPEAR_DOLPHIN_CONFIG : SWORD_DOLPHIN_CONFIG),
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
    if (dolphin.life_stage === 100 && !dolphin.isIll) {
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
        theme={customTheme}
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
      <h1 className="text-4xl font-bold text-center mb-8" style={{ color: '#007BFF' }}>
  Dolphin Sparta Ranch
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
          onBuyDolphin={(type: "spear" | "sword") => buyDolphin(type === "spear" ? 0 : 1)}
          onBuySlot={buySlot}
          onCollectAllCoins={collectAllCoins}
          onFightEvilWhale={() => {
            setShowEvilWhale(true);
          }}
          showDolphinStatus={showDolphinStatus}
          onToggleDolphinStatus={() => setShowDolphinStatus(!showDolphinStatus)}
          pendingCoins={pendingCoins}
        />

        {showDolphinStatus && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
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
        dolphins={dolphins}
      />
    </div>
  );
}

export default App;