'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Inbox, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';

export default function SupervisorRequestsAudit() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await fetchStrapiCollection('supervisor-requests', []);
      setRequests(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>My Submission Audit & Approvals</h2>
          <p>Real-time audit status of all your indents, expenses, issues and field submissions.</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div style={{ padding: '0.85rem 1rem', background: '#F4F2EC', borderBottom: '1px solid #ECEBE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.88rem', color: '#172B32' }}>All Submissions (Central Database)</strong>
          <button onClick={loadRequests} style={{ background: 'none', border: 'none', color: '#167C72', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Request Title / Subject</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Project Site</th>
              <th>Admin / PM Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#718096' }}>
                  {loading ? 'Connecting to Strapi...' : 'No submissions found in central database.'}
                </td>
              </tr>
            ) : (
              requests.map((r, idx) => (
                <tr key={r.id || idx}>
                  <td>{r.submittedDate || 'Today'}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.requestType || 'Field Submission'}</td>
                  <td>
                    <span className={`${styles.badge} ${r.priority === 'Critical' ? styles.badgeWarning : styles.badgeSuccess}`}>
                      {r.priority || 'Standard'}
                    </span>
                  </td>
                  <td>{r.site || r.project || 'Tower A'}</td>
                  <td>
                    <span className={`${styles.badge} ${r.status === 'Approved' || r.status === 'Resolved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {r.status || 'Under Review'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
