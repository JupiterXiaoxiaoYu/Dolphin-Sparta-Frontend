import React, { useState, useEffect } from 'react';
import './AnimatedDolphin.css';

export const AnimatedDolphin: React.FC = () => {
  const [spriteIndex, setSpriteIndex] = useState(0);
  const totalSprites = 8;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSpriteIndex((prev) => (prev + 1) % totalSprites);
    }, 125); // 8帧动画，1秒完成一个循环
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dolphin-animation-container">
      <div className="dolphin-row">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="dolphin-wrapper" style={{ animationDelay: `${i * -3}s` }}>
            <div 
              className="dolphin"
              style={{
                transform: `translateX(${-spriteIndex * 100}px)`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};