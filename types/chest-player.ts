// Types extracted from Chest Player MF for integration
export interface ChestTrack {
  id: string;
  name: string;
  authors?: string[];
  cover?: string;
  audio?: string;
  type?: string;
  plays?: number;
  play_limit?: number;
  token?: string; // Para tracks compartidos
  isPlaying?: boolean;
}

export interface TrackSource {
  url: string;
  cover_url: string;
  name: string;
  authors?: string[];
  type?: string;
  id: string;
  plays?: number;
  play_limit?: number;
}

export interface SharedTrackData {
  id: string;
  token: string;
  play_limit: number;
  plays: number;
}

export interface PlayLimitState {
  playCount: number;
  playLimit: number | null;
  isLimitReached: boolean;
  hasDecremented: boolean;
}

// API types
export interface GetTrackSourceRequest {
  id: string;
  session?: string;
}

export interface GetTrackSourceResponse {
  url: string;
}

export interface UpdateTrackPlayRequest {
  id: string;
  anonymous?: boolean;
  token?: string;
}

export interface UpdateTrackPlayResponse {
  success: boolean;
  plays?: number;
}

// SEO and meta tags
export interface TrackMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}