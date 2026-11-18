'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { AlertOctagon, Send, RefreshCw } from 'lucide-react';
import { createStrapiEntity, fetchStrapiCollection } from '@/services/strapiClient';

export default function SupervisorIssuesView() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Site Safety Hazard');
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Standard'>('High');
  const [description, setDescription] = useState('');
  
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function loadIssues() {
    try {
      const data = await fetchStrapiCollection('supervisor-requests', []);
      const siteIssues = data.filter((d: any) => d.requestType === 'Site Issue');
      setIssues(siteIssues);
    } catch {}
  }

  useEffect(() => {
    loadIssues();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      requestType: 'Site Issue',
      title: `Issue: ${title}`,
      project: 'Skyline Commercial Complex',
      site: 'Tower A',
      category,
      priority,
      status: 'Submitted',
      remarks: description,
      submittedBy: 'Er. Pravin Gaikwad (Chief Supervisor)',
      submittedDate: new Date().toLocaleDateString('en-GB')
    };

    await createStrapiEntity('supervisor-requests', payload);
    setIssues(prev => [payload, ...prev]);
    setLoading(false);
    setSubmitted(true);
    setTitle('');
    setDescription('');
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Site Issues, EHS Incidents & Breakdowns</h2>
          <p>Report safety issues, delays and mechanical failures directly to management (Strapi Connected).</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>File Incident / Issue Ticket</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Incident recorded in Strapi! Queued for Project Manager & EHS safety audit.
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Issue Title</label>
              <input type="text" className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Tower crane hydraulic pressure drop" required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Incident Category</label>
              <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Machinery Breakdown">Machinery Breakdown</option>
                <option value="Site Safety Hazard">Site Safety Hazard (EHS)</option>
                <option value="Material Quality Rejection">Material Quality Rejection</option>
                <option value="Work Execution Delay">Work Execution Delay</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Severity / Priority</label>
              <select className={styles.select} value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="Critical">Critical &mdash; Site Work Halted</option>
                <option value="High">High &mdash; Action Needed Today</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Detailed Description & Immediate Action Taken</label>
            <textarea className={styles.textarea} rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} />
            <span>{loading ? 'Logging Incident...' : 'Transmit Issue Ticket'}</span>
          </button>
        </form>
      </div>

      {/* Real Issues Table */}
      <div className={styles.tableWrapper}>
        <div style={{ padding: '0.85rem 1rem', background: '#F4F2EC', borderBottom: '1px solid #ECEBE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.88rem', color: '#172B32' }}>Live Site Incidents (Strapi Database)</strong>
          <button onClick={loadIssues} style={{ background: 'none', border: 'none', color: '#167C72', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Incident Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Admin Action</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#718096' }}>
                  No open site incidents reported. Site is operating under normal safety conditions.
                </td>
              </tr>
            ) : (
              issues.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{item.submittedDate || 'Today'}</td>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`${styles.badge} ${item.priority === 'Critical' ? styles.badgeWarning : styles.badgeSuccess}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${item.status === 'Resolved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {item.status || 'Under Review'}
                    </span>
                  </td>
                  <td>{item.adminRemarks || 'Investigation Scheduled'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
