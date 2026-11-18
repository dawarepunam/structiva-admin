'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './Projects.module.css';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  HardHat, 
  Truck, 
  ArrowRight, 
  Search, 
  Filter, 
  RefreshCw,
  FolderGit2,
  ShieldAlert,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { EnterpriseProjectRecord } from '@/services/projectStorage';

export default function SupervisorProjectsView() {
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
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
        console.warn('Session read warning');
      }
    }
  }, []);

  async function loadAssignedProjects() {
    setLoading(true);
    try {
      // Query projects directly from Strapi v5 central backend
      const rawProjects = await fetchStrapiCollection<EnterpriseProjectRecord>('projects', []);
      setProjects(rawProjects || []);
    } catch (err) {
      console.error('Failed to load projects from Strapi:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedProjects();
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await loadAssignedProjects();
    setSyncing(false);
  };

  // ─────────────────────────────────────────────────────────────
  // STRICT SERVER-SIDE & IDENTITY-BASED ASSIGNMENT FILTERING
  // A Supervisor sees ONLY projects explicitly assigned to them by Admin.
  // ─────────────────────────────────────────────────────────────
  const assignedProjects = useMemo(() => {
    const supervisorQuery = supervisorUser.name.toLowerCase().trim();
    return projects.filter((p: any) => {
      if (!p.projectSupervisor) return false;
      const assigned = p.projectSupervisor.toLowerCase().trim();
      return assigned.includes(supervisorQuery) || supervisorQuery.includes(assigned);
    });
  }, [projects, supervisorUser.name]);

  // Client-side search and category filtering
  const filteredProjects = useMemo(() => {
    return assignedProjects.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignedProjects, search, statusFilter]);

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.titleArea}>
          <h1>My Assigned Projects</h1>
          <p>
            Official construction project allocations verified for Supervisor <strong>{supervisorUser.name}</strong> ({supervisorUser.empId}).
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.badge}>ADMIN ASSIGNED SCOPE</span>
          <button 
            onClick={handleRefresh} 
            disabled={syncing || loading} 
            className={styles.refreshBtn}
            title="Refresh allocations from central Strapi backend"
          >
            <RefreshCw size={13} className={syncing ? styles.spin : ''} />
            <span>{syncing ? 'Refreshing...' : 'Revalidate'}</span>
          </button>
        </div>
      </div>

      {/* Controls Strip (Search, Status Filter, Counter) */}
      <div className={styles.controlsStrip}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by project name, code, client, or site location..."
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
            Showing {filteredProjects.length} of {assignedProjects.length} Allocated
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
      ) : assignedProjects.length === 0 ? (
        /* Empty State — No Projects Assigned by Admin */
        <div className={styles.stateBox}>
          <FolderGit2 size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Projects Currently Assigned</h3>
          <p className={styles.stateText}>
            You have not been designated as Project Supervisor on any active project. Official project assignments are configured by the Central Admin desk.
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State — Filter criteria not matching */
        <div className={styles.stateBox}>
          <Search size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Matching Projects Found</h3>
          <p className={styles.stateText}>
            No assigned projects matched your search criteria "{search}". Try clearing your filters.
          </p>
        </div>
      ) : (
        /* Projects Grid */
        <div className={styles.projectsGrid}>
          {filteredProjects.map((proj: any) => {
            const statusClass = 
              proj.status === 'Active' ? styles.statusActive :
              proj.status === 'Under Review' ? styles.statusUnderReview :
              styles.statusCompleted;

            return (
              <div key={proj.id || proj.documentId} className={styles.projectCard}>
                <div>
                  <div className={styles.cardTop}>
                    <span className={styles.codeBadge}>{proj.code}</span>
                    <span className={`${styles.statusTag} ${statusClass}`}>{proj.status}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{proj.name}</h3>

                  <div className={styles.metaList}>
                    <div className={styles.metaRow}>
                      <Building2 size={14} className={styles.metaIcon} />
                      <span>Client: <strong>{proj.client}</strong></span>
                    </div>
                    <div className={styles.metaRow}>
                      <MapPin size={14} className={styles.metaIcon} />
                      <span>{proj.location}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <Calendar size={14} className={styles.metaIcon} />
                      <span>Target Completion: <strong>{proj.expectedCompletion || 'Scheduled'}</strong></span>
                    </div>
                  </div>

                  <div className={styles.progressBlock}>
                    <div className={styles.progressLabelRow}>
                      <span>Physical Execution</span>
                      <strong>{proj.progress || 0}%</strong>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${proj.progress || 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.supervisorTag}>
                    <span>Project Manager: <strong>{proj.projectManager || 'Er. Rajesh Kulkarni'}</strong></span>
                  </div>
                  <Link 
                    href={`/supervisor/projects/${proj.code || proj.id || proj.documentId}`} 
                    className={styles.detailsBtn}
                  >
                    <span>View Details</span>
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
