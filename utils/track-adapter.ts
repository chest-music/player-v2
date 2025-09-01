import { Track, ChestTrack } from '@/types';

/**
 * Convert ChestTrack to legacy Track format for PlayerBar compatibility
 */
export function chestTrackToTrack(chestTrack: ChestTrack): Track {
  return {
    title: chestTrack.name,
    artist: chestTrack.authors?.join(', ') || 'Unknown Artist',
    cover: chestTrack.cover || 'https://cdn.chestmusic.com/cover-default.jpg',
    url: chestTrack.audio || '',
  };
}

/**
 * Convert array of ChestTracks to legacy Track format
 */
export function chestTracksToTracks(chestTracks: ChestTrack[]): Track[] {
  return chestTracks.map(chestTrackToTrack);
}