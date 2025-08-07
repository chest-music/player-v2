import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Player v2</title>
        <meta name="description" content="Minimalist music player component" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎵</h1>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Player v2</h2>
        <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '30px' }}>
          Minimalist music player component
        </p>
        <p style={{ fontSize: '14px', opacity: 0.6 }}>
          Access shared tracks via <code>/share/[token]</code>
        </p>
      </div>
    </>
  );
}