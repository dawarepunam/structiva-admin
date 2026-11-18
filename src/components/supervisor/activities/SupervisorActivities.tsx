'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './Activities.module.css';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  Building, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  Send, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity, createStrapiEntity } from '@/services/strapiClient';
import { EnterpriseProjectRecord } from '@/services/projectStorage';

export default function SupervisorActivitiesView() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Raw Database Collections from Strapi v5
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);

  // Authenticated Supervisor Identity
  const [supervisorUser, setSupervisorUser] = useState({
    name: 'Er. Pravin Gaikwad',
    empId: 'EMP-SUP-084',
    role: 'Supervisor'
  });

  // Controls & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Task Details Drawer State
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('In Progress');
  const [completedQtyInput, setCompletedQtyInput] = useState<string>('');
  const [progressPercentInput, setProgressPercentInput] = useState<number>(0);
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [blockersInput, setBlockersInput] = useState<string>('');
  const [updateSaved, setUpdateSaved] = useState<boolean>(false);

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

  async function loadTasksData() {
    setLoading(true);
    try {
      const [requestsRes, projectsRes] = await Promise.all([
        fetchStrapiCollection('supervisor-requests', []),
        fetchStrapiCollection<EnterpriseProjectRecord>('projects', [])
      ]);

      setAllRequests(requestsRes || []);
      setProjects(projectsRes || []);
    } catch (err) {
      console.error('Failed to load tasks from Strapi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasksData();
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await loadTasksData();
    setSyncing(false);
  };

  // ─────────────────────────────────────────────────────────────
  // STRICT IDENTITY-BASED PROJECT & TASK ASSIGNMENT FILTERING
  // Supervisor sees ONLY tasks belonging to their assigned projects
  // ─────────────────────────────────────────────────────────────
  const assignedProjects = useMemo(() => {
    const supQuery = supervisorUser.name.toLowerCase().trim();
    return projects.filter((p: any) => {
      if (!p.projectSupervisor) return false;
      const assigned = p.projectSupervisor.toLowerCase().trim();
      return assigned.includes(supQuery) || supQuery.includes(assigned);
    });
  }, [projects, supervisorUser.name]);

  const assignedTasks = useMemo(() => {
    const projectNames = assignedProjects.map(p => p.name.toLowerCase().split('(')[0].trim());
    const supervisorQuery = supervisorUser.name.toLowerCase().trim();

    return allRequests
      .filter((r: any) => r.requestType === 'Task')
      .filter((r: any) => {
        // Direct supervisor match
        if (r.submittedBy && r.submittedBy.toLowerCase().includes(supervisorQuery)) return true;
        // Project assignment match
        if (r.project) {
          const taskProj = r.project.toLowerCase();
          return projectNames.some(pName => taskProj.includes(pName));
        }
        return false;
      })
      .map((r: any) => {
        let parsedDetails: any = {};
        try {
          parsedDetails = typeof r.details === 'string' ? JSON.parse(r.details) : (r.details || {});
        } catch {
          parsedDetails = {};
        }

        return {
          id: r.id || r.documentId,
          documentId: r.documentId,
          title: r.title,
          project: r.project || 'Skyline Commercial Complex',
          site: r.site || 'Tower A',
          category: r.category || 'General Civil',
          priority: r.priority || 'Standard',
          status: r.status || 'In Progress',
          remarks: r.remarks || '',
          adminRemarks: r.adminRemarks || '',
          submittedBy: r.submittedBy,
          submittedDate: r.submittedDate || '18 Nov 2026',
          // Structured details
          taskId: parsedDetails.taskId || `TSK-${r.id || '101'}`,
          plannedQty: parsedDetails.plannedQty || 100,
          completedQty: parsedDetails.completedQty || 0,
          unit: parsedDetails.unit || 'Units',
          progressPercent: parsedDetails.progressPercent !== undefined ? parsedDetails.progressPercent : (r.status === 'Completed' ? 100 : 50),
          startDate: parsedDetails.startDate || '16 Nov 2026',
          dueDate: parsedDetails.dueDate || '20 Nov 2026',
          assignedTeam: parsedDetails.assignedTeam || 'Site Civil Crew',
          workCompletedToday: parsedDetails.workCompletedToday || '',
          workInProgress: parsedDetails.workInProgress || '',
          blockers: parsedDetails.blockers || 'None'
        };
      });
  }, [allRequests, assignedProjects, supervisorUser.name]);

  // ─────────────────────────────────────────────────────────────
  // 6-METRIC TASK OVERVIEW (100% REAL DATABASE COUNTS)
  // ─────────────────────────────────────────────────────────────
  const overviewStats = useMemo(() => {
    const total = assignedTasks.length;
    const notStarted = assignedTasks.filter(t => t.status === 'Not Started').length;
    const inProgress = assignedTasks.filter(t => t.status === 'In Progress').length;
    const completed = assignedTasks.filter(t => t.status === 'Completed').length;
    const delayed = assignedTasks.filter(t => t.status === 'Delayed').length;
    const pendingReview = assignedTasks.filter(t => t.status === 'Under Review' || t.status === 'Pending Verification').length;

    return {
      total,
      notStarted,
      inProgress,
      completed,
      delayed,
      pendingReview
    };
  }, [assignedTasks]);

  // Search & Filters
  const filteredTasks = useMemo(() => {
    return assignedTasks.filter(t => {
      const matchesSearch = 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.taskId.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.project.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCat;
    });
  }, [assignedTasks, search, statusFilter, priorityFilter, categoryFilter]);

  const handleOpenDrawer = (task: any) => {
    setSelectedTask(task);
    setUpdateStatus(task.status);
    setCompletedQtyInput(task.completedQty?.toString() || '');
    setProgressPercentInput(task.progressPercent || 0);
    setRemarksInput(task.remarks || '');
    setBlockersInput(task.blockers !== 'None' ? task.blockers : '');
    setUpdateSaved(false);
  };

  const handleSaveProgress = async () => {
    if (!selectedTask) return;

    const updatedDetails = {
      taskId: selectedTask.taskId,
      category: selectedTask.category,
      plannedQty: selectedTask.plannedQty,
      completedQty: Number(completedQtyInput) || selectedTask.completedQty,
      unit: selectedTask.unit,
      progressPercent: progressPercentInput,
      startDate: selectedTask.startDate,
      dueDate: selectedTask.dueDate,
      assignedTeam: selectedTask.assignedTeam,
      workCompletedToday: `${completedQtyInput} ${selectedTask.unit} verified by supervisor.`,
      workInProgress: remarksInput,
      blockers: blockersInput || 'None'
    };

    const updatePayload = {
      status: updateStatus,
      remarks: remarksInput,
      details: JSON.stringify(updatedDetails)
    };

    if (selectedTask.documentId) {
      await updateStrapiEntity('supervisor-requests', selectedTask.documentId, updatePayload);
    }

    setUpdateSaved(true);
    await loadTasksData();
    setTimeout(() => {
      setUpdateSaved(false);
      setSelectedTask(null);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.titleArea}>
          <h1>Activities & Construction Tasks</h1>
          <p>
            Field work packages, progress tracking, and site execution milestones for Supervisor <strong>{supervisorUser.name}</strong> ({supervisorUser.empId}).
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.badge}>ADMIN ASSIGNED TASKS</span>
          <button 
            onClick={handleRefresh} 
            disabled={syncing || loading} 
            className={styles.refreshBtn}
            title="Refresh tasks from central Strapi backend"
          >
            <RefreshCw size={13} className={syncing ? styles.spin : ''} />
            <span>{syncing ? 'Refreshing...' : 'Revalidate'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          6-METRIC OVERVIEW STRIP
          ───────────────────────────────────────────────────────── */}
      <section className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Assigned</span>
          <strong className={styles.overviewValue}>{overviewStats.total}</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>All Work Packages</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Not Started</span>
          <strong className={styles.overviewValue}>{overviewStats.notStarted}</strong>
          <span className={`${styles.overviewTag} ${styles.tagAmber}`}>Scheduled</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>In Progress</span>
          <strong className={styles.overviewValue}>{overviewStats.inProgress}</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>Active On Site</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Completed</span>
          <strong className={styles.overviewValue}>{overviewStats.completed}</strong>
          <span className={`${styles.overviewTag} ${styles.tagGreen}`}>Execution Finished</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Delayed / Blocker</span>
          <strong className={styles.overviewValue}>{overviewStats.delayed}</strong>
          <span className={`${styles.overviewTag} ${overviewStats.delayed > 0 ? styles.tagRed : styles.tagGreen}`}>
            {overviewStats.delayed === 0 ? 'Zero Blockers' : 'Action Required'}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Pending Review</span>
          <strong className={styles.overviewValue}>{overviewStats.pendingReview}</strong>
          <span className={`${styles.overviewTag} ${styles.tagAmber}`}>Under PM Evaluation</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          CONTROLS STRIP (SEARCH & FILTERS)
          ───────────────────────────────────────────────────────── */}
      <div className={styles.controlsStrip}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks by title, code, trade, or project..."
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
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Standard">Standard</option>
            <option value="Critical">Critical</option>
          </select>

          {(search || statusFilter !== 'All' || priorityFilter !== 'All') && (
            <button 
              onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); }} 
              className={styles.clearBtn}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          TASK TABLE
          ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={styles.stateBox}>
          <Clock size={32} />
          <h3 className={styles.stateTitle}>Loading Activities & Tasks...</h3>
          <p className={styles.stateText}>Querying verified Strapi v5 work records.</p>
        </div>
      ) : assignedTasks.length === 0 ? (
        <div className={styles.stateBox}>
          <CheckSquare size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Tasks Currently Assigned</h3>
          <p className={styles.stateText}>
            You have no active work packages assigned by the Planning Engineer or Central Admin desk. Official tasks will appear here once allocated.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.stateBox}>
          <Search size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Matching Tasks Found</h3>
          <p className={styles.stateText}>
            No tasks match your search criteria "{search}". Try clearing your filters.
          </p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Activity / Task Title</th>
                  <th>Category</th>
                  <th>Assigned Site</th>
                  <th>Priority</th>
                  <th>Timeline</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t: any) => {
                  const statusClass = 
                    t.status === 'Completed' ? styles.statusCompleted :
                    t.status === 'In Progress' ? styles.statusActive :
                    styles.statusPending;

                  return (
                    <tr key={t.id || t.documentId}>
                      <td className={styles.taskId}>{t.taskId}</td>
                      <td>
                        <strong>{t.title}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>
                          Team: {t.assignedTeam}
                        </div>
                      </td>
                      <td>{t.category}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{t.site}</span>
                        <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>{t.project}</div>
                      </td>
                      <td>
                        <span className={t.priority === 'High' || t.priority === 'Critical' ? styles.priorityHigh : styles.priorityStandard}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem' }}>Due: <strong>{t.dueDate}</strong></div>
                        <div style={{ fontSize: '0.68rem', color: '#8C9990' }}>Start: {t.startDate}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#167C72' }}>
                          {t.progressPercent}%
                        </div>
                        <div className={styles.miniProgressBar}>
                          <div className={styles.miniProgressFill} style={{ width: `${t.progressPercent}%` }}></div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusActive} ${statusClass}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleOpenDrawer(t)} 
                          className={styles.viewBtn}
                        >
                          <span>Update Progress</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          TASK DETAILS & PROGRESS UPDATE DRAWER
          ───────────────────────────────────────────────────────── */}
      {selectedTask && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedTask(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span className={styles.badge}>{selectedTask.taskId}</span>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
                  {selectedTask.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#ECEBE5' }}>
                  {selectedTask.category} &middot; {selectedTask.site}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)} 
                className={styles.drawerCloseBtn}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              
              {/* Task Specifications */}
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>Work Specifications</h4>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Parent Project</span>
                  <span className={styles.drawerFieldValue}>{selectedTask.project}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Assigned Site</span>
                  <span className={styles.drawerFieldValue}>{selectedTask.site}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Assigned Crew / Team</span>
                  <span className={styles.drawerFieldValue}>{selectedTask.assignedTeam}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Planned Target Quantity</span>
                  <span className={styles.drawerFieldValue}>{selectedTask.plannedQty} {selectedTask.unit}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Target Due Date</span>
                  <span className={styles.drawerFieldValue} style={{ color: '#D97706', fontWeight: 700 }}>
                    {selectedTask.dueDate}
                  </span>
                </div>
              </div>

              {/* Admin Feedback */}
              {selectedTask.adminRemarks && (
                <div className={styles.drawerSection}>
                  <h4 className={styles.drawerSectionTitle}>Project Manager Directive</h4>
                  <div style={{ background: '#F4F2EC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#172B32' }}>
                    {selectedTask.adminRemarks}
                  </div>
                </div>
              )}

              {/* Progress Update Form */}
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>Submit Work Execution Progress</h4>
                
                <div className={styles.updateForm}>
                  <div>
                    <label className={styles.formLabel}>Execution Status</label>
                    <select 
                      value={updateStatus} 
                      onChange={(e) => setUpdateStatus(e.target.value)} 
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="In Progress">In Progress (Active Work)</option>
                      <option value="Completed">Completed (Ready for Inspection)</option>
                      <option value="Delayed">Delayed / Blocker Encountered</option>
                      <option value="On Hold">On Hold (Awaiting Consultant)</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.formLabel}>Cumulative Quantity Completed ({selectedTask.unit})</label>
                    <input 
                      type="number" 
                      value={completedQtyInput} 
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setCompletedQtyInput(e.target.value);
                        if (selectedTask.plannedQty > 0) {
                          setProgressPercentInput(Math.min(100, Math.round((val / selectedTask.plannedQty) * 100)));
                        }
                      }}
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px' }}
                      placeholder={`e.g. ${selectedTask.plannedQty}`}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span>Calculated Progress</span>
                      <strong style={{ color: '#167C72' }}>{progressPercentInput}%</strong>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={progressPercentInput} 
                      onChange={(e) => setProgressPercentInput(Number(e.target.value))}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Work Completed Today & Remarks</label>
                    <textarea 
                      value={remarksInput} 
                      onChange={(e) => setRemarksInput(e.target.value)}
                      rows={2}
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px', resize: 'vertical' }}
                      placeholder="Specify grids poured, steel tied, or shuttering progress..."
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Blockers / Delay Reasons (if any)</label>
                    <input 
                      type="text" 
                      value={blockersInput} 
                      onChange={(e) => setBlockersInput(e.target.value)}
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px' }}
                      placeholder="e.g. Rain stoppage, awaiting RMC transit mixer..."
                    />
                  </div>

                  <button 
                    onClick={handleSaveProgress} 
                    className={styles.submitUpdateBtn}
                  >
                    <Send size={14} />
                    <span>{updateSaved ? 'Progress Saved to Central Strapi!' : 'Save & Sync Progress'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
