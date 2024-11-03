import React, { useEffect, useRef } from 'react';
import BottomAnimation from './BottomAnimation';
import { ISpriteConfig } from '../types/ISpriteConfig';

interface PetPreviewProps {
  spriteConfig: ISpriteConfig;
}

export const PetPreview: React.FC<PetPreviewProps> = ({ spriteConfig }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: BottomAnimation | null = null;
    
    if (containerRef.current) {
      animation = new BottomAnimation({
        config: spriteConfig,
        initialState: 'walk',
        scale: 1,
        frameRate: 9,
        container: containerRef.current
      });
    }

    return () => {
      animation?.destroy();
    };
  }, [spriteConfig]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '200px',
        pointerEvents: 'auto'
      }} 
    />
  );
}; 