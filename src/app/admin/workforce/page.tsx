import React from 'react';
import MasterWorkforceCoordinator from '@/components/admin/workforce/MasterWorkforceCoordinator';
import styles from '../page.module.css';

export const metadata = {
  title: 'Workforce & Supervisor Registry | Admin Panel',
  description: 'Enterprise master registry for trade workers and chief field supervisors',
};

export default function WorkforcePage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Workforce & Supervisor Enterprise Registry</h1>
          <p className={styles.pageSubtitle}>
            Unified human resource management: Skilled, semi-skilled, and unskilled trade workers alongside chief field operations supervisors.
          </p>
        </div>
      </div>
      <MasterWorkforceCoordinator />
    </div>
  );
}
