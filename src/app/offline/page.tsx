'use client';

export default function OfflinePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        fontFamily: 'var(--font-geist-sans, Arial, sans-serif)',
      }}
    >
      <div style={{ fontSize: '4rem' }}>🎣</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>You're Offline</h1>
      <p style={{ color: '#888', margin: 0, maxWidth: 300 }}>
        Looks like you've lost your connection. Check your internet and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: '10px 24px',
          backgroundColor: '#228be6',
          color: 'white',
          border: 'none',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
