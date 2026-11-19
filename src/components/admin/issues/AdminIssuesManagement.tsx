'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdminIssues.module.css';
import {
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  History,
  X,
  Search,
  RotateCcw,
  FileText,
  Eye,
  Check,
  ShieldAlert,
  Wrench,
  UserCheck
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity } from '@/services/strapiClient';

interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

interface SiteIssueRecord {
  id: number;
  document_id?: string;
  documentId?: string;
  request_type?: string;
  requestType?: string;
  issue_reference?: string;
  title: string;
  project: string;
  site?: string;
  category?: string;
  priority: 'Critical' | 'High' | 'Standard';
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolution Submitted' | 'Closed' | 'On Hold' | 'Reopened';
  incident_time?: string;
  exact_location?: string;
  immediate_action?: string;
  safety_risk?: string;
  work_impact?: string;
  remarks?: string;
  admin_remarks?: string;
  submitted_by?: string;
  submittedBy?: string;
  submitted_date?: string;
  assigned_supervisor?: string;
  assigned_worker_id?: number;
  assigned_worker_name?: string;
  worker_remarks?: string;
  resolution_description?: string;
  audit_timeline_json?: string;
}

export default function AdminIssuesManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'critical' | 'pending' | 'progress' | 'resolutions' | 'closed'>('overview');

  const [issues, setIssues] = useState<SiteIssueRecord[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer state
  const [selectedIssue, setSelectedIssue] = useState<SiteIssueRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Admin Action Modal
  const [actionIssue, setActionIssue] = useState<SiteIssueRecord | null>(null);
  const [actionType, setActionType] = useState<'assign' | 'approve' | 'reject' | 'close' | null>(null);
  const [assignedWorkerId, setAssignedWorkerId] = useState<number | ''>('');
  const [actionRemarks, setActionRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allReqs, allWrks] = await Promise.all([
        fetchStrapiCollection('supervisor-requests', []),
        fetchStrapiCollection('workers', [])
      ]);

      const siteIssues = (allReqs || []).filter((r: any) => 
        r.request_type === 'Site Issue' || r.requestType === 'Site Issue'
      );

      setIssues(siteIssues);
      setWorkers(allWrks || []);
    } catch (err) {
      console.error('Failed to load admin issues data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 6-Metric Calculations
  const metrics = useMemo(() => {
    let totalIssues = issues.length;
    let criticalIssues = 0;
    let pendingReview = 0;
    let inProgress = 0;
    let resolutionSubmitted = 0;
    let closed = 0;

    issues.forEach(i => {
      if (i.priority === 'Critical') criticalIssues++;
      if (i.status === 'Submitted' || i.status === 'Under Review') pendingReview++;
      else if (i.status === 'In Progress' || i.status === 'Assigned') inProgress++;
      else if (i.status === 'Resolution Submitted') resolutionSubmitted++;
      else if (i.status === 'Closed') closed++;
    });

    return {
      totalIssues,
      criticalIssues,
      pendingReview,
      inProgress,
      resolutionSubmitted,
      closed
    };
  }, [issues]);

  // Displayed filtered table
  const displayedIssues = useMemo(() => {
    let list = [...issues];

    if (activeTab === 'critical') list = list.filter(i => i.priority === 'Critical');
    else if (activeTab === 'pending') list = list.filter(i => i.status === 'Submitted' || i.status === 'Under Review');
    else if (activeTab === 'progress') list = list.filter(i => i.status === 'In Progress' || i.status === 'Assigned');
    else if (activeTab === 'resolutions') list = list.filter(i => i.status === 'Resolution Submitted');
    else if (activeTab === 'closed') list = list.filter(i => i.status === 'Closed');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        (i.issue_reference || '').toLowerCase().includes(q) ||
        (i.title || '').toLowerCase().includes(q) ||
        (i.project || '').toLowerCase().includes(q) ||
        (i.assigned_worker_name || '').toLowerCase().includes(q)
      );
    }

    if (projectFilter !== 'ALL') list = list.filter(i => i.project.includes(projectFilter));
    if (categoryFilter !== 'ALL') list = list.filter(i => i.category === categoryFilter);
    if (priorityFilter !== 'ALL') list = list.filter(i => i.priority === priorityFilter);
    if (statusFilter !== 'ALL') list = list.filter(i => i.status === statusFilter);

    return list;
  }, [issues, activeTab, searchQuery, projectFilter, categoryFilter, priorityFilter, statusFilter]);

  // Execute Admin Action
  const handleExecuteAction = async () => {
    if (!actionIssue || !actionType) return;

    setSubmitting(true);
    try {
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let existingAudit: AuditEntry[] = [];
      try {
        existingAudit = JSON.parse(actionIssue.audit_timeline_json || '[]');
      } catch (e) {}

      let updateData: any = {};

      if (actionType === 'assign') {
        let workerName = '';
        if (assignedWorkerId) {
          const w = workers.find(item => item.id === Number(assignedWorkerId));
          if (w) workerName = w.name;
        }

        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin)',
          action: `Assigned to ${workerName}`,
          note: actionRemarks || 'Assigned to site trade worker for physical rectification.'
        });

        updateData = {
          status: 'Assigned',
          assigned_worker_id: assignedWorkerId ? Number(assignedWorkerId) : null,
          assigned_worker_name: workerName,
          admin_remarks: actionRemarks,
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'approve') {
        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin)',
          action: 'Resolution Approved & Verified',
          note: actionRemarks || 'Approved after physical site inspection.'
        });

        updateData = {
          status: 'Closed',
          admin_remarks: actionRemarks || 'Resolution verified and accepted',
          closed_at: timestampStr,
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'reject') {
        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin)',
          action: 'Resolution Rejected (Work Reopened)',
          note: actionRemarks
        });

        updateData = {
          status: 'In Progress',
          admin_remarks: `REJECTED: ${actionRemarks}`,
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'close') {
        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin)',
          action: 'Ticket Closed & Archived',
          note: actionRemarks || 'Safety hazard officially resolved.'
        });

        updateData = {
          status: 'Closed',
          closed_at: timestampStr,
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      }

      const targetId = String(actionIssue.document_id || actionIssue.documentId || actionIssue.id);
      await updateStrapiEntity('supervisor-requests', targetId, updateData);

      setActionIssue(null);
      setActionType(null);
      setActionRemarks('');
      await loadData();

      if (selectedIssue && selectedIssue.id === actionIssue.id) {
        setShowDrawer(false);
      }
    } catch (err: any) {
      alert('Operation failed: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  const parseAudit = (issue: SiteIssueRecord): AuditEntry[] => {
    try {
      if (issue.audit_timeline_json) return JSON.parse(issue.audit_timeline_json);
    } catch (e) {}
    return [
      {
        timestamp: issue.submitted_date || 'Recent',
        actor: issue.submitted_by || 'Supervisor',
        action: 'Incident Filed',
        note: issue.remarks || 'Initial entry'
      }
    ];
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>
            <AlertOctagon size={28} />
            <span>Central Incident & Site Maintenance Control</span>
          </h1>
          <p>
            Enterprise hazard monitoring, multi-site EHS compliance, trade technician dispatch, and resolution verification.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnActionSecondary} onClick={() => loadData()} title="Refresh database records">
            <RotateCcw size={15} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Incidents</span>
            <span className={styles.summaryValue}>{metrics.totalIssues}</span>
            <span className={styles.summarySubtext}>Company-wide tickets</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconSlate}`}>
            <AlertOctagon size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Critical Safety Hazards</span>
            <span className={styles.summaryValue} style={{ color: '#DC2626' }}>{metrics.criticalIssues}</span>
            <span className={styles.summarySubtext}>High priority alert</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconRose}`}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Pending Assignment</span>
            <span className={styles.summaryValue}>{metrics.pendingReview}</span>
            <span className={styles.summarySubtext}>Awaiting technician</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <Clock size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Active Remediation</span>
            <span className={styles.summaryValue}>{metrics.inProgress}</span>
            <span className={styles.summarySubtext}>In Progress</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconTeal}`}>
            <Wrench size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Awaiting Verification</span>
            <span className={styles.summaryValue} style={{ color: '#B45309' }}>{metrics.resolutionSubmitted}</span>
            <span className={styles.summarySubtext}>Resolution submitted</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <UserCheck size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Closed & EHS Certified</span>
            <span className={styles.summaryValue}>{metrics.closed}</span>
            <span className={styles.summarySubtext}>Archived</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      <div className={styles.tabNav}>
        <button className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('overview')}>
          <AlertOctagon size={16} />
          <span>Overview</span>
        </button>

        <button className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('all')}>
          <FileText size={16} />
          <span>All Incidents</span>
          <span className={activeTab === 'all' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
            {issues.length}
          </span>
        </button>

        <button className={`${styles.tabBtn} ${activeTab === 'critical' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('critical')}>
          <ShieldAlert size={16} />
          <span>Critical EHS</span>
          {metrics.criticalIssues > 0 && (
            <span className={activeTab === 'critical' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.criticalIssues}
            </span>
          )}
        </button>

        <button className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('pending')}>
          <Clock size={16} />
          <span>Pending Review</span>
          {metrics.pendingReview > 0 && (
            <span className={activeTab === 'pending' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.pendingReview}
            </span>
          )}
        </button>

        <button className={`${styles.tabBtn} ${activeTab === 'progress' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('progress')}>
          <Wrench size={16} />
          <span>In Progress</span>
          {metrics.inProgress > 0 && (
            <span className={activeTab === 'progress' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.inProgress}
            </span>
          )}
        </button>

        <button className={`${styles.tabBtn} ${activeTab === 'resolutions' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('resolutions')}>
          <UserCheck size={16} />
          <span>Resolutions</span>
          {metrics.resolutionSubmitted > 0 && (
            <span className={activeTab === 'resolutions' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.resolutionSubmitted}
            </span>
          )}
        </button>

        <button className={`${styles.tabBtn} ${activeTab === 'closed' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('closed')}>
          <CheckCircle2 size={16} />
          <span>Closed</span>
        </button>
      </div>

      <div className={styles.paneContainer}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={16} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search by Reference, title, project, technician..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterControls}>
            <select className={styles.selectInput} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
              <option value="ALL">All Projects</option>
              <option value="Skyline">Skyline Commercial Complex</option>
              <option value="Expressway">Eastern Expressway Link</option>
            </select>

            <select className={styles.selectInput} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
            </select>

            <select className={styles.selectInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted / Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolution Submitted">Resolution Submitted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#667085' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading company incident records...</div>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertOctagon size={40} style={{ color: '#B58B59', opacity: 0.8 }} />
            <div className={styles.emptyStateTitle}>No Incidents Found</div>
            <div className={styles.emptyStateSubtitle}>
              There are no incident records matching your filter parameters.
            </div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Date</th>
                  <th>Project & Site</th>
                  <th>Issue Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Technician</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedIssues.map(issue => {
                  const status = issue.status || 'Submitted';
                  const refId = issue.issue_reference || `ISS-${issue.id}`;

                  return (
                    <tr key={issue.id}>
                      <td style={{ fontWeight: 700, color: '#172B32' }}>{refId}</td>
                      <td style={{ whiteSpace: 'nowrap', color: '#667085' }}>{issue.submitted_date || 'Recent'}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#172B32' }}>{issue.project}</div>
                        <div style={{ fontSize: '0.74rem', color: '#8391A1' }}>{issue.exact_location || issue.site}</div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#172B32', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={issue.title}>
                          {issue.title}
                        </div>
                      </td>
                      <td>
                        <span className={`
                          ${styles.badge}
                          ${issue.priority === 'Critical' ? styles.badgePriorityCritical : ''}
                          ${issue.priority === 'High' ? styles.badgePriorityHigh : ''}
                          ${issue.priority === 'Standard' ? styles.badgePriorityStandard : ''}
                        `}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`
                          ${styles.badge}
                          ${status === 'In Progress' ? styles.badgeProgress : ''}
                          ${status === 'Resolution Submitted' ? styles.badgePending : ''}
                          ${status === 'Closed' ? styles.badgeApproved : ''}
                          ${status === 'Submitted' ? styles.badgePending : ''}
                        `}>
                          {status === 'Closed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{status}</span>
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#172B32' }}>
                        {issue.assigned_worker_name ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <UserCheck size={13} style={{ color: '#167C72' }} />
                            <span>{issue.assigned_worker_name}</span>
                          </span>
                        ) : (
                          <span style={{ color: '#8391A1', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className={styles.tableActionBtn} onClick={() => { setSelectedIssue(issue); setShowDrawer(true); }} title="View particulars">
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {status === 'Submitted' && (
                            <button className={styles.tableActionBtn} style={{ background: '#E0F2F1', color: '#00695C', borderColor: '#80CBC4' }} onClick={() => { setActionIssue(issue); setActionType('assign'); }} title="Assign Worker">
                              <Wrench size={13} />
                              <span>Assign</span>
                            </button>
                          )}

                          {status === 'Resolution Submitted' && (
                            <>
                              <button className={styles.tableActionBtn} style={{ background: '#E8F5E9', color: '#1B5E20', borderColor: '#A5D6A7' }} onClick={() => { setActionIssue(issue); setActionType('approve'); }} title="Approve & Close">
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button className={styles.tableActionBtn} style={{ background: '#FFEBEE', color: '#C62828', borderColor: '#FFCDD2' }} onClick={() => { setActionIssue(issue); setActionType('reject'); }} title="Reject & Reopen">
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDrawer && selectedIssue && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#B58B59', fontWeight: 700, letterSpacing: '0.04em' }}>
                  ADMIN INCIDENT CONTROL
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedIssue.issue_reference || `ISS-${selectedIssue.id}`}
                </div>
              </div>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'transparent', border: 'none', color: '#ECEBE5', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Project</div>
                  <div className={styles.detailItemValue}>{selectedIssue.project}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Category</div>
                  <div className={styles.detailItemValue}>{selectedIssue.category}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Priority</div>
                  <div className={styles.detailItemValue}>{selectedIssue.priority}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Current Status</div>
                  <div className={styles.detailItemValue}>{selectedIssue.status}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Assigned Technician</div>
                  <div className={styles.detailItemValue}>{selectedIssue.assigned_worker_name || 'Unassigned'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Reported By</div>
                  <div className={styles.detailItemValue}>{selectedIssue.submitted_by}</div>
                </div>
              </div>

              <div className={styles.detailBox}>
                <div className={styles.detailItemLabel}>Immediate Action Taken</div>
                <div style={{ fontSize: '0.85rem', color: '#172B32' }}>{selectedIssue.immediate_action || 'Area isolated'}</div>
              </div>

              {selectedIssue.resolution_description && (
                <div className={styles.detailBox} style={{ background: '#E8F5E9', borderColor: '#C8E6C9' }}>
                  <div className={styles.detailItemLabel} style={{ color: '#2E7D32' }}>Submitted Resolution Narrative</div>
                  <div style={{ fontSize: '0.85rem', color: '#1B5E20' }}>{selectedIssue.resolution_description}</div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={15} />
                  <span>Activity Timeline</span>
                </div>
                <div className={styles.timelineList}>
                  {parseAudit(selectedIssue).map((entry, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineActor}>{entry.actor}</span>
                        <span className={styles.timelineTime}>{entry.timestamp}</span>
                      </div>
                      <div className={styles.timelineAction}>{entry.action}</div>
                      {entry.note && <div className={styles.timelineNote}>{entry.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.btnActionSecondary} style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#FFFFFF' }} onClick={() => window.print()}>
                <FileText size={15} />
                <span>Print Ticket</span>
              </button>
              <button className={styles.btnActionPrimary} onClick={() => setShowDrawer(false)}>
                Close Particulars
              </button>
            </div>
          </div>
        </div>
      )}

      {actionIssue && actionType && (
        <div className={styles.drawerOverlay}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.5rem', width: '100%', maxWidth: '500px', margin: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#167C72', marginBottom: '0.75rem' }}>
              <AlertOctagon size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {actionType === 'assign' && 'Assign Site Trade Technician'}
                {actionType === 'approve' && 'Approve Resolution & Close Ticket'}
                {actionType === 'reject' && 'Reject Resolution (Require Re-work)'}
                {actionType === 'close' && 'Close Incident Ticket'}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1rem 0' }}>
              Updating incident <strong>{actionIssue.issue_reference}</strong> ({actionIssue.project}).
            </p>

            {actionType === 'assign' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>Select Trade Worker *</label>
                <select className={styles.formSelect} style={{ width: '100%' }} value={assignedWorkerId} onChange={e => setAssignedWorkerId(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">Select Technician</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.skill || w.category})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>
                {actionType === 'reject' ? 'Rejection Reason *' : 'Administrative Remarks'}
              </label>
              <textarea 
                className={styles.formTextarea} 
                style={{ width: '100%', minHeight: '60px' }}
                value={actionRemarks}
                onChange={e => setActionRemarks(e.target.value)}
                placeholder={actionType === 'reject' ? 'Explain what fails inspection...' : 'Notes regarding assignment or closure...'}
                required={actionType === 'reject'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className={styles.btnActionSecondary} style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }} onClick={() => { setActionIssue(null); setActionType(null); }} disabled={submitting}>
                Cancel
              </button>
              <button 
                className={styles.btnActionPrimary}
                style={{ background: actionType === 'reject' ? '#DC2626' : '#167C72' }}
                onClick={handleExecuteAction}
                disabled={submitting}
              >
                {submitting ? 'Executing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
