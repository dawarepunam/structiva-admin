'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SupervisorSettings.module.css';
import {
  Settings,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  MapPin,
  Bell,
  Shield,
  Clock,
  Globe,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Database,
  Trash2,
  LogOut,
  Radio,
  Save,
  Server,
  Layers,
  Info
} from 'lucide-react';
import {
  STRAPI_BASE_URL,
  getOfflineQueue,
  saveOfflineQueue,
  syncOfflineQueue,
  fetchStrapiCollection,
  updateStrapiEntity,
  createStrapiEntity,
  OfflineQueueItem
} from '@/services/strapiClient';
import { useRouter } from 'next/navigation';

export interface SupervisorPreferences {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  defaultLandingPage: string;
  themeContrast: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  notifications: {
    dprUpdates: boolean;
    attendanceReminders: boolean;
    approvalStatusUpdates: boolean;
    materialRequestUpdates: boolean;
    siteIssuesUpdates: boolean;
    taskAssignments: boolean;
    importantAnnouncements: boolean;
  };
  geofence: {
    enforced: boolean;
    radiusMetres: number;
    assignedSite: string;
    assignedSiteLatitude: number;
    assignedSiteLongitude: number;
  };
}

const DEFAULT_PREFERENCES: SupervisorPreferences = {
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  timezone: 'Asia/Kolkata',
  defaultLandingPage: '/supervisor/dashboard',
  themeContrast: 'Standard High Contrast',
  autoSync: true,
  syncIntervalMinutes: 5,
  notifications: {
    dprUpdates: true,
    attendanceReminders: true,
    approvalStatusUpdates: true,
    materialRequestUpdates: true,
    siteIssuesUpdates: true,
    taskAssignments: true,
    importantAnnouncements: true
  },
  geofence: {
    enforced: true,
    radiusMetres: 100,
    assignedSite: 'Tower A — Skyline Commercial Complex',
    assignedSiteLatitude: 18.55294,
    assignedSiteLongitude: 73.93481
  }
};

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: 'SAVE_SETTINGS' | 'SYNC_NOW' | 'RETRY_SYNC' | 'DISABLE_AUTO_SYNC' | 'CLEAR_CACHE' | 'REQUEST_LOCATION' | 'LOGOUT' | null;
  onConfirm: () => Promise<void> | void;
  confirmBtnLabel: string;
  isDanger?: boolean;
}

