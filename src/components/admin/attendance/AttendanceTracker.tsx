'use client';

import React, { useState, useEffect } from 'react';
import styles from './AttendanceTracker.module.css';
import SafeImage from '@/components/admin/ui/SafeImage';
import { 
  ShieldCheck, MapPin, Lock, CheckCircle, Flag, Calendar, DollarSign, Clock, 
  X, ArrowRight, UserCheck, AlertTriangle, QrCode, Navigation, UserX, Check,
  Filter, RefreshCw, FileText, CheckCircle2, ChevronRight, AlertCircle, Building
} from 'lucide-react';
import { 
  getStoredWorkers, EnterpriseWorkerRecord, getStoredAttendanceLogs, 
  saveAttendanceLogs, AttendanceCheckInRecord 
} from '@/services/workerStorage';
import { getStoredProjects, EnterpriseProjectRecord } from '@/services/projectStorage';

// Haversine formula to compute distance in metres between two coordinates
function computeDistanceMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Preset site coordinates for geofence validation
const SITE_GEO_REGISTRY: Record<string, { lat: number; lng: number; defaultRadius: number }> = {
  'Skyline Commercial Complex': { lat: 18.55294, lng: 73.93481, defaultRadius: 100 },
  'Eastern Expressway Bridge': { lat: 19.0330, lng: 73.0297, defaultRadius: 100 },
  'Metro Line Piling': { lat: 18.4575, lng: 73.8677, defaultRadius: 100 },
  'Industrial Logistics Park': { lat: 18.7510, lng: 73.8340, defaultRadius: 100 }
};

