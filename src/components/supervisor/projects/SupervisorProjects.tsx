'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Building2, MapPin, Calendar, Users, HardHat } from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { getStoredProjects, EnterpriseProjectRecord } from '@/services/projectStorage';

export default function SupervisorProjectsView() {
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchStrapiCollection<EnterpriseProjectRecord>('projects', getStoredProjects());
      setProjects(data);
    }
    load();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>My Assigned Projects</h2>
          <p>Projects officially assigned to you by the Central Admin desk.</p>
        </div>
      </div>

      <div className={styles.cardGrid}>
        {projects.map(proj => (
          <div key={proj.id} className={styles.card}>
            <div className={styles.cardBody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>{proj.status}</span>
                <span style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 600 }}>{proj.code}</span>
              </div>
              <h3 className={styles.cardTitle}>{proj.name}</h3>
              <div className={styles.cardMeta}>
                <Building2 size={14} />
                <span>Client: {proj.client}</span>
              </div>
              <div className={styles.cardMeta}>
                <MapPin size={14} />
                <span>{proj.location}</span>
              </div>
              <div className={styles.cardMeta}>
                <Calendar size={14} />
                <span>Target: {proj.expectedCompletion}</span>
              </div>
              <div style={{ marginTop: '0.5rem', background: '#F4F2EC', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span>Physical Execution Progress</span>
                  <strong>{proj.progress}%</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#ECEBE5', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${proj.progress}%`, height: '100%', background: '#167C72' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
