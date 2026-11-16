'use client';

import React from 'react';
import styles from './AdminFooter.module.css';

export default function AdminFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.leftSection}>
        <span>© 2026 <strong>STRUCTIVA OS</strong>. Enterprise Infrastructure Intelligence.</span>
        <span>•</span>
        <div className={styles.systemStatus}>
          <span className={styles.statusDot}></span>
          <span>Central Strapi Node: Connected (Latency: 24ms)</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <a href="#audit" className={styles.footerLink}>Audit Trail</a>
        <a href="#security" className={styles.footerLink}>Security Policy</a>
        <span>Build v2.4-enterprise</span>
      </div>
    </footer>
  );
}