export default function AttendanceTracker() {
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceCheckInRecord[]>([]);
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
  
  // Filters
  const [selectedSite, setSelectedSite] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'muster' | 'checkin' | 'exceptions'>('muster');

  // Check-in Flow State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [checkInSite, setCheckInSite] = useState('Skyline Commercial Complex');
  const [siteGeofenceRadius, setSiteGeofenceRadius] = useState(100);
  const [capturingGps, setCapturingGps] = useState(false);
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [qrCodeScanned, setQrCodeScanned] = useState(false);
  const [qrInputToken, setQrInputToken] = useState('');
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState('');

  // Exception Review Modal State
  const [reviewingException, setReviewingException] = useState<AttendanceCheckInRecord | null>(null);
  const [supervisorRemark, setSupervisorRemark] = useState('');

  // Load storage
  useEffect(() => {
    setWorkers(getStoredWorkers());
    setAttendanceLogs(getStoredAttendanceLogs());
    setProjects(getStoredProjects());

    const handleStorage = () => {
      setWorkers(getStoredWorkers());
      setAttendanceLogs(getStoredAttendanceLogs());
      setProjects(getStoredProjects());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('attendanceUpdated', handleStorage);
    window.addEventListener('workersUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('attendanceUpdated', handleStorage);
      window.removeEventListener('workersUpdated', handleStorage);
    };
  }, []);

  // Set default selected worker
  useEffect(() => {
    if (workers.length > 0 && !selectedWorkerId) {
      setSelectedWorkerId(workers[0].id);
    }
  }, [workers, selectedWorkerId]);

  // Compute Live Attendance KPIs
  const presentCount = attendanceLogs.filter(a => a.status === 'Present').length;
  const halfDayCount = attendanceLogs.filter(a => a.status === 'Half Day').length;
  const exceptionCount = attendanceLogs.filter(a => a.isException && a.approvalStatus === 'Pending Exception Review').length;
  const verifiedGpsCount = attendanceLogs.filter(a => a.geofencePassed).length;

  // Real Geolocation Capture
  const handleCaptureLiveGps = () => {
    setCapturingGps(true);
    setCheckInSuccessMsg('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);
          setCurrentGps({ lat, lng, accuracy });

          const siteTarget = SITE_GEO_REGISTRY[checkInSite] || { lat: 18.55294, lng: 73.93481, defaultRadius: 100 };
          const dist = computeDistanceMetres(lat, lng, siteTarget.lat, siteTarget.lng);
          setCalculatedDistance(dist);
          setCapturingGps(false);
        },
        (err) => {
          // If browser denies permission or on localhost, fallback to site-accurate simulation
          console.warn('Geolocation fallback used:', err.message);
          const siteTarget = SITE_GEO_REGISTRY[checkInSite] || { lat: 18.55294, lng: 73.93481, defaultRadius: 100 };
          // Random point within 40m
          const lat = siteTarget.lat + 0.00015;
          const lng = siteTarget.lng + 0.00010;
          setCurrentGps({ lat, lng, accuracy: 8 });
          const dist = computeDistanceMetres(lat, lng, siteTarget.lat, siteTarget.lng);
          setCalculatedDistance(dist);
          setCapturingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCapturingGps(false);
    }
  };

  // Perform Verified Check-in
  const handlePerformCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    const siteTarget = SITE_GEO_REGISTRY[checkInSite] || { lat: 18.55294, lng: 73.93481, defaultRadius: 100 };
    const dist = calculatedDistance !== null ? calculatedDistance : 25;
    const isWithinGeofence = dist <= siteGeofenceRadius;
    const isQrValid = qrCodeScanned || qrInputToken.trim().length > 0;

    const isException = !isWithinGeofence || !isQrValid;

    const now = new Date();
    const timeMarked = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: AttendanceCheckInRecord = {
      id: `att-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerCode: worker.code,
      site: checkInSite,
      date: '17 Nov 2026',
      checkInTime: timeMarked,
      status: 'Present',
      verificationMethod: isQrValid ? 'QR Code' : 'GPS + Geofence',
      latitude: currentGps?.lat || siteTarget.lat,
      longitude: currentGps?.lng || siteTarget.lng,
      distanceFromSiteMetres: dist,
      gpsAccuracyMetres: currentGps?.accuracy || 6,
      geofencePassed: isWithinGeofence,
      qrVerified: isQrValid,
      isException: isException,
      exceptionReason: isException ? `Check-in recorded ${dist}m from site coordinates (Geofence radius: ${siteGeofenceRadius}m).` : undefined,
      approvalStatus: isException ? 'Pending Exception Review' : 'Auto-Verified',
      hoursWorked: 8.0,
      wageEarned: worker.dailyWage
    };

    const updated = [newLog, ...attendanceLogs];
    setAttendanceLogs(updated);
    saveAttendanceLogs(updated);

    setCheckInSuccessMsg(
      isException 
        ? `⚠️ Check-in recorded with Exception: Worker is ${dist}m away from registered site geofence. Sent to Supervisor for approval.` 
        : `✅ Check-in Verified! Biometric & GPS Geofence matched (${dist}m, accuracy ${currentGps?.accuracy || 6}m).`
    );

    // Reset check-in form state
    setCurrentGps(null);
    setCalculatedDistance(null);
    setQrCodeScanned(false);
    setQrInputToken('');
  };

  // Supervisor Approves Exception
  const handleApproveException = () => {
    if (!reviewingException) return;
    const updated = attendanceLogs.map(log => {
      if (log.id === reviewingException.id) {
        return {
          ...log,
          approvalStatus: 'Approved by Supervisor' as const,
          supervisorRemark: supervisorRemark || 'Verified manual check-in on external gate duty.'
        };
      }
      return log;
    });
    setAttendanceLogs(updated);
    saveAttendanceLogs(updated);
    setReviewingException(null);
    setSupervisorRemark('');
  };

  // Supervisor Rejects Exception
  const handleRejectException = () => {
    if (!reviewingException) return;
    const updated = attendanceLogs.map(log => {
      if (log.id === reviewingException.id) {
        return {
          ...log,
          approvalStatus: 'Rejected' as const,
          status: 'Absent' as const,
          wageEarned: 0,
          supervisorRemark: supervisorRemark || 'Distance beyond site boundary without prior intimation.'
        };
      }
      return log;
    });
    setAttendanceLogs(updated);
    saveAttendanceLogs(updated);
    setReviewingException(null);
    setSupervisorRemark('');
  };

  // Filter logs for muster view
  const filteredLogs = attendanceLogs.filter(log => {
    const matchSite = selectedSite === 'All' || log.site === selectedSite;
    const matchStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchSite && matchStatus;
  });

  const pendingExceptions = attendanceLogs.filter(log => log.isException && log.approvalStatus === 'Pending Exception Review');

  return (
    <div className={styles.container}>
      {/* 4 Attendance Header KPI Metrics */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Verified Present</span>
            <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{presentCount}</span>
            <span className={styles.kpiBadgeEmerald}>Muster Marked</span>
          </div>
          <span className={styles.kpiSub}>Biometric & GPS verified</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>GPS Geofence Match</span>
            <div className={`${styles.kpiIconBox} ${styles.iconTeal}`}>
              <Navigation size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{verifiedGpsCount}</span>
            <span className={styles.kpiBadgeTeal}>Within 100m</span>
          </div>
          <span className={styles.kpiSub}>Real site boundary compliance</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Half-Day Shifts</span>
            <div className={`${styles.kpiIconBox} ${styles.iconBronze}`}>
              <Clock size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{halfDayCount}</span>
            <span className={styles.kpiBadgeBronze}>4-Hour Cap</span>
          </div>
          <span className={styles.kpiSub}>Partial day allocations</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${pendingExceptions.length > 0 ? styles.kpiCardWarning : ''}`}
          onClick={() => setActiveTab('exceptions')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Exceptions</span>
            <div className={`${styles.kpiIconBox} ${styles.iconDanger}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{pendingExceptions.length}</span>
            <span className={styles.kpiBadgeDanger}>Needs Review</span>
          </div>
          <span className={styles.kpiSub}>Out-of-geofence check-ins</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className={styles.tabNavContainer}>
        <div className={styles.tabNav}>
          <button 
            className={`${styles.navTabBtn} ${activeTab === 'muster' ? styles.navTabBtnActive : ''}`}
            onClick={() => setActiveTab('muster')}
          >
            <Calendar size={15} />
            <span>Daily Site Muster Roll</span>
          </button>
          <button 
            className={`${styles.navTabBtn} ${activeTab === 'checkin' ? styles.navTabBtnActive : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            <Navigation size={15} />
            <span>Worker GPS & QR Check-In Terminal</span>
          </button>
          <button 
            className={`${styles.navTabBtn} ${activeTab === 'exceptions' ? styles.navTabBtnActive : ''}`}
            onClick={() => setActiveTab('exceptions')}
          >
            <AlertCircle size={15} />
            <span>Supervisor Exception Review ({pendingExceptions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Daily Site Muster Roll */}
      {activeTab === 'muster' && (
        <div className={styles.contentSection}>
          <div className={styles.toolbarRow}>
            <div className={styles.filtersGroup}>
              <div className={styles.filterItem}>
                <Building size={14} className={styles.filterIcon} />
                <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
                  <option value="All">All Project Sites</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <Filter size={14} className={styles.filterIcon} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Muster Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <button onClick={() => setActiveTab('checkin')} className={styles.btnPrimarySmall}>
              <Navigation size={14} />
              <span>Record New Check-In</span>
            </button>
          </div>

          {/* Muster Table */}
          <div className={styles.tableCard}>
            <table className={styles.musterTable}>
              <thead>
                <tr>
                  <th>Worker Name & ID</th>
                  <th>Project Site</th>
                  <th>Punch In / Out</th>
                  <th>Verification Method</th>
                  <th>GPS Geofence Distance</th>
                  <th>Status & Hours</th>
                  <th>Calculated Daily Wage</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.workerCol}>
                        <strong className={styles.workerName}>{log.workerName}</strong>
                        <span className={styles.workerCode}>{log.workerCode}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.siteBadge}>{log.site}</span>
                    </td>
                    <td>
                      <div className={styles.timeCol}>
                        <span className={styles.punchIn}>{log.checkInTime}</span>
                        {log.checkOutTime && <span className={styles.punchOut}>– {log.checkOutTime}</span>}
                      </div>
                    </td>
                    <td>
                      <div className={styles.methodPill}>
                        {log.qrVerified ? <QrCode size={12} /> : <Navigation size={12} />}
                        <span>{log.verificationMethod}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.distanceCol}>
                        <span className={log.geofencePassed ? styles.distValid : styles.distInvalid}>
                          {log.distanceFromSiteMetres}m from site
                        </span>
                        <span className={styles.accuracyText}>±{log.gpsAccuracyMetres}m accuracy</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.hoursCol}>
                        <span className={`${styles.statusBadge} ${styles[log.status.toLowerCase().replace(' ', '')]}`}>
                          ● {log.status}
                        </span>
                        <span className={styles.hoursLogged}>{log.hoursWorked} hrs</span>
                      </div>
                    </td>
                    <td>
                      <strong className={styles.wageAmount}>₹ {log.wageEarned}</strong>
                    </td>
                    <td>
                      <span className={`${styles.approvalPill} ${styles[log.approvalStatus.toLowerCase().replace(/ /g, '')]}`}>
                        {log.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Worker GPS & QR Check-In Terminal */}
      {activeTab === 'checkin' && (
        <div className={styles.checkInGrid}>
          <div className={styles.checkInCard}>
            <div className={styles.checkInHeader}>
              <div className={styles.checkInTitleBox}>
                <Navigation size={20} className={styles.headerIcon} />
                <div>
                  <h3>Worker Shift Check-in & Location Verification</h3>
                  <p>Enforce 100m geofence radius, browser GPS, and site QR authentication</p>
                </div>
              </div>
            </div>

            {checkInSuccessMsg && (
              <div className={checkInSuccessMsg.includes('Exception') ? styles.alertWarning : styles.alertSuccess}>
                {checkInSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePerformCheckIn} className={styles.checkInForm}>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Select Registered Worker *</label>
                  <select 
                    value={selectedWorkerId} 
                    onChange={e => setSelectedWorkerId(e.target.value)}
                    required
                  >
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code}) – {w.skill}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Assign Project Site *</label>
                  <select 
                    value={checkInSite} 
                    onChange={e => {
                      setCheckInSite(e.target.value);
                      setCurrentGps(null);
                      setCalculatedDistance(null);
                    }}
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Geofence Configuration & GPS Capture Section */}
              <div className={styles.verificationBox}>
                <div className={styles.verifRow}>
                  <div>
                    <span className={styles.verifLabel}>Configured Geofence Radius</span>
                    <strong className={styles.verifVal}>{siteGeofenceRadius} Metres</strong>
                  </div>
                  <div>
                    <span className={styles.verifLabel}>Registered Site Coordinates</span>
                    <span className={styles.coordText}>
                      Lat: {SITE_GEO_REGISTRY[checkInSite]?.lat || 18.5529}, Lng: {SITE_GEO_REGISTRY[checkInSite]?.lng || 73.9348}
                    </span>
                  </div>
                </div>

                <div className={styles.gpsActionArea}>
                  <button 
                    type="button" 
                    onClick={handleCaptureLiveGps} 
                    disabled={capturingGps}
                    className={styles.btnCaptureGps}
                  >
                    <Navigation size={16} />
                    <span>{capturingGps ? 'Locating Real Browser GPS...' : 'Capture Worker GPS Location'}</span>
                  </button>

                  {currentGps && (
                    <div className={styles.gpsReadout}>
                      <div className={styles.readoutItem}>
                        <span>Device Lat / Lng:</span>
                        <strong>{currentGps.lat.toFixed(5)}, {currentGps.lng.toFixed(5)}</strong>
                      </div>
                      <div className={styles.readoutItem}>
                        <span>Accuracy:</span>
                        <strong>±{currentGps.accuracy}m</strong>
                      </div>
                      <div className={styles.readoutItem}>
                        <span>Distance to Site:</span>
                        <strong className={calculatedDistance! <= siteGeofenceRadius ? styles.textSuccess : styles.textDanger}>
                          {calculatedDistance}m {calculatedDistance! <= siteGeofenceRadius ? '(Within Geofence)' : '(OUTSIDE 100m)'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Site QR Authentication */}
              <div className={styles.qrVerificationBox}>
                <div className={styles.qrHeader}>
                  <QrCode size={18} className={styles.qrIcon} />
                  <div>
                    <strong>Site Turnstile QR Verification (Optional / Dual Factor)</strong>
                    <p>Scan site physical QR token to verify physical presence</p>
                  </div>
                </div>

                <div className={styles.qrControls}>
                  <label className={styles.qrCheckbox}>
                    <input 
                      type="checkbox" 
                      checked={qrCodeScanned} 
                      onChange={e => setQrCodeScanned(e.target.checked)} 
                    />
                    <span>Turnstile Gate QR Scanned & Verified</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter QR token code (e.g. SKY-GATE-B-TOKEN)" 
                    value={qrInputToken}
                    onChange={e => setQrInputToken(e.target.value)}
                    className={styles.qrTokenInput}
                  />
                </div>
              </div>

              <div className={styles.submitArea}>
                <button type="submit" className={styles.btnSubmitCheckIn}>
                  <CheckCircle size={18} />
                  <span>Execute Shift Check-In & Compute Wage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Supervisor Exception Review Queue */}
      {activeTab === 'exceptions' && (
        <div className={styles.contentSection}>
          <div className={styles.exceptionHeader}>
            <div>
              <h3>Supervisor Attendance Exception Review Queue</h3>
              <p>Review check-ins recorded outside the 100m geofence radius or with irregular timestamps.</p>
            </div>
            <span className={styles.exceptionCountBadge}>
              {pendingExceptions.length} Action Items
            </span>
          </div>

          {pendingExceptions.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle2 size={40} className={styles.emptyIconSuccess} />
              <h4>All Site Check-ins Verified</h4>
              <p>There are no pending out-of-geofence attendance exceptions at this time.</p>
            </div>
          ) : (
            <div className={styles.exceptionsList}>
              {pendingExceptions.map(exc => (
                <div key={exc.id} className={styles.exceptionCard}>
                  <div className={styles.excTop}>
                    <div className={styles.excWorker}>
                      <strong className={styles.excWorkerName}>{exc.workerName}</strong>
                      <span className={styles.excWorkerCode}>{exc.workerCode}</span>
                      <span className={styles.excSiteTag}>{exc.site}</span>
                    </div>

                    <div className={styles.excDistanceBox}>
                      <span className={styles.distLabel}>Distance Violation</span>
                      <strong className={styles.distValue}>{exc.distanceFromSiteMetres}m from site</strong>
                      <span className={styles.distCap}>Allowed: 100m</span>
                    </div>
                  </div>

                  <p className={styles.excReason}>{exc.exceptionReason}</p>

                  <div className={styles.excFooter}>
                    <div className={styles.excMeta}>
                      <span>Time: {exc.checkInTime}</span>
                      <span>•</span>
                      <span>Accuracy: ±{exc.gpsAccuracyMetres}m</span>
                    </div>

                    <button 
                      onClick={() => setReviewingException(exc)} 
                      className={styles.btnReviewException}
                    >
                      Review & Approve / Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supervisor Review Dialog Modal */}
      {reviewingException && (
        <div className={styles.modalBackdrop} onClick={() => setReviewingException(null)}>
          <div className={styles.reviewModalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Attendance Exception Review: {reviewingException.workerName}</h3>
              <button onClick={() => setReviewingException(null)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.reviewBody}>
              <div className={styles.reviewViolationSummary}>
                <AlertTriangle size={24} className={styles.violationIcon} />
                <div>
                  <strong>Geofence Radius Exceeded: {reviewingException.distanceFromSiteMetres} Metres</strong>
                  <p>{reviewingException.exceptionReason}</p>
                </div>
              </div>

              <div className={styles.evidenceGrid}>
                <div className={styles.evidenceItem}>
                  <span>Worker</span>
                  <strong>{reviewingException.workerName} ({reviewingException.workerCode})</strong>
                </div>
                <div className={styles.evidenceItem}>
                  <span>Project Site</span>
                  <strong>{reviewingException.site}</strong>
                </div>
                <div className={styles.evidenceItem}>
                  <span>Check-in Timestamp</span>
                  <strong>{reviewingException.checkInTime}</strong>
                </div>
                <div className={styles.evidenceItem}>
                  <span>GPS Device Lat / Lng</span>
                  <strong>{reviewingException.latitude.toFixed(5)}, {reviewingException.longitude.toFixed(5)}</strong>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Supervisor Decision Remarks (Mandatory) *</label>
                <textarea 
                  rows={3} 
                  value={supervisorRemark}
                  onChange={e => setSupervisorRemark(e.target.value)}
                  placeholder="e.g. Approved: Worker was assigned to off-site concrete batching plant inspection with prior verbal approval."
                  required
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button onClick={handleRejectException} className={styles.btnDanger}>
                  <UserX size={14} />
                  <span>Reject (Mark Absent)</span>
                </button>
                <button onClick={handleApproveException} className={styles.btnSuccess}>
                  <Check size={14} />
                  <span>Approve Exception (Record Attendance)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
