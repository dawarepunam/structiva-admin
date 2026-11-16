'use client';

import React, { useState, useEffect } from 'react';
import styles from './AttendanceTracker.module.css';
import SafeImage from '@/components/admin/ui/SafeImage';
import { ShieldCheck, MapPin, Lock, CheckCircle, Flag, Calendar, DollarSign, Clock, X, ArrowRight, UserCheck } from 'lucide-react';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';

interface PastAttendanceDay {
  date: string;
  status: 'Present' | 'Half Day' | 'Overtime' | 'Absent';
  site: string;
  wage: number;
  hours: number;
}

interface WorkerAuditRecord {
  id: string;
  workerName: string;
  workerCode: string;
  avatar: string;
  skill: string;
  site: string;
  supervisor: string;
  status: 'Present' | 'Half Day' | 'Overtime';
  hoursLogged: number;
  calculatedWage: number;
  geoVerified: boolean;
  timeMarked: string;
  isFlagged?: boolean;
  phone: string;
  dailyRate: number;
  totalPresentDaysMonth: number;
  totalOvertimeHoursMonth: number;
  netPayableThisMonth: number;
  pastHistory: PastAttendanceDay[];
}

const mockAuditRecords: WorkerAuditRecord[] = [
  { 
    id: '1', 
    workerName: 'Ramesh Patil', 
    workerCode: 'WRK-MUM-104',
    avatar: '/images/worker1.jpg',
    skill: 'Bar Bender & Mason', 
    site: 'Skyline Site A', 
    supervisor: 'Pravin Gaikwad', 
    status: 'Present', 
    hoursLogged: 8.0, 
    calculatedWage: 950, 
    geoVerified: true, 
    timeMarked: '08:14 AM',
    phone: '+91 98220 12345',
    dailyRate: 950,
    totalPresentDaysMonth: 24,
    totalOvertimeHoursMonth: 14.5,
    netPayableThisMonth: 24850,
    pastHistory: [
      { date: '16 Nov 2026', status: 'Present', site: 'Skyline Site A', hours: 8.0, wage: 950 },
      { date: '15 Nov 2026', status: 'Overtime', site: 'Skyline Site A', hours: 10.5, wage: 1350 },
      { date: '14 Nov 2026', status: 'Present', site: 'Skyline Site A', hours: 8.0, wage: 950 },
      { date: '13 Nov 2026', status: 'Present', site: 'Skyline Site A', hours: 8.0, wage: 950 },
      { date: '12 Nov 2026', status: 'Half Day', site: 'Skyline Site A', hours: 4.0, wage: 475 },
      { date: '11 Nov 2026', status: 'Present', site: 'Skyline Site A', hours: 8.0, wage: 950 },
      { date: '10 Nov 2026', status: 'Absent', site: 'Skyline Site A', hours: 0.0, wage: 0 },
    ]
  },
  { 
    id: '2', 
    workerName: 'Suresh Kumar Yadav', 
    workerCode: 'WRK-DEL-209',
    avatar: '/images/worker2.jpg',
    skill: 'Helper / Shuttering', 
    site: 'Eastern Expressway Bridge', 
    supervisor: 'Sunil Rao', 
    status: 'Half Day', 
    hoursLogged: 4.0, 
    calculatedWage: 325, 
    geoVerified: true, 
    timeMarked: '08:22 AM',
    phone: '+91 98220 54321',
    dailyRate: 650,
    totalPresentDaysMonth: 21,
    totalOvertimeHoursMonth: 6.0,
    netPayableThisMonth: 14150,
    pastHistory: [
      { date: '16 Nov 2026', status: 'Half Day', site: 'Eastern Expressway', hours: 4.0, wage: 325 },
      { date: '15 Nov 2026', status: 'Present', site: 'Eastern Expressway', hours: 8.0, wage: 650 },
      { date: '14 Nov 2026', status: 'Present', site: 'Eastern Expressway', hours: 8.0, wage: 650 },
      { date: '13 Nov 2026', status: 'Overtime', site: 'Eastern Expressway', hours: 11.0, wage: 975 },
    ]
  },
  { 
    id: '3', 
    workerName: 'Ganesh More', 
    workerCode: 'WRK-PUN-302',
    avatar: '/images/worker3.jpg',
    skill: 'Heavy Crane Operator', 
    site: 'Metro Line Piling', 
    supervisor: 'Santosh More', 
    status: 'Overtime', 
    hoursLogged: 11.5, 
    calculatedWage: 1725, 
    geoVerified: true, 
    timeMarked: '07:55 AM',
    phone: '+91 94220 99887',
    dailyRate: 1200,
    totalPresentDaysMonth: 26,
    totalOvertimeHoursMonth: 28.0,
    netPayableThisMonth: 35400,
    pastHistory: [
      { date: '16 Nov 2026', status: 'Overtime', site: 'Metro Line Piling', hours: 11.5, wage: 1725 },
      { date: '15 Nov 2026', status: 'Overtime', site: 'Metro Line Piling', hours: 12.0, wage: 1800 },
      { date: '14 Nov 2026', status: 'Present', site: 'Metro Line Piling', hours: 8.0, wage: 1200 },
      { date: '13 Nov 2026', status: 'Present', site: 'Metro Line Piling', hours: 8.0, wage: 1200 },
    ]
  },
  { 
    id: '4', 
    workerName: 'Santosh Yadav', 
    workerCode: 'WRK-UP-418',
    avatar: '/images/worker4.jpg',
    skill: 'General Civil Labour', 
    site: 'Skyline Site A', 
    supervisor: 'Pravin Gaikwad', 
    status: 'Present', 
    hoursLogged: 8.0, 
    calculatedWage: 500, 
    geoVerified: true, 
    timeMarked: '08:30 AM',
    phone: '+91 91220 44556',
    dailyRate: 500,
    totalPresentDaysMonth: 18,
    totalOvertimeHoursMonth: 0.0,
    netPayableThisMonth: 9000,
    pastHistory: [
      { date: '16 Nov 2026', status: 'Present', site: 'Skyline Site A', hours: 8.0, wage: 500 },
      { date: '15 Nov 2026', status: 'Present', site: 'Skyline Site A', hours: 8.0, wage: 500 },
      { date: '14 Nov 2026', status: 'Absent', site: 'Skyline Site A', hours: 0.0, wage: 0 },
    ]
  },
];

