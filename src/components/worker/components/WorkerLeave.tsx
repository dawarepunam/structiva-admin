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
import { getWorkerById, updateWorker, WorkerLeaveRecord } from '@/services/workerStorage';

interface WorkerLeaveProps {
  worker: WorkerProfile;
}

export default function WorkerLeaveView({ worker }: WorkerLeaveProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Paid Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Sync leaves with central workerStorage
  const [workerRecord, setWorkerRecord] = useState(() => {
    return getWorkerById(worker.id?.toString() || worker.workerId?.toString());
  });

  const leavesList = workerRecord?.leaves && workerRecord.leaves.length > 0 ? workerRecord.leaves : [
    {
      id: 'LV-2026-001',
      workerId: worker.id?.toString(),
      workerName: worker.name,
      workerCode: worker.code,
      type: 'Paid Leave' as const,
      startDate: '2026-11-24',
      endDate: '2026-11-26',
      days: 3,
      reason: 'Family festival in Satara hometown',
      status: 'Approved' as const,
      appliedOn: '2026-11-18',
      approvedBy: worker.supervisorName || 'Er. Pravin Gaikwad'
    }
  ];

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newLeave: WorkerLeaveRecord = {
      id: `LV-${Date.now()}`,
      workerId: worker.id?.toString() || worker.workerId?.toString(),
      workerName: worker.name,
      workerCode: worker.code,
      type: (leaveType === 'Casual Leave' ? 'Paid Leave' : leaveType) as any,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      days: Number(days) || 1,
      reason: reason || 'Personal work at hometown',
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    const targetId = worker.id?.toString() || worker.workerId?.toString();
    const currentRec = getWorkerById(targetId);
    const updatedLeaves = [newLeave, ...(currentRec?.leaves || [])];
    const updatedList = updateWorker(targetId, { leaves: updatedLeaves });
    const fresh = updatedList.find(w => w.id === targetId);
    setWorkerRecord(fresh);

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowApplyModal(false);
        setReason('');
      }, 1200);
    }, 400);
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <div className={styles.statCard} style={{ padding: '0.75rem 0.6rem' }}>
          <div className={styles.statIcon} style={{ background: '#ECFDF5', color: '#059669', width: '36px', height: '36px' }}>
            <CalendarDays size={18} />
          </div>
          <div>
            <div className={styles.statVal} style={{ fontSize: '1.1rem' }}>7 Days</div>
            <div className={styles.statLabel} style={{ fontSize: '0.68rem' }}>Casual Leave</div>
          </div>
        </div>

        <div className={styles.statCard} style={{ padding: '0.75rem 0.6rem' }}>
          <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#2563EB', width: '36px', height: '36px' }}>
            <CalendarDays size={18} />
          </div>
          <div>
            <div className={styles.statVal} style={{ fontSize: '1.1rem' }}>5 Days</div>
            <div className={styles.statLabel} style={{ fontSize: '0.68rem' }}>Sick Leave</div>
          </div>
        </div>

        <div className={styles.statCard} style={{ padding: '0.75rem 0.6rem' }}>
          <div className={styles.statIcon} style={{ background: '#FFFBEB', color: '#D97706', width: '36px', height: '36px' }}>
            <CalendarDays size={18} />
          </div>
          <div>
            <div className={styles.statVal} style={{ fontSize: '1.1rem' }}>5 Days</div>
            <div className={styles.statLabel} style={{ fontSize: '0.68rem' }}>Availed (2026)</div>
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
          {leavesList.map((item) => (
            <div key={item.id} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F8F9FA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 600, color: '#172B32', fontSize: '0.95rem' }}>
                  {item.type} ({item.days} Days) • {item.startDate} to {item.endDate}
                </div>
                <span className={`${styles.badge} ${item.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                  {item.status}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '0.4rem' }}>
                <strong>Reason:</strong> {item.reason}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', gap: '1rem' }}>
                <span><strong>Applied:</strong> {item.appliedOn}</span>
                {item.approvedBy && <span><strong>Reviewer:</strong> {item.approvedBy}</span>}
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
