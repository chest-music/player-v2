import {
  ChestTrack,
  GetTrackSourceRequest,
  GetTrackSourceResponse,
  UpdateTrackPlayRequest,
  UpdateTrackPlayResponse,
  TrackMeta
} from '../types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chestmusic.com';

class ChestAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get track source/audio URL
   */
  async getTrackSource({ id, session }: GetTrackSourceRequest): Promise<GetTrackSourceResponse> {
    const url = `${this.baseUrl}/tracks/${id}/source`;
    const params = session ? `?session=${session}` : '';
    
    const response = await fetch(`${url}${params}`);
    if (!response.ok) {
      throw new Error(`Failed to get track source: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Get track metadata by ID (for non-shared tracks)
   */
  async getTrack(id: string): Promise<ChestTrack> {
    const response = await fetch(`${this.baseUrl}/tracks/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to get track: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Get shared track by token
   */
  async getSharedTrack(token: string): Promise<ChestTrack> {
    const response = await fetch(`${this.baseUrl}/share/${token}`);
    if (!response.ok) {
      throw new Error(`Failed to get shared track: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Update track play count
   */
  async updateTrackPlay({ id, anonymous = true, token }: UpdateTrackPlayRequest): Promise<UpdateTrackPlayResponse> {
    const url = `${this.baseUrl}/tracks/${id}/play`;
    const body: any = { anonymous };
    
    if (token) {
      body.token = token;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update play count: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate meta tags for SEO from track data
   */
  generateTrackMeta(track: ChestTrack): TrackMeta {
    const title = `${track.name} - ${track.authors?.join(', ') || 'Unknown Artist'}`;
    const description = `Listen to ${track.name} by ${track.authors?.join(', ') || 'Unknown Artist'} on Chest Music`;
    
    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogImage: track.cover || 'https://cdn.chestmusic.com/cover-default.jpg',
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: track.cover || 'https://cdn.chestmusic.com/cover-default.jpg',
    };
  }
}

// Export singleton instance
export const apiClient = new ChestAPIClient();
export default ChestAPIClient;