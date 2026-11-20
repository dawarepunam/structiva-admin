'use client';

import React from 'react';
import styles from '../styles/HomeAbout.module.css';
import { ShieldCheck, CheckCircle2, Award, Zap, Users2 } from 'lucide-react';
import { StrapiHomepageData } from '../types/homeTypes';

interface HomeAboutProps {
  data?: StrapiHomepageData;
}

export default function HomeAbout({ data }: HomeAboutProps) {
  const tagline = data?.aboutTagline || 'Quality Work Is Our Backbone.';
  const title = data?.aboutTitle || 'Pioneering Next-Generation Industrial & Heavy Infrastructure Across India';
  const desc = data?.aboutDescription || 'With over 18 years of uncompromised engineering rigor, STRUCTIVA operates as an agile, highly integrated EPC partner. We combine certified engineering talent, heavy-duty self-owned plant fleets, rigorous ISO-standard safety protocols, and real-time site operational intelligence to deliver high-consequence infrastructure on schedule.';

  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.aboutContainer}>
        {/* Left: Industrial Visual Presentation */}
        <div className={styles.imageGrid}>
          <div className={styles.mainImageWrapper}>
            <img 
              src="/images/highway_bridge.jpg" 
              alt="STRUCTIVA Infrastructure Engineering" 
              className={styles.mainImage}
            />
          </div>

          <div className={styles.badgeOverlay}>
            <div className={styles.badgeTagline}>"{tagline}"</div>
            <div className={styles.badgeSub}>STRUCTIVA Quality Principle</div>
          </div>
        </div>

        {/* Right: Editorial Overview & Core Pillars */}
        <div className={styles.contentWrapper}>
          <div className={styles.sectionPill}>
            <ShieldCheck size={16} />
            <span>About STRUCTIVA</span>
          </div>

          <h2 className={styles.aboutTitle}>{title}</h2>

          <p className={styles.aboutDesc}>{desc}</p>

          <div className={styles.valuesList}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <CheckCircle2 size={18} />
              </div>
              <div className={styles.valueText}>
                Turnkey Water & Pipeline Infrastructure Execution
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <Zap size={18} />
              </div>
              <div className={styles.valueText}>
                GW-Scale Utility Solar Balance of Plant (BOP)
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <Award size={18} />
              </div>
              <div className={styles.valueText}>
                Certified ISO 9001, 14001 & 45001 Quality Benchmarks
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <Users2 size={18} />
              </div>
              <div className={styles.valueText}>
                1,200+ Dedicated Trade Technicians & Engineers
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
