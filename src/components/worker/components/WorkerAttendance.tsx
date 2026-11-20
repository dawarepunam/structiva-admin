'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  CalendarCheck2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WorkerProfile, WorkerAttendanceRecord } from '../data/workerTypes';

interface WorkerAttendanceProps {
  worker: WorkerProfile;
  attendanceRecords: WorkerAttendanceRecord[];
}

export default function WorkerAttendanceView({
  worker,
  attendanceRecords
}: WorkerAttendanceProps) {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionDate, setCorrectionDate] = useState('18 Nov 2026');
  const [requestedStatus, setRequestedStatus] = useState('Present');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const sampleDays = [
    { date: '01 Nov', status: 'Present', in: '08:25 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '02 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '03 Nov', status: 'Sunday', in: '-', out: '-', hrs: 0, wage: 0 },
    { date: '04 Nov', status: 'Present', in: '08:20 AM', out: '06:30 PM', hrs: 10, wage: 1090 },
    { date: '05 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '06 Nov', status: 'Present', in: '08:35 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '07 Nov', status: 'Present', in: '08:25 AM', out: '07:30 PM', hrs: 11, wage: 1230 },
    { date: '08 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '09 Nov', status: 'Present', in: '08:28 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '10 Nov', status: 'Sunday', in: '-', out: '-', hrs: 0, wage: 0 },
    { date: '11 Nov', status: 'Present', in: '08:25 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '12 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '13 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '14 Nov', status: 'Present', in: '08:22 AM', out: '06:00 PM', hrs: 9.5, wage: 1020 },
    { date: '15 Nov', status: 'Half Day', in: '08:30 AM', out: '01:00 PM', hrs: 4.5, wage: 475 },
    { date: '16 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '17 Nov', status: 'Sunday', in: '-', out: '-', hrs: 0, wage: 0 },
    { date: '18 Nov', status: 'Present', in: '08:30 AM', out: '05:30 PM', hrs: 9, wage: 950 },
    { date: '19 Nov', status: 'Present', in: '08:30 AM', out: 'In Progress', hrs: 9, wage: 950 },
  ];

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowCorrectionModal(false);
        setReason('');
      }, 2000);
    }, 600);
  };

  return (
    <div>
      {/* Month Summary Bar */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#172B32' }}>
              November 2026 Muster Roll
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Standard shift: 08:30 AM – 05:30 PM • Verified by GPS & Biometric Punch
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              className={styles.btnSecondary}
              onClick={() => setShowCorrectionModal(true)}
            >
              <FileQuestion size={16} /> Request Attendance Correction
            </button>
          </div>
        </div>

        <div className={styles.grid4} style={{ marginTop: '1.25rem' }}>
          <div style={{ background: '#F8F9FA', padding: '0.85rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>18</div>
            <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Full Days Present</div>
          </div>
          <div style={{ background: '#F8F9FA', padding: '0.85rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D97706' }}>1</div>
            <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Half Days</div>
          </div>
          <div style={{ background: '#F8F9FA', padding: '0.85rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563EB' }}>14 Hrs</div>
            <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Approved Overtime</div>
          </div>
          <div style={{ background: '#F8F9FA', padding: '0.85rem', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172B32' }}>3</div>
            <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Weekly Rest / Holidays</div>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <CalendarCheck2 size={18} color="#167C72" />
            <span>Daily Attendance & Punch Log</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#F8F9FA', borderBottom: '2px solid #E5E7EB', color: '#4B5563', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Punch In</th>
                <th style={{ padding: '0.75rem' }}>Punch Out</th>
                <th style={{ padding: '0.75rem' }}>Total Hours</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Verification Method</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Wage Earned</th>
              </tr>
            </thead>
            <tbody>
              {sampleDays.slice().reverse().map((day, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: '#172B32' }}>{day.date}</td>
                  <td style={{ padding: '0.75rem' }}>{day.in}</td>
                  <td style={{ padding: '0.75rem' }}>{day.out}</td>
                  <td style={{ padding: '0.75rem' }}>{day.hrs > 0 ? `${day.hrs} hrs` : '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`${styles.badge} ${
                      day.status === 'Present' ? styles.badgeSuccess :
                      day.status === 'Half Day' ? styles.badgeWarning :
                      styles.badgeInfo
                    }`}>
                      {day.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#6B7280' }}>
                    {day.status === 'Sunday' ? 'Weekly Off' : 'GPS + Geofence Verified (24m)'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: day.wage > 0 ? '#059669' : '#9CA3AF' }}>
                    {day.wage > 0 ? `₹${day.wage}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {showCorrectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '480px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#172B32' }}>
              Request Attendance Correction
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              If you worked on site but your biometric punch or GPS geofence missed registration, submit this correction for supervisor verification.
            </p>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Correction Sent to Er. Pravin Gaikwad</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>
                  The supervisor will verify muster logs and approve the wage credit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCorrectionSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Shift Date
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={correctionDate} 
                    onChange={(e) => setCorrectionDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Requested Status
                  </label>
                  <select 
                    value={requestedStatus} 
                    onChange={(e) => setRequestedStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="Present">Present (Full Day - 9 hrs)</option>
                    <option value="Half Day">Half Day (4.5 hrs)</option>
                    <option value="Overtime">Overtime Hours Unrecorded</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Explanation / Reason
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="E.g., Biometric device power failure at East Gate; supervisor witnessed shift presence." 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    onClick={() => setShowCorrectionModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.btnPrimary} 
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Send Correction Request'}
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
