'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Users, Phone, HardHat, CheckCircle2 } from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';

export default function SupervisorWorkforceView() {
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchStrapiCollection<EnterpriseWorkerRecord>('workers', getStoredWorkers());
      setWorkers(data);
    }
    load();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Site Workforce Roster</h2>
          <p>Verified tradespersons and crew members assigned to your supervision.</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Worker Code</th>
              <th>Full Name</th>
              <th>Skill / Trade</th>
              <th>Category</th>
              <th>Mobile</th>
              <th>Daily Wage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id}>
                <td style={{ fontWeight: 600 }}>{w.code}</td>
                <td>{w.name}</td>
                <td>{w.skill}</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>{w.category}</span>
                </td>
                <td>{w.phone}</td>
                <td>₹{w.dailyWage}</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>{w.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
