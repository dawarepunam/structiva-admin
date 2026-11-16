'use client';

import React from 'react';
import Link from 'next/link';
import styles from './ProjectOverview.module.css';
import SafeImage from '@/components/admin/ui/SafeImage';
import { ArrowRight, Activity, Building2 } from 'lucide-react';

const realProjects = [
  { 
    name: 'Skyline Commercial Complex', 
    location: 'Kharadi, Pune • K Raheja Corp',
    progress: 68, 
    budget: '₹ 4.2 Cr', 
    status: 'Active',
    image: '/images/commercial_tower.jpg'
  },
  { 
    name: 'Eastern Expressway Bridge Sec-4', 
    location: 'Thane - Bhiwandi • NHAI',
    progress: 84, 
    budget: '₹ 12.8 Cr', 
    status: 'Active',
    image: '/images/highway_bridge.jpg'
  },
  { 
    name: 'Metro Line Corridor Piling', 
    location: 'Andheri East • MMRDA',
    progress: 42, 
    budget: '₹ 8.5 Cr', 
    status: 'Active',
    image: '/images/metro_piling.jpg'
  }
];

const liveSiteActivities = [
  { text: 'Fuel audit logged for JCB 3DX (60L Diesel at ₹5,550) by Sunil Rao', time: '14 mins ago' },
  { text: 'Muster signed: 42 workers marked present at Skyline Site A with GPS verification', time: '48 mins ago' },
  { text: 'Expense voucher #VCH-EXP-091 (Hydraulic Hose) authorized by Super Admin', time: '2 hours ago' },
  { text: 'Tata Prima Tipper completed 140 KM material haul at Eastern Expressway', time: '3 hours ago' }
];

export default function ProjectOverview() {
  return (
    <div className={styles.overviewGrid}>
      {/* Left Panel: Real Site Projects */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#f59e0b" />
            <h2 className={styles.panelTitle}>Active Construction Contracts</h2>
          </div>
          <Link href="/admin/projects" className={styles.viewAllLink}>
            <span>View All Projects</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className={styles.projectList}>
          {realProjects.map((p, idx) => (
            <Link key={idx} href="/admin/projects" style={{ textDecoration: 'none' }}>
              <div className={styles.projectItem}>
                <SafeImage src={p.image} alt={p.name} fallbackType="project" className={styles.thumbnail} />
                <div className={styles.projectInfo}>
                  <div className={styles.projectMeta}>
                    <span className={styles.projectName}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{p.progress}%</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.location}</span>
                  <div className={styles.progressBarTrack}>
                    <div className={styles.progressBarFill} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Panel: Real-time Live Field Activities */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="#10b981" />
            <h2 className={styles.panelTitle}>Live Site Field Operations</h2>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, background: '#d1fae5', padding: '3px 8px', borderRadius: 20 }}>
            ● Telematics Live
          </span>
        </div>

        <div className={styles.activityList}>
          {liveSiteActivities.map((act, idx) => (
            <div key={idx} className={styles.activityItem}>
              <div className={styles.activityDot} />
              <div>
                <p className={styles.activityText}>{act.text}</p>
                <span className={styles.activityTime}>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
