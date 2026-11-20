'use client';

import React from 'react';
import styles from '../styles/HomeCTA.module.css';
import { ArrowRight, PhoneCall, Building2, Sparkles } from 'lucide-react';
import { StrapiHomepageData } from '../types/homeTypes';

interface HomeCTAProps {
  data?: StrapiHomepageData;
}

export default function HomeCTA({ data }: HomeCTAProps) {
  const headline = data?.ctaHeadline || 'Have an Infrastructure Project in Mind?';
  const desc = data?.ctaDescription || "Let's discuss your project requirements and explore how STRUCTIVA can support your execution goals.";

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.ctaPill}>
          <Sparkles size={15} />
          <span>National EPC Execution Desk</span>
        </div>
        <h2 className={styles.ctaHeadline}>{headline}</h2>
        <p className={styles.ctaDesc}>{desc}</p>

        <div className={styles.actionsGroup}>
          <a href="#contact" className={styles.btnPrimary}>
            <PhoneCall size={18} />
            <span>Discuss Your Project</span>
          </a>
          <a href="/projects" className={styles.btnSecondary}>
            <Building2 size={18} />
            <span>Explore Project Portfolio</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
