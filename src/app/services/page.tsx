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

const defaultServicesList: StrapiServiceData[] = [
  {
    id: 1,
    title: 'Water Pipeline Infrastructure',
    slug: 'water-pipeline-infrastructure',
    shortDescription: 'Large-diameter cross-country bulk water transmission, MS welded pipes, and trenchless HDD boring under highways and rivers.',
    fullDescription: 'Comprehensive EPC execution of large-scale cross-country bulk water pipeline networks. From raw water intake pumphouses to intermediate booster stations and city distribution feeder mains. Equipped with automatic internal/external joint welding stations, automated hydro-testing rigs, and sacrificial anode cathodic corrosion protection.',
    order: 1,
    imageUrl: '/images/pipeline_trench.jpg',
    features: ['1400mm MS Pipeline Laying', 'Micro-tunneling & HDD Crossings', 'Cathodic Corrosion Protection', 'Automated Hydrostatic Testing up to 45 Bar']
  },
  {
    id: 2,
    title: 'Solar Infrastructure & Balance of Plant (BOP)',
    slug: 'solar-infrastructure',
    shortDescription: 'Utility-scale 250+ MWp solar parks, automated pile driving, MMS installation, inverter rooms, and 33kV internal power lines.',
    fullDescription: 'Complete civil and electrical Balance of Plant (BOP) execution for mega-watt utility-scale solar farms across arid and complex terrain. Dedicated fleet of self-owned hydraulic GPS-guided pile ramming units ensures rapid structure mounting system (MMS) foundations with millimeter accuracy.',
    order: 2,
    imageUrl: '/images/solar_park_real.jpg',
    features: ['Automated Pile Driving Fleet', 'Turnkey 33kV Internal Sub-stations', 'SCADA Plant Performance Monitoring', 'Single-Axis & Fixed Tilt Mounting Structures']
  },
  {
    id: 3,
    title: 'Water Storage Reservoirs (GFS / ESR)',
    slug: 'water-storage-tanks',
    shortDescription: 'Glass-Fused-to-Steel (GFS) industrial tanks and Elevated Storage Reservoirs (ESR) engineered to IS 3370 water retaining standards.',
    fullDescription: 'Advanced water retaining infrastructure combining modern Glass-Fused-to-Steel (GFS) bolted industrial technology with monolithic RCC Elevated Storage Reservoirs (ESR). Built strictly adhering to IS 3370 standards with high-grade M-35 impermeability concrete and elastomeric waterstops.',
    order: 3,
    imageUrl: '/images/water_tank_real.jpg',
    features: ['Glass-Fused-to-Steel (GFS) Technology', 'RCC Elevated Storage Reservoirs', 'SCADA Chlorination & Flow Telemetry', 'Subterranean Master Balancing Reservoirs']
  },
  {
    id: 4,
    title: 'Heavy Structural Fabrication & Erection',
    slug: 'heavy-fabrication',
    shortDescription: 'Railway overbridge (ROB) plate girders, industrial warehouse trusses, PEB structures, and heavy machinery support frames.',
    fullDescription: 'Heavy-duty steel structural engineering and precision fabrication for complex transportation, commercial, and industrial corridors. Certified under ISO 3834 welding standards with complete in-house ultrasonic testing (UT), magnetic particle inspection (MPI), and automated submerged arc welding.',
    order: 4,
    imageUrl: '/images/steel_fabrication_real.jpg',
    features: ['Clear Span 72m ROB Plate Girders', 'Ultrasonic NDT Quality Verified', 'Automated Submerged Arc Welding (SAW)', 'Hot-Dip Galvanized & Epoxied Finishes']
  }
];

async function getServicesData() {
  const [services, home] = await Promise.all([
    fetchStrapiCollection<StrapiServiceData>('services', defaultServicesList),
    fetch(`${STRAPI_BASE_URL}/api/homepage`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)
  ]);
  return {
    services: (services && services.length > 0) ? services : defaultServicesList,
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
      <section style={{ padding: 'clamp(50px, 6vw, 80px) 1.5rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: ' clamp(2.5rem, 4vw, 4rem)' }}>
          {services.map((srv, idx) => (
            <div 
              key={srv.id} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', 
                gap: 'clamp(1.5rem, 3vw, 3rem)', 
                alignItems: 'center',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                background: '#FAFAFA'
              }}
            >
              <div style={{ order: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#167C72', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Business Sector 0{srv.order}
                </span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: '#172B32', margin: '0.5rem 0 1rem 0', lineHeight: 1.25 }}>
                  {srv.title}
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  {srv.fullDescription || srv.shortDescription}
                </p>

                {srv.features && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {srv.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#172B32', fontWeight: 500 }}>
                        <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
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

              <div style={{ order: 2, height: 'clamp(240px, 30vw, 360px)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <img 
                  src={srv.imageUrl || '/images/pipeline_trench.jpg'} 
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
