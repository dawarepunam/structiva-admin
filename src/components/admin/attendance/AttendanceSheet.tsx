'use client';

import React, { useState } from 'react';
import styles from './AttendanceSheet.module.css';

interface WorkerAttendanceState {
  id: string;
  name: string;
  role: string;
  status: 'Present' | 'Half Day' | 'Absent' | 'Overtime';
}

const initialAttendance: WorkerAttendanceState[] = [
  { id: '1', name: 'Ramesh Patil', role: 'Bar Bender', status: 'Present' },
  { id: '2', name: 'Suresh Kumar', role: 'Shuttering Helper', status: 'Present' },
  { id: '3', name: 'Ganesh More', role: 'Crane Operator', status: 'Overtime' },
  { id: '4', name: 'Santosh Yadav', role: 'Labour', status: 'Half Day' },
];

export default function AttendanceSheet() {
  const [records, setRecords] = useState<WorkerAttendanceState[]>(initialAttendance);

  const setStatus = (id: string, status: WorkerAttendanceState['status']) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
            Daily Attendance Sheet (Skyline Site A)
          </span>
          <input type="date" defaultValue="2026-11-16" className={styles.datePicker} />
        </div>

        <div className={styles.grid}>
          {records.map(worker => (
            <div key={worker.id} className={styles.card}>
              <div className={styles.workerHeader}>
                <span className={styles.workerName}>{worker.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{worker.role}</span>
              </div>

              <div className={styles.statusButtons}>
                <button 
                  className={`${styles.statusBtn} ${worker.status === 'Present' ? styles.activePresent : ''}`}
                  onClick={() => setStatus(worker.id, 'Present')}
                >
                  Present (1.0)
                </button>
                <button 
                  className={`${styles.statusBtn} ${worker.status === 'Half Day' ? styles.activeHalfDay : ''}`}
                  onClick={() => setStatus(worker.id, 'Half Day')}
                >
                  Half Day (0.5)
                </button>
                <button 
                  className={`${styles.statusBtn} ${worker.status === 'Overtime' ? styles.activeOvertime : ''}`}
                  onClick={() => setStatus(worker.id, 'Overtime')}
                >
                  Overtime (1.5x)
                </button>
                <button 
                  className={`${styles.statusBtn} ${worker.status === 'Absent' ? styles.activeAbsent : ''}`}
                  onClick={() => setStatus(worker.id, 'Absent')}
                >
                  Absent (0.0)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
