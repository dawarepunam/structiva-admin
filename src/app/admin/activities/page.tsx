import React from 'react';
import SiteActivities from '@/components/admin/activities/SiteActivities';
import styles from '../page.module.css';

export default function SiteActivitiesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Site Activities & Field Timeline</h1>
          <p className={styles.pageSubtitle}>
            Live civil execution feed, construction photographs, supervisor shift logs, and progress verification.
          </p>
        </div>
      </div>
      <SiteActivities />
    </div>
  );
}
