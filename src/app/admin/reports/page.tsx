import React from 'react';
import DprReportViewer from '@/components/admin/reports/DprReportViewer';
import styles from '../page.module.css';

export default function ReportsPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Reports & Daily Progress Reports (DPR)</h1>
          <p className={styles.pageSubtitle}>
            Consolidated site execution briefs, cumulative workforce audit, fleet diesel metrics, and print-ready executive dossiers.
          </p>
        </div>
      </div>
      <DprReportViewer />
    </div>
  );
}
