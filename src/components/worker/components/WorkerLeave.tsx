'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  CalendarDays,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerLeaveProps {
  worker: WorkerProfile;
}

export default function WorkerLeaveView({ worker }: WorkerLeaveProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [leaveHistory, setLeaveHistory] = useState([
    {
      id: 'LV-2026-001',
      type: 'Casual Leave',
      dates: '24 Nov 2026 – 26 Nov 2026',
      days: 3,
      reason: 'Family festival in Satara hometown',
      status: 'Approved',
      approvedBy: 'Er. Pravin Gaikwad',
      remarks: 'Substitute bar-bender briefed for core cage schedule.'
    },
    {
      id: 'LV-2026-002',
      type: 'Medical Leave',
      dates: '12 Sep 2026 – 13 Sep 2026',
      days: 2,
      reason: 'Viral fever rest with clinic certificate',
      status: 'Approved',
      approvedBy: 'HR Admin Deshmukh',
      remarks: 'Fitness certificate verified.'
    }
  ]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setLeaveHistory([
        {
          id: `LV-2026-00${leaveHistory.length + 1}`,
          type: leaveType,
          dates: `${startDate} to ${endDate}`,
          days: 2,
          reason,
          status: 'Pending',
          approvedBy: 'Under Review',
          remarks: 'Submitted for supervisor verification.'
        },
        ...leaveHistory
      ]);

      setTimeout(() => {
        setSuccessMsg(false);
        setShowApplyModal(false);
        setReason('');
      }, 1500);
    }, 600);
  };

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            My Leave Applications & Balances
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Track planned absences, medical leaves, and supervisor approvals
          </div>
        </div>

        <button className={styles.btnPrimary} onClick={() => setShowApplyModal(true)}>
          <PlusCircle size={16} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balance Overview */}
      <div className={styles.grid3} style={{ marginBottom: '1.25rem' }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <CalendarDays size={22} />
          </div>
          <div>
            <div className={styles.statVal}>7 Days</div>
            <div className={styles.statLabel}>Casual Leave Balance</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <CalendarDays size={22} />
          </div>
          <div>
            <div className={styles.statVal}>5 Days</div>
            <div className={styles.statLabel}>Sick / Medical Leave</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <CalendarDays size={22} />
          </div>
          <div>
            <div className={styles.statVal}>5 Days</div>
            <div className={styles.statLabel}>Total Availed This Year</div>
          </div>
        </div>
      </div>

      {/* Leave Application History */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FileText size={18} color="#167C72" />
            <span>Leave Requests History</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaveHistory.map((item) => (
            <div key={item.id} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F8F9FA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 600, color: '#172B32', fontSize: '0.95rem' }}>
                  {item.type} ({item.days} Days) • {item.dates}
                </div>
                <span className={`${styles.badge} ${item.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                  {item.status}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '0.4rem' }}>
                <strong>Reason:</strong> {item.reason}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', gap: '1rem' }}>
                <span><strong>Reviewer:</strong> {item.approvedBy}</span>
                {item.remarks && <span><strong>Remarks:</strong> {item.remarks}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '480px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#172B32' }}>
              Apply for Leave
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Submit for advance authorization. Uninformed leaves may lead to muster deduction.
            </p>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Leave Application Submitted</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>
                  Er. Pravin Gaikwad notified. Check back for confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyLeave}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Leave Type
                  </label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="Casual Leave">Casual Leave (Personal / Family)</option>
                    <option value="Medical Leave">Medical / Sick Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                      End Date
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Reason for Absence
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Describe reason for leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    onClick={() => setShowApplyModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.btnPrimary} 
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Leave'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
