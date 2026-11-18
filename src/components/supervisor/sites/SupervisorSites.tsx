'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Building, MapPin, Users, CheckCircle, Navigation } from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';

export default function SupervisorSitesView() {
  const [sites, setSites] = useState([
    {
      id: 'SIT-SKY-01',
      name: 'Tower A — Main Superstructure',
      project: 'Skyline Commercial Complex',
      location: 'Plot 4, Kharadi IT Park, Pune',
      status: 'Active Execution',
      progress: 68,
      workersCount: 42,
      coordinates: '18.55294, 73.93481'
    },
    {
      id: 'SIT-SKY-02',
      name: 'Basement 2 — Retaining Wall & Substructure',
      project: 'Skyline Commercial Complex',
      location: 'Plot 4, Kharadi IT Park, Pune',
      status: 'In Progress',
      progress: 45,
      workersCount: 14,
      coordinates: '18.55310, 73.93495'
    }
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>My Assigned Sites</h2>
          <p>Active physical construction sites under your direct supervision.</p>
        </div>
      </div>

      <div className={styles.cardGrid}>
        {sites.map(site => (
          <div key={site.id} className={styles.card}>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>{site.status}</span>
                <span style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 600 }}>{site.id}</span>
              </div>
              <h3 className={styles.cardTitle}>{site.name}</h3>
              <div className={styles.cardMeta}>
                <Building size={14} />
                <span>{site.project}</span>
              </div>
              <div className={styles.cardMeta}>
                <MapPin size={14} />
                <span>{site.location}</span>
              </div>
              <div className={styles.cardMeta}>
                <Navigation size={14} />
                <span>GPS Geofence: {site.coordinates}</span>
              </div>
              <div className={styles.cardMeta}>
                <Users size={14} />
                <span>Deployed Workforce: {site.workersCount} Personnel</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
