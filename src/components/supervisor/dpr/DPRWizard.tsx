'use client';

import React, { useState } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { FileText, Send, CheckCircle2 } from 'lucide-react';
import { createStrapiEntity } from '@/services/strapiClient';

export default function SupervisorDPRWizard() {
  const [reportDate, setReportDate] = useState('18 Nov 2026');
  const [shift, setShift] = useState('Shift-1 (Day)');
  const [workExecuted, setWorkExecuted] = useState('Level 4 slab reinforcement completed. 145 m³ concrete poured.');
  const [labourCount, setLabourCount] = useState(42);
  const [machineryCount, setMachineryCount] = useState(4);
  const [dieselConsumed, setDieselConsumed] = useState(60);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      reportDate,
      shift,
      workExecuted,
      labourCount,
      machineryCount,
      dieselConsumedLitres: dieselConsumed,
      submittedBy: 'Er. Pravin Gaikwad (Chief Supervisor)',
      approvalStatus: 'Under Review'
    };
    
    // Save to Project daily report in Strapi
    await createStrapiEntity('expenses', {
      title: `DPR Log: ${shift}`,
      category: 'DPR Submission',
      amount: 0,
      project: 'Skyline Commercial Complex',
      date: reportDate,
      remarks: workExecuted
    });

    setSubmitted(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Daily Progress Report (DPR) Submission</h2>
          <p>Submit formal daily site log for Project Manager and Client review.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="#167C72" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>DPR Submitted Successfully!</h3>
            <p style={{ color: '#718096', fontSize: '0.88rem' }}>
              Your Daily Progress Report has been transmitted to central Strapi and queued for PM signoff.
            </p>
            <button onClick={() => setSubmitted(false)} className={styles.btnPrimary} style={{ marginTop: '1rem' }}>
              Create Another DPR
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Report Date</label>
                <input type="text" className={styles.input} value={reportDate} onChange={e => setReportDate(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Shift</label>
                <select className={styles.select} value={shift} onChange={e => setShift(e.target.value)}>
                  <option value="Shift-1 (Day)">Shift-1 (Day: 08:00 AM - 05:00 PM)</option>
                  <option value="Shift-2 (Night)">Shift-2 (Night: 08:00 PM - 05:00 AM)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Site Workforce Count</label>
                <input type="number" className={styles.input} value={labourCount} onChange={e => setLabourCount(Number(e.target.value))} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Machinery Utilized</label>
                <input type="number" className={styles.input} value={machineryCount} onChange={e => setMachineryCount(Number(e.target.value))} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Diesel Consumed (Litres)</label>
                <input type="number" className={styles.input} value={dieselConsumed} onChange={e => setDieselConsumed(Number(e.target.value))} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Physical Work Executed & Milestones Tied</label>
              <textarea 
                className={styles.textarea} 
                rows={4} 
                value={workExecuted} 
                onChange={e => setWorkExecuted(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={16} />
              <span>Transmit DPR to Central Desk</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
