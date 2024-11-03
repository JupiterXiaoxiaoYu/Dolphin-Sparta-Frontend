import React, { useEffect, useRef } from 'react';
import BottomAnimation from './BottomAnimation';
import { ISpriteConfig } from '../types/ISpriteConfig';

interface PetPreviewProps {
  spriteConfig: ISpriteConfig;
}

export const PetPreview: React.FC<PetPreviewProps> = ({ spriteConfig }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<BottomAnimation | null>(null);

  useEffect(() => {
    if (containerRef.current && !animationRef.current) {
      const containerId = `pet-container-${spriteConfig.name}`;
      containerRef.current.id = containerId;
      
      animationRef.current = new BottomAnimation({
        config: spriteConfig,
        initialState: 'walk',
        scale: 1,
        frameRate: 9,
        container: containerRef.current,
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [spriteConfig.name]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '200px',
        pointerEvents: 'auto',
        zIndex: 9999
      }} 
    />
  );
}; 