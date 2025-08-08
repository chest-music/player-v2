import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PlayerBar from '@/components/PlayerBar';
import { Track } from '@/types';

interface SharePageProps {
  tracks?: Track[];
  error?: string;
  token: string;
}

const SharePage: React.FC<SharePageProps> = ({ tracks, error, token }) => {
  // Error state - elegant and simple
  if (error) {
    return (
      <>
        <Head>
          <title>Track Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'rgba(30, 30, 30, 0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.8
            }}>
              🎵
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}>
              Track not found
            </h1>
            <p style={{
              fontSize: '16px',
              opacity: 0.7,
              marginBottom: '24px',
              lineHeight: 1.4
            }}>
              {error}
            </p>
            <Link 
              href="/"
              style={{
                display: 'inline-block',
                background: 'white',
                color: 'black',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'transform 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Go Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  // No tracks state
  if (!tracks || !tracks.length) {
    return (
      <>
        <Head>
          <title>No Tracks Available</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', opacity: 0.7 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <p style={{ fontSize: '18px' }}>No tracks available</p>
          </div>
        </div>
      </>
    );
  }

  const currentTrack = tracks[0]; // For meta tags

  return (
    <>
      <Head>
        <title>{currentTrack.title} - {currentTrack.artist}</title>
        <meta name="description" content={`Listen to ${currentTrack.title} by ${currentTrack.artist}`} />
        <meta property="og:title" content={`${currentTrack.title} - ${currentTrack.artist}`} />
        <meta property="og:description" content={`Listen to ${currentTrack.title} by ${currentTrack.artist}`} />
        <meta property="og:image" content={currentTrack.cover} />
        <meta property="og:type" content="music.song" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${currentTrack.title} - ${currentTrack.artist}`} />
        <meta name="twitter:description" content={`Listen to ${currentTrack.title} by ${currentTrack.artist}`} />
        <meta name="twitter:image" content={currentTrack.cover} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${currentTrack.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Background blur overlay */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(24px)',
          zIndex: -1
        }} />
        
        {/* Main content - minimalist album display */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 1,
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '400px'
          }}>
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.title}
              style={{
                width: '280px',
                height: '280px',
                objectFit: 'cover',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
              }}
            />
            <h1 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '28px', 
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {currentTrack.title}
            </h1>
            <p style={{ 
              margin: '0', 
              fontSize: '20px', 
              fontWeight: 500,
              opacity: 0.8,
              letterSpacing: '-0.01em'
            }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Player Bar - Fixed at bottom */}
        <PlayerBar tracks={tracks} variant="minimal" />
      </div>
    </>
  );
};

// Simulate API fetch function for server-side rendering
async function fetchTrackFromAPI(token: string): Promise<{ tracks?: Track[]; error?: string }> {
  try {
    // TODO: Replace with actual API call to /api/tracks/${token}
    // For now, simulate different responses based on token
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (token === 'demo') {
      // Mock successful response
      return {
        tracks: [
          {
            title: 'Ocean Waves',
            artist: 'Nature Sounds',
            cover: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop',
            url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
          }
        ]
      };
    }
    
    if (token === 'test') {
      // Mock another successful response
      return {
        tracks: [
          {
            title: 'Midnight Jazz',
            artist: 'Cool Vibes',
            cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
          }
        ]
      };
    }
    
    // Simulate invalid token
    return {
      error: 'Track not found or has expired'
    };
    
    /* 
    // Real implementation would look like this:
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/tracks/${token}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Track not found' };
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { tracks: data.tracks || [data.track] };
    */
    
  } catch (error) {
    console.error('Error fetching track:', error);
    return {
      error: 'Failed to load track. Please try again later.'
    };
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.params!;
  
  if (typeof token !== 'string') {
    return {
      notFound: true,
    };
  }

  // Fetch track data server-side for better SEO and performance
  const result = await fetchTrackFromAPI(token);
  
  if (result.error) {
    return {
      props: {
        token,
        error: result.error,
      },
    };
  }
  
  if (!result.tracks || result.tracks.length === 0) {
    return {
      props: {
        token,
        error: 'No tracks found',
      },
    };
  }

  return {
    props: {
      token,
      tracks: result.tracks,
    },
  };
};

export default SharePage;