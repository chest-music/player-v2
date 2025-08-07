import React, { useState, useRef, useEffect } from 'react';
import { Track, PlayerState } from '@/types';
import styles from '@/styles/player.module.css';

interface PlayerBarProps {
  tracks: Track[];
}

const PlayerBar: React.FC<PlayerBarProps> = ({ tracks }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentTrackIndex: 0,
  });

  const currentTrack = tracks[playerState.currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const skipForward = () => {
    if (playerState.currentTrackIndex < tracks.length - 1) {
      setPlayerState(prev => ({ 
        ...prev, 
        currentTrackIndex: prev.currentTrackIndex + 1,
        isPlaying: false 
      }));
    }
  };

  const skipBackward = () => {
    if (playerState.currentTrackIndex > 0) {
      setPlayerState(prev => ({ 
        ...prev, 
        currentTrackIndex: prev.currentTrackIndex - 1,
        isPlaying: false 
      }));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.offsetLeft;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * playerState.duration;
    
    audio.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className={styles.playerBar}>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={() => setPlayerState(prev => ({ ...prev, isPlaying: false }))}
      />
      
      <div className={styles.playerContent}>
        {/* Track Info */}
        <div className={styles.trackInfo}>
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            className={styles.albumCover}
          />
          <div className={styles.trackText}>
            <div className={styles.trackTitle}>{currentTrack.title}</div>
            <div className={styles.trackArtist}>{currentTrack.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            onClick={skipBackward}
            disabled={playerState.currentTrackIndex === 0}
            className={styles.controlButton}
            aria-label="Previous track"
          >
            {/* TODO: Add backward icon component */}
            ⏮
          </button>
          
          <button
            onClick={togglePlayPause}
            className={`${styles.controlButton} ${styles.playPauseButton}`}
            aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
          >
            {/* TODO: Add play/pause icon components */}
            {playerState.isPlaying ? '⏸' : '▶️'}
          </button>
          
          <button
            onClick={skipForward}
            disabled={playerState.currentTrackIndex === tracks.length - 1}
            className={styles.controlButton}
            aria-label="Next track"
          >
            {/* TODO: Add forward icon component */}
            ⏭
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <span className={styles.timeText}>
            {formatTime(playerState.currentTime)}
          </span>
          <div 
            className={styles.progressBar}
            onClick={handleProgressClick}
          >
            <div 
              className={styles.progressFill}
              style={{
                width: `${(playerState.currentTime / playerState.duration) * 100 || 0}%`
              }}
            />
          </div>
          <span className={styles.timeText}>
            {formatTime(playerState.duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;