import React from 'react';
import WorkerTable from '@/components/admin/workforce/WorkerTable';
import styles from '../page.module.css';

export default function WorkforcePage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Workforce & Labour Directory</h1>
          <p className={styles.pageSubtitle}>
            Central registry of skilled, semi-skilled, and unskilled site workers.
          </p>
        </div>
      </div>
      <WorkerTable />
    </div>
  );
}
