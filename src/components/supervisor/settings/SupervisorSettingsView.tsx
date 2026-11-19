'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SupervisorSettings.module.css';
import {
  Settings,
  Sliders,
  Server,
  HardDrive,
  MapPin,
  Bell,
  Shield,
  Globe,
  Monitor,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Radio,
  Save,
  Trash2,
  LogOut,
  Info,
  Layers,
  Clock,
  Key,
  Smartphone,
  Eye,
  Check
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

export type SettingsCategory =
  | 'general'
  | 'connectivity'
  | 'offline'
  | 'geofence'
  | 'notifications'
  | 'security'
  | 'regional'
  | 'display';

export interface SupervisorPreferences {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  defaultLandingPage: string;
  themeContrast: string;
  displayDensity: 'Compact' | 'Comfortable';
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
    inAppSound: boolean;
  };
  geofence: {
    enforced: boolean;
    radiusMetres: number;
    assignedSite: string;
    assignedProject: string;
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
  displayDensity: 'Comfortable',
  autoSync: true,
  syncIntervalMinutes: 5,
  notifications: {
    dprUpdates: true,
    attendanceReminders: true,
    approvalStatusUpdates: true,
    materialRequestUpdates: true,
    siteIssuesUpdates: true,
    taskAssignments: true,
    importantAnnouncements: true,
    inAppSound: true
  },
  geofence: {
    enforced: true,
    radiusMetres: 100,
    assignedSite: 'Tower A — Skyline Commercial Complex',
    assignedProject: 'Skyline Commercial Complex (Tower A)',
    assignedSiteLatitude: 18.55294,
    assignedSiteLongitude: 73.93481
  }
};

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
  confirmBtnLabel: string;
  isDanger?: boolean;
}

