'use client';

import React from 'react';
import styles from '@/components/supervisor/common/SupervisorCommon.module.css';
import { Settings, Bell, Shield, Database } from 'lucide-react';

export default function SupervisorSettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Supervisor Node Settings</h2>
          <p>Local offline sync parameters and telemetry connectivity settings.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #ECEBE5' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Central Strapi Backend Host</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#718096' }}>http://localhost:1337 &bull; Latency 14ms</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Connected</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #ECEBE5' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Offline IndexedDB & LocalStorage Buffer</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#718096' }}>Auto-sync enabled &bull; Zero data loss protocol active</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Mobile Geofence Accuracy</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#718096' }}>Standard 100m site threshold radius</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
