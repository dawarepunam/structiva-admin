'use client';

import React from 'react';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import ProjectOverview from '@/components/admin/dashboard/ProjectOverview';
import styles from './page.module.css';
import { Calendar, CloudSun, HardHat, Sparkles } from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';

export default function AdminDashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      {/* ========================================================
          HERO BANNER: WELCOME BACK, ADMIN! WITH CONSTRUCTION TEAM
          ======================================================== */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.titleRow}>
            <h1 className={styles.heroTitle}>Welcome Back, Admin! 👋</h1>
          </div>
          <p className={styles.heroSubtitle}>Construction Excellence. Together.</p>
          
          <div className={styles.metaPillsRow}>
            <div className={styles.datePill}>
              <Calendar size={13} className={styles.pillIcon} />
              <span>Monday, 17 Nov 2026</span>
            </div>

            <div className={styles.weatherPill}>
              <CloudSun size={13} className={styles.pillIcon} />
              <span>Pune HQ: 32°C Clear • Concreting Favorable</span>
            </div>
          </div>
        </div>

        {/* Right Construction Team Visual Overlay */}
        <div className={styles.heroImageWrapper}>
          <SafeImage 
            src="/images/worker1.jpg" 
            alt="Construction Engineers Team" 
            fallbackType="worker"
            className={styles.heroImg}
          />
          <div className={styles.heroImgOverlay} />
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <DashboardStats />

      {/* Analytics, Budget Charts, Quick Actions & Project Portfolio */}
      <ProjectOverview />
    </div>
  );
}
