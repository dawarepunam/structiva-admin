'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../styles/HomeCapabilities.module.css';
import { 
  Compass, 
  Droplets, 
  Sun, 
  Cpu, 
  Truck, 
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HomeCapabilities() {
  // Exactly 6 primary industrial pillars with deep-dive technical specs
  const capabilities = [
    {
      id: 'engineering-planning',
      title: 'Engineering & EPC Planning',
      tagline: 'Hydraulic & Structural FEA',
      desc: 'Advanced hydraulic transient modeling, structural finite element analysis, 3D BIM civil coordination, and geotechnical soil survey.',
      icon: Compass,
      color: '#167C72',
      metric: '3D BIM / FEA',
      link: '/capabilities#engineering'
    },
    {
      id: 'water-transmission',
      title: 'Water Transmission Networks',
      tagline: 'Bulk MS & DI Pipelines',
      desc: 'Cross-country bulk lines, micro-tunneling under active rail corridors, automatic surge mitigation chambers, and real-time SCADA telemetry.',
      icon: Droplets,
      color: '#0284C7',
      metric: 'ND 3000mm / 40 Bar',
      link: '/capabilities#water'
    },
    {
      id: 'solar-bop',
      title: 'GW-Scale Solar BOP',
      tagline: 'Turnkey Utility Solar',
      desc: 'Hydraulic GPS-guided post-ramming, single-axis tracker erection, AC/DC trenching, inverter stations, and 33/132kV pooling substations.',
      icon: Sun,
      color: '#D97706',
      metric: '500+ MWp BOP',
      link: '/capabilities#solar'
    },
    {
      id: 'structural-fabrication',
      title: 'Heavy Structural Fabrication',
      tagline: 'Certified High-Yield Steel',
      desc: 'CNC oxy-fuel and plasma profiling, automated submerged arc welding (SAW), non-destructive testing, and corrosion-resistant hot-dip galvanizing.',
      icon: Cpu,
      color: '#7C3AED',
      metric: 'ISO 3834 / SAW',
      link: '/capabilities#fabrication'
    },
    {
      id: 'plant-machinery',
      title: 'Self-Owned Machinery Fleet',
      tagline: '85+ Heavy Earthmoving Units',
      desc: 'Hydraulic crawler cranes, long-reach excavators, automated chain trenchers, horizontal directional drilling rigs, and heavy-duty tipper gangs.',
      icon: Truck,
      color: '#B58B59',
      metric: '85+ Plant Units',
      link: '/capabilities#fleet'
    },
    {
      id: 'quality-hseq',
      title: 'Zero-Harm Quality & HSE Regimes',
      tagline: 'Integrated Tri-Certification',
      desc: 'Certified ISO 9001:2015, ISO 14001, and ISO 45001 governance with daily safety induction toolbox talks and rigorous multi-stage QA sign-offs.',
      icon: ShieldCheck,
      color: '#059669',
      metric: 'ISO 9001/14001/45001',
      link: '/capabilities#quality'
    }
  ];

  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.sectionPill}>
            <Sparkles size={16} />
            <span>Industrial Infrastructure Pillars</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Enterprise Engineering & Execution Capabilities
          </h2>
          <p className={styles.sectionSubtitle}>
            Our integrated ecosystem unifies certified technical design, modern equipment fleets, trade craftsmanship, and rigorous quality governance.
          </p>
        </div>

        {/* Exactly 6 Industrial Pillars Grid */}
        <div className={styles.grid}>
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.id} className={styles.capabilityCard}>
                <div className={styles.cardTopRow}>
                  <div className={styles.iconWrapper} style={{ background: `${cap.color}15`, color: cap.color }}>
                    <Icon size={26} />
                  </div>
                  <span className={styles.badgeMetric}>{cap.metric}</span>
                </div>

                <div className={styles.tagline}>{cap.tagline}</div>
                <h3 className={styles.cardTitle}>{cap.title}</h3>
                <p className={styles.cardDesc}>{cap.desc}</p>

                <div className={styles.cardFooter}>
                  <Link href="/capabilities" className={styles.detailLink}>
                    <span>Technical Dossier</span>
                    <ArrowRight size={15} />
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
