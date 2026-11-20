import React from 'react';
import Link from 'next/link';
import HomeHeader from '@/components/home/components/HomeHeader';
import HomeFooter from '@/components/home/components/HomeFooter';
import HomeAbout from '@/components/home/components/HomeAbout';
import HomeCertifications from '@/components/home/components/HomeCertifications';
import { fetchStrapiCollection, STRAPI_BASE_URL } from '@/services/strapiClient';
import { StrapiHomepageData } from '@/components/home/types/homeTypes';
import { ShieldCheck, ArrowRight, Award, Compass, Users2, Building } from 'lucide-react';

export const metadata = {
  title: 'About STRUCTIVA — Built on Rigor & Integrity | EPC Infrastructure',
  description: 'Learn about STRUCTIVA engineering heritage, core leadership, ISO benchmarks, and national infrastructure capabilities.'
};

async function getAboutData() {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/homepage`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return json?.data as StrapiHomepageData;
    }
  } catch {}
  return undefined;
}

export default async function AboutPage() {
  const data = await getAboutData();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#172B32', paddingTop: '80px' }}>
      <HomeHeader />

      {/* Page Hero */}
      <section style={{ background: '#172B32', color: '#FFFFFF', padding: '80px 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
            <Compass size={16} /> Corporate Profile & Heritage
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            About STRUCTIVA Infrastructure
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#ECEBE5', lineHeight: '1.6', margin: 0 }}>
            Pioneering heavy civil works, bulk water pipelines, solar utility farms, and heavy structural fabrication through uncompromised engineering integrity.
          </p>
        </div>
      </section>

      {/* Editorial Content */}
      <HomeAbout data={data} />

      {/* Corporate Benchmarks */}
      <section style={{ padding: 'clamp(50px, 6vw, 80px) 1.5rem', background: '#F8F9FA' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <Award size={32} color="#167C72" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Quality As A Backbone</h3>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
              Zero deviation from structural design codes. Every weld, pour, and joint undergoes accredited third-party non-destructive testing before certification.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <Users2 size={32} color="#D97706" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Trade Craft & Talent</h3>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
              Over 1,200 site technicians, supervisors, and graduate engineers working in harmonious collaboration across Maharashtra, Gujarat, and South India.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <Building size={32} color="#2563EB" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Asset Independence</h3>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
              We own and deploy 85+ heavy equipment assets, ensuring project timelines never stall waiting on third-party machinery availability.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <HomeCertifications />

      <HomeFooter data={data} />
    </div>
  );
}
