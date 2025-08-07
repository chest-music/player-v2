export interface Track {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrackIndex: number;
}