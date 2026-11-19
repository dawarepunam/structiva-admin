import React from 'react';
import MasterAttendanceCoordinator from '@/components/admin/attendance/MasterAttendanceCoordinator';
import styles from '../page.module.css';

export const metadata = {
  title: 'Attendance & Shift Audit | Admin Panel',
  description: 'Separated Worker and Supervisor Attendance, Shift Biometrics, and Automated Wage/Salary Auditing',
};

export default function AttendancePage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Workforce & Supervisor Attendance Audit</h1>
          <p className={styles.pageSubtitle}>
            Dual partitioned attendance management: Site worker daily muster roll alongside field supervisor shift compliance, geofence audit, and salary accrual.
          </p>
        </div>
      </div>
      <MasterAttendanceCoordinator />
    </div>
  );
}
