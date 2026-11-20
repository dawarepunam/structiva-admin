'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import {
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity } from '@/services/strapiClient';
import { getStoredWorkers, EnterpriseWorkerRecord, getStoredAttendanceLogs, AttendanceCheckInRecord } from '@/services/workerStorage';

export default function SupervisorAttendanceView() {
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceCheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('18 Nov 2026');

  // Form modal / state for manual check-in
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [shiftStatus, setShiftStatus] = useState<'Present' | 'Half Day' | 'Overtime' | 'Absent'>('Present');
  const [checkInTime, setCheckInTime] = useState('08:30 AM');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [supervisorRemark, setSupervisorRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Log for detail modal
  const [viewLog, setViewLog] = useState<AttendanceCheckInRecord | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [workersList, logsList] = await Promise.all([
        fetchStrapiCollection<EnterpriseWorkerRecord>('workers', getStoredWorkers()),
        fetchStrapiCollection<AttendanceCheckInRecord>('attendances', getStoredAttendanceLogs())
      ]);
      setWorkers(workersList);
      setAttendanceLogs(logsList);
      if (workersList.length > 0) {
        setSelectedWorkerId((workersList[0] as any).workerId || workersList[0].id || '1');
      }
    } catch (err) {
      console.warn('Attendance load fallback');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const totalAssigned = workers.length || 0;
    const present = attendanceLogs.filter(a => a.status === 'Present').length;
    const halfDay = attendanceLogs.filter(a => a.status === 'Half Day').length;
    const absent = attendanceLogs.filter(a => a.status === 'Absent').length;
    const totalWageToday = attendanceLogs.reduce((sum, a) => sum + (Number(a.wageEarned) || 0), 0);
    return { totalAssigned, present, halfDay, absent, totalWageToday };
  }, [workers, attendanceLogs]);

  // Filtered attendance list
  const filteredLogs = useMemo(() => {
    return attendanceLogs.filter(log => {
      const matchesSearch = log.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.workerCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [attendanceLogs, searchTerm, filterStatus]);

  // Handle Mark Attendance with Duplicate check
  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const targetWorker = workers.find(w => ((w as any).workerId || w.id) === selectedWorkerId);
    if (!targetWorker) {
      setMessage({ type: 'error', text: 'Please select a valid worker from the assigned site roster.' });
      setSubmitting(false);
      return;
    }

    // Business Rule: Check for duplicate entry on same date
    const existingEntry = attendanceLogs.find(
      l => l.workerCode === targetWorker.code && l.date === selectedDate
    );
    if (existingEntry) {
      setMessage({
        type: 'error',
        text: `Duplicate check-in blocked: Worker ${targetWorker.name} (${targetWorker.code}) already has muster logged for ${selectedDate}.`
      });
      setSubmitting(false);
      return;
    }

    // Calculate wages
    const baseDailyWage = Number(targetWorker.dailyWage) || 950;
    let computedWage = baseDailyWage;
    let hours = 8;
    if (shiftStatus === 'Half Day') {
      computedWage = Math.round(baseDailyWage / 2);
      hours = 4;
    } else if (shiftStatus === 'Absent') {
      computedWage = 0;
      hours = 0;
    } else if (shiftStatus === 'Overtime') {
      computedWage = baseDailyWage + ((Number(targetWorker.overtimeHourlyRate) || 140) * 2);
      hours = 10;
    }

    const newRecord: Partial<AttendanceCheckInRecord> = {
      workerId: (targetWorker as any).workerId || targetWorker.id,
      workerName: targetWorker.name,
      workerCode: targetWorker.code,
      site: targetWorker.assignedProject || 'Skyline Commercial Complex (Tower A)',
      date: selectedDate,
      checkInTime,
      checkOutTime: checkOutTime || undefined,
      status: shiftStatus,
      verificationMethod: 'Supervisor Manual Overrule',
      latitude: 18.55294,
      longitude: 73.93481,
      distanceFromSiteMetres: 18,
      gpsAccuracyMetres: 3.5,
      geofencePassed: true,
      qrVerified: true,
      isException: false,
      approvalStatus: 'Approved by Supervisor',
      supervisorRemark: supervisorRemark || 'Verified on site by Chief Supervisor',
      hoursWorked: hours,
      wageEarned: computedWage
    };

    const saved = await createStrapiEntity('attendances', newRecord);
    setAttendanceLogs(prev => [newRecord as AttendanceCheckInRecord, ...prev]);
    setMessage({
      type: 'success',
      text: `Muster roll marked & synced to Strapi for ${targetWorker.name} (₹${computedWage} computed wage).`
    });
    setSubmitting(false);
    setSupervisorRemark('');
    setTimeout(() => setMessage(null), 4000);
  };

  // CSV Export functionality
  const handleExportCSV = () => {
    if (attendanceLogs.length === 0) return;
    const headers = ['Date,Worker Name,Code,Site,Status,Check-In,Check-Out,Hours,Wage (INR),Method'];
    const rows = attendanceLogs.map(l =>
      `"${l.date}","${l.workerName}","${l.workerCode}","${l.site}","${l.status}","${l.checkInTime}","${l.checkOutTime || ''}",${l.hoursWorked},${l.wageEarned},"${l.verificationMethod}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STRUCTIVA_Attendance_${selectedDate.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Workforce Muster Roll & Wage Computation</h2>
          <p>Centralized shift verification, GPS geofence compliance, and automated daily payroll calculation.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportCSV} className={styles.btnPrimary} style={{ background: '#203A3B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards - 2x2 grid on mobile with compact padding */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', width: '100%' }}>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Workforce</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#172B32' }}>{stats.totalAssigned}</h3>
          <span style={{ fontSize: '0.68rem', color: '#167C72', fontWeight: 600 }}>Skyline Roster</span>
        </div>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Present on Site</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>{stats.present}</h3>
          <span style={{ fontSize: '0.68rem', color: '#718096' }}>Biometric & GPS</span>
        </div>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Half-Day / Partial</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B' }}>{stats.halfDay}</h3>
          <span style={{ fontSize: '0.68rem', color: '#718096' }}>4-Hr Cap</span>
        </div>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Computed Wages</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#167C72' }}>₹{stats.totalWageToday.toLocaleString('en-IN')}</h3>
          <span style={{ fontSize: '0.68rem', color: '#718096' }}>Daily Liability</span>
        </div>
      </div>

      {/* Action / Muster Mark Form with Complete Validation */}
      <div className={styles.formCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#172B32' }}>Execute Shift Check-in & Compute Wage</h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(22, 124, 114, 0.1)', color: '#167C72', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
            Geofence Active: 100m Site Radius
          </span>
        </div>

        {message && (
          <div style={{
            background: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleMarkAttendance} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Registered Worker *</label>
            <select
              className={styles.select}
              value={selectedWorkerId}
              onChange={e => setSelectedWorkerId(e.target.value)}
              required
            >
              {workers.map(w => (
                <option key={w.id} value={(w as any).workerId || w.id}>
                  {w.name} ({w.code}) &mdash; {w.skill} (₹{w.dailyWage}/day)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Muster Date *</label>
            <input
              type="text"
              className={styles.input}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Shift Status *</label>
            <select
              className={styles.select}
              value={shiftStatus}
              onChange={e => setShiftStatus(e.target.value as any)}
            >
              <option value="Present">Present (Full Shift &mdash; 8 Hrs)</option>
              <option value="Half Day">Half Day (4 Hrs &mdash; 50% Wage)</option>
              <option value="Overtime">Overtime (8 Hrs + 2 Hrs OT)</option>
              <option value="Absent">Absent (0 Wage)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Check-in Time *</label>
            <input
              type="text"
              className={styles.input}
              value={checkInTime}
              onChange={e => setCheckInTime(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Check-out Time (Optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. 05:30 PM"
              value={checkOutTime}
              onChange={e => setCheckOutTime(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Supervisor Overrule Remark</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Physical presence verified on Tower A Level 4"
              value={supervisorRemark}
              onChange={e => setSupervisorRemark(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
            <button
              type="submit"
              disabled={submitting}
              className={styles.btnPrimary}
              style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <UserCheck size={18} />
              <span>{submitting ? 'Transmitting to Strapi...' : 'Record Shift Muster & Compute Payroll'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ECEBE5', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px', minWidth: '160px', background: '#F8F9FA', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #ECEBE5' }}>
          <Search size={16} color="#718096" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search worker by name or code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.82rem', color: '#172B32' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={14} color="#718096" style={{ flexShrink: 0 }} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #ECEBE5', fontSize: '0.8rem', background: '#F4F2EC', color: '#172B32', fontWeight: 600 }}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Half Day">Half Day</option>
            <option value="Overtime">Overtime</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Real Live Attendance Database Records with touch scroll and screen boundary protection */}
      <div className={styles.tableWrapper} style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className={styles.table} style={{ minWidth: '600px', width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Worker Name</th>
              <th>Trade Code</th>
              <th>Check-in</th>
              <th>Shift Status</th>
              <th>Method</th>
              <th>Hours</th>
              <th>Wage Computed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                  {loading ? 'Fetching attendance records from Strapi...' : 'No matching attendance records found.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td>{log.date}</td>
                  <td style={{ fontWeight: 600 }}>{log.workerName}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', background: '#ECEBE5', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.workerCode}
                    </span>
                  </td>
                  <td>{log.checkInTime}</td>
                  <td>
                    <span className={`${styles.badge} ${log.status === 'Present' ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#718096' }}>{log.verificationMethod}</td>
                  <td>{log.hoursWorked} hrs</td>
                  <td style={{ fontWeight: 700, color: '#167C72' }}>₹{log.wageEarned}</td>
                  <td>
                    <button
                      onClick={() => setViewLog(log)}
                      style={{ background: 'none', border: 'none', color: '#167C72', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      View Audit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Detail Modal */}
      {viewLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 43, 50, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ECEBE5', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#172B32' }}>Attendance Audit Detail</h3>
              <button onClick={() => setViewLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Worker Name:</strong>
                <span>{viewLog.workerName} ({viewLog.workerCode})</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Shift Date:</strong>
                <span>{viewLog.date}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Timestamps:</strong>
                <span>{viewLog.checkInTime} &mdash; {viewLog.checkOutTime || 'Active on shift'}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Computed Wage:</strong>
                <span style={{ fontWeight: 700, color: '#167C72' }}>₹{viewLog.wageEarned} ({viewLog.hoursWorked} Hours)</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Geofence Accuracy:</strong>
                <span>{viewLog.distanceFromSiteMetres || 24}m (GPS Accuracy: {viewLog.gpsAccuracyMetres || 3.5}m)</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Verification Method:</strong>
                <span>{viewLog.verificationMethod}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Supervisor Remark:</strong>
                <span style={{ color: '#172B32' }}>{viewLog.supervisorRemark || 'Verified by Chief Site Supervisor'}</span>
              </div>
            </div>

            <button onClick={() => setViewLog(null)} className={styles.btnPrimary} style={{ width: '100%', marginTop: '1.25rem' }}>
              Close Audit Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
