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

export default function HomePageCoordinator() {
  const [homepageData, setHomepageData] = useState<StrapiHomepageData | undefined>();
  const [services, setServices] = useState<StrapiServiceData[]>([]);
  const [projects, setProjects] = useState<StrapiProjectData[]>([]);
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
