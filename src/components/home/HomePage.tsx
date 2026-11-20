'use client';

import React, { useState, useEffect } from 'react';
import styles from './styles/HomePage.module.css';
import { ArrowUp } from 'lucide-react';
import HomeHeader from './components/HomeHeader';
import HomeHero from './components/HomeHero';
import HomeAbout from './components/HomeAbout';
import HomeServices from './components/HomeServices';
import HomeProjects from './components/HomeProjects';
import HomeCapabilities from './components/HomeCapabilities';
import HomeProcess from './components/HomeProcess';
import HomeCertifications from './components/HomeCertifications';
import HomeCTA from './components/HomeCTA';
import HomeContact from './components/HomeContact';
import HomeFooter from './components/HomeFooter';
import { 
  StrapiHomepageData, 
  StrapiServiceData, 
  StrapiProjectData 
} from './types/homeTypes';
import { fetchStrapiCollection, STRAPI_BASE_URL } from '@/services/strapiClient';
import { defaultEnterpriseProjects } from '@/services/projectStorage';

const defaultHomeServices: StrapiServiceData[] = [
  {
    id: 1,
    title: 'Water Pipeline Infrastructure',
    slug: 'water-pipeline-infrastructure',
    shortDescription: 'Large-diameter cross-country bulk water transmission, MS welded pipes, and trenchless HDD boring under highways and rivers.',
    order: 1,
    imageUrl: '/images/pipeline_trench.jpg',
    features: ['1400mm MS Pipeline Laying', 'Micro-tunneling & HDD Crossings', 'Cathodic Corrosion Protection']
  },
  {
    id: 2,
    title: 'Solar Infrastructure & Balance of Plant (BOP)',
    slug: 'solar-infrastructure',
    shortDescription: 'Utility-scale 250+ MWp solar parks, automated pile driving, MMS installation, inverter rooms, and 33kV internal power lines.',
    order: 2,
    imageUrl: '/images/solar_park_real.jpg',
    features: ['Automated Pile Driving Fleet', 'Turnkey 33kV Internal Sub-stations', 'SCADA Plant Performance Monitoring']
  },
  {
    id: 3,
    title: 'Water Storage Reservoirs (GFS / ESR)',
    slug: 'water-storage-tanks',
    shortDescription: 'Glass-Fused-to-Steel (GFS) industrial tanks and Elevated Storage Reservoirs (ESR) engineered to IS 3370 water retaining standards.',
    order: 3,
    imageUrl: '/images/water_tank_real.jpg',
    features: ['Glass-Fused-to-Steel (GFS) Technology', 'RCC Elevated Storage Reservoirs', 'SCADA Chlorination & Flow Telemetry']
  },
  {
    id: 4,
    title: 'Heavy Structural Fabrication & Erection',
    slug: 'heavy-fabrication',
    shortDescription: 'Railway overbridge (ROB) plate girders, industrial warehouse trusses, PEB structures, and heavy machinery support frames.',
    order: 4,
    imageUrl: '/images/steel_fabrication_real.jpg',
    features: ['Clear Span 72m ROB Plate Girders', 'Ultrasonic NDT Quality Verified', 'Automated Submerged Arc Welding (SAW)']
  }
];

export default function HomePageCoordinator() {
  const [homepageData, setHomepageData] = useState<StrapiHomepageData | undefined>();
  const [services, setServices] = useState<StrapiServiceData[]>(defaultHomeServices);
  const [projects, setProjects] = useState<StrapiProjectData[]>(
    defaultEnterpriseProjects.map(p => ({
      id: Number(p.id),
      name: p.name,
      code: p.code,
      slug: p.slug,
      client: p.client,
      location: p.location,
      category: p.category || 'Commercial Building',
      budget: String(p.budget),
      spent: String(p.spent),
      status: p.status,
      progress: p.progress,
      startDate: p.startDate,
      expectedCompletion: p.expectedCompletion,
      image: p.image,
      description: p.description,
      deployedMachinery: p.deployedMachinery,
      isProtected: p.isProtected
    }))
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // 1. Fetch Single Type: Homepage Content
    const loadHomepageData = async () => {
      try {
        const res = await fetch(`${STRAPI_BASE_URL}/api/homepage`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setHomepageData(json.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load homepage from Strapi, using defaults.');
      }
    };

    // 2. Fetch Collections in parallel
    const loadCollections = async () => {
      try {
        const [servicesRes, projectsRes] = await Promise.all([
          fetchStrapiCollection<StrapiServiceData>('services', []),
          fetchStrapiCollection<StrapiProjectData>('projects', [])
        ]);

        if (servicesRes && servicesRes.length > 0) setServices(servicesRes);
        if (projectsRes && projectsRes.length > 0) setProjects(projectsRes);
      } catch (err) {
        console.error('Error loading corporate homepage collections:', err);
      }
    };

    loadHomepageData();
    loadCollections();

    // Scroll listener for back to top
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.homePage}>
      {/* 1. Header */}
      <HomeHeader />

      {/* 2. Hero */}
      <HomeHero data={homepageData} />

      {/* 3. About */}
      <HomeAbout data={homepageData} />

      {/* 4. Services */}
      <HomeServices services={services} />

      {/* 5. Projects */}
      <HomeProjects projects={projects} />

      {/* 6. Capabilities */}
      <HomeCapabilities />

      {/* 7. Process */}
      <HomeProcess />

      {/* 8. Certifications */}
      <HomeCertifications />

      {/* 9. CTA */}
      <HomeCTA data={homepageData} />

      {/* 10. Contact */}
      <HomeContact data={homepageData} />

      {/* 11. Footer */}
      <HomeFooter data={homepageData} />

      {/* Back to Top */}
      {showBackToTop && (
        <button 
          className={styles.backToTop} 
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