export default function SupervisorSettingsView() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'preferences' | 'connectivity' | 'offline' | 'geofence' | 'notifications' | 'security'>('preferences');

  // Preferences State
  const [prefs, setPrefs] = useState<SupervisorPreferences>(DEFAULT_PREFERENCES);
  const [strapiDocId, setStrapiDocId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Connectivity Telemetry State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [backendLatencyMs, setBackendLatencyMs] = useState<number | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<string>('Never');
  const [backendStatus, setBackendStatus] = useState<'Connected' | 'Degraded' | 'Offline'>('Connected');
  const [healthChecking, setHealthChecking] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('19 Nov 2026, 12:45 PM');

  // Offline Queue State
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [syncingNow, setSyncingNow] = useState<boolean>(false);

  // Geolocation State
  const [geoPermission, setGeoPermission] = useState<'granted' | 'prompt' | 'denied' | 'unsupported'>('prompt');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [distanceFromSite, setDistanceFromSite] = useState<number | null>(null);
  const [insideGeofence, setInsideGeofence] = useState<boolean | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  // Active Session details
  const [sessionInfo, setSessionInfo] = useState<{
    supervisorName: string;
    email: string;
    role: string;
    browser: string;
    os: string;
    ipAddress: string;
    loginTime: string;
  }>({
    supervisorName: 'Er. Pravin Gaikwad',
    email: 'p.gaikwad@structiva.internal',
    role: 'Chief Field Supervisor',
    browser: 'Chrome / Edge Desktop',
    os: 'Windows 11',
    ipAddress: '127.0.0.1 (Local Workstation)',
    loginTime: '19 Nov 2026, 08:30 AM'
  });

  // Modal Dialog State
  const [dialog, setDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    message: '',
    actionType: null,
    onConfirm: () => {},
    confirmBtnLabel: 'Confirm'
  });

  // Helper to calculate distance between two coordinates in metres (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Perform Real Strapi Health Check
  const checkBackendHealth = useCallback(async () => {
    setHealthChecking(true);
    const start = performance.now();
    try {
      const res = await fetch(`${STRAPI_BASE_URL}/_health`, {
        method: 'GET',
        cache: 'no-store'
      });
      const duration = Math.round(performance.now() - start);
      setBackendLatencyMs(duration);
      const now = new Date();
      setLastHealthCheck(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (res.status === 204 || res.status === 200) {
        setBackendStatus('Connected');
      } else {
        setBackendStatus('Degraded');
      }
    } catch {
      setBackendStatus('Offline');
      setBackendLatencyMs(null);
    } finally {
      setHealthChecking(false);
    }
  }, []);

  // Real Geolocation Check
  const checkCurrentLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoPermission('unsupported');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPermission('granted');
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy * 10) / 10
        };
        setCurrentCoords(coords);

        // Distance from assigned site
        const dist = calculateDistance(
          coords.lat,
          coords.lng,
          prefs.geofence.assignedSiteLatitude,
          prefs.geofence.assignedSiteLongitude
        );
        setDistanceFromSite(dist);
        setInsideGeofence(dist <= prefs.geofence.radiusMetres);
        setLocating(false);
      },
      (err) => {
        if (err.code === 1) {
          setGeoPermission('denied');
        } else {
          setGeoPermission('prompt');
        }
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [prefs.geofence.assignedSiteLatitude, prefs.geofence.assignedSiteLongitude, prefs.geofence.radiusMetres]);

  // Load Preferences from Strapi on mount
  useEffect(() => {
    async function loadData() {
      setInitialLoading(true);

      // Check session in localStorage
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('structiva_supervisor_session');
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            setSessionInfo((prev) => ({
              ...prev,
              supervisorName: parsed.username || prev.supervisorName,
              email: parsed.email || prev.email,
              role: parsed.role || prev.role
            }));
          } catch {}
        }

        // Online listener
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Permissions API
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            setGeoPermission(result.state as any);
            result.onchange = () => setGeoPermission(result.state as any);
          }).catch(() => {});
        }
      }

      // Fetch queue from local storage
      setOfflineQueue(getOfflineQueue());

      // Fetch Strapi supervisor preferences
      try {
        const allRequests = await fetchStrapiCollection<any>('supervisor-requests', []);
        const prefItem = allRequests.find(
          (item) => item.requestType === 'Supervisor Preferences' || item.documentId === 'pref_supervisor_pravin_01'
        );

        if (prefItem && prefItem.details) {
          setStrapiDocId(prefItem.documentId);
          setPrefs((prev) => ({
            ...prev,
            ...prefItem.details
          }));
        }
      } catch (e) {
        console.warn('Could not load Strapi preferences, using cached defaults', e);
      } finally {
        setInitialLoading(false);
      }

      // Run health check
      checkBackendHealth();
    }

    loadData();
  }, [checkBackendHealth]);

  // Trigger real location check if permission granted
  useEffect(() => {
    if (geoPermission === 'granted') {
      checkCurrentLocation();
    }
  }, [geoPermission, checkCurrentLocation]);

  // Save Preferences to Strapi
  const handleSavePreferences = async () => {
    setSaveLoading(true);
    setAlertMsg(null);

    try {
      if (strapiDocId) {
        const res = await updateStrapiEntity('supervisor-requests', strapiDocId, {
          details: prefs,
          updatedAt: new Date().toISOString()
        });
        if (res) {
          setAlertMsg({ type: 'success', text: 'Supervisor preferences successfully updated and synced with Strapi central backend.' });
        } else {
          setAlertMsg({ type: 'error', text: 'Backend rejected update. Please check network connectivity.' });
        }
      } else {
        const created = await createStrapiEntity<any>('supervisor-requests', {
          requestType: 'Supervisor Preferences',
          title: `User Settings & Operational Preferences: ${sessionInfo.supervisorName}`,
          project: 'Skyline Commercial Complex (Tower A)',
          site: 'Tower A',
          category: 'Configuration',
          priority: 'Standard',
          status: 'Active',
          details: prefs,
          remarks: 'Supervisor operational preferences record',
          submittedBy: `${sessionInfo.supervisorName} (Chief Supervisor)`,
          submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
        if (created && (created as any).documentId) {
          setStrapiDocId((created as any).documentId);
          setAlertMsg({ type: 'success', text: 'Supervisor preferences created and saved into Strapi v5 database.' });
        } else {
          setAlertMsg({ type: 'error', text: 'Failed to create preferences in Strapi.' });
        }
      }

      // Also persist to localStorage for instant local loading
      if (typeof window !== 'undefined') {
        localStorage.setItem('structiva_supervisor_prefs_cache', JSON.stringify(prefs));
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: `Sync error: ${err.message || 'Unknown network failure'}` });
    } finally {
      setSaveLoading(false);
    }
  };

  // Perform Sync Now
  const handleSyncNow = async () => {
    setSyncingNow(true);
    setAlertMsg(null);
    try {
      const result = await syncOfflineQueue();
      setOfflineQueue(getOfflineQueue());
      const nowStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      setAlertMsg({
        type: 'success',
        text: `Sync complete: ${result.synced} item(s) pushed to Strapi. Failed / remaining: ${result.failed}.`
      });
    } catch {
      setAlertMsg({ type: 'error', text: 'Failed to synchronize queue with central Strapi instance.' });
    } finally {
      setSyncingNow(false);
    }
  };

  // Clear Local Cache (Protected: Only synced/stale items; NEVER pending items)
  const handleClearCache = () => {
    if (typeof window === 'undefined') return;
    const currentQueue = getOfflineQueue();
    const pendingCount = currentQueue.filter((i) => i.status === 'Pending' || i.status === 'Syncing').length;

    if (pendingCount > 0) {
      setAlertMsg({
        type: 'error',
        text: `Cannot clear cache: There are ${pendingCount} unsynchronized field records in the offline buffer. Synchronize first to prevent data loss.`
      });
      return;
    }

    // Safe purge of temporary keys
    localStorage.removeItem('structiva_supervisor_prefs_cache');
    setAlertMsg({ type: 'success', text: 'Temporary cache cleared safely. Zero unsynchronized records were harmed.' });
  };

  // Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('structiva_supervisor_session');
    }
    router.push('/supervisor/login');
  };

  // Trigger Modal
  const openConfirm = (
    title: string,
    message: string,
    actionType: ConfirmationDialogState['actionType'],
    onConfirm: () => Promise<void> | void,
    confirmBtnLabel: string = 'Confirm',
    isDanger: boolean = false
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      actionType,
      onConfirm,
      confirmBtnLabel,
      isDanger
    });
  };

  const closeConfirm = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>
            <Settings size={26} color="#167C72" /> Supervisor Node Settings
          </h2>
          <p>
            Central Strapi backend synchronization, geofence parameters, offline queue control, and node preferences.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.btnSecondary}
            onClick={() => checkBackendHealth()}
            disabled={healthChecking}
          >
            <RefreshCw size={15} className={healthChecking ? 'spin' : ''} />
            {healthChecking ? 'Pinging...' : 'Ping Backend'}
          </button>

          <button
            className={styles.btnPrimary}
            onClick={() =>
              openConfirm(
                'Save Settings to Central Strapi',
                'Are you sure you want to commit your operational and display preferences to the Strapi backend?',
                'SAVE_SETTINGS',
                handleSavePreferences,
                'Save Changes'
              )
            }
            disabled={saveLoading || initialLoading}
          >
            <Save size={15} />
            {saveLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {alertMsg && (
        <div className={alertMsg.type === 'success' ? styles.alertSuccess : styles.alertError}>
          {alertMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Sliders size={16} /> Preferences
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'connectivity' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('connectivity')}
        >
          <Server size={16} /> Backend Connectivity
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'offline' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('offline')}
        >
          <HardDrive size={16} /> Offline & Sync Buffer
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'geofence' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('geofence')}
        >
          <MapPin size={16} /> Location & Geofence
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'notifications' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} /> Notification Channels
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} /> Session & Security
        </button>
      </div>

      {/* TAB 1: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Globe size={18} color="#167C72" /> Regional & Localization
                </h3>
                <p className={styles.cardSubtitle}>Configure date format, timezone and field language</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Field Language</div>
                <p className={styles.fieldDesc}>Operating language for forms, indents, and inspection lists</p>
              </div>
              <div className={styles.inputControl}>
                <select
                  className={styles.select}
                  value={prefs.language}
                  onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                >
                  <option value="en">English (India - Metric)</option>
                  <option value="mr">मराठी (Regional Pune/MH)</option>
                  <option value="hi">हिन्दी (National)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Date Display Format</div>
                <p className={styles.fieldDesc}>Standard enterprise format for DPRs and delivery logs</p>
              </div>
              <div className={styles.inputControl}>
                <select
                  className={styles.select}
                  value={prefs.dateFormat}
                  onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (19/11/2026)</option>
                  <option value="DD-MMM-YYYY">DD-MMM-YYYY (19-Nov-2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Time Format</div>
                <p className={styles.fieldDesc}>Shift logs, fuel disbursement and telemetry stamps</p>
              </div>
              <div className={styles.inputControl}>
                <select
                  className={styles.select}
                  value={prefs.timeFormat}
                  onChange={(e) => setPrefs({ ...prefs, timeFormat: e.target.value as '12h' | '24h' })}
                >
                  <option value="12h">12-Hour (02:30 PM)</option>
                  <option value="24h">24-Hour (14:30)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Timezone Authority</div>
                <p className={styles.fieldDesc}>Locked to Maharashtra Site Operations Time</p>
              </div>
              <div className={styles.inputControl}>
                <input
                  type="text"
                  className={styles.textInput}
                  value="Asia/Kolkata (IST +05:30)"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Layers size={18} color="#167C72" /> Application Display
                </h3>
                <p className={styles.cardSubtitle}>Landing workspace and visual contrast</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Default Landing Workspace</div>
                <p className={styles.fieldDesc}>Route loaded immediately after login</p>
              </div>
              <div className={styles.inputControl}>
                <select
                  className={styles.select}
                  value={prefs.defaultLandingPage}
                  onChange={(e) => setPrefs({ ...prefs, defaultLandingPage: e.target.value })}
                >
                  <option value="/supervisor/dashboard">Chief Supervisor Dashboard</option>
                  <option value="/supervisor/activities">Activities & Tasks</option>
                  <option value="/supervisor/dpr">Daily Progress Reports (DPR)</option>
                  <option value="/supervisor/attendance">Attendance & Geofence</option>
                  <option value="/supervisor/material-requests">Material Requisitions</option>
                  <option value="/supervisor/requests">Approvals & Submissions</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Sunlight Contrast Mode</div>
                <p className={styles.fieldDesc}>Optimized for outdoor tablet/laptop daylight visibility</p>
              </div>
              <div className={styles.inputControl}>
                <select
                  className={styles.select}
                  value={prefs.themeContrast}
                  onChange={(e) => setPrefs({ ...prefs, themeContrast: e.target.value })}
                >
                  <option value="Standard High Contrast">Standard High Contrast (Recommended)</option>
                  <option value="Soft Stone">Soft Stone Warm Neutral</option>
                  <option value="Outdoor High Lux">Outdoor High Lux (Pure Monochrome)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BACKEND CONNECTIVITY */}
      {activeTab === 'connectivity' && (
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Server size={18} color="#167C72" /> Central Strapi Server Node
                </h3>
                <p className={styles.cardSubtitle}>Live telemetry and health monitoring with core database</p>
              </div>
              <span
                className={`${styles.badge} ${
                  backendStatus === 'Connected'
                    ? styles.badgeSuccess
                    : backendStatus === 'Degraded'
                    ? styles.badgeWarning
                    : styles.badgeDanger
                }`}
              >
                {backendStatus === 'Connected' ? (
                  <CheckCircle size={12} />
                ) : (
                  <AlertTriangle size={12} />
                )}
                {backendStatus}
              </span>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Configured Host URL</div>
                <p className={styles.fieldDesc}>Base API endpoint for REST resources and collection types</p>
              </div>
              <div className={styles.inputControl} style={{ minWidth: '280px' }}>
                <input
                  type="text"
                  className={styles.textInput}
                  value={STRAPI_BASE_URL}
                  disabled
                />
              </div>
            </div>

            <div className={styles.telemetryGrid}>
              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Response Latency</div>
                <div className={styles.statValue}>
                  {backendLatencyMs !== null ? `${backendLatencyMs} ms` : 'Unreachable'}
                </div>
                <div className={styles.statNote}>Real HTTP ping duration</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Last Health Ping</div>
                <div className={styles.statValue}>{lastHealthCheck}</div>
                <div className={styles.statNote}>Endpoint: /_health</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Client Network Link</div>
                <div className={styles.statValue}>
                  {isOnline ? 'Online (LAN/4G)' : 'Offline (Disconnected)'}
                </div>
                <div className={styles.statNote}>Browser Network Status</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Last Master Sync</div>
                <div className={styles.statValue}>{lastSyncTime}</div>
                <div className={styles.statNote}>Bidirectional payload sync</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                className={styles.btnSecondary}
                onClick={checkBackendHealth}
                disabled={healthChecking}
              >
                <RefreshCw size={14} className={healthChecking ? 'spin' : ''} />
                {healthChecking ? 'Checking...' : 'Check Connection / Retry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE & SYNC BUFFER */}
      {activeTab === 'offline' && (
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <HardDrive size={18} color="#167C72" /> Field Offline Sync Buffer
                </h3>
                <p className={styles.cardSubtitle}>
                  Zero Data Loss Protocol: In-flight indents, attendance, and expense entries are buffered locally.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() =>
                    openConfirm(
                      'Clear Local Cache',
                      'This will purge local cached views while strictly protecting any pending unsynced records. Continue?',
                      'CLEAR_CACHE',
                      handleClearCache,
                      'Clear Cache'
                    )
                  }
                >
                  <Trash2 size={14} /> Clear Cache
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={() =>
                    openConfirm(
                      'Sync Pending Offline Records',
                      `Flush and push ${offlineQueue.length} pending record(s) to the Strapi central database now?`,
                      'SYNC_NOW',
                      handleSyncNow,
                      'Synchronize Now'
                    )
                  }
                  disabled={syncingNow || offlineQueue.length === 0}
                >
                  <RefreshCw size={14} className={syncingNow ? 'spin' : ''} />
                  {syncingNow ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Automated Periodic Background Sync</div>
                <p className={styles.fieldDesc}>
                  Automatically synchronize pending local queue items as soon as connectivity is detected.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={prefs.autoSync}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (!checked) {
                      openConfirm(
                        'Disable Auto-Sync?',
                        'Disabling automated sync means field changes will remain queued locally until you manually click "Sync Now".',
                        'DISABLE_AUTO_SYNC',
                        () => setPrefs({ ...prefs, autoSync: false }),
                        'Disable'
                      );
                    } else {
                      setPrefs({ ...prefs, autoSync: true });
                    }
                  }}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.telemetryGrid}>
              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Pending Sync Records</div>
                <div className={styles.statValue}>
                  {offlineQueue.filter((i) => i.status === 'Pending').length}
                </div>
                <div className={styles.statNote}>Awaiting network push</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Failed Submissions</div>
                <div className={styles.statValue} style={{ color: '#DC2626' }}>
                  {offlineQueue.filter((i) => i.status === 'Failed').length}
                </div>
                <div className={styles.statNote}>Requires manual retry</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Total Buffer Items</div>
                <div className={styles.statValue}>{offlineQueue.length}</div>
                <div className={styles.statNote}>IndexedDB / LocalStorage</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Buffer Health</div>
                <div className={styles.statValue} style={{ color: '#047857' }}>
                  Optimal
                </div>
                <div className={styles.statNote}>Zero Data Loss active</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className={styles.fieldLabel} style={{ marginBottom: '0.5rem' }}>
                Active Queue Inspect
              </div>
              {offlineQueue.length === 0 ? (
                <div
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E0',
                    color: '#718096',
                    fontSize: '0.85rem'
                  }}
                >
                  <CheckCircle size={22} color="#047857" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>All field submissions are 100% synchronized with Strapi backend. Queue is empty.</div>
                </div>
              ) : (
                <div className={styles.queueList}>
                  {offlineQueue.map((item) => (
                    <div key={item.id} className={styles.queueItem}>
                      <div>
                        <strong>{item.method}</strong> <code>/{item.endpoint}</code>
                        <span style={{ marginLeft: '0.5rem', color: '#718096' }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          item.status === 'Pending'
                            ? styles.badgeWarning
                            : item.status === 'Syncing'
                            ? styles.badgeInfo
                            : styles.badgeDanger
                        }`}
                      >
                        {item.status} ({item.retryCount} retries)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOCATION & GEOFENCE */}
      {activeTab === 'geofence' && (
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <MapPin size={18} color="#167C72" /> Location & Site Geofence Verification
                </h3>
                <p className={styles.cardSubtitle}>
                  Attendance, biometric verification, and diesel disbursement are verified against the authorized site coordinates.
                </p>
              </div>

              <button
                className={styles.btnSecondary}
                onClick={checkCurrentLocation}
                disabled={locating}
              >
                <Radio size={14} className={locating ? 'spin' : ''} />
                {locating ? 'Acquiring GPS...' : 'Acquire Current GPS'}
              </button>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Assigned Site Operational Jurisdiction</div>
                <p className={styles.fieldDesc}>Admin-controlled site assignment for Er. Pravin Gaikwad</p>
              </div>
              <div className={styles.inputControl} style={{ minWidth: '280px' }}>
                <input
                  type="text"
                  className={styles.textInput}
                  value={prefs.geofence.assignedSite}
                  disabled
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Configured Geofence Radius</div>
                <p className={styles.fieldDesc}>
                  Enforced radial compliance boundary (Admin controlled — read only)
                </p>
              </div>
              <div className={styles.inputControl}>
                <input
                  type="text"
                  className={styles.textInput}
                  value={`${prefs.geofence.radiusMetres} Metres`}
                  disabled
                />
              </div>
            </div>

            <div className={styles.telemetryGrid}>
              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Browser GPS Permission</div>
                <div className={styles.statValue}>
                  <span
                    className={`${styles.badge} ${
                      geoPermission === 'granted'
                        ? styles.badgeSuccess
                        : geoPermission === 'denied'
                        ? styles.badgeDanger
                        : styles.badgeWarning
                    }`}
                  >
                    {geoPermission.toUpperCase()}
                  </span>
                </div>
                <div className={styles.statNote}>Device Security Status</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Current Coordinates</div>
                <div className={styles.statValue} style={{ fontSize: '0.9rem' }}>
                  {currentCoords
                    ? `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`
                    : 'GPS Not Queried'}
                </div>
                <div className={styles.statNote}>
                  {currentCoords ? `Accuracy: ±${currentCoords.accuracy}m` : 'Click Acquire GPS'}
                </div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Distance to Site Center</div>
                <div className={styles.statValue}>
                  {distanceFromSite !== null ? `${distanceFromSite} m` : 'Awaiting GPS'}
                </div>
                <div className={styles.statNote}>Assigned Site Coordinates</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Geofence Verification</div>
                <div className={styles.statValue}>
                  {insideGeofence === null ? (
                    'Not Tested'
                  ) : insideGeofence ? (
                    <span style={{ color: '#047857' }}>PASSED (Inside Site)</span>
                  ) : (
                    <span style={{ color: '#DC2626' }}>BREACH (Outside Site)</span>
                  )}
                </div>
                <div className={styles.statNote}>Threshold: 100m radius</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATION PREFERENCES */}
      {activeTab === 'notifications' && (
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Bell size={18} color="#167C72" /> Field Notification Alerts
                </h3>
                <p className={styles.cardSubtitle}>
                  Choose which operational events send in-app alert badges and status notifications.
                </p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Daily Progress Report (DPR) Status</div>
                <p className={styles.fieldDesc}>
                  Receive alerts when PM Kulkarni or Admin reviews or approves daily reports
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={prefs.notifications.dprUpdates}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      notifications: { ...prefs.notifications, dprUpdates: e.target.checked }
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Workforce Attendance Shift Reminders</div>
                <p className={styles.fieldDesc}>
                  Morning 08:30 AM muster reminder and 06:00 PM shift-end biometric sync alert
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={prefs.notifications.attendanceReminders}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      notifications: { ...prefs.notifications, attendanceReminders: e.target.checked }
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Material Indent & Delivery Dispatches</div>
                <p className={styles.fieldDesc}>
                  Immediate notification when procurement issues PO or dispatches delivery trucks
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={prefs.notifications.materialRequestUpdates}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      notifications: { ...prefs.notifications, materialRequestUpdates: e.target.checked }
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Site Issues & Safety Hazards</div>
                <p className={styles.fieldDesc}>
                  Critical EHS safety incidents, equipment breakdown approvals, and work-stoppage alerts
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={prefs.notifications.siteIssuesUpdates}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      notifications: { ...prefs.notifications, siteIssuesUpdates: e.target.checked }
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Task Assignments & Stage Milestones</div>
                <p className={styles.fieldDesc}>
                  Notifications when new site activities or rebar/concreting tasks are scheduled
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={prefs.notifications.taskAssignments}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      notifications: { ...prefs.notifications, taskAssignments: e.target.checked }
                    })
                  }
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & ACTIVE SESSIONS */}
      {activeTab === 'security' && (
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Shield size={18} color="#167C72" /> Field Supervisor Session & Security
                </h3>
                <p className={styles.cardSubtitle}>
                  Authenticated identity, terminal credentials, and active node session.
                </p>
              </div>
              <button
                className={styles.btnDanger}
                onClick={() =>
                  openConfirm(
                    'Confirm Logout',
                    'Are you sure you want to log out from this field workstation? All unsynced records should be synchronized first.',
                    'LOGOUT',
                    handleLogout,
                    'Log Out',
                    true
                  )
                }
              >
                <LogOut size={14} /> End Active Session
              </button>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Authenticated Employee</div>
                <p className={styles.fieldDesc}>Verified Chief Field Supervisor</p>
              </div>
              <div className={styles.inputControl} style={{ minWidth: '280px' }}>
                <input
                  type="text"
                  className={styles.textInput}
                  value={`${sessionInfo.supervisorName} (${sessionInfo.email})`}
                  disabled
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.labelCol}>
                <div className={styles.fieldLabel}>Assigned Security Clearance</div>
                <p className={styles.fieldDesc}>Enterprise access level for Skyline Commercial Complex</p>
              </div>
              <div className={styles.inputControl}>
                <input
                  type="text"
                  className={styles.textInput}
                  value="Level 2 Chief Field Supervisor (Read/Write Indents, DPR, Attendance)"
                  disabled
                />
              </div>
            </div>

            <div className={styles.telemetryGrid}>
              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Session State</div>
                <div className={styles.statValue} style={{ color: '#047857' }}>
                  Active & Authenticated
                </div>
                <div className={styles.statNote}>JWT Token Valid</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Client Device / OS</div>
                <div className={styles.statValue} style={{ fontSize: '0.95rem' }}>
                  {sessionInfo.os}
                </div>
                <div className={styles.statNote}>{sessionInfo.browser}</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Terminal IP Address</div>
                <div className={styles.statValue} style={{ fontSize: '0.95rem' }}>
                  {sessionInfo.ipAddress}
                </div>
                <div className={styles.statNote}>Local Field Node</div>
              </div>

              <div className={styles.telemetryStat}>
                <div className={styles.statLabel}>Session Started</div>
                <div className={styles.statValue} style={{ fontSize: '0.9rem' }}>
                  {sessionInfo.loginTime}
                </div>
                <div className={styles.statNote}>Shift Sign-In Timestamp</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL POPUP */}
      {dialog.isOpen && (
        <div className={styles.modalOverlay} onClick={closeConfirm}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Info size={20} color={dialog.isDanger ? '#DC2626' : '#167C72'} />
              <h4 className={styles.modalTitle}>{dialog.title}</h4>
            </div>

            <div className={styles.modalBody}>
              <p>{dialog.message}</p>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={closeConfirm}>
                Cancel
              </button>
              <button
                className={dialog.isDanger ? styles.btnDanger : styles.btnPrimary}
                onClick={async () => {
                  await dialog.onConfirm();
                  closeConfirm();
                }}
              >
                {dialog.confirmBtnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
