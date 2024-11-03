import React, { useState, useEffect } from 'react';
import { Dolphin as DolphinType } from '../types/game';

interface Props {
  dolphin: DolphinType;
  onFeed: () => void;
  onPet: () => void;
  onHeal: () => void;
  onCollect: () => void;
}

export const Dolphin: React.FC<Props> = ({ dolphin, onFeed, onPet, onHeal, onCollect }) => {
  const isWarrior = dolphin.stage === 'warrior';
  const timeSinceLastPet = Date.now() - dolphin.lastPetted;
  const canPet = timeSinceLastPet >= 30000;
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (dolphin.stage === 'baby') {
      const timer = setInterval(() => {
        const now = Date.now();
        const timeNeeded = 60000 - (dolphin.growthProgress / 100 * 60000);
        const timePassed = now - dolphin.bornTime;
        const remaining = Math.max(0, timeNeeded - timePassed);
        
        if (remaining > 0) {
          const seconds = Math.ceil(remaining / 1000);
          setTimeLeft(`${Math.floor(seconds / 60)}分${seconds % 60}秒`);
        } else {
          setTimeLeft('即将成年');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [dolphin]);

  return (
    <div className={`rpg-panel rpg-border p-4 rounded-lg ${dolphin.isIll ? 'bg-red-900/50' : ''}`}>
      <div className="text-center">
        <div className="text-xl font-bold text-yellow-100 text-shadow mb-3">
          {dolphin.type === 'spear' ? '🔱' : '⚔️'} 
          {isWarrior ? '战士海豚' : '小海豚'}
          {dolphin.isIll && ' 🤒'}
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm text-yellow-100 mb-1">饱食度</div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill satiety-bar"
                style={{ width: `${dolphin.satiety}%` }}
              />
            </div>
          </div>

          {!isWarrior && (
            <div>
              <div className="text-sm text-yellow-100 mb-1">成长进度</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill growth-bar"
                  style={{ width: `${dolphin.growthProgress}%` }}
                />
              </div>
              <div className="text-xs text-yellow-200 mt-1">
                预计成年: {timeLeft}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-x-2">
          <button
            onClick={onFeed}
            className="rpg-button px-3 py-1 rounded text-sm"
          >
            喂食
          </button>
          
          {!isWarrior && (
            <button
              onClick={onPet}
              disabled={!canPet}
              className={`rpg-button px-3 py-1 rounded text-sm ${
                !canPet ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {canPet ? '抚摸' : '冷却中'}
            </button>
          )}

          {dolphin.isIll && (
            <button
              onClick={onHeal}
              className="rpg-button px-3 py-1 rounded text-sm"
            >
              治疗
            </button>
          )}

          {isWarrior && !dolphin.isIll && dolphin.coins > 0 && (
            <button
              onClick={onCollect}
              className="rpg-button px-3 py-1 rounded text-sm"
            >
              <span className="coin-icon"></span>
              收集金币 ({dolphin.coins})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};