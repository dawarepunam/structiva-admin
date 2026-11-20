import React, { Suspense } from 'react';
import Link from 'next/link';
import HomeHeader from '@/components/home/components/HomeHeader';
import HomeFooter from '@/components/home/components/HomeFooter';
import HomeContact from '@/components/home/components/HomeContact';
import { STRAPI_BASE_URL } from '@/services/strapiClient';
import { StrapiHomepageData } from '@/components/home/types/homeTypes';
import { MessageSquare, Phone, Mail, MapPin, Clock, Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Contact STRUCTIVA — Commercial & Tendering Offices',
  description: 'Reach out to STRUCTIVA commercial engineering and tendering offices for project inquiries, tenders, and joint ventures.'
};

async function getContactPageData() {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/homepage`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return json?.data as StrapiHomepageData;
    }
  } catch {}
  return undefined;
}

export default async function ContactPage() {
  const homeData = await getContactPageData();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#172B32', paddingTop: '80px' }}>
      <HomeHeader />

      {/* Hero Header */}
      <section style={{ background: '#172B32', color: '#FFFFFF', padding: '80px 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
            <MessageSquare size={16} /> Commercial & Tendering Desk
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            Get in Touch with Our Engineers
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#ECEBE5', lineHeight: '1.6', margin: 0 }}>
            Submit your infrastructure project scope for formal estimating, pre-qualification, and Joint Venture tendering.
          </p>
        </div>
      </section>

      {/* Contact & Inquiry Section wrapped in Suspense for search params */}
      <Suspense fallback={
        <div style={{ padding: '80px 1.5rem', textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: '#167C72' }} />
        </div>
      }>
        <HomeContact data={homeData} />
      </Suspense>

      <HomeFooter data={homeData} />
    </div>
  );
}
