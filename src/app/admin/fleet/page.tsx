import React from 'react';
import VehicleList from '@/components/admin/fleet/VehicleList';
import styles from '../page.module.css';

export default function FleetPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Fleet & Heavy Machinery</h1>
          <p className={styles.pageSubtitle}>
            Live machinery status, driver assignments, and running hours tracking.
          </p>
        </div>
      </div>
      <VehicleList />
    </div>
  );
}
