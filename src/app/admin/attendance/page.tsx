import React from 'react';
import AttendanceTracker from '@/components/admin/attendance/AttendanceTracker';
import styles from '../page.module.css';

export default function AttendancePage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Workforce Attendance & Wage Audit</h1>
          <p className={styles.pageSubtitle}>
            Centralized monitoring of field supervisor check-ins, geofence compliance, and automated payroll calculations.
          </p>
        </div>
      </div>
      <AttendanceTracker />
    </div>
  );
}
