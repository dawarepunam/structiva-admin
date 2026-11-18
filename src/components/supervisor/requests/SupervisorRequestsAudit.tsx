'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Inbox, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';

export default function SupervisorRequestsAudit() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchStrapiCollection('expenses', []);
      setRequests(data);
    }
    load();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>My Submission Audit & Approvals</h2>
          <p>Real-time audit status of all your indents, expenses and field submissions.</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Request Title / Voucher</th>
              <th>Category</th>
              <th>Project Site</th>
              <th>Admin / PM Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, idx) => (
              <tr key={r.id || idx}>
                <td>{r.date}</td>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td>{r.category}</td>
                <td>{r.project}</td>
                <td>
                  <span className={`${styles.badge} ${r.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {r.status || 'Under Review'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
