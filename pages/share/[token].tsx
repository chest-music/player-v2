import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PlayerBar from '@/components/PlayerBar';
import { Track } from '@/types';
import { fetchTrack, getMockTrack } from '@/utils/fetchTrack';

interface SharePageProps {
  initialTracks?: Track[];
  error?: string;
  token: string;
}

const SharePage: React.FC<SharePageProps> = ({ initialTracks, error, token }) => {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>(initialTracks || []);
  const [loading, setLoading] = useState(!initialTracks && !error);
  const [fetchError, setFetchError] = useState<string | null>(error || null);

  useEffect(() => {
    if (!initialTracks && !error && token) {
      const loadTracks = async () => {
        try {
          setLoading(true);
          const result = await fetchTrack(token);
          
          if (result.success && result.tracks) {
            setTracks(result.tracks);
          } else {
            setFetchError(result.error || 'Failed to load track');
            // Fallback to mock data for development
            if (process.env.NODE_ENV === 'development') {
              setTracks(getMockTrack());
              setFetchError(null);
            }
          }
        } catch (err) {
          setFetchError('Failed to load track');
          // Fallback to mock data for development
          if (process.env.NODE_ENV === 'development') {
            setTracks(getMockTrack());
            setFetchError(null);
          }
        } finally {
          setLoading(false);
        }
      };

      loadTracks();
    }
  }, [token, initialTracks, error]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        Loading track...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1>Track not found</h1>
        <p>{fetchError}</p>
        <button 
          onClick={() => router.push('/')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#1db954',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        No tracks available
      </div>
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
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${currentTrack.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Background blur effect */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(20px)',
          zIndex: -1
        }} />
        
        {/* Main content area - minimalist for now */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 1
        }}>
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            style={{
              width: '300px',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
          />
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{currentTrack.title}</h1>
          <p style={{ margin: '0', fontSize: '18px', opacity: 0.8 }}>{currentTrack.artist}</p>
        </div>

        {/* Player Bar - Fixed at bottom */}
        <PlayerBar tracks={tracks} />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.params!;
  
  if (typeof token !== 'string') {
    return {
      notFound: true,
    };
  }

  // TODO: Implement server-side track fetching for better SEO
  // For now, we'll handle it client-side
  return {
    props: {
      token,
    },
  };
};

export default SharePage;