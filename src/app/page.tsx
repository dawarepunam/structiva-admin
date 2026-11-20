import React from 'react';
import HomePageCoordinator from '@/components/home/HomePage';

export const metadata = {
  title: 'STRUCTIVA — Engineering with Precision. Execution with Responsibility.',
  description: 'Premier infrastructure and heavy construction EPC contractor specializing in water pipeline transmission, utility solar farms, water storage reservoirs, and heavy fabrication.',
  openGraph: {
    title: 'STRUCTIVA — Heavy Infrastructure & EPC Contractor',
    description: 'Disciplined turnkey infrastructure delivery across Water, Solar, and Heavy Industrial Fabrication.',
    url: 'https://structiva.internal',
    siteName: 'STRUCTIVA',
    images: [
      {
        url: '/images/commercial_tower.jpg',
        width: 1200,
        height: 630,
        alt: 'STRUCTIVA Infrastructure Engineering'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  }
};

export default function Home() {
  return <HomePageCoordinator />;
}
