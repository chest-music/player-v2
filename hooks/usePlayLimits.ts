import { useState, useEffect, useCallback } from 'react';
import { ChestTrack, PlayLimitState } from '../types';
import { apiClient } from '../lib/api-client';

interface UsePlayLimitsProps {
  track: ChestTrack | null;
  isSharedLink: boolean;
}

interface UsePlayLimitsReturn extends PlayLimitState {
  canPlay: boolean;
  decrementPlayCount: () => Promise<void>;
  checkPlayLimit: () => boolean;
}

export function usePlayLimits({ track, isSharedLink }: UsePlayLimitsProps): UsePlayLimitsReturn {
  const [playCount, setPlayCount] = useState(0);
  const [playLimit, setPlayLimit] = useState<number | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [hasDecremented, setHasDecremented] = useState(false);

  // Initialize play limits when track changes
  useEffect(() => {
    if (!track || !isSharedLink) {
      setPlayCount(0);
      setPlayLimit(null);
      setIsLimitReached(false);
      setHasDecremented(false);
      return;
    }

    // Set initial values from track
    setPlayCount(track.plays || 0);
    setPlayLimit(track.play_limit || null);
    setHasDecremented(false);

    // Check if limit is already reached
    if (track.play_limit && (track.plays || 0) >= track.play_limit) {
      setIsLimitReached(true);
    }
  }, [track?.id, track?.token, isSharedLink]);

  const canPlay = !isSharedLink || !isLimitReached;

  const checkPlayLimit = useCallback((): boolean => {
    if (!isSharedLink || !playLimit) return true;
    
    if (playCount >= playLimit) {
      setIsLimitReached(true);
      return false;
    }
    
    return true;
  }, [isSharedLink, playLimit, playCount]);

  const decrementPlayCount = useCallback(async (): Promise<void> => {
    if (!track || !isSharedLink || isLimitReached || hasDecremented) {
      return;
    }

    try {
      const result = await apiClient.updateTrackPlay({
        id: track.id,
        anonymous: true,
        token: track.token,
      });

      if (result.success) {
        const newPlayCount = playCount + 1;
        setPlayCount(newPlayCount);
        setHasDecremented(true);

        // Check if limit is reached after increment
        if (playLimit && newPlayCount >= playLimit) {
          setIsLimitReached(true);
        }
      }
    } catch (error) {
      console.error('Failed to update play count:', error);
      // Silently handle error - don't block playback
    }
  }, [track, isSharedLink, isLimitReached, hasDecremented, playCount, playLimit]);

  return {
    playCount,
    playLimit,
    isLimitReached,
    hasDecremented,
    canPlay,
    decrementPlayCount,
    checkPlayLimit,
  };
}