import { Track } from '@/types';

// TODO: Replace with actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface FetchTrackResponse {
  success: boolean;
  track?: Track;
  tracks?: Track[];
  error?: string;
}

export const fetchTrack = async (token: string): Promise<FetchTrackResponse> => {
  try {
    // TODO: Implement actual API call to backend
    const response = await fetch(`${API_BASE_URL}/api/share/${token}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // TODO: Validate response structure according to backend API
    if (data.track) {
      return {
        success: true,
        track: data.track,
        tracks: data.tracks || [data.track], // Support single track or playlist
      };
    }
    
    return {
      success: false,
      error: 'No track data found',
    };
  } catch (error) {
    console.error('Error fetching track:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Mock data for development/testing
export const getMockTrack = (): Track[] => [
  {
    title: 'Sample Track',
    artist: 'Test Artist',
    cover: 'https://via.placeholder.com/300x300/333/fff?text=Album',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // TODO: Replace with actual audio URL
  },
];