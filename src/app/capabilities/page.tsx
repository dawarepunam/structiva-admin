import React from 'react';
import Link from 'next/link';
import HomeHeader from '@/components/home/components/HomeHeader';
import HomeFooter from '@/components/home/components/HomeFooter';
import HomeCapabilities from '@/components/home/components/HomeCapabilities';
import HomeProcess from '@/components/home/components/HomeProcess';
import HomeCertifications from '@/components/home/components/HomeCertifications';
import { fetchStrapiCollection, STRAPI_BASE_URL } from '@/services/strapiClient';
import { StrapiHomepageData } from '@/components/home/types/homeTypes';
import { Cpu, ArrowRight, ShieldCheck, Truck, Users2, Compass } from 'lucide-react';

export const metadata = {
  title: 'Engineering & Industrial Capabilities | STRUCTIVA',
  description: 'Enterprise technical capabilities, 85+ plant machinery fleet, 1,200+ muster tradespeople, and 5-stage ISO execution cycle.'
};

async function getCapabilitiesPageData() {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/homepage`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return json?.data as StrapiHomepageData;
    }
  } catch {}
  return undefined;
}

export default async function CapabilitiesPage() {
  const homeData = await getCapabilitiesPageData();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#172B32', paddingTop: '80px' }}>
      <HomeHeader />

      {/* Hero Header */}
      <section style={{ background: '#172B32', color: '#FFFFFF', padding: '80px 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
            <Cpu size={16} /> Technical Infrastructure Ecosystem
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            Enterprise Capabilities & Execution Plant
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#ECEBE5', lineHeight: '1.6', margin: 0 }}>
            Unified engineering design, modern heavy equipment fleets, certified tradesmanship, and rigorous quality governance.
          </p>
        </div>
      </section>

      {/* Core Capabilities */}
      <HomeCapabilities />

      {/* 5-Stage Disciplined Delivery Cycle */}
      <HomeProcess />

      {/* Heavy Machinery Fleet Deep Dive */}
      <section style={{ padding: 'clamp(50px, 6vw, 80px) 1.5rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#167C72', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Heavy Plant Logistics
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>
              Self-Owned Modern Plant & Machinery Fleets
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4B5563', lineHeight: '1.6' }}>
              With zero reliance on third-party leasing intermediaries, STRUCTIVA mobilizes heavy crawler cranes, automated trenchers, slip-form gantries, and asphalt pavers directly from regional yard depots.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#F8F9FA', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src="/images/crane_real.jpg" alt="Crawler Crane" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#172B32' }}>150T Hydraulic Cranes</h4>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Heavy girder erection, plate handling, and pipe stringing.</p>
              </div>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src="/images/jcb_real.jpg" alt="Excavator" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#172B32' }}>Heavy Excavators (30T)</h4>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Deep earth trenching, bulk muck shifting, and rock breaking.</p>
              </div>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src="/images/water_tanker.jpg" alt="Transit Mixers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#172B32' }}>Transit Mixers & Pumps</h4>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Continuous high-grade concrete pouring and GFS foundations.</p>
              </div>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src="/images/tipper_real.jpg" alt="Tipper Dumpers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#172B32' }}>Heavy Tippers & Haulers</h4>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Bulk aggregate mobilization and heavy pipe logistics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <HomeCertifications />

      <HomeFooter data={homeData} />
    </div>
  );
}
