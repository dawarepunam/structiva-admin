'use client';

import React from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { UserCircle, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';

export default function SupervisorProfileView() {
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Chief Field Supervisor Profile</h2>
          <p>Verified employee credentials and authorized operational scopes.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#203A3B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
            PG
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Er. Pravin Gaikwad</h3>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Chief Site Supervisor &bull; Active Field Node</span>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Employee ID</label>
            <input type="text" className={styles.input} value="SUP-PUN-084" disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Official Email</label>
            <input type="text" className={styles.input} value="p.gaikwad@structiva.internal" disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mobile Phone</label>
            <input type="text" className={styles.input} value="+91 98220 99441" disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Designated Site</label>
            <input type="text" className={styles.input} value="Tower A — Skyline Commercial Complex" disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Reporting Authority</label>
            <input type="text" className={styles.input} value="Er. Rajesh Kulkarni (Project Manager)" disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Security Clearance</label>
            <input type="text" className={styles.input} value="Level 2 Field Supervisor" disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
