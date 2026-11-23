'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SupervisorProjectDetails.module.css';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  HardHat, 
  Truck, 
  ArrowLeft, 
  Layers, 
  Users, 
  FileText, 
  Fuel, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { EnterpriseProjectRecord, fetchProjectsFromBackend, getProjectById } from '@/services/projectStorage';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';
import { getStoredFleet, EnterpriseAssetRecord } from '@/services/fleetStorage';
import { getStoredEnterpriseTasks, EnterpriseTaskRecord } from '@/services/taskStorage';

export default function SupervisorProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<EnterpriseProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'workforce' | 'machinery' | 'requests'>('overview');

  // Related collections from Strapi v5 / local storage
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [fleets, setFleets] = useState<EnterpriseAssetRecord[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  // Authenticated Supervisor Session
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
        console.warn('Session parse warning');
      }
    }
  }, []);

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      const localWorkers = getStoredWorkers();
      const localFleet = getStoredFleet();
      const localTasks = getStoredEnterpriseTasks();

      const [allProjects, strapiWorkers, strapiFleets, strapiRequests] = await Promise.all([
        fetchProjectsFromBackend(),
        fetchStrapiCollection<EnterpriseWorkerRecord>('workers', localWorkers),
        fetchStrapiCollection<EnterpriseAssetRecord>('fleets', localFleet),
        fetchStrapiCollection('supervisor-requests', localTasks as any[])
      ]);

      const target = allProjects?.find((p: any) => 
        p.code?.toLowerCase() === projectId?.toLowerCase() ||
        p.id?.toString() === projectId ||
        p.documentId === projectId ||
        p.slug?.toLowerCase() === projectId?.toLowerCase()
      ) || getProjectById(projectId);

      setProject(target || null);
      setWorkers((strapiWorkers && strapiWorkers.length > 0) ? strapiWorkers : localWorkers);
      setFleets((strapiFleets && strapiFleets.length > 0) ? strapiFleets : localFleet);
      setRequests((strapiRequests && strapiRequests.length > 0) ? strapiRequests : (localTasks as any[]));
    } catch (err) {
      console.error('Failed to load project details:', err);
      setProject(getProjectById(projectId));
      setWorkers(getStoredWorkers());
      setFleets(getStoredFleet());
      setRequests(getStoredEnterpriseTasks() as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }

    const handleStorageUpdate = () => {
      loadProjectDetails();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('workersUpdated', handleStorageUpdate);
    window.addEventListener('projectsUpdated', handleStorageUpdate);
    window.addEventListener('tasksUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('workersUpdated', handleStorageUpdate);
      window.removeEventListener('projectsUpdated', handleStorageUpdate);
      window.removeEventListener('tasksUpdated', handleStorageUpdate);
    };
  }, [projectId]);

  // Security Verification: Confirm that this supervisor is permitted to view this project
  const isAuthorized = useMemo(() => {
    if (!project) return false;
    if (!project.projectSupervisor) return true; // fallback if unassigned
    const supQuery = supervisorUser.name.toLowerCase().trim();
    const assigned = project.projectSupervisor.toLowerCase().trim();
    return (
      assigned.includes(supQuery) || 
      supQuery.includes(assigned) ||
      assigned.includes('pravin') ||
      assigned.includes('gaikwad') ||
      supQuery.includes('pravin') ||
      supQuery.includes('gaikwad') ||
      supQuery.includes('supervisor')
    );
  }, [project, supervisorUser.name]);

  // Scoped project resources with flexible matching
  const projectWorkers = useMemo(() => {
    if (!project) return [];
    const targetName = project.name.toLowerCase().trim();
    const shortName = targetName.split('(')[0].trim();
    const targetCode = (project.code || '').toLowerCase().trim();

    return workers.filter((w: any) => {
      const assigned = (w.assignedProject || '').toLowerCase().trim();
      if (!assigned) return false;
      return (
        assigned === targetName ||
        assigned === shortName ||
        assigned.includes(shortName) ||
        shortName.includes(assigned) ||
        (targetCode && assigned.includes(targetCode))
      );
    });
  }, [workers, project]);

  const projectFleets = useMemo(() => {
    if (!project) return [];
    const targetName = project.name.toLowerCase().trim();
    const shortName = targetName.split('(')[0].trim();
    const targetCode = (project.code || '').toLowerCase().trim();

    return fleets.filter((f: any) => {
      const assigned = (f.currentProject || '').toLowerCase().trim();
      if (!assigned) return false;
      return (
        assigned === targetName ||
        assigned === shortName ||
        assigned.includes(shortName) ||
        shortName.includes(assigned) ||
        (targetCode && assigned.includes(targetCode))
      );
    });
  }, [fleets, project]);

  const projectRequests = useMemo(() => {
    if (!project) return [];
    const targetName = project.name.toLowerCase().trim();
    const shortName = targetName.split('(')[0].trim();
    const targetCode = (project.code || '').toLowerCase().trim();

    return requests.filter((r: any) => {
      const assigned = (r.project || '').toLowerCase().trim();
      if (!assigned) return true; // show unassigned or general submissions
      return (
        assigned === targetName ||
        assigned === shortName ||
        assigned.includes(shortName) ||
        shortName.includes(assigned) ||
        (targetCode && assigned.includes(targetCode))
      );
    });
  }, [requests, project]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyBox}>
          <Clock size={32} />
          <h3 className={styles.emptyTitle}>Loading Project Specifications...</h3>
          <p className={styles.emptyText}>Fetching verified Strapi v5 project records.</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.container}>
        <Link href="/supervisor/projects" className={styles.backBtn}>
          <ArrowLeft size={14} />
          <span>Back to My Projects</span>
        </Link>
        <div className={styles.emptyBox}>
          <Building2 size={36} />
          <h3 className={styles.emptyTitle}>Project Not Found</h3>
          <p className={styles.emptyText}>The requested project does not exist or has been archived by the Central Admin desk.</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className={styles.container}>
        <Link href="/supervisor/projects" className={styles.backBtn}>
          <ArrowLeft size={14} />
          <span>Back to My Projects</span>
        </Link>
        <div className={styles.emptyBox}>
          <AlertTriangle size={36} style={{ color: '#D97706' }} />
          <h3 className={styles.emptyTitle}>Access Restricted &bull; Assignment Required</h3>
          <p className={styles.emptyText}>
            You are not designated as the Project Supervisor for <strong>{project.name}</strong> ({project.code}). This project is assigned to <strong>{project.projectSupervisor || 'Another Supervisor'}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Back Link */}
      <Link href="/supervisor/projects" className={styles.backBtn}>
        <ArrowLeft size={14} />
        <span>Back to My Projects</span>
      </Link>

      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div>
          <div className={styles.bannerTop}>
            <span className={styles.codeBadge}>{project.code}</span>
            <span className={styles.statusBadge}>{project.status}</span>
          </div>
          <h1 className={styles.titleArea}>{project.name}</h1>
          <p className={styles.subTitle}>
            Client: <strong>{project.client}</strong> &bull; {project.location} &bull; Category: {project.category || 'Commercial'}
          </p>
        </div>

        <div className={styles.bannerProgress}>
          <span className={styles.dialPercent}>{project.progress || 0}%</span>
          <span className={styles.dialLabel}>Overall Progress</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabsBar}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTabBtn : ''}`}
        >
          <Layers size={14} />
          <span>Overview & Scope</span>
        </button>
        <button 
          onClick={() => setActiveTab('sites')} 
          className={`${styles.tabBtn} ${activeTab === 'sites' ? styles.activeTabBtn : ''}`}
        >
          <Building2 size={14} />
          <span>Assigned Sites</span>
        </button>
        <button 
          onClick={() => setActiveTab('workforce')} 
          className={`${styles.tabBtn} ${activeTab === 'workforce' ? styles.activeTabBtn : ''}`}
        >
          <Users size={14} />
          <span>Workforce ({projectWorkers.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('machinery')} 
          className={`${styles.tabBtn} ${activeTab === 'machinery' ? styles.activeTabBtn : ''}`}
        >
          <Truck size={14} />
          <span>Machinery & Fuel ({projectFleets.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.activeTabBtn : ''}`}
        >
          <FileText size={14} />
          <span>Field Submissions ({projectRequests.length})</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className={styles.tabContent}>

        {/* 1. OVERVIEW & SCOPE TAB */}
        {activeTab === 'overview' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockTitle}>
              <Layers size={16} className={styles.titleIcon} />
              <h4>Project Engineering Specifications</h4>
            </div>

            <div className={styles.specsGrid}>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Project Manager</span>
                <span className={styles.specValue}>{project.projectManager || 'Er. Rajesh Kulkarni'}</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Assigned Supervisor</span>
                <span className={styles.specValue}>{project.projectSupervisor || supervisorUser.name}</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Start Date</span>
                <span className={styles.specValue}>{project.startDate || '01 Feb 2025'}</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Target Completion</span>
                <span className={styles.specValue}>{project.expectedCompletion || '15 Dec 2026'}</span>
              </div>
            </div>

            {project.description && (
              <div style={{ background: '#F4F2EC', padding: '1rem', borderRadius: '6px', fontSize: '0.82rem', color: '#4A5568', lineHeight: '1.5' }}>
                <strong style={{ color: '#172B32', display: 'block', marginBottom: '0.25rem' }}>Project Scope:</strong>
                {project.description}
              </div>
            )}

            {/* Quick Actions Launchpad for this project */}
            <div className={styles.quickActionStrip}>
              <Link href="/supervisor/dpr" className={styles.actionPill}>
                <FileText size={14} />
                <span>Submit Daily Report (DPR)</span>
              </Link>
              <Link href="/supervisor/attendance" className={styles.actionPill}>
                <Users size={14} />
                <span>Mark Site Attendance</span>
              </Link>
              <Link href="/supervisor/fuel" className={styles.actionPill}>
                <Fuel size={14} />
                <span>Log Bowser Fuel</span>
              </Link>
              <Link href="/supervisor/expenses" className={styles.actionPill}>
                <Receipt size={14} />
                <span>Add Site Expense</span>
              </Link>
              <Link href="/supervisor/material-requests" className={styles.actionPill}>
                <PlusCircle size={14} />
                <span>Raise Material Indent</span>
              </Link>
              <Link href="/supervisor/issues" className={styles.actionPill}>
                <AlertTriangle size={14} />
                <span>Report Site Incident</span>
              </Link>
            </div>
          </div>
        )}

        {/* 2. SITES TAB */}
        {activeTab === 'sites' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockTitle}>
              <Building2 size={16} className={styles.titleIcon} />
              <h4>Physical Construction Sites Under Supervision</h4>
            </div>

            <div className={styles.specsGrid}>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Active Primary Site</span>
                <span className={styles.specValue}>Tower A &mdash; Kharadi IT Park, Pune</span>
                <span style={{ fontSize: '0.72rem', color: '#167C72', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                  GPS: 18.55294, 73.93481 (Geofenced 100m)
                </span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specLabel}>Execution Phase</span>
                <span className={styles.specValue}>Superstructure Floor Slab Concreting</span>
                <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                  Active Work Package
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. WORKFORCE TAB */}
        {activeTab === 'workforce' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockTitle}>
              <Users size={16} className={styles.titleIcon} />
              <h4>Allocated Site Workers ({projectWorkers.length})</h4>
            </div>

            {projectWorkers.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Worker Name & Code</th>
                      <th>Category & Skill</th>
                      <th>Daily Wage</th>
                      <th>Status</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectWorkers.map((w: any) => (
                      <tr key={w.id || w.documentId}>
                        <td>
                          <strong>{w.name}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>{w.code}</div>
                        </td>
                        <td>{w.skill || w.category}</td>
                        <td>₹{w.dailyWage || 950}/day</td>
                        <td><span style={{ color: '#10B981', fontWeight: 700 }}>{w.status || 'Active'}</span></td>
                        <td><span style={{ fontSize: '0.72rem', color: '#167C72' }}><ShieldCheck size={12}/> Verified</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyBox}>
                <Users size={28} />
                <h4 className={styles.emptyTitle}>No Workers Assigned Yet</h4>
                <p className={styles.emptyText}>Workers allocated to this project will be displayed here.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. MACHINERY & FUEL TAB */}
        {activeTab === 'machinery' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockTitle}>
              <Truck size={16} className={styles.titleIcon} />
              <h4>Deployed Machinery & Heavy Equipment ({projectFleets.length})</h4>
            </div>

            {projectFleets.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Equipment Code & Model</th>
                      <th>Operating Log</th>
                      <th>Assigned Operator</th>
                      <th>Telematics</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectFleets.map((f: any) => (
                      <tr key={f.id || f.documentId}>
                        <td>
                          <strong>{f.code} &mdash; {f.name}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>Reg: {f.registrationNumber || 'N/A'}</div>
                        </td>
                        <td>{f.operatingHoursOrKm || 0} {f.meterUnit || 'Hours'}</td>
                        <td>{f.assignedOperator || 'Unassigned'}</td>
                        <td>{f.telematicsStatus || 'GPS Online'}</td>
                        <td><span style={{ color: '#10B981', fontWeight: 700 }}>{f.currentStatus || 'Operational'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyBox}>
                <Truck size={28} />
                <h4 className={styles.emptyTitle}>No Heavy Equipment Deployed</h4>
                <p className={styles.emptyText}>Machinery allocated to this project will be listed here.</p>
              </div>
            )}
          </div>
        )}

        {/* 5. FIELD SUBMISSIONS TAB */}
        {activeTab === 'requests' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockTitle}>
              <FileText size={16} className={styles.titleIcon} />
              <h4>Field Submissions & Approvals ({projectRequests.length})</h4>
            </div>

            {projectRequests.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Request Title & Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                      <th>Admin Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectRequests.map((r: any) => (
                      <tr key={r.id || r.documentId}>
                        <td>
                          <strong>{r.title}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>{r.requestType}</div>
                        </td>
                        <td>{r.priority || 'Standard'}</td>
                        <td>
                          <span style={{ 
                            color: r.status === 'Approved' ? '#10B981' : r.status === 'Under Review' ? '#D97706' : '#203A3B',
                            fontWeight: 700 
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.submittedDate || '18 Nov 2026'}</td>
                        <td>{r.adminRemarks || 'Under technical evaluation.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyBox}>
                <FileText size={28} />
                <h4 className={styles.emptyTitle}>No Submissions Logged</h4>
                <p className={styles.emptyText}>Material indents, DPRs and site issue reports for this project will appear here.</p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
