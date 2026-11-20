'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  Coins,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerAdvanceProps {
  worker: WorkerProfile;
}

export default function WorkerAdvanceView({ worker }: WorkerAdvanceProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState('3000');
  const [reason, setReason] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [advanceHistory, setAdvanceHistory] = useState([
    {
      id: 'ADV-2026-081',
      amount: 3000,
      date: '14 Nov 2026',
      reason: 'Urgent medical checkup and school supplies for children',
      status: 'Approved',
      disbursedDate: '15 Nov 2026',
      recoveryDetails: '₹1,500/month across Nov and Dec payroll'
    },
    {
      id: 'ADV-2026-042',
      amount: 2000,
      date: '08 Aug 2026',
      reason: 'Home repair materials during monsoon',
      status: 'Paid & Closed',
      disbursedDate: '09 Aug 2026',
      recoveryDetails: 'Fully recovered in Aug/Sep salary'
    }
  ]);

  const handleApplyAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setAdvanceHistory([
        {
          id: `ADV-2026-0${advanceHistory.length + 82}`,
          amount: Number(requestedAmount),
          date: '19 Nov 2026',
          reason,
          status: 'Pending',
          disbursedDate: 'Awaiting Sign-off',
          recoveryDetails: `₹${Math.round(Number(requestedAmount) / Number(repaymentMonths))}/month across ${repaymentMonths} months`
        },
        ...advanceHistory
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
            My Salary Advances & Loans
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Request emergency wage advances with auto-deduction from upcoming payroll
          </div>
        </div>

        <button className={styles.btnPrimary} onClick={() => setShowApplyModal(true)}>
          <PlusCircle size={16} /> Request Salary Advance
        </button>
      </div>

      {/* Advance Policy Notice */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Coins size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#1E40AF', lineHeight: '1.5' }}>
          <strong>STRUCTIVA Advance Policy:</strong> Workers who have completed 15+ muster days in the current calendar month are eligible for up to 50% of accrued wages (maximum ₹5,000). Advances are zero-interest and deducted in 1–3 equal monthly instalments.
        </div>
      </div>

      {/* Advances History */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FileText size={18} color="#167C72" />
            <span>Advance Requests & Repayment Schedule</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {advanceHistory.map((item) => (
            <div key={item.id} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F8F9FA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172B32' }}>
                  ₹{item.amount.toLocaleString('en-IN')} • <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#6B7280' }}>Ref: {item.id}</span>
                </div>
                <span className={`${styles.badge} ${
                  item.status === 'Approved' ? styles.badgeSuccess :
                  item.status === 'Paid & Closed' ? styles.badgeInfo :
                  styles.badgeWarning
                }`}>
                  {item.status}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '0.4rem' }}>
                <strong>Reason:</strong> {item.reason}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', gap: '1.5rem' }}>
                <span><strong>Requested:</strong> {item.date}</span>
                <span><strong>Disbursement:</strong> {item.disbursedDate}</span>
                <span><strong>Recovery:</strong> {item.recoveryDetails}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Advance Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '480px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#172B32' }}>
              Apply for Salary Advance
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Eligible limit based on 19 days attendance: <strong>₹9,000</strong>
            </p>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Advance Request Submitted</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>
                  Routed to Project Director and Accounts for approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyAdvance}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Requested Amount (INR)
                  </label>
                  <input 
                    type="number" 
                    min={500} 
                    max={5000} 
                    step={500}
                    required 
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Repayment Schedule
                  </label>
                  <select 
                    value={repaymentMonths}
                    onChange={(e) => setRepaymentMonths(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="1">1 Month (Deduct in full next payroll)</option>
                    <option value="2">2 Months (Equal 50% split)</option>
                    <option value="3">3 Months (Equal 33% split)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Emergency Reason
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Medical expenses, school fees, family travel, etc."
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
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
