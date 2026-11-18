'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { ClockCheck, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity } from '@/services/strapiClient';
import { getStoredAttendanceLogs, AttendanceCheckInRecord } from '@/services/workerStorage';

export default function SupervisorAttendanceView() {
  const [logs, setLogs] = useState<AttendanceCheckInRecord[]>([]);
  const [selectedWorker, setSelectedWorker] = useState('WRK-MUM-104 - Ramesh Patil');
  const [status, setStatus] = useState<'Present' | 'Half Day' | 'Overtime' | 'Absent'>('Present');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchStrapiCollection<AttendanceCheckInRecord>('attendances', getStoredAttendanceLogs());
      setLogs(data);
    }
    load();
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: Partial<AttendanceCheckInRecord> = {
      workerId: '1',
      workerName: 'Ramesh Patil',
      workerCode: 'WRK-MUM-104',
      site: 'Tower A — Skyline Commercial Complex',
      date: new Date().toLocaleDateString('en-GB'),
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      verificationMethod: 'Supervisor Manual Overrule',
      geofencePassed: true,
      qrVerified: true,
      approvalStatus: 'Approved by Supervisor',
      hoursWorked: status === 'Half Day' ? 4 : 8,
      wageEarned: status === 'Half Day' ? 475 : 950
    };

    await createStrapiEntity('attendances', newLog);
    setLogs(prev => [newLog as AttendanceCheckInRecord, ...prev]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Daily Site Muster Roll & Attendance</h2>
          <p>Mark official attendance for tradespersons on your active site.</p>
        </div>
      </div>

      {/* Manual Muster Mark Form */}
      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Mark Field Shift Attendance</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Attendance marked and synced to central Strapi backend!
          </div>
        )}
        <form onSubmit={handleMarkAttendance} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Assigned Worker</label>
            <select className={styles.select} value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
              <option value="WRK-MUM-104 - Ramesh Patil">Ramesh Patil (WRK-MUM-104) &mdash; Bar Bender</option>
              <option value="WRK-DEL-209 - Suresh Kumar">Suresh Kumar (WRK-DEL-209) &mdash; Carpenter</option>
              <option value="WRK-PUN-302 - Ganesh More">Ganesh More (WRK-PUN-302) &mdash; Crane Operator</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Attendance Shift Status</label>
            <select className={styles.select} value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="Present">Present (Full Day &mdash; 8 Hrs)</option>
              <option value="Half Day">Half Day (4 Hrs Cap)</option>
              <option value="Overtime">Overtime (Full Day + OT)</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={16} />
              <span>Submit Muster Log</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verified Log Roster */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Worker Name</th>
              <th>Code</th>
              <th>Check-in Time</th>
              <th>Shift Status</th>
              <th>Verification Method</th>
              <th>Wage Earned</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={log.id || idx}>
                <td>{log.date}</td>
                <td style={{ fontWeight: 600 }}>{log.workerName}</td>
                <td>{log.workerCode}</td>
                <td>{log.checkInTime}</td>
                <td>
                  <span className={`${styles.badge} ${log.status === 'Present' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {log.status}
                  </span>
                </td>
                <td>{log.verificationMethod}</td>
                <td>₹{log.wageEarned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