export default function SupervisorSettingsView() {
  const router = useRouter();

  // Active Category Selection
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');

  // Master Preferences State
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

  // Authenticated Session State
  const [sessionInfo, setSessionInfo] = useState<{
    supervisorName: string;
    email: string;
    role: string;
    browser: string;
    os: string;
    ipAddress: string;
    loginTime: string;
    authProvider: string;
  }>({
    supervisorName: 'Er. Pravin Gaikwad',
    email: 'p.gaikwad@structiva.internal',
    role: 'Chief Field Supervisor',
    browser: 'Chrome / Edge Desktop',
    os: 'Windows 11 Enterprise',
    ipAddress: '127.0.0.1 (Local Workstation)',
    loginTime: '19 Nov 2026, 08:30 AM',
    authProvider: 'Enterprise Secure Credentials'
  });

  // Modal Dialog State
  const [dialog, setDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmBtnLabel: 'Confirm'
  });

  // Haversine formula to calculate distance in metres
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

        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            setGeoPermission(result.state as any);
            result.onchange = () => setGeoPermission(result.state as any);
          }).catch(() => {});
        }
      }

      setOfflineQueue(getOfflineQueue());

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

      checkBackendHealth();
    }

    loadData();
  }, [checkBackendHealth]);

  // Save Preferences to Strapi
  const handleSavePreferences = async (customMessage?: string) => {
    setSaveLoading(true);
    setAlertMsg(null);

    try {
      if (strapiDocId) {
        const res = await updateStrapiEntity('supervisor-requests', strapiDocId, {
          details: prefs,
          updatedAt: new Date().toISOString()
        });
        if (res) {
          setAlertMsg({
            type: 'success',
            text: customMessage || 'Settings successfully saved and synced to the central Strapi backend.'
          });
        } else {
          setAlertMsg({ type: 'error', text: 'Backend rejected update. Please check network connectivity.' });
        }
      } else {
        const created = await createStrapiEntity<any>('supervisor-requests', {
          requestType: 'Supervisor Preferences',
          title: `User Settings & Operational Preferences: ${sessionInfo.supervisorName}`,
          project: prefs.geofence.assignedProject,
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
      const nowStr = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  // Safe Cache Clear
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
    onConfirm: () => Promise<void> | void,
    confirmBtnLabel: string = 'Confirm',
    isDanger: boolean = false
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmBtnLabel,
      isDanger
    });
  };

  const closeConfirm = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Navigation Items Definition (8 Categories)
  const navCategories = [
    {
      id: 'general' as SettingsCategory,
      title: 'General Preferences',
      subtitle: 'Landing workspace & general defaults',
      icon: Sliders
    },
    {
      id: 'connectivity' as SettingsCategory,
      title: 'Backend Connectivity',
      subtitle: 'Central Strapi node & live health ping',
      icon: Server,
      badge: backendStatus === 'Connected' ? 'Live' : 'Degraded'
    },
    {
      id: 'offline' as SettingsCategory,
      title: 'Offline & Data Sync',
      subtitle: 'Buffer queue & zero data loss protocol',
      icon: HardDrive,
      badge: offlineQueue.length > 0 ? `${offlineQueue.length}` : undefined
    },
    {
      id: 'geofence' as SettingsCategory,
      title: 'Location & Geofence',
      subtitle: 'Site jurisdiction & 100m radial perimeter',
      icon: MapPin
    },
    {
      id: 'notifications' as SettingsCategory,
      title: 'Notification Channels',
      subtitle: 'DPR, indents, attendance & safety alerts',
      icon: Bell
    },
    {
      id: 'security' as SettingsCategory,
      title: 'Session & Security',
      subtitle: 'Authenticated identity & access clearance',
      icon: Shield
    },
    {
      id: 'regional' as SettingsCategory,
      title: 'Regional & Localization',
      subtitle: 'Language, date format & IST timezone',
      icon: Globe
    },
    {
      id: 'display' as SettingsCategory,
      title: 'Application Display',
      subtitle: 'Sunlight contrast & interface density',
      icon: Monitor
    }
  ];

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>
            <Settings size={26} color="#167C72" /> Supervisor Node Settings
          </h1>
          <p>
            Centralized enterprise configuration, Strapi backend telemetry, site geofencing, and offline buffer control.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.btnSecondary}
            onClick={() => checkBackendHealth()}
            disabled={healthChecking}
          >
            <RefreshCw size={14} className={healthChecking ? 'spin' : ''} />
            {healthChecking ? 'Pinging...' : 'Ping Backend'}
          </button>

          <button
            className={styles.btnPrimary}
            onClick={() =>
              openConfirm(
                'Save Settings to Strapi',
                'Are you sure you want to commit your operational configuration to the Strapi central database?',
                () => handleSavePreferences(),
                'Save Changes'
              )
            }
            disabled={saveLoading || initialLoading}
          >
            <Save size={14} />
            {saveLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alertMsg && (
        <div className={alertMsg.type === 'success' ? styles.alertSuccess : styles.alertError}>
          {alertMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Main Two-Panel Settings Workspace */}
      <div className={styles.settingsWorkspace}>
        {/* LEFT NAVIGATION PANEL */}
        <nav className={styles.navPanel} aria-label="Settings categories">
          <div className={styles.navSectionTitle}>Settings Categories</div>
          <ul className={styles.navList}>
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setAlertMsg(null);
                    }}
                  >
                    <Icon size={18} className={styles.navIcon} />
                    <div className={styles.navLabelArea}>
                      <span className={styles.navTitle}>{cat.title}</span>
                      <span className={styles.navSubtitle}>{cat.subtitle}</span>
                    </div>
                    {cat.badge && (
                      <span
                        className={styles.navBadge}
                        style={{
                          background:
                            cat.badge === 'Live'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : cat.badge === 'Degraded'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : '#ECEBE5',
                          color:
                            cat.badge === 'Live'
                              ? '#047857'
                              : cat.badge === 'Degraded'
                              ? '#B91C1C'
                              : '#172B32'
                        }}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT CONTENT AREA: INDEPENDENT CATEGORY VIEW */}
        <main className={styles.contentArea}>
          {/* CATEGORY 1: GENERAL PREFERENCES */}
          {activeCategory === 'general' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <Sliders size={22} color="#167C72" /> General Preferences
                  </h2>
                  <p>Configure default landing route, core operating defaults, and workspace behavior.</p>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Layers size={17} color="#167C72" /> Workspace Defaults
                    </h3>
                    <p className={styles.sectionSubtitle}>Standard routing and application behavior</p>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Default Landing Workspace</div>
                    <p className={styles.settingDescription}>The primary operations module loaded immediately after login</p>
                  </div>
                  <div className={styles.settingControl}>
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
                      <option value="/supervisor/requests">Approvals & Submissions Audit</option>
                      <option value="/supervisor/fuel">Fuel Management</option>
                      <option value="/supervisor/expenses">Site Expenses</option>
                    </select>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Supervisor Primary Language</div>
                    <p className={styles.settingDescription}>Operating terminology for indents, muster, and checklist views</p>
                  </div>
                  <div className={styles.settingControl}>
                    <select
                      className={styles.select}
                      value={prefs.language}
                      onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                    >
                      <option value="en">English (India - Metric Standard)</option>
                      <option value="mr">मराठी (Regional Pune/MH Construction Terms)</option>
                      <option value="hi">हिन्दी (National Industrial Standard)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>In-App Audio Feedback</div>
                    <p className={styles.settingDescription}>Audible chime on successful QR scan and material indent receipt</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={prefs.notifications.inAppSound}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          notifications: { ...prefs.notifications, inAppSound: e.target.checked }
                        })
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* CATEGORY 2: BACKEND CONNECTIVITY */}
          {activeCategory === 'connectivity' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <Server size={22} color="#167C72" /> Backend Connectivity
                  </h2>
                  <p>Central Strapi backend host parameters, latency monitoring, and health-check status.</p>
                </div>

                <button
                  className={styles.btnSecondary}
                  onClick={checkBackendHealth}
                  disabled={healthChecking}
                >
                  <RefreshCw size={14} className={healthChecking ? 'spin' : ''} />
                  {healthChecking ? 'Checking...' : 'Ping Backend Now'}
                </button>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Server size={17} color="#167C72" /> Host & Communication Node
                    </h3>
                    <p className={styles.sectionSubtitle}>Direct REST endpoint communication state</p>
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
                    {backendStatus === 'Connected' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                    {backendStatus}
                  </span>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Configured Central Strapi URL</div>
                    <p className={styles.settingDescription}>Target enterprise host for database transactions and authentication</p>
                  </div>
                  <div className={styles.settingControl} style={{ minWidth: '260px' }}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={STRAPI_BASE_URL}
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Actual Response Latency</div>
                    <div className={styles.metricValue}>
                      {backendLatencyMs !== null ? `${backendLatencyMs} ms` : 'Unreachable'}
                    </div>
                    <div className={styles.metricNote}>Live measured HTTP ping</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Last Health Check</div>
                    <div className={styles.metricValue}>{lastHealthCheck}</div>
                    <div className={styles.metricNote}>Ping endpoint: /_health</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Workstation Network</div>
                    <div className={styles.metricValue}>
                      {isOnline ? 'Online (LAN / 4G)' : 'Offline (No Connection)'}
                    </div>
                    <div className={styles.metricNote}>Browser navigator status</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Last Master Sync</div>
                    <div className={styles.metricValue}>{lastSyncTime}</div>
                    <div className={styles.metricNote}>Payload exchange time</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CATEGORY 3: OFFLINE & DATA SYNCHRONIZATION */}
          {activeCategory === 'offline' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <HardDrive size={22} color="#167C72" /> Offline & Data Synchronization
                  </h2>
                  <p>Zero Data Loss protocol, local IndexedDB buffer inspection, and queue synchronization.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() =>
                      openConfirm(
                        'Clear Local Cache',
                        'This will purge cached views while strictly protecting any pending unsynced field records. Continue?',
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
                        'Sync Offline Queue Now',
                        `Flush and transmit ${offlineQueue.length} pending record(s) to the central Strapi backend?`,
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

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <HardDrive size={17} color="#167C72" /> Synchronization Parameters
                    </h3>
                    <p className={styles.sectionSubtitle}>Manage automated background data dispatch</p>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Automated Periodic Background Sync</div>
                    <p className={styles.settingDescription}>
                      Automatically pushes queued field items as soon as connectivity is detected
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
                            'Disable Automated Sync?',
                            'Disabling auto-sync means field records will stay queued on this device until you manually click "Sync Now".',
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

                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Pending Sync Records</div>
                    <div className={styles.metricValue}>
                      {offlineQueue.filter((i) => i.status === 'Pending').length}
                    </div>
                    <div className={styles.metricNote}>Awaiting network push</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Failed Sync Records</div>
                    <div className={styles.metricValue} style={{ color: '#DC2626' }}>
                      {offlineQueue.filter((i) => i.status === 'Failed').length}
                    </div>
                    <div className={styles.metricNote}>Requires manual retry</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Total Buffer Count</div>
                    <div className={styles.metricValue}>{offlineQueue.length}</div>
                    <div className={styles.metricNote}>Local queue size</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Zero Data Loss Protocol</div>
                    <div className={styles.metricValue} style={{ color: '#047857' }}>
                      Active
                    </div>
                    <div className={styles.metricNote}>Guaranteed storage buffer</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <div className={styles.settingLabel} style={{ marginBottom: '0.5rem' }}>
                    Active Queue Record Inspector
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
                      <div>All field records are 100% synchronized with Strapi backend. Buffer is empty.</div>
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
            </>
          )}

          {/* CATEGORY 4: LOCATION & GEOFENCE */}
          {activeCategory === 'geofence' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <MapPin size={22} color="#167C72" /> Location & Geofence
                  </h2>
                  <p>Admin-enforced site perimeter verification, GPS coordinates, and shift compliance checks.</p>
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

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <MapPin size={17} color="#167C72" /> Designated Site Jurisdiction
                    </h3>
                    <p className={styles.sectionSubtitle}>Operational boundary configured by Central Admin</p>
                  </div>

                  <span className={`${styles.badge} ${styles.badgeInfo}`}>Admin Controlled</span>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Assigned Project & Site</div>
                    <p className={styles.settingDescription}>Designated structural node for supervisor Er. Pravin Gaikwad</p>
                  </div>
                  <div className={styles.settingControl} style={{ minWidth: '260px' }}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={`${prefs.geofence.assignedSite} (${prefs.geofence.assignedProject})`}
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Enforced Geofence Radius</div>
                    <p className={styles.settingDescription}>Radial boundary threshold for attendance and diesel disbursement</p>
                  </div>
                  <div className={styles.settingControl}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={`${prefs.geofence.radiusMetres} Metres (Locked)`}
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Browser GPS Permission</div>
                    <div className={styles.metricValue}>
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
                    <div className={styles.metricNote}>Device API status</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Device Coordinates</div>
                    <div className={styles.metricValue} style={{ fontSize: '0.85rem' }}>
                      {currentCoords
                        ? `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`
                        : 'GPS Not Queried'}
                    </div>
                    <div className={styles.metricNote}>
                      {currentCoords ? `Accuracy: ±${currentCoords.accuracy}m` : 'Click Acquire Current GPS'}
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Distance to Site Center</div>
                    <div className={styles.metricValue}>
                      {distanceFromSite !== null ? `${distanceFromSite} m` : 'Awaiting GPS'}
                    </div>
                    <div className={styles.metricNote}>Assigned site: Skyline Tower A</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Perimeter Compliance</div>
                    <div className={styles.metricValue}>
                      {insideGeofence === null ? (
                        'Not Tested'
                      ) : insideGeofence ? (
                        <span style={{ color: '#047857' }}>PASSED (Inside Site)</span>
                      ) : (
                        <span style={{ color: '#DC2626' }}>BREACH (Outside Site)</span>
                      )}
                    </div>
                    <div className={styles.metricNote}>Threshold: 100m radius</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CATEGORY 5: NOTIFICATION CHANNELS */}
          {activeCategory === 'notifications' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <Bell size={22} color="#167C72" /> Notification Channels
                  </h2>
                  <p>Manage operational alerts, dispatch tracking, safety notices, and shift reminders.</p>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Bell size={17} color="#167C72" /> Field Event Triggers
                    </h3>
                    <p className={styles.sectionSubtitle}>Toggle notifications for field lifecycle events</p>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Daily Progress Report (DPR) Updates</div>
                    <p className={styles.settingDescription}>Alerts when Project Manager approves or requests revisions on DPRs</p>
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

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Workforce Attendance Shift Reminders</div>
                    <p className={styles.settingDescription}>Morning 08:30 AM muster reminder and 06:00 PM shift-end biometric sync</p>
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

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Material Indent & Delivery Dispatches</div>
                    <p className={styles.settingDescription}>Alerts when Central Procurement issues POs or releases transit trucks</p>
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

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Site Safety Hazards & EHS Alerts</div>
                    <p className={styles.settingDescription}>Immediate alerts for critical safety incidents, stop-work notices, and breakdowns</p>
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

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Task Assignments & Stage Milestones</div>
                    <p className={styles.settingDescription}>Notifies when new rebar tie-up or concrete casting tasks are assigned</p>
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
            </>
          )}

          {/* CATEGORY 6: SESSION & SECURITY */}
          {activeCategory === 'security' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <Shield size={22} color="#167C72" /> Session & Security
                  </h2>
                  <p>Supervisor identity verification, authenticated session details, and access control.</p>
                </div>

                <button
                  className={styles.btnDanger}
                  onClick={() =>
                    openConfirm(
                      'Confirm Logout',
                      'Are you sure you want to end your active session on this workstation? All unsynced records should be synchronized first.',
                      handleLogout,
                      'Log Out',
                      true
                    )
                  }
                >
                  <LogOut size={14} /> End Active Session
                </button>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Shield size={17} color="#167C72" /> Current Active Session
                    </h3>
                    <p className={styles.sectionSubtitle}>Verified credentials in STRUCTIVA Enterprise OS</p>
                  </div>

                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                    <CheckCircle size={12} /> Authenticated
                  </span>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Authenticated Supervisor</div>
                    <p className={styles.settingDescription}>Verified identity tied to Strapi user account</p>
                  </div>
                  <div className={styles.settingControl} style={{ minWidth: '260px' }}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={`${sessionInfo.supervisorName} (${sessionInfo.email})`}
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Assigned Clearance Level</div>
                    <p className={styles.settingDescription}>Authorized scope for Skyline Commercial Complex</p>
                  </div>
                  <div className={styles.settingControl}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value="Level 2 Chief Field Supervisor (Read/Write Indents, DPR, Attendance)"
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Authentication Method</div>
                    <div className={styles.metricValue} style={{ fontSize: '0.95rem' }}>
                      {sessionInfo.authProvider}
                    </div>
                    <div className={styles.metricNote}>Strapi Users & Permissions</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Workstation Environment</div>
                    <div className={styles.metricValue} style={{ fontSize: '0.95rem' }}>
                      {sessionInfo.os}
                    </div>
                    <div className={styles.metricNote}>{sessionInfo.browser}</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Terminal Node IP</div>
                    <div className={styles.metricValue} style={{ fontSize: '0.95rem' }}>
                      {sessionInfo.ipAddress}
                    </div>
                    <div className={styles.metricNote}>Local Site Workstation</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Session Started</div>
                    <div className={styles.metricValue} style={{ fontSize: '0.9rem' }}>
                      {sessionInfo.loginTime}
                    </div>
                    <div className={styles.metricNote}>Shift Sign-In Timestamp</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CATEGORY 7: REGIONAL & LOCALIZATION */}
          {activeCategory === 'regional' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <Globe size={22} color="#167C72" /> Regional & Localization
                  </h2>
                  <p>Enterprise date formats, time display preferences, and Maharashtra state timezone.</p>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Globe size={17} color="#167C72" /> Formatting & Time Standards
                    </h3>
                    <p className={styles.sectionSubtitle}>Standardize audit records across site and head office</p>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Date Display Format</div>
                    <p className={styles.settingDescription}>Format applied to DPR submissions, material challans, and muster logs</p>
                  </div>
                  <div className={styles.settingControl}>
                    <select
                      className={styles.select}
                      value={prefs.dateFormat}
                      onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (19/11/2026)</option>
                      <option value="DD-MMM-YYYY">DD-MMM-YYYY (19-Nov-2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Time Display Format</div>
                    <p className={styles.settingDescription}>Timestamp format for diesel dispensing and shift check-ins</p>
                  </div>
                  <div className={styles.settingControl}>
                    <select
                      className={styles.select}
                      value={prefs.timeFormat}
                      onChange={(e) => setPrefs({ ...prefs, timeFormat: e.target.value as '12h' | '24h' })}
                    >
                      <option value="12h">12-Hour Clock (02:30 PM)</option>
                      <option value="24h">24-Hour Clock (14:30)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Operational Timezone</div>
                    <p className={styles.settingDescription}>Locked to Maharashtra Site Operations Time</p>
                  </div>
                  <div className={styles.settingControl}>
                    <input
                      type="text"
                      className={styles.textInput}
                      value="Asia/Kolkata (IST +05:30) [Enforced]"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CATEGORY 8: APPLICATION DISPLAY */}
          {activeCategory === 'display' && (
            <>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleArea}>
                  <h2>
                    <Monitor size={22} color="#167C72" /> Application Display
                  </h2>
                  <p>Sunlight contrast settings, UI density, and field visibility preferences.</p>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Monitor size={17} color="#167C72" /> Field Visibility Options
                    </h3>
                    <p className={styles.sectionSubtitle}>Optimized for outdoor laptops and ruggedized field tablets</p>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Sunlight Contrast Mode</div>
                    <p className={styles.settingDescription}>Enhanced contrast mode for direct sunlight readability on site</p>
                  </div>
                  <div className={styles.settingControl}>
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

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Data Table Display Density</div>
                    <p className={styles.settingDescription}>Padding density for workforce attendance and material tables</p>
                  </div>
                  <div className={styles.settingControl}>
                    <select
                      className={styles.select}
                      value={prefs.displayDensity}
                      onChange={(e) => setPrefs({ ...prefs, displayDensity: e.target.value as any })}
                    >
                      <option value="Comfortable">Comfortable (Standard Field Viewing)</option>
                      <option value="Compact">Compact (High Information Density)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

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
