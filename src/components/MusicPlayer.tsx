import React, { useState, useRef, useEffect } from 'react';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks] = useState<string[]>([
    '/music/RolanTin - SeaSand.mp3',
    '/music/Tempo - DeepSea.mp3',
    '/music/Tempo - DeepSea(Beta1).mp3',
    '/music/Tempo - Intro.mp3',
    '/music/Tempo - Memories.mp3',
    '/music/Tempo - Rain.mp3',
    '/music/Tempo - Rainyday.mp3',
    '/music/Tempo - Time.mp3',
    '/music/Tempo - Tunnel(Beta1).mp3',
    '/music/Tempo - Tunnel(Beta2).mp3',
    '/music/Tempo - Tunnel.mp3',
    '/music/Tempo - Voices.mp3',
    '/music/Tempo - Void.mp3',
    '/music/Tempo - Void(Beta1).mp3',
    '/music/Tempo - Best.mp3'
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = tracks[currentTrackIndex];
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, tracks, isPlaying]);

  const handleTrackEnd = () => {
    playNext();
  };

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('播放出错:', error);
      }
    }
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prevIndex) => 
      prevIndex === 0 ? tracks.length - 1 : prevIndex - 1
    );
  };

  const playNext = () => {
    setCurrentTrackIndex((prevIndex) => 
      (prevIndex + 1) % tracks.length
    );
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('音频加载错误:', e);
    playNext();
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={playPrevious}
        className="rpg-button p-2 rounded-full bg-blue-900/50 hover:bg-blue-800/50 transition-all duration-200"
        title="上一首"
      >
        <span className="text-xl">⏮️</span>
      </button>
      <button
        onClick={togglePlay}
        className="rpg-button p-2 rounded-full bg-blue-900/50 hover:bg-blue-800/50 transition-all duration-200"
        title={isPlaying ? '暂停音乐' : '播放音乐'}
      >
        {isPlaying ? (
          <span className="text-xl">🔊</span>
        ) : (
          <span className="text-xl">🔈</span>
        )}
      </button>
      <button
        onClick={playNext}
        className="rpg-button p-2 rounded-full bg-blue-900/50 hover:bg-blue-800/50 transition-all duration-200"
        title="下一首"
      >
        <span className="text-xl">⏭️</span>
      </button>
      <span className="text-white text-sm opacity-80">
        {`${currentTrackIndex + 1}/${tracks.length}`}
      </span>
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        onError={handleError}
        loop={false}
      />
    </div>
  );
}; 