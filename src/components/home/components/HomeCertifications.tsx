'use client';

import React from 'react';
import styles from '../styles/HomeCertifications.module.css';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function HomeCertifications() {
  const certs = [
    {
      code: 'ISO 9001:2015',
      scope: 'Quality Management Systems (QMS)',
      desc: 'Certified compliance in heavy civil construction, cross-country pipeline execution, and structural steel fabrication workflows.'
    },
    {
      code: 'ISO 14001:2015',
      scope: 'Environmental Management Systems (EMS)',
      desc: 'Rigorous stewardship in ecological impact mitigation, carbon footprint control, and sustainable construction site waste governance.'
    },
    {
      code: 'ISO 45001:2018',
      scope: 'Occupational Health & Safety (OHSMS)',
      desc: 'Zero-harm mandates, certified high-altitude fall protection, regular tool-box talks, and strict PPE enforcement across all project sites.'
    }
  ];

  return (
    <section className={styles.certSection}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.sectionPill}>
            <Award size={16} />
            <span>Accreditations & Compliance</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Internationally Certified Quality & Safety Standards
          </h2>
        </div>

        <div className={styles.certGrid}>
          {certs.map((c) => (
            <div key={c.code} className={styles.certCard}>
              <div className={styles.badgeIcon}>
                <ShieldCheck size={28} />
              </div>
              <h3 className={styles.certCode}>{c.code}</h3>
              <div className={styles.certScope}>{c.scope}</div>
              <p className={styles.certDesc}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
