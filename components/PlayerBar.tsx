/**
 * Enhanced PlayerBar Component
 * 
 * A modern, glassmorphism-styled music player with Apple Music/Spotify-inspired design.
 * 
 * Features:
 * - Play/pause with smooth animations and visual feedback
 * - Progress bar with scrubbing support and time display
 * - Volume control with floating glassmorphism slider
 * - Loop and shuffle functionality
 * - Playing indicator with animated waves
 * - Full keyboard accessibility (Space, Arrow keys, M, L, S)
 * - Responsive design for mobile and desktop
 * - Smart track navigation (restart vs previous)
 * - Glassmorphism UI with backdrop blur effects
 * 
 * @param tracks - Array of track objects to play
 * @param onTrackChange - Optional callback when track changes
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track, PlayerState } from '@/types';
import styles from '@/styles/player.module.css';

interface PlayerBarProps {
  tracks: Track[];
  onTrackChange?: (trackIndex: number) => void;
  variant?: 'full' | 'minimal'; // full = all controls, minimal = share page version
}

const PlayerBar: React.FC<PlayerBarProps> = ({ tracks, onTrackChange, variant = 'full' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentTrackIndex: 0,
    volume: 1,
    isMuted: false,
    isLooping: false,
    isShuffled: false,
    showVolumeSlider: false,
  });

  const currentTrack = tracks[playerState.currentTrackIndex];

  // Format time helper
  const formatTime = useCallback((time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Audio setup and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging) {
        setPlayerState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
          duration: audio.duration || 0,
        }));
      }
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      if (playerState.isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging, playerState.isLooping]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = playerState.isMuted ? 0 : playerState.volume;
  }, [playerState.volume, playerState.isMuted]);

  // Track change effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.load(); // Reload new track
    if (playerState.isPlaying) {
      audio.play().catch(console.error);
    }
  }, [playerState.currentTrackIndex, playerState.isPlaying]);

  // Enhanced play/pause with animation feedback
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.isPlaying) {
      audio.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audio.play().then(() => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      }).catch(console.error);
    }
  };

  // Smart track navigation
  const skipForward = () => {
    let newIndex = playerState.currentTrackIndex;
    
    if (playerState.isShuffled) {
      // Random track selection
      do {
        newIndex = Math.floor(Math.random() * tracks.length);
      } while (newIndex === playerState.currentTrackIndex && tracks.length > 1);
    } else {
      newIndex = playerState.currentTrackIndex < tracks.length - 1 ? playerState.currentTrackIndex + 1 : 0;
    }
    
    setPlayerState(prev => ({ ...prev, currentTrackIndex: newIndex }));
    onTrackChange?.(newIndex);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If more than 3 seconds played, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setPlayerState(prev => ({ ...prev, currentTime: 0 }));
      return;
    }

    let newIndex = playerState.currentTrackIndex;
    
    if (playerState.isShuffled) {
      // Random track selection
      do {
        newIndex = Math.floor(Math.random() * tracks.length);
      } while (newIndex === playerState.currentTrackIndex && tracks.length > 1);
    } else {
      newIndex = playerState.currentTrackIndex > 0 ? playerState.currentTrackIndex - 1 : tracks.length - 1;
    }
    
    setPlayerState(prev => ({ ...prev, currentTrackIndex: newIndex }));
    onTrackChange?.(newIndex);
  };

  // Enhanced progress handling with scrubbing
  const handleProgressInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * playerState.duration;
    
    audio.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  }, [playerState.duration]);

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressInteraction(e);
  };

  // Volume controls
  const toggleMute = () => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleVolumeSlider = () => {
    setPlayerState(prev => ({ ...prev, showVolumeSlider: !prev.showVolumeSlider }));
  };

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const volumeBar = volumeRef.current;
    if (!volumeBar) return;

    const rect = volumeBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    
    setPlayerState(prev => ({ 
      ...prev, 
      volume: newVolume,
      isMuted: newVolume === 0
    }));
  }, []);

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsVolumeDragging(true);
    handleVolumeChange(e);
  };

  // Toggle controls
  const toggleLoop = () => {
    setPlayerState(prev => ({ ...prev, isLooping: !prev.isLooping }));
  };

  const toggleShuffle = () => {
    setPlayerState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  };

  // Global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleProgressInteraction(e);
      }
      if (isVolumeDragging) {
        handleVolumeChange(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsVolumeDragging(false);
    };

    if (isDragging || isVolumeDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isVolumeDragging, handleProgressInteraction, handleVolumeChange]);

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (playerState.showVolumeSlider && volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setPlayerState(prev => ({ ...prev, showVolumeSlider: false }));
      }
    };

    if (playerState.showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [playerState.showVolumeSlider]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept when typing in inputs
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setPlayerState(prev => ({ 
            ...prev, 
            volume: Math.min(1, prev.volume + 0.1),
            isMuted: false
          }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPlayerState(prev => ({ 
            ...prev, 
            volume: Math.max(0, prev.volume - 0.1),
            isMuted: prev.volume - 0.1 <= 0
          }));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
          e.preventDefault();
          toggleLoop();
          break;
        case 's':
          e.preventDefault();
          toggleShuffle();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, skipBackward, skipForward, toggleMute, toggleLoop, toggleShuffle]);

  if (!currentTrack) return null;

  if (variant === 'minimal') {
    return (
      <div className={`${styles.playerBar} ${styles.minimal}`}>
        <audio
          ref={audioRef}
          src={currentTrack.url}
          loop={playerState.isLooping}
          preload="metadata"
        />
        
        <div className={styles.minimalContainer}>
          {/* Single Row: Play + Progress + Volume */}
          <div className={styles.minimalControlsRow}>
            <button
              onClick={togglePlayPause}
              className={`${styles.minimalPlayBtn} ${playerState.isPlaying ? styles.playing : ''}`}
              aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
              title={playerState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              <div className={styles.playBtnIcon}>
                {playerState.isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
            </button>

            {/* Inline Progress Section */}
            <div className={styles.inlineProgressSection}>
              <span className={styles.inlineTimeText}>
                {formatTime(playerState.currentTime)}
              </span>
              
              <div 
                ref={progressRef}
                className={`${styles.inlineProgressBar} ${isDragging ? styles.dragging : ''}`}
                onMouseDown={handleProgressMouseDown}
              >
                <div 
                  className={styles.progressTrack}
                  style={{
                    width: `${(playerState.currentTime / playerState.duration) * 100 || 0}%`
                  }}
                />
                <div 
                  className={styles.progressThumb}
                  style={{
                    left: `${(playerState.currentTime / playerState.duration) * 100 || 0}%`
                  }}
                />
              </div>

              <span className={styles.inlineTimeText}>
                {formatTime(playerState.duration)}
              </span>
            </div>

            {/* Volume Section */}
            <div className={styles.minimalVolumeSection} ref={volumeRef}>
              <button
                onClick={toggleVolumeSlider}
                className={styles.minimalVolumeBtn}
                aria-label={`Volume ${Math.round(playerState.volume * 100)}%`}
                title="Volume (M to mute)"
              >
                {playerState.isMuted || playerState.volume === 0 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : playerState.volume < 0.5 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              {/* Volume Slider */}
              {playerState.showVolumeSlider && (
                <div className={styles.volumeSlider}>
                  <div 
                    className={styles.volumeBar}
                    onMouseDown={handleVolumeMouseDown}
                  >
                    <div 
                      className={styles.volumeFill}
                      style={{ width: `${playerState.isMuted ? 0 : playerState.volume * 100}%` }}
                    />
                    <div 
                      className={styles.volumeThumb}
                      style={{ left: `${playerState.isMuted ? 0 : playerState.volume * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full player version
  return (
    <div className={styles.playerBar}>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop={playerState.isLooping}
        preload="metadata"
      />
      
      <div className={styles.playerContainer}>
        {/* Track Info Section */}
        <div className={styles.trackSection}>
          <div className={styles.albumCoverContainer}>
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.title}
              className={`${styles.albumCover} ${playerState.isPlaying ? styles.playing : ''}`}
            />
            {playerState.isPlaying && (
              <div className={styles.playingIndicator}>
                <div className={styles.playingWave}></div>
                <div className={styles.playingWave}></div>
                <div className={styles.playingWave}></div>
              </div>
            )}
          </div>
          <div className={styles.trackInfo}>
            <div className={styles.trackTitle}>{currentTrack.title}</div>
            <div className={styles.trackArtist}>{currentTrack.artist}</div>
          </div>
        </div>

        {/* Progress Section - Compact */}
        <div className={styles.progressSection}>
          <span className={styles.timeText}>
            {formatTime(playerState.currentTime)}
          </span>
          
          <div 
            ref={progressRef}
            className={`${styles.progressBar} ${isDragging ? styles.dragging : ''}`}
            onMouseDown={handleProgressMouseDown}
          >
            <div 
              className={styles.progressTrack}
              style={{
                width: `${(playerState.currentTime / playerState.duration) * 100 || 0}%`
              }}
            />
            <div 
              className={styles.progressThumb}
              style={{
                left: `${(playerState.currentTime / playerState.duration) * 100 || 0}%`
              }}
            />
          </div>

          <span className={styles.timeText}>
            {formatTime(playerState.duration)}
          </span>
        </div>

        {/* Controls + Volume Section */}
        <div className={styles.controlsRow}>
          <div className={styles.controlsSection}>
            {/* Secondary Controls */}
            <button
              onClick={toggleShuffle}
              className={`${styles.secondaryBtn} ${playerState.isShuffled ? styles.active : ''}`}
              aria-label={playerState.isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
              title="Shuffle (S)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
            </button>

            {/* Main Controls */}
            <button
              onClick={skipBackward}
              className={styles.controlBtn}
              aria-label="Previous track or restart"
              title="Previous (←)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button
              onClick={togglePlayPause}
              className={`${styles.playBtn} ${playerState.isPlaying ? styles.playing : ''}`}
              aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
              title={playerState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              <div className={styles.playBtnIcon}>
                {playerState.isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
            </button>
            
            <button
              onClick={skipForward}
              className={styles.controlBtn}
              aria-label="Next track"
              title="Next (→)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z"/>
              </svg>
            </button>

            <button
              onClick={toggleLoop}
              className={`${styles.secondaryBtn} ${playerState.isLooping ? styles.active : ''}`}
              aria-label={playerState.isLooping ? 'Disable loop' : 'Enable loop'}
              title="Loop (L)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            </button>
          </div>

          {/* Volume Section */}
          <div className={styles.volumeSection} ref={volumeRef}>
            <button
              onClick={toggleVolumeSlider}
              className={styles.volumeBtn}
              aria-label={`Volume ${Math.round(playerState.volume * 100)}%`}
              title="Volume (M to mute)"
            >
              {playerState.isMuted || playerState.volume === 0 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : playerState.volume < 0.5 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            {playerState.showVolumeSlider && (
              <div className={styles.volumeSlider}>
                <div 
                  className={styles.volumeBar}
                  onMouseDown={handleVolumeMouseDown}
                >
                  <div 
                    className={styles.volumeFill}
                    style={{ width: `${playerState.isMuted ? 0 : playerState.volume * 100}%` }}
                  />
                  <div 
                    className={styles.volumeThumb}
                    style={{ left: `${playerState.isMuted ? 0 : playerState.volume * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;