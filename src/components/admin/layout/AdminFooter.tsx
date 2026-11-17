'use client';

import React from 'react';
import styles from './AdminFooter.module.css';

export default function AdminFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.leftSection}>
        <span className={styles.companyText}>
          © 2026 <strong>STRUCTIVA ENTERPRISE OS</strong>. Infrastructure Intelligence.
        </span>
        <span>•</span>
        <div className={styles.systemStatus}>
          <span className={styles.statusDot}></span>
          <span>Central Strapi Node: Connected (Latency: 24ms)</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <a href="#audit" className={styles.footerLink}>Audit Trail</a>
        <a href="#security" className={styles.footerLink}>Security Policy</a>
        <span className={styles.buildBadge}>Build v3.0-enterprise</span>
      </div>
    </footer>
  );
}