export default function AttendanceTracker() {
  const [siteFilter, setSiteFilter] = useState('All');
  const [records, setRecords] = useState<WorkerAuditRecord[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerAuditRecord | null>(null);

  const syncRecords = () => {
    const storedWorkers = getStoredWorkers();
    const synced: WorkerAuditRecord[] = storedWorkers.map((w, idx) => {
      // Find if we already had a record for this worker
      const existing = mockAuditRecords.find(m => m.id === w.id);
      if (existing) {
        return {
          ...existing,
          workerName: w.name,
          workerCode: w.code,
          avatar: w.avatar,
          skill: w.skill,
          dailyRate: w.dailyWage
        };
      }
      return {
        id: w.id,
        workerName: w.name,
        workerCode: w.code,
        avatar: w.avatar || '/images/worker1.jpg',
        skill: w.skill,
        site: w.assignedProject,
        supervisor: 'Sunil Rao (Site In-charge)',
        status: 'Present',
        hoursLogged: 8.0,
        calculatedWage: w.dailyWage,
        geoVerified: true,
        timeMarked: '08:30 AM',
        phone: w.phone,
        dailyRate: w.dailyWage,
        totalPresentDaysMonth: 1,
        totalOvertimeHoursMonth: 0,
        netPayableThisMonth: w.dailyWage,
        pastHistory: [
          { date: '16 Nov 2026', status: 'Present', site: w.assignedProject, hours: 8.0, wage: w.dailyWage }
        ]
      };
    });
    setRecords(synced);
  };

  useEffect(() => {
    syncRecords();
    const handleSync = () => syncRecords();
    window.addEventListener('storage', handleSync);
    window.addEventListener('workersUpdated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('workersUpdated', handleSync);
    };
  }, []);

  const toggleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecords(prev => prev.map(r => r.id === id ? { ...r, isFlagged: !r.isFlagged } : r));
  };

  const filtered = siteFilter === 'All' 
    ? records 
    : records.filter(r => r.site.includes(siteFilter));

  const totalPayableToday = filtered.reduce((acc, curr) => acc + (curr.isFlagged ? 0 : curr.calculatedWage), 0);

  return (
    <div className={styles.container}>
      {/* Executive KPI Audit Row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Workers Present</span>
          <span className={styles.kpiValue}>{filtered.length} Verified</span>
          <span className={styles.kpiSub}>100% Geofence Checked</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Verified Payable Wages (Today)</span>
          <span className={styles.kpiValue}>₹ {totalPayableToday.toLocaleString('en-IN')}</span>
          <span className={styles.kpiSub}>Auto-calculated from hourly rates</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Audit Lock Status</span>
          <span className={styles.kpiValue} style={{ color: isLocked ? '#10b981' : '#f59e0b' }}>
            {isLocked ? 'Locked & Signed' : 'Open for Review'}
          </span>
          <span className={styles.kpiSub} style={{ color: isLocked ? '#059669' : '#d97706' }}>
            {isLocked ? 'Payroll ledger immutable' : 'Field revisions permitted'}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={styles.tablePanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <ShieldCheck size={18} color="#10b981" />
            <span>Field Supervisor Attendance Audit Feed</span>
          </div>

          <div className={styles.actionControls}>
            <select 
              className={styles.selectInput} 
              value={siteFilter} 
              onChange={e => setSiteFilter(e.target.value)}
            >
              <option value="All">All Construction Sites</option>
              <option value="Skyline">Skyline Commercial</option>
              <option value="Eastern">Eastern Expressway</option>
              <option value="Metro">Metro Line Piling</option>
            </select>

            <button 
              className={styles.btnLockMuster} 
              onClick={() => setIsLocked(prev => !prev)}
            >
              {isLocked ? (
                <>
                  <CheckCircle size={14} color="#10b981" />
                  <span>Muster Locked</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Sign & Lock Muster</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table wrapped in responsive horizontal scroller */}
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Worker Dossier (Click to Inspect)</th>
                <th>Assigned Site</th>
                <th>Reported By (Supervisor)</th>
                <th>Status</th>
                <th>Hours</th>
                <th>Daily Wage Accrued</th>
                <th>GPS Geofence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr 
                  key={r.id} 
                  style={{ backgroundColor: r.isFlagged ? '#fff1f2' : 'transparent', cursor: 'pointer' }}
                  onClick={() => setSelectedWorker(r)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SafeImage 
                        src={r.avatar} 
                        alt={r.workerName} 
                        fallbackType="worker"
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.workerName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.workerCode} • {r.skill}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.site}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.supervisor}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Logged at {r.timeMarked}</div>
                  </td>
                  <td>
                    <span className={
                      r.status === 'Present' ? styles.badgePresent : 
                      r.status === 'Overtime' ? styles.badgeOvertime : styles.badgeHalfDay
                    }>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.hoursLogged} hrs</td>
                  <td style={{ fontWeight: 800, color: r.isFlagged ? '#dc2626' : '#0f172a' }}>
                    {r.isFlagged ? 'Disputed (₹0)' : `₹ ${r.calculatedWage.toLocaleString('en-IN')}`}
                  </td>
                  <td>
                    <span className={styles.geoBadge}>
                      <MapPin size={11} style={{ display: 'inline', marginRight: 2 }} />
                      Verified On-Site
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.btnAction} 
                      onClick={(e) => toggleFlag(r.id, e)}
                      style={{ color: r.isFlagged ? '#dc2626' : '#475569' }}
                    >
                      <Flag size={12} style={{ display: 'inline', marginRight: 3 }} />
                      {r.isFlagged ? 'Unflag' : 'Dispute'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Comprehensive Attendance Ledger Modal */}
      {selectedWorker && (
        <div className={styles.modalOverlay} onClick={() => setSelectedWorker(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SafeImage src={selectedWorker.avatar} alt={selectedWorker.workerName} fallbackType="worker" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #f59e0b', objectFit: 'cover' }} />
                <div>
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>{selectedWorker.workerCode}</span>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0' }}>{selectedWorker.workerName}</h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedWorker.skill} • {selectedWorker.phone}</span>
                </div>
              </div>
              <button onClick={() => setSelectedWorker(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Monthly Summary Ledger */}
              <div className={styles.statsGrid3}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>DAYS PRESENT (NOV)</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{selectedWorker.totalPresentDaysMonth} Days</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>OVERTIME LOGGED</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>{selectedWorker.totalOvertimeHoursMonth} Hours</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>NET ACCRUED PAYOUT</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>₹ {selectedWorker.netPayableThisMonth.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Past Attendance History Table */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="#f59e0b" /> Historical Attendance & Daily Ledger
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Date</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Site Location</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Status</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Logged Hours</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Wage Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWorker.pastHistory.map((h, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{h.date}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{h.site}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              fontWeight: 700, fontSize: '0.72rem', padding: '2px 6px', borderRadius: 4,
                              background: h.status === 'Present' ? '#d1fae5' : h.status === 'Overtime' ? '#ede9fe' : h.status === 'Half Day' ? '#fef3c7' : '#fee2e2',
                              color: h.status === 'Present' ? '#065f46' : h.status === 'Overtime' ? '#5b21b6' : h.status === 'Half Day' ? '#92400e' : '#991b1b'
                            }}>
                              {h.status}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{h.hours} hrs</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>₹ {h.wage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button 
                onClick={() => setSelectedWorker(null)}
                style={{
                  padding: '10px', background: '#0f172a', color: '#ffffff',
                  border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                Close Worker Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
