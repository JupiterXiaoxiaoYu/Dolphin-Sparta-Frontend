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
    '/music/Tempo - 熊伽霖.mp3'
]);


  useEffect(() => {
    // 预加载音频
    if (audioRef.current) {
      audioRef.current.src = tracks[currentTrackIndex];
      audioRef.current.load();
    }
  }, [currentTrackIndex, tracks]);

  // 处理音乐播放结束
  const handleTrackEnd = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  // 切换播放状态
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

  // 处理音频错误
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('音频加载错误:', e);
    // 尝试播放下一首
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
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
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        onError={handleError}
        loop={false}
      />
    </div>
  );
}; 