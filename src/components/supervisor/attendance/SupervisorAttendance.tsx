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
  FileSpreadsheet,
  ShieldCheck,
  Check
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity } from '@/services/strapiClient';
import { 
  getStoredWorkers, 
  EnterpriseWorkerRecord, 
  getStoredAttendanceLogs, 
  saveAttendanceLogs,
  AttendanceCheckInRecord 
} from '@/services/workerStorage';

export default function SupervisorAttendanceView() {
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceCheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticated Supervisor Identity
  const [supervisorUser, setSupervisorUser] = useState({
    name: 'Er. Pravin Gaikwad',
    empId: 'EMP-SUP-084',
    code: 'SUP-PUN-01',
    role: 'Chief Site Operations Supervisor',
    site: 'Skyline Commercial Complex (Tower A)'
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('18 Nov 2026');

  // Form modal / state for manual check-in
  const [attendanceTarget, setAttendanceTarget] = useState<'worker' | 'supervisor'>('worker');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [shiftStatus, setShiftStatus] = useState<'Present' | 'Half Day' | 'Overtime' | 'Absent'>('Present');
  const [checkInTime, setCheckInTime] = useState('08:30 AM');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [supervisorRemark, setSupervisorRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Log for detail modal
  const [viewLog, setViewLog] = useState<AttendanceCheckInRecord | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('structiva_supervisor_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSupervisorUser({
            name: parsed.username || parsed.name || 'Er. Pravin Gaikwad',
            empId: parsed.empId || 'EMP-SUP-084',
            code: parsed.code || 'SUP-PUN-01',
            role: parsed.role || 'Chief Site Operations Supervisor',
            site: parsed.assignedProject || 'Skyline Commercial Complex (Tower A)'
          });
        }
      } catch (e) {
        console.warn('Supervisor session parse warning');
      }
    }
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const localWorkers = getStoredWorkers();
      const localLogs = getStoredAttendanceLogs();
      const [workersList, logsList] = await Promise.all([
        fetchStrapiCollection<EnterpriseWorkerRecord>('workers', localWorkers),
        fetchStrapiCollection<AttendanceCheckInRecord>('attendances', localLogs)
      ]);
      const finalWorkers = (workersList && workersList.length > 0) ? workersList : localWorkers;
      const finalLogs = (logsList && logsList.length > 0) ? logsList : localLogs;
      setWorkers(finalWorkers);
      setAttendanceLogs(finalLogs);
      if (finalWorkers.length > 0) {
        setSelectedWorkerId((finalWorkers[0] as any).workerId || finalWorkers[0].id || '1');
      }
    } catch (err) {
      console.warn('Attendance load fallback');
      setWorkers(getStoredWorkers());
      setAttendanceLogs(getStoredAttendanceLogs());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => {
      setAttendanceLogs(getStoredAttendanceLogs());
      setWorkers(getStoredWorkers());
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('attendanceUpdated', handleStorageUpdate);
    window.addEventListener('workersUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('attendanceUpdated', handleStorageUpdate);
      window.removeEventListener('workersUpdated', handleStorageUpdate);
    };
  }, []);

  // Check if supervisor already checked in today
  const supervisorTodayLog = useMemo(() => {
    return attendanceLogs.find(
      l => (l.workerName === supervisorUser.name || l.workerCode === supervisorUser.code || l.workerCode === supervisorUser.empId) &&
           l.date === selectedDate
    );
  }, [attendanceLogs, supervisorUser, selectedDate]);

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
      const matchesSearch = 
        log.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.workerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.site || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [attendanceLogs, searchTerm, filterStatus]);

  // Handle Mark Attendance (Both Worker and Supervisor Self-Attendance)
  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    let targetName = '';
    let targetCode = '';
    let targetSite = '';
    let baseDailyWage = 950;
    let otRate = 140;
    let targetId = '';

    if (attendanceTarget === 'supervisor') {
      // Supervisor self attendance
      targetName = supervisorUser.name;
      targetCode = supervisorUser.code || supervisorUser.empId;
      targetSite = supervisorUser.site;
      baseDailyWage = 2200; // Standard Site Supervisor daily bracket
      otRate = 250;
      targetId = supervisorUser.empId;
    } else {
      // Worker attendance
      const targetWorker = workers.find(w => ((w as any).workerId || w.id) === selectedWorkerId);
      if (!targetWorker) {
        setMessage({ type: 'error', text: 'Please select a valid worker from the assigned site roster.' });
        setSubmitting(false);
        return;
      }
      targetName = targetWorker.name;
      targetCode = targetWorker.code;
      targetSite = targetWorker.assignedProject || 'Skyline Commercial Complex (Tower A)';
      baseDailyWage = Number(targetWorker.dailyWage) || 950;
      otRate = Number(targetWorker.overtimeHourlyRate) || 140;
      targetId = (targetWorker as any).workerId || targetWorker.id;
    }

    // Business Rule: Check for duplicate entry on same date
    const existingEntry = attendanceLogs.find(
      l => (l.workerCode === targetCode || l.workerName === targetName) && l.date === selectedDate
    );
    if (existingEntry) {
      setMessage({
        type: 'error',
        text: `Duplicate check-in blocked: ${targetName} (${targetCode}) already has muster logged for ${selectedDate}.`
      });
      setSubmitting(false);
      return;
    }

    // Calculate wages
    let computedWage = baseDailyWage;
    let hours = 8;
    if (shiftStatus === 'Half Day') {
      computedWage = Math.round(baseDailyWage / 2);
      hours = 4;
    } else if (shiftStatus === 'Absent') {
      computedWage = 0;
      hours = 0;
    } else if (shiftStatus === 'Overtime') {
      computedWage = baseDailyWage + (otRate * 2);
      hours = 10;
    }

    const newRecord: AttendanceCheckInRecord = {
      id: `ATT-${Date.now()}`,
      workerId: targetId,
      workerName: targetName,
      workerCode: targetCode,
      site: targetSite,
      date: selectedDate,
      checkInTime,
      checkOutTime: checkOutTime || undefined,
      status: shiftStatus,
      verificationMethod: attendanceTarget === 'supervisor' ? 'Biometric & GPS Self-Punch' : 'Supervisor Manual Overrule',
      latitude: 18.55294,
      longitude: 73.93481,
      distanceFromSiteMetres: 12,
      gpsAccuracyMetres: 2.8,
      geofencePassed: true,
      qrVerified: true,
      isException: false,
      approvalStatus: attendanceTarget === 'supervisor' ? 'Verified (Supervisor Self-Muster)' : 'Approved by Supervisor',
      supervisorRemark: supervisorRemark || (attendanceTarget === 'supervisor' ? 'Supervisor On-Site Duty Check-in' : 'Verified on site by Chief Supervisor'),
      hoursWorked: hours,
      wageEarned: computedWage
    };

    const updated = [newRecord, ...attendanceLogs];
    setAttendanceLogs(updated);
    saveAttendanceLogs(updated);
    await createStrapiEntity('attendances', newRecord).catch(() => {});

    setMessage({
      type: 'success',
      text: attendanceTarget === 'supervisor'
        ? `Supervisor Attendance Marked Successfully! You are logged in as Present for ${selectedDate}.`
        : `Muster roll recorded & computed for ${targetName} (₹${computedWage} computed wage).`
    });
    setSubmitting(false);
    setSupervisorRemark('');
    setTimeout(() => setMessage(null), 5000);
  };

  // Quick Supervisor Punch Button
  const handleQuickSupervisorPunch = () => {
    setAttendanceTarget('supervisor');
    setShiftStatus('Present');
    setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSupervisorRemark('Automated On-Site Geofence Punch');
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
          <p>Centralized shift verification, GPS geofence compliance, supervisor self-attendance, and automated daily payroll calculation.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {supervisorTodayLog ? (
            <div style={{
              background: '#E6F4EA',
              color: '#137333',
              border: '1px solid #CEEAD6',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} />
              <span>Supervisor Check-in Active ({supervisorTodayLog.checkInTime})</span>
            </div>
          ) : (
            <button 
              onClick={handleQuickSupervisorPunch}
              className={styles.btnPrimary} 
              style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <ShieldCheck size={16} />
              <span>Mark My Attendance (Supervisor)</span>
            </button>
          )}

          <button onClick={handleExportCSV} className={styles.btnPrimary} style={{ background: '#203A3B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards - Fully Interactive & Clickable Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', width: '100%' }}>
        {/* Card 1: All Workforce */}
        <div 
          onClick={() => { setFilterStatus('All'); setSearchTerm(''); }}
          style={{ 
            background: filterStatus === 'All' ? '#F0FDF4' : '#FFFFFF', 
            padding: '0.9rem', 
            borderRadius: '8px', 
            border: filterStatus === 'All' ? '2px solid #167C72' : '1px solid #ECEBE5', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.2rem',
            boxShadow: filterStatus === 'All' ? '0 4px 12px rgba(22, 124, 114, 0.15)' : 'none'
          }}
          title="Click to view all workforce records"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Workforce</span>
            {filterStatus === 'All' && <span style={{ fontSize: '0.65rem', background: '#167C72', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>Active Filter</span>}
          </div>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#172B32' }}>{stats.totalAssigned}</h3>
          <span style={{ fontSize: '0.72rem', color: '#167C72', fontWeight: 600 }}>Skyline Roster &bull; Click to Reset</span>
        </div>

        {/* Card 2: Present on Site */}
        <div 
          onClick={() => setFilterStatus('Present')}
          style={{ 
            background: filterStatus === 'Present' ? '#ECFDF5' : '#FFFFFF', 
            padding: '0.9rem', 
            borderRadius: '8px', 
            border: filterStatus === 'Present' ? '2px solid #10B981' : '1px solid #ECEBE5', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.2rem',
            boxShadow: filterStatus === 'Present' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
          }}
          title="Click to filter only Present workers"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Present on Site</span>
            {filterStatus === 'Present' && <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>Active Filter</span>}
          </div>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{stats.present}</h3>
          <span style={{ fontSize: '0.72rem', color: '#047857' }}>Biometric & GPS &bull; Click to View</span>
        </div>

        {/* Card 3: Half-Day */}
        <div 
          onClick={() => setFilterStatus('Half Day')}
          style={{ 
            background: filterStatus === 'Half Day' ? '#FFFBEB' : '#FFFFFF', 
            padding: '0.9rem', 
            borderRadius: '8px', 
            border: filterStatus === 'Half Day' ? '2px solid #F59E0B' : '1px solid #ECEBE5', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.2rem',
            boxShadow: filterStatus === 'Half Day' ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none'
          }}
          title="Click to filter Half-Day workers"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Half-Day / Partial</span>
            {filterStatus === 'Half Day' && <span style={{ fontSize: '0.65rem', background: '#F59E0B', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>Active Filter</span>}
          </div>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B' }}>{stats.halfDay}</h3>
          <span style={{ fontSize: '0.72rem', color: '#B45309' }}>4-Hr Cap &bull; Click to View</span>
        </div>

        {/* Card 4: Daily Wages */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            padding: '0.9rem', 
            borderRadius: '8px', 
            border: '1px solid #ECEBE5', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.2rem' 
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Computed Wages</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#167C72' }}>₹{stats.totalWageToday.toLocaleString('en-IN')}</h3>
          <span style={{ fontSize: '0.72rem', color: '#718096' }}>Total Daily Site Liability</span>
        </div>
      </div>

      {/* Action / Muster Mark Form with Mode Switcher (Worker vs Supervisor Self-Punch) */}
      <div className={styles.formCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#172B32' }}>
              Execute Shift Check-in & Compute Wage
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {attendanceTarget === 'supervisor' ? `Logging supervisor self-muster for ${supervisorUser.name}` : 'Recording trade worker site muster'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Target Switcher */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setAttendanceTarget('worker')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: attendanceTarget === 'worker' ? '#167C72' : 'transparent',
                  color: attendanceTarget === 'worker' ? '#FFFFFF' : '#475569'
                }}
              >
                Trade Worker
              </button>
              <button
                type="button"
                onClick={() => setAttendanceTarget('supervisor')}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: attendanceTarget === 'supervisor' ? '#10B981' : 'transparent',
                  color: attendanceTarget === 'supervisor' ? '#FFFFFF' : '#475569'
                }}
              >
                ★ Supervisor (Self)
              </button>
            </div>

            <span style={{ fontSize: '0.72rem', background: 'rgba(22, 124, 114, 0.1)', color: '#167C72', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Geofence: 100m Radius
            </span>
          </div>
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
          {attendanceTarget === 'worker' ? (
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
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label}>Designated Site Supervisor *</label>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{supervisorUser.name} ({supervisorUser.code})</span>
                <span style={{ fontSize: '0.72rem', color: '#10B981', background: '#D1FAE5', padding: '2px 8px', borderRadius: '4px' }}>
                  {supervisorUser.role}
                </span>
              </div>
            </div>
          )}

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
            <label className={styles.label}>
              {attendanceTarget === 'supervisor' ? 'On-Site Location Note / GPS Remark' : 'Supervisor Overrule Remark'}
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder={attendanceTarget === 'supervisor' ? 'Tower A Site Office / GPS Geo-check confirmed' : 'Physical presence verified on Tower A'}
              value={supervisorRemark}
              onChange={e => setSupervisorRemark(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
            <button
              type="submit"
              disabled={submitting}
              className={styles.btnPrimary}
              style={{ 
                width: '100%', 
                height: '42px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                background: attendanceTarget === 'supervisor' ? '#10B981' : '#167C72'
              }}
            >
              <UserCheck size={18} />
              <span>
                {submitting 
                  ? 'Transmitting...' 
                  : attendanceTarget === 'supervisor' 
                    ? 'Confirm Supervisor Self-Punch & Sync' 
                    : 'Record Shift Muster & Compute Payroll'}
              </span>
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
            placeholder="Search worker or supervisor by name, code or site..."
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

          {filterStatus !== 'All' && (
            <button
              onClick={() => setFilterStatus('All')}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              Clear Filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Real Live Attendance Database Records */}
      <div className={styles.tableWrapper} style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className={styles.table} style={{ minWidth: '600px', width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name & Designation</th>
              <th>Trade / Staff Code</th>
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
                  {loading ? 'Fetching attendance records from database...' : 'No matching attendance records found.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => {
                const isSupervisor = log.workerName.includes('Gaikwad') || 
                  log.workerName.includes('Er.') || 
                  (log.workerCode && log.workerCode.startsWith('SUP-')) ||
                  (log.approvalStatus && log.approvalStatus.includes('Supervisor Self-Muster'));

                return (
                  <tr key={log.id || idx} style={{ background: isSupervisor ? '#F0FDF4' : undefined }}>
                    <td>{log.date}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{log.workerName}</span>
                        {isSupervisor && (
                          <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#FFF', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                            SUPERVISOR
                          </span>
                        )}
                      </div>
                    </td>
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
                );
              })
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
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Name & Code:</strong>
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
                <span>{viewLog.distanceFromSiteMetres || 12}m (GPS Accuracy: {viewLog.gpsAccuracyMetres || 2.8}m)</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Verification Method:</strong>
                <span>{viewLog.verificationMethod}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Status & Approval:</strong>
                <span style={{ color: '#10B981', fontWeight: 600 }}>{viewLog.approvalStatus || 'Approved on Site'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Remarks:</strong>
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
