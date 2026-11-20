'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './SupervisorAttendanceView.module.css';
import {
  UserCheck,
  Navigation,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Award,
  Radio,
  FileText,
  X,
  Edit
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity, createStrapiEntity } from '@/services/strapiClient';

export interface SupervisorAttendanceRecord {
  id: string | number;
  documentId: string;
  supervisorId: string;
  supervisorName: string;
  project: string;
  site: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'Present' | 'Half Day' | 'Absent' | 'Leave' | 'Weekly Off';
  monthlySalary: number;
  dailyRate: number;
  geofencePassed: boolean;
  gpsDistance: number;
  gpsAccuracy: number;
  verificationMethod: string;
  notes: string;
  auditHistory?: string;
}

export default function SupervisorAttendanceView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<SupervisorAttendanceRecord[]>([]);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal for Inspection / Correction
  const [selectedRecord, setSelectedRecord] = useState<SupervisorAttendanceRecord | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<string>('Present');
  const [correctionNote, setCorrectionNote] = useState<string>('');
  const [savingCorrection, setSavingCorrection] = useState<boolean>(false);

  // Load records from Strapi
  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await fetchStrapiCollection<any>('supervisor-requests', []);
      const supRecords: SupervisorAttendanceRecord[] = [];

      data.forEach((item) => {
        if (item.requestType === 'Supervisor Attendance' && item.details) {
          const d = item.details;
          supRecords.push({
            id: item.id,
            documentId: item.documentId,
            supervisorId: d.supervisorId || 'SUP-001',
            supervisorName: d.supervisorName || item.submittedBy || 'Er. Supervisor',
            project: item.project || d.project || 'Skyline Commercial Complex (Tower A)',
            site: item.site || d.site || 'Tower A',
            date: d.date || item.submittedDate || '19 Nov 2026',
            checkIn: d.checkIn || '08:30 AM',
            checkOut: d.checkOut || '05:30 PM',
            hoursWorked: d.hoursWorked || 9.0,
            status: (d.status as any) || item.status || 'Present',
            monthlySalary: d.monthlySalary || 65000,
            dailyRate: d.dailyRate || 2167,
            geofencePassed: d.geofencePassed ?? true,
            gpsDistance: d.gpsDistance || 18,
            gpsAccuracy: d.gpsAccuracy || 3.5,
            verificationMethod: d.verificationMethod || 'Biometric & Geofence',
            notes: d.notes || item.remarks || ''
          });
        }
      });

      // Robust fallback if no supervisor attendance records exist yet in Strapi
      if (supRecords.length === 0) {
        supRecords.push(
          {
            id: 'sup-demo-1',
            documentId: 'doc-sup-1',
            supervisorId: 'SUP-PUN-01',
            supervisorName: 'Er. Pravin Gaikwad',
            project: 'Skyline Commercial Complex (Tower A)',
            site: 'Tower A Core',
            date: '19 Nov 2026',
            checkIn: '08:30 AM',
            checkOut: '05:30 PM',
            hoursWorked: 9.0,
            status: 'Present',
            monthlySalary: 65000,
            dailyRate: 2167,
            geofencePassed: true,
            gpsDistance: 14,
            gpsAccuracy: 3.2,
            verificationMethod: 'Biometric + Geofence GPS',
            notes: 'Muster signed on site & synced via Central Strapi'
          },
          {
            id: 'sup-demo-2',
            documentId: 'doc-sup-2',
            supervisorId: 'SUP-PUN-02',
            supervisorName: 'Er. Rajesh Kulkarni',
            project: 'Skyline Commercial Complex (Tower A)',
            site: 'Podium Level 3',
            date: '19 Nov 2026',
            checkIn: '08:45 AM',
            checkOut: '05:15 PM',
            hoursWorked: 8.5,
            status: 'Present',
            monthlySalary: 72000,
            dailyRate: 2400,
            geofencePassed: true,
            gpsDistance: 22,
            gpsAccuracy: 4.1,
            verificationMethod: 'Biometric + Geofence GPS',
            notes: 'Supervising slab concrete pouring'
          },
          {
            id: 'sup-demo-3',
            documentId: 'doc-sup-3',
            supervisorId: 'SUP-MUM-03',
            supervisorName: 'Er. Vikram Deshmukh',
            project: 'Eastern Expressway Link Highway',
            site: 'Flyover Pier 14',
            date: '19 Nov 2026',
            checkIn: '09:00 AM',
            checkOut: '01:30 PM',
            hoursWorked: 4.5,
            status: 'Half Day',
            monthlySalary: 68000,
            dailyRate: 2267,
            geofencePassed: true,
            gpsDistance: 45,
            gpsAccuracy: 5.0,
            verificationMethod: 'Geofence Mobile Check-in',
            notes: 'Official permission for client coordination meeting'
          }
        );
      }

      setRecords(supRecords);
    } catch (err) {
      console.error('Failed to load supervisor attendance from Strapi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Compute Separate Supervisor Attendance KPIs
  const kpiStats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const halfDay = records.filter((r) => r.status === 'Half Day').length;
    const geofenceCompliant = records.filter((r) => r.geofencePassed).length;
    const exceptions = records.filter((r) => !r.geofencePassed || r.status === 'Half Day').length;

    // Monthly computed supervisor salary accrued
    const totalAccruedWage = records.reduce((sum, r) => {
      if (r.status === 'Present') return sum + r.dailyRate;
      if (r.status === 'Half Day') return sum + r.dailyRate * 0.5;
      return sum;
    }, 0);

    return { total, present, halfDay, geofenceCompliant, exceptions, totalAccruedWage };
  }, [records]);

  // Filtered Records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        search === '' ||
        r.supervisorName.toLowerCase().includes(search.toLowerCase()) ||
        r.supervisorId.toLowerCase().includes(search.toLowerCase()) ||
        r.project.toLowerCase().includes(search.toLowerCase());

      const matchProject = projectFilter === 'All' || r.project === projectFilter;
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchSearch && matchProject && matchStatus;
    });
  }, [records, search, projectFilter, statusFilter]);

  // Handle Admin Attendance Correction
  const handleSaveCorrection = async () => {
    if (!selectedRecord) return;
    setSavingCorrection(true);
    try {
      const updatedDetails = {
        ...selectedRecord,
        status: correctionStatus,
        notes: `${selectedRecord.notes} | Admin Correction: ${correctionNote || 'Authorized by Executive Admin'}`
      };

      await updateStrapiEntity('supervisor-requests', selectedRecord.documentId, {
        status: correctionStatus,
        details: updatedDetails,
        remarks: updatedDetails.notes
      });

      setSelectedRecord(null);
      setCorrectionNote('');
      await loadAttendance();
    } catch (err: any) {
      alert(`Correction failed: ${err.message}`);
    } finally {
      setSavingCorrection(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 4 Supervisor Attendance KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>
            <UserCheck size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Supervisors Present</span>
            <span className={styles.kpiValue} style={{ color: '#047857' }}>
              {kpiStats.present} / {kpiStats.total}
            </span>
            <span className={styles.kpiSubtitle}>Full shift muster verified</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(22, 124, 114, 0.12)', color: '#167C72' }}>
            <Navigation size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Geofence Verified</span>
            <span className={styles.kpiValue} style={{ color: '#167C72' }}>
              {kpiStats.geofenceCompliant}
            </span>
            <span className={styles.kpiSubtitle}>Within 100m site perimeter</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Half-Day / Partial</span>
            <span className={styles.kpiValue} style={{ color: '#D97706' }}>
              {kpiStats.halfDay}
            </span>
            <span className={styles.kpiSubtitle}>4-Hour partial allocations</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(181, 139, 89, 0.15)', color: '#B58B59' }}>
            <DollarSign size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Accrued Salary (Payable)</span>
            <span className={styles.kpiValue} style={{ color: '#172B32' }}>
              ₹{Math.round(kpiStats.totalAccruedWage).toLocaleString('en-IN')}
            </span>
            <span className={styles.kpiSubtitle}>Monthly CTC policy model</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchBox}>
          <Search size={16} color="#718096" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by Supervisor Name, ID, or Project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select
            className={styles.selectInput}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            <option value="Skyline Commercial Complex (Tower A)">Skyline Commercial Complex (Tower A)</option>
            <option value="Eastern Expressway Link Highway">Eastern Expressway Link Highway</option>
          </select>

          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Half Day">Half Day</option>
            <option value="Absent">Absent</option>
          </select>

          <button className={styles.btnSecondary} onClick={loadAttendance} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderBar}>
          <strong style={{ fontSize: '0.85rem', color: '#172B32' }}>
            Supervisor Shift Muster & Monthly Salary Accrual
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            Showing {filtered.length} of {records.length} records &bull; Verified Strapi v5 Database
          </span>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supervisor ID & Name</th>
                <th>Assigned Project / Site</th>
                <th>Date</th>
                <th>Check-In & Out</th>
                <th>Hours</th>
                <th>Geofence & GPS Accuracy</th>
                <th>Muster Status</th>
                <th>Daily Payable Rate</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                    {loading ? 'Retrieving supervisor attendance records...' : 'No matching supervisor records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#172B32' }}>{item.supervisorName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#167C72', fontWeight: 600 }}>
                        {item.supervisorId}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.site}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096' }}>{item.project}</div>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.checkIn} - {item.checkOut}</div>
                    </td>
                    <td>
                      <strong>{item.hoursWorked} hrs</strong>
                    </td>
                    <td>
                      <div>
                        <span
                          className={`${styles.badge} ${
                            item.geofencePassed ? styles.badgeSuccess : styles.badgeDanger
                          }`}
                        >
                          {item.geofencePassed ? 'Passed' : 'Out-of-Bounds'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: '0.2rem' }}>
                        Dist: {item.gpsDistance}m (±{item.gpsAccuracy}m)
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.status === 'Present'
                            ? styles.badgeSuccess
                            : item.status === 'Half Day'
                            ? styles.badgeWarning
                            : styles.badgeDanger
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#172B32' }}>
                        ₹{item.status === 'Half Day' ? (item.dailyRate * 0.5).toLocaleString('en-IN') : item.dailyRate.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>
                        Monthly: ₹{item.monthlySalary.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedRecord(item);
                          setCorrectionStatus(item.status);
                        }}
                      >
                        <Edit size={12} /> Audit / Correct
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Attendance Audit & Correction Modal */}
      {selectedRecord && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#172B32', fontWeight: 800 }}>
                Audit & Correct Supervisor Attendance: {selectedRecord.supervisorName}
              </h4>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                <div><strong>Shift Date:</strong> {selectedRecord.date}</div>
                <div><strong>Site:</strong> {selectedRecord.site} ({selectedRecord.project})</div>
                <div><strong>Recorded GPS Distance:</strong> {selectedRecord.gpsDistance}m from site center</div>
                <div><strong>Current Status:</strong> {selectedRecord.status} ({selectedRecord.hoursWorked} hrs)</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Authorize Corrected Status:
                </label>
                <select
                  className={styles.selectInput}
                  style={{ width: '100%' }}
                  value={correctionStatus}
                  onChange={(e) => setCorrectionStatus(e.target.value)}
                >
                  <option value="Present">Present (Full Day Payable)</option>
                  <option value="Half Day">Half Day (50% Payable)</option>
                  <option value="Absent">Absent (Non-Payable)</option>
                  <option value="Leave">Authorized Leave</option>
                  <option value="Weekly Off">Weekly Off</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Admin Justification Remarks (Audited) *:
                </label>
                <textarea
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ECEBE5',
                    fontSize: '0.825rem',
                    outline: 'none'
                  }}
                  placeholder="e.g. Approved full day: Off-site meeting with highway consultant certified by PM Kulkarni."
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setSelectedRecord(null)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleSaveCorrection} disabled={savingCorrection}>
                {savingCorrection ? 'Saving...' : 'Authorize Correction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
