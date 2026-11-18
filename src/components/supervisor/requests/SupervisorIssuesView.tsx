'use client';

import React, { useState } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { AlertOctagon, Send, CheckCircle2 } from 'lucide-react';
import { createStrapiEntity } from '@/services/strapiClient';

export default function SupervisorIssuesView() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Site Safety Hazard');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStrapiEntity('expenses', {
      title: `Issue: ${title}`,
      category: `Site Incident (${category})`,
      amount: 0,
      project: 'Skyline Commercial Complex',
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Pending Review',
      remarks: description
    });
    setSubmitted(true);
    setTitle('');
    setDescription('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Site Issues, EHS Incidents & Breakdowns</h2>
          <p>Report safety issues, delays and mechanical failures directly to management.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>File Incident / Issue Ticket</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Incident reported to Project Manager and EHS Safety Desk!
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
              <select className={styles.select} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Critical">Critical &mdash; Site Work Halted</option>
                <option value="High">High &mdash; Action Needed Today</option>
                <option value="Moderate">Moderate</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Detailed Description & Immediate Action Taken</label>
            <textarea className={styles.textarea} rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} />
            <span>Transmit Issue Ticket</span>
          </button>
        </form>
      </div>
    </div>
  );
}
