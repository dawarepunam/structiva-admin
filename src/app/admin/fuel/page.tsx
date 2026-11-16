import React from 'react';
import FuelAuditTable from '@/components/admin/fuel/FuelAuditTable';
import FuelLogger from '@/components/admin/fuel/FuelLogger';
import styles from '../page.module.css';

export default function FuelPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Fuel Intelligence & Fleet Audit</h1>
          <p className={styles.pageSubtitle}>
            Monitor diesel allocations, compare run-hours vs fuel burn rate, and intercept site theft.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <FuelAuditTable />
        <FuelLogger />
      </div>
    </div>
  );
}
