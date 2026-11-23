'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePageCoordinator from '@/components/home/HomePage';

export default function Home() {
  const router = useRouter();
  const [isAdminHost, setIsAdminHost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase();
      // If deployed as structiva-admin.vercel.app or env flag is set, redirect directly to /admin
      if (
        hostname.includes('admin') ||
        process.env.NEXT_PUBLIC_APP_PORTAL === 'admin'
      ) {
        setIsAdminHost(true);
        router.replace('/admin');
      }
    }
  }, [router]);

  if (isAdminHost) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1512',
        color: '#f0fdf4',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #14532d',
            borderTopColor: '#22c55e',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '15px', color: '#86efac' }}>Redirecting to Structiva Admin Portal...</p>
        </div>
      </div>
    );
  }

  return <HomePageCoordinator />;
}

