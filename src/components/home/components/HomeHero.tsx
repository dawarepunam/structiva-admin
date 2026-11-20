'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../styles/HomeHero.module.css';
import { ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { StrapiHomepageData } from '../types/homeTypes';

interface HomeHeroProps {
  data?: StrapiHomepageData;
}

export default function HomeHero({ data }: HomeHeroProps) {
  const headline = data?.heroHeadline || 'Engineering with Precision. Execution with Responsibility.';
  const subheadline = data?.heroSubheadline || 'STRUCTIVA delivers dependable infrastructure, engineering, fabrication, water pipeline, solar infrastructure, and industrial construction solutions through disciplined execution and quality-driven processes.';
  const primaryCta = data?.heroCtaText || 'Explore Our Services';
  const secondaryCta = data?.heroSecondaryCtaText || 'Discuss Your Project';

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground} />
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <ShieldCheck size={16} />
          <span>Premier Infrastructure & EPC Contractor</span>
        </div>

        <h1 className={styles.heroHeadline}>
          <span className={styles.heroHeadlineHighlight}>{headline}</span>
        </h1>

        <p className={styles.heroSubheadline}>
          {subheadline}
        </p>

        <div className={styles.heroActions}>
          {/* Navigate to Dedicated Services Page */}
          <Link href="/services" className={styles.btnPrimary}>
            <span>{primaryCta}</span>
            <ArrowRight size={18} />
          </Link>
          {/* Navigate to Dedicated Contact Page */}
          <Link href="/contact" className={styles.btnSecondary}>
            <MessageSquare size={18} />
            <span>{secondaryCta}</span>
          </Link>
        </div>

        {/* Dynamic Key Performance Stats from Strapi */}
        <div className={styles.metricsStrip}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{data?.statExperienceYears || '18+'}</span>
            <span className={styles.metricLabel}>Years Industrial Track Record</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{data?.statProjectsCompleted || '250+'}</span>
            <span className={styles.metricLabel}>Critical Projects Delivered</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{data?.statWorkforceStrength || '1,200+'}</span>
            <span className={styles.metricLabel}>Certified Site Tradespeople</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{data?.statMachineryUnits || '85+'}</span>
            <span className={styles.metricLabel}>Heavy Machinery Assets</span>
          </div>
        </div>
      </div>
    </section>
  );
}
