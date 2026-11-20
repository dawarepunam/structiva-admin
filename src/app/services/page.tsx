import React from 'react';
import Link from 'next/link';
import HomeHeader from '@/components/home/components/HomeHeader';
import HomeFooter from '@/components/home/components/HomeFooter';
import HomeServices from '@/components/home/components/HomeServices';
import { fetchStrapiCollection, STRAPI_BASE_URL } from '@/services/strapiClient';
import { StrapiServiceData, StrapiHomepageData } from '@/components/home/types/homeTypes';
import { Wrench, ArrowRight, Droplets, Sun, Cylinder, Factory, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Specialized Engineering Services | STRUCTIVA Enterprise OS',
  description: 'Water pipeline transmission, utility solar farms, water storage reservoirs, and heavy structural steel fabrication.'
};

async function getServicesData() {
  const [services, home] = await Promise.all([
    fetchStrapiCollection<StrapiServiceData>('services', []),
    fetch(`${STRAPI_BASE_URL}/api/homepage`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)
  ]);
  return {
    services: services || [],
    homeData: home?.data as StrapiHomepageData | undefined
  };
}

export default async function ServicesPage() {
  const { services, homeData } = await getServicesData();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#172B32', paddingTop: '80px' }}>
      <HomeHeader />

      {/* Page Hero */}
      <section style={{ background: '#172B32', color: '#FFFFFF', padding: '80px 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
            <Wrench size={16} /> Technical Business Verticals
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            Our Engineering & EPC Services
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#ECEBE5', lineHeight: '1.6', margin: 0 }}>
            Four dedicated business sectors driving national utilities, renewable energy corridors, and heavy industrial growth.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <HomeServices services={services} />

      {/* Comprehensive Sector Breakdowns */}
      <section style={{ padding: '80px 1.5rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {services.map((srv, idx) => (
            <div 
              key={srv.id} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: idx % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr', 
                gap: '3rem', 
                alignItems: 'center' 
              }}
            >
              <div style={{ order: idx % 2 === 0 ? 1 : 2 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#167C72', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Business Sector 0{srv.order}
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#172B32', margin: '0.5rem 0 1rem 0' }}>
                  {srv.title}
                </h2>
                <p style={{ fontSize: '1rem', color: '#4B5563', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  {srv.fullDescription || srv.shortDescription}
                </p>

                {srv.features && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {srv.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#172B32', fontWeight: 500 }}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link 
                  href="/contact" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#167C72', color: '#FFF', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}
                >
                  <span>Request Technical Proposal</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ order: idx % 2 === 0 ? 2 : 1, height: '360px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}>
                <img 
                  src={srv.imageUrl || '/images/project1.jpg'} 
                  alt={srv.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomeFooter data={homeData} />
    </div>
  );
}
