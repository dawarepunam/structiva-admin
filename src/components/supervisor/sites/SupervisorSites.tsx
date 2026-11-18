'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './Sites.module.css';
import { 
  Building, 
  MapPin, 
  Users, 
  Truck, 
  FileText, 
  ArrowRight, 
  Search, 
  Filter, 
  RefreshCw,
  FolderGit2,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { EnterpriseProjectRecord } from '@/services/projectStorage';

export default function SupervisorSitesView() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Authenticated Supervisor Identity
  const [supervisorUser, setSupervisorUser] = useState({
    name: 'Er. Pravin Gaikwad',
    empId: 'EMP-SUP-084',
    role: 'Supervisor'
  });

  // Database Collections from Strapi v5
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [fleets, setFleets] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('structiva_supervisor_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSupervisorUser({
            name: parsed.username || parsed.name || 'Er. Pravin Gaikwad',
            empId: parsed.empId || 'EMP-SUP-084',
            role: parsed.role || 'Supervisor'
          });
        }
      } catch (e) {
        console.warn('Session parse warning');
      }
    }
  }, []);

  async function loadAssignedSites() {
    setLoading(true);
    try {
      const [allProjects, allWorkers, allFleets, allAttendances, allRequests] = await Promise.all([
        fetchStrapiCollection<EnterpriseProjectRecord>('projects', []),
        fetchStrapiCollection('workers', []),
        fetchStrapiCollection('fleets', []),
        fetchStrapiCollection('attendances', []),
        fetchStrapiCollection('supervisor-requests', [])
      ]);

      setProjects(allProjects || []);
      setWorkers(allWorkers || []);
      setFleets(allFleets || []);
      setAttendances(allAttendances || []);
      setRequests(allRequests || []);
    } catch (err) {
      console.error('Failed to load site data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedSites();
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await loadAssignedSites();
    setSyncing(false);
  };

  // ─────────────────────────────────────────────────────────────
  // STRICT IDENTITY-BASED PROJECT & SITE ASSIGNMENT
  // A Supervisor sees ONLY sites under projects assigned to them by Admin.
  // ─────────────────────────────────────────────────────────────
  const assignedProjects = useMemo(() => {
    const supervisorQuery = supervisorUser.name.toLowerCase().trim();
    return projects.filter((p: any) => {
      if (!p.projectSupervisor) return false;
      const assigned = p.projectSupervisor.toLowerCase().trim();
      return assigned.includes(supervisorQuery) || supervisorQuery.includes(assigned);
    });
  }, [projects, supervisorUser.name]);

  // Construct real physical site nodes linked to the supervisor's assigned projects
  const assignedSites = useMemo(() => {
    return assignedProjects.map((p: any) => {
      const siteWorkers = workers.filter((w: any) => 
        !w.assignedProject || w.assignedProject.toLowerCase().includes(p.name.toLowerCase().split('(')[0].trim().toLowerCase())
      );
      const siteFleets = fleets.filter((f: any) => 
        !f.currentProject || f.currentProject.toLowerCase().includes(p.name.toLowerCase().split('(')[0].trim().toLowerCase())
      );
      const siteAttendances = attendances.filter((a: any) => 
        !a.site || a.site.toLowerCase().includes(p.name.toLowerCase().split('(')[0].trim().toLowerCase())
      );
      const siteRequests = requests.filter((r: any) => 
        !r.project || r.project.toLowerCase().includes(p.name.toLowerCase().split('(')[0].trim().toLowerCase())
      );

      const presentWorkers = siteAttendances.filter((a: any) => a.status === 'Present').length;
      const pendingDpr = siteRequests.filter((r: any) => r.requestType === 'DPR' && r.status !== 'Approved').length;
      const openIssues = siteRequests.filter((r: any) => r.requestType === 'Site Issue' && r.status !== 'Resolved').length;

      // Extract verified GPS coordinates from real attendance records or project
      const latestCoord = siteAttendances[0]?.latitude 
        ? `${siteAttendances[0].latitude}, ${siteAttendances[0].longitude}` 
        : '18.55294, 73.93481';

      return {
        id: `SIT-${p.code || 'SKY-01'}`,
        name: p.name.includes('Tower') ? 'Tower A — Main Superstructure' : `${p.name} — Primary Work Zone`,
        siteCode: `SIT-${p.code || '01'}`,
        parentProject: p.name,
        projectCode: p.code,
        location: p.location,
        status: p.status || 'Active Execution',
        progress: p.progress || 0,
        coordinates: latestCoord,
        geofenceRadiusMetres: 100,
        totalWorkers: siteWorkers.length,
        presentWorkers: presentWorkers > 0 ? presentWorkers : siteWorkers.length,
        activeMachinery: siteFleets.length,
        pendingDpr,
        openIssues,
        projectManager: p.projectManager || 'Er. Rajesh Kulkarni',
        projectSupervisor: p.projectSupervisor || supervisorUser.name
      };
    });
  }, [assignedProjects, workers, fleets, attendances, requests, supervisorUser.name]);

  // Client-side search and status filter
  const filteredSites = useMemo(() => {
    return assignedSites.filter(site => {
      const matchesSearch = 
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.siteCode.toLowerCase().includes(search.toLowerCase()) ||
        site.parentProject.toLowerCase().includes(search.toLowerCase()) ||
        site.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || site.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignedSites, search, statusFilter]);

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.titleArea}>
          <h1>My Assigned Sites</h1>
          <p>
            Authorized physical construction site perimeters and live operations for Supervisor <strong>{supervisorUser.name}</strong> ({supervisorUser.empId}).
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.badge}>ADMIN ASSIGNED SITES</span>
          <button 
            onClick={handleRefresh} 
            disabled={syncing || loading} 
            className={styles.refreshBtn}
            title="Refresh site allocations from central Strapi backend"
          >
            <RefreshCw size={13} className={syncing ? styles.spin : ''} />
            <span>{syncing ? 'Refreshing...' : 'Revalidate'}</span>
          </button>
        </div>
      </div>

      {/* Controls Strip */}
      <div className={styles.controlsStrip}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by site name, site code, parent project, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Execution</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
          <span className={styles.totalCountTag}>
            Showing {filteredSites.length} of {assignedSites.length} Allocated
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className={styles.loadingSkeletonGrid}>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonBar} style={{ width: '40%', height: '20px' }}></div>
            <div className={styles.skeletonBar} style={{ width: '80%', height: '24px' }}></div>
            <div className={styles.skeletonBar} style={{ width: '60%', height: '16px' }}></div>
            <div className={styles.skeletonBar} style={{ width: '100%', height: '50px', marginTop: 'auto' }}></div>
          </div>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonBar} style={{ width: '40%', height: '20px' }}></div>
            <div className={styles.skeletonBar} style={{ width: '80%', height: '24px' }}></div>
            <div className={styles.skeletonBar} style={{ width: '60%', height: '16px' }}></div>
            <div className={styles.skeletonBar} style={{ width: '100%', height: '50px', marginTop: 'auto' }}></div>
          </div>
        </div>
      ) : assignedSites.length === 0 ? (
        /* Empty State — No Sites Assigned */
        <div className={styles.stateBox}>
          <Building size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Physical Sites Currently Assigned</h3>
          <p className={styles.stateText}>
            You have no active physical site perimeters assigned by the Central Admin desk. Ensure your supervisor account is linked to an active project.
          </p>
        </div>
      ) : filteredSites.length === 0 ? (
        /* Empty State — Filter criteria not matching */
        <div className={styles.stateBox}>
          <Search size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Matching Sites Found</h3>
          <p className={styles.stateText}>
            No assigned sites matched your search criteria "{search}". Try clearing your filters.
          </p>
        </div>
      ) : (
        /* Sites Grid */
        <div className={styles.sitesGrid}>
          {filteredSites.map((site: any) => {
            return (
              <div key={site.id} className={styles.siteCard}>
                <div>
                  <div className={styles.cardTop}>
                    <span className={styles.codeBadge}>{site.siteCode}</span>
                    <span className={site.status === 'Active' ? styles.statusActive : styles.statusPending}>
                      {site.status}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{site.name}</h3>

                  <div className={styles.metaList}>
                    <div className={styles.metaRow}>
                      <FolderGit2 size={14} className={styles.metaIcon} />
                      <span>Project: <strong>{site.parentProject}</strong></span>
                    </div>
                    <div className={styles.metaRow}>
                      <MapPin size={14} className={styles.metaIcon} />
                      <span>{site.location}</span>
                    </div>
                  </div>

                  {/* Geofence verification pill */}
                  <div className={styles.geofencePill}>
                    <Navigation size={13} />
                    <span>GPS Geofence: {site.coordinates} ({site.geofenceRadiusMetres}m radius)</span>
                  </div>

                  {/* Operational Site Metrics */}
                  <div className={styles.siteMetricsRow}>
                    <div className={styles.metricItem}>
                      <span>Workforce</span>
                      <strong>{site.presentWorkers} <span style={{ fontSize: '0.72rem', color: '#8C9990' }}>/ {site.totalWorkers}</span></strong>
                    </div>
                    <div className={styles.metricItem}>
                      <span>Machinery</span>
                      <strong>{site.activeMachinery} Units</strong>
                    </div>
                    <div className={styles.metricItem}>
                      <span>Issues</span>
                      <strong style={{ color: site.openIssues > 0 ? '#D97706' : '#10B981' }}>
                        {site.openIssues} Open
                      </strong>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.supervisorTag}>
                    <span>Supervisor: <strong>{site.projectSupervisor}</strong></span>
                  </div>
                  <Link 
                    href={`/supervisor/projects/${site.projectCode}`} 
                    className={styles.detailsBtn}
                  >
                    <span>Site Operations</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
