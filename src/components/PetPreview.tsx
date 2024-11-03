import React, { useEffect, useRef, useMemo } from 'react';
import BottomAnimation from './BottomAnimation';
import { ISpriteConfig } from '../types/ISpriteConfig';

export const PetPreview: React.FC<{ configs: ISpriteConfig[] }> = ({ configs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<BottomAnimation | null>(null);
  const initializedSpritesRef = useRef<Set<string>>(new Set());

  const memoizedConfigs = useMemo(() => {
    return configs.map(config => ({
      ...config,
      name: `${config.name}-${config.id || Math.random().toString(36).substr(2, 9)}`
    }));
  }, [configs]);

  useEffect(() => {
    if (containerRef.current && !animationRef.current) {
      containerRef.current.id = 'pet-container';
      animationRef.current = new BottomAnimation({
        container: containerRef.current
      });
    }
  }, []);

  useEffect(() => {
    if (!animationRef.current) return;

    const newSprites = new Set(memoizedConfigs.map(config => config.name));
    const currentSprites = initializedSpritesRef.current;

    memoizedConfigs.forEach(config => {
      if (!currentSprites.has(config.name)) {
        console.log('Adding new sprite:', config.name);
        animationRef.current?.addSprite(config);
        currentSprites.add(config.name);
      }
    });

    currentSprites.forEach(spriteName => {
      if (!newSprites.has(spriteName)) {
        console.log('Removing sprite:', spriteName);
        animationRef.current?.removeSprite(spriteName);
        currentSprites.delete(spriteName);
      }
    });
  }, [memoizedConfigs]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
        initializedSpritesRef.current.clear();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 20
      }} 
    >
      <div 
        id="game-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}; 