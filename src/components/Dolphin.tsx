import React, { useState, useEffect } from 'react';
import { Dolphin as DolphinType } from '../types/game';

interface Props {
  dolphin: DolphinType;
  onFeed: () => void;
  onHeal: () => void;
  onSell: () => void;
}

export const Dolphin: React.FC<Props> = ({ dolphin, onFeed, onHeal, onSell }) => {
  const isWarrior = dolphin.stage === 'warrior';
  const [timeLeft, setTimeLeft] = useState<string>('');

  const GROWTH_TIME = 3000;

  useEffect(() => {
    if (dolphin.stage === 'baby') {
      const timer = setInterval(() => {
        const now = Date.now();
        const timePassed = now - dolphin.bornTime;
        const totalTime = GROWTH_TIME;
        const remaining = Math.max(0, totalTime - timePassed);
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeLeft(`${minutes}min${seconds}sec`);
        } else {
          setTimeLeft('Ready to Mature');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [dolphin.stage, dolphin.bornTime]);

  return (
    <div className={`rpg-panel rpg-border p-4 rounded-lg ${dolphin.isIll ? 'bg-red-900/50' : ''}`} style={{zIndex: 10}}>
      <div className="text-center">
        <div className="text-xl font-bold text-yellow-100 text-shadow mb-3">
          {dolphin.type === 'spear' ? '🔱' : '⚔️'} 
          {isWarrior ? 'Sword Dolphin' : 'Little Dolphin'}
          {dolphin.isIll && ' 🤒'}
          <span className="ml-2 text-sm text-yellow-300">
              Level: {dolphin.level || 1}
          </span>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-yellow-100 w-16">Satiety</div>
              <div className="stat-bar flex-1">
                <div 
                  className="stat-bar-fill satiety-bar"
                  style={{ width: `${dolphin.satiety}%` }}
                />
              </div>
            </div>
          </div>

          {isWarrior && !dolphin.isIll && (
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-yellow-100 w-16">Coins</div>
                <div className="stat-bar flex-1">
                  <div 
                    className="stat-bar-fill coin-bar"
                    style={{ width: `${(dolphin.coins / 1000) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-yellow-200 mt-1">
                Coin Collection: {dolphin.coins}/{1000}
              </div>
            </div>
          )}

          {!isWarrior && (
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-yellow-100 w-16">Growth Progress</div>
                <div className="stat-bar flex-1">
                  <div 
                    className="stat-bar-fill growth-bar"
                    style={{ width: `${dolphin.growthProgress}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-yellow-200 mt-1">
                Time to Mature: {timeLeft}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-x-2">
          <button
            onClick={onFeed}
            className="rpg-button px-3 py-1 rounded text-sm"
          >
            Feed
          </button>

          {dolphin.isIll && (
            <button
              onClick={onHeal}
              className="rpg-button px-3 py-1 rounded text-sm"
            >
              Heal
            </button>
          )}

          <button
            onClick={onSell}
            className="rpg-button px-3 py-1 rounded text-sm bg-red-900/50 hover:bg-red-800/50"
          >
            Sell ({Math.floor(dolphin.type === 'spear' ? 50 : 75)} Coins)
          </button>
        </div>
      </div>
    </div>
  );
};