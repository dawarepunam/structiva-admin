'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../styles/HomeServices.module.css';
import { ArrowRight, CheckCircle, Wrench, Droplets, Sun, Cylinder, Factory } from 'lucide-react';
import { StrapiServiceData } from '../types/homeTypes';

interface HomeServicesProps {
  services: StrapiServiceData[];
}

export default function HomeServices({ services }: HomeServicesProps) {
  // Fallback icon selector based on service title
  const getServiceIcon = (title: string) => {
    if (title.includes('Water Pipeline')) return <Droplets size={20} color="#167C72" />;
    if (title.includes('Solar')) return <Sun size={20} color="#D97706" />;
    if (title.includes('Tank')) return <Cylinder size={20} color="#2563EB" />;
    return <Factory size={20} color="#7C3AED" />;
  };

  // Map service title to contact sector parameter
  const getSectorParam = (title: string) => {
    if (title.includes('Water Pipeline')) return 'Water Pipeline Infrastructure';
    if (title.includes('Solar')) return 'Solar Infrastructure';
    if (title.includes('Tank')) return 'Water Storage Tanks';
    if (title.includes('Fabrication')) return 'Heavy Fabrication';
    return 'General EPC / Industrial';
  };

  return (
    <section id="services" className={styles.servicesSection}>
      <div className={styles.servicesContainer}>
        <div className={styles.headerRow}>
          <div className={styles.sectionPill}>
            <Wrench size={16} />
            <span>Core Business Sectors</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Specialized Engineering & EPC Capabilities
          </h2>
          <p className={styles.sectionSubtitle}>
            Disciplined turnkey delivery across four vital infrastructure sectors powering regional urban utilities, clean renewable power, and industrial growth.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {services.map((service) => {
            const sectorParam = encodeURIComponent(getSectorParam(service.title));
            const contactUrl = `/contact?sector=${sectorParam}#contact`;

            return (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={service.imageUrl || '/images/project1.jpg'} 
                    alt={service.title} 
                    className={styles.cardImage}
                  />
                </div>

                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    {getServiceIcon(service.title)}
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                  </div>

                  <p className={styles.cardDesc}>{service.shortDescription}</p>

                  {service.features && service.features.length > 0 && (
                    <ul className={styles.featuresList}>
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className={styles.featureItem}>
                          <CheckCircle size={14} color="#059669" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link href={contactUrl} className={styles.cardLink}>
                    <span>Consult Engineering Team</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
