'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './IssuesManagement.module.css';
import {
  AlertOctagon,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  History,
  Send,
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
import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from '@/services/strapiClient';

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

export default function SupervisorIssuesView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'all' | 'critical' | 'progress' | 'resolution' | 'closed'>('overview');

  const [issues, setIssues] = useState<SiteIssueRecord[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticated supervisor
  const [currentSupervisor, setCurrentSupervisor] = useState({
    name: 'Er. Pravin Gaikwad (Chief Supervisor)',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A (Podium & Core)'
  });

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer state
  const [selectedIssue, setSelectedIssue] = useState<SiteIssueRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Resolution review state
  const [reviewIssue, setReviewIssue] = useState<SiteIssueRecord | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Report Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Site Safety Hazard (EHS)');
  const [formPriority, setFormPriority] = useState<'Critical' | 'High' | 'Standard'>('Critical');
  const [formTime, setFormTime] = useState('11:30');
  const [formLocation, setFormLocation] = useState('Tower A Level 4 North Core Wall');
  const [formImmediateAction, setFormImmediateAction] = useState('Cordoned off work area with red safety barrier tape');
  const [formSafetyRisk, setFormSafetyRisk] = useState('Fall hazard from elevated core slab opening');
  const [formWorkImpact, setFormWorkImpact] = useState('Halted column rebar placement for 2 hours');
  const [formDescription, setFormDescription] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState<number | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadIssuesData = async () => {
    try {
      setLoading(true);

      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem('structiva_supervisor_session');
        if (sessionStr) {
          try {
            const parsed = JSON.parse(sessionStr);
            if (parsed.name) {
              setCurrentSupervisor(prev => ({
                ...prev,
                name: parsed.name,
                project: parsed.assignedProject || prev.project,
                site: parsed.assignedSite || prev.site
              }));
            }
          } catch (e) {}
        }
      }

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
      console.error('Failed to load site issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssuesData();
  }, []);

  // Supervisor isolation: only show Skyline / Gaikwad issues
  const authorizedIssues = useMemo(() => {
    return issues.filter(v => {
      const proj = v.project || '';
      const sub = v.submitted_by || v.submittedBy || '';
      return (
        proj.toLowerCase().includes('skyline') ||
        proj.toLowerCase().includes('tower a') ||
        sub.toLowerCase().includes('gaikwad') ||
        sub.toLowerCase().includes('kulkarni')
      );
    });
  }, [issues]);

  // Metrics
  const metrics = useMemo(() => {
    let totalIssues = authorizedIssues.length;
    let criticalIssues = 0;
    let submitted = 0;
    let inProgress = 0;
    let resolutionSubmitted = 0;
    let closed = 0;

    authorizedIssues.forEach(i => {
      if (i.priority === 'Critical') criticalIssues++;
      if (i.status === 'Submitted' || i.status === 'Under Review') submitted++;
      else if (i.status === 'In Progress' || i.status === 'Assigned') inProgress++;
      else if (i.status === 'Resolution Submitted') resolutionSubmitted++;
      else if (i.status === 'Closed') closed++;
    });

    return {
      totalIssues,
      criticalIssues,
      submitted,
      inProgress,
      resolutionSubmitted,
      closed
    };
  }, [authorizedIssues]);

  // Displayed filtered table
  const displayedIssues = useMemo(() => {
    let list = [...authorizedIssues];

    if (activeTab === 'critical') list = list.filter(i => i.priority === 'Critical');
    else if (activeTab === 'progress') list = list.filter(i => i.status === 'In Progress' || i.status === 'Assigned');
    else if (activeTab === 'resolution') list = list.filter(i => i.status === 'Resolution Submitted');
    else if (activeTab === 'closed') list = list.filter(i => i.status === 'Closed');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        (i.issue_reference || '').toLowerCase().includes(q) ||
        (i.title || '').toLowerCase().includes(q) ||
        (i.exact_location || '').toLowerCase().includes(q) ||
        (i.assigned_worker_name || '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'ALL') list = list.filter(i => i.category === categoryFilter);
    if (priorityFilter !== 'ALL') list = list.filter(i => i.priority === priorityFilter);
    if (statusFilter !== 'ALL') list = list.filter(i => i.status === statusFilter);

    return list;
  }, [authorizedIssues, activeTab, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  // Report Issue
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formTitle.trim()) {
      setFormError('Please enter an issue title.');
      return;
    }

    setSubmitting(true);
    try {
      const refCount = authorizedIssues.length + 101;
      const issueRef = `ISS-2026-${String(refCount).padStart(3, '0')}`;
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let assignedWorkerName = '';
      if (assignedWorkerId) {
        const found = workers.find(w => w.id === Number(assignedWorkerId));
        if (found) assignedWorkerName = found.name;
      }

      const auditTrail: AuditEntry[] = [
        {
          timestamp: timestampStr,
          actor: currentSupervisor.name,
          action: 'Incident Reported',
          note: formDescription || formImmediateAction
        }
      ];

      if (assignedWorkerName) {
        auditTrail.push({
          timestamp: timestampStr,
          actor: currentSupervisor.name,
          action: `Assigned to ${assignedWorkerName}`,
          note: 'Supervisor on-site trade assignment'
        });
      }

      const payload = {
        request_type: 'Site Issue',
        requestType: 'Site Issue',
        issue_reference: issueRef,
        title: formTitle,
        project: currentSupervisor.project,
        site: currentSupervisor.site,
        category: formCategory,
        priority: formPriority,
        status: assignedWorkerName ? 'Assigned' : 'Submitted',
        incident_time: formTime,
        exact_location: formLocation,
        immediate_action: formImmediateAction,
        safety_risk: formSafetyRisk,
        work_impact: formWorkImpact,
        remarks: formDescription,
        submitted_by: currentSupervisor.name,
        submittedBy: currentSupervisor.name,
        submitted_date: now.toLocaleDateString('en-GB'),
        assigned_supervisor: currentSupervisor.name,
        assigned_worker_id: assignedWorkerId ? Number(assignedWorkerId) : null,
        assigned_worker_name: assignedWorkerName,
        audit_timeline_json: JSON.stringify(auditTrail)
      };

      await createStrapiEntity('supervisor-requests', payload);

      setFormSuccess(`✓ Issue ticket ${issueRef} successfully filed and transmitted to PM & EHS desk!`);
      setFormTitle('');
      setFormDescription('');
      await loadIssuesData();

      setTimeout(() => {
        setActiveTab('all');
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      console.error('Failed to report issue:', err);
      setFormError('Failed to record issue ticket in Strapi backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // Supervisor verification of worker resolution
  const handleVerifyResolution = async () => {
    if (!reviewIssue) return;

    setSubmitting(true);
    try {
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let existingAudit: AuditEntry[] = [];
      try {
        existingAudit = JSON.parse(reviewIssue.audit_timeline_json || '[]');
      } catch (e) {}

      existingAudit.push({
        timestamp: timestampStr,
        actor: currentSupervisor.name,
        action: 'Supervisor Physical Verification Sign-off',
        note: reviewRemarks || 'Physical work inspected on site and confirmed sound.'
      });

      const updateData = {
        remarks: `${reviewIssue.remarks || ''}\n[Supervisor Sign-off]: ${reviewRemarks}`,
        audit_timeline_json: JSON.stringify(existingAudit)
      };

      const targetId = String(reviewIssue.document_id || reviewIssue.documentId || reviewIssue.id);
      await updateStrapiEntity('supervisor-requests', targetId, updateData);

      setReviewIssue(null);
      setReviewRemarks('');
      await loadIssuesData();

      if (selectedIssue && selectedIssue.id === reviewIssue.id) {
        setShowDrawer(false);
      }
    } catch (err: any) {
      alert('Verification failed: ' + (err.message || 'Server error'));
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
        actor: issue.submitted_by || currentSupervisor.name,
        action: 'Incident Filed',
        note: issue.remarks || 'Initial entry'
      }
    ];
  };

  return (
    <div className={styles.container}>
      {/* --------------------------------------------------------------------
         1. Header Section
         -------------------------------------------------------------------- */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>
            <AlertOctagon size={28} />
            <span>Site Issues, EHS Incidents & Maintenance</span>
          </h1>
          <p>
            Field hazard reporting, immediate safety interventions, trade crew dispatch, worker resolution tracking, and administrative sign-offs.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.btnActionSecondary}
            onClick={() => loadIssuesData()}
            title="Refresh database records"
          >
            <RotateCcw size={15} />
            <span>Sync Live</span>
          </button>
          <button 
            className={styles.btnActionPrimary}
            onClick={() => setActiveTab('report')}
          >
            <PlusCircle size={16} />
            <span>File Incident Ticket</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         2. 6-Metric Summary Overview Grid
         -------------------------------------------------------------------- */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Site Issues</span>
            <span className={styles.summaryValue}>{metrics.totalIssues}</span>
            <span className={styles.summarySubtext}>Active site tickets</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconSlate}`}>
            <AlertOctagon size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Critical Safety Hazards</span>
            <span className={styles.summaryValue} style={{ color: '#DC2626' }}>{metrics.criticalIssues}</span>
            <span className={styles.summarySubtext}>Immediate action required</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconRose}`}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Pending Admin Review</span>
            <span className={styles.summaryValue}>{metrics.submitted}</span>
            <span className={styles.summarySubtext}>Under PM assessment</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <Clock size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Work In Progress</span>
            <span className={styles.summaryValue}>{metrics.inProgress}</span>
            <span className={styles.summarySubtext}>Assigned to trade crew</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconTeal}`}>
            <Wrench size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Resolution Submitted</span>
            <span className={styles.summaryValue} style={{ color: '#B45309' }}>{metrics.resolutionSubmitted}</span>
            <span className={styles.summarySubtext}>Awaiting verification</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <UserCheck size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Resolved & Closed</span>
            <span className={styles.summaryValue}>{metrics.closed}</span>
            <span className={styles.summarySubtext}>Verified & archived</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         3. Workspace Tabs Bar
         -------------------------------------------------------------------- */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <AlertOctagon size={16} />
          <span>Overview</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'report' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <PlusCircle size={16} />
          <span>File Incident</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FileText size={16} />
          <span>All Site Issues</span>
          <span className={activeTab === 'all' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
            {authorizedIssues.length}
          </span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'critical' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('critical')}
        >
          <ShieldAlert size={16} />
          <span>Critical Hazards</span>
          {metrics.criticalIssues > 0 && (
            <span className={activeTab === 'critical' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.criticalIssues}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'progress' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <Wrench size={16} />
          <span>In Progress</span>
          {metrics.inProgress > 0 && (
            <span className={activeTab === 'progress' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.inProgress}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'resolution' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('resolution')}
        >
          <UserCheck size={16} />
          <span>Resolution Submitted</span>
          {metrics.resolutionSubmitted > 0 && (
            <span className={activeTab === 'resolution' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.resolutionSubmitted}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'closed' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          <CheckCircle2 size={16} />
          <span>Closed</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
         4. Pane: REPORT INCIDENT FORM
         -------------------------------------------------------------------- */}
      {activeTab === 'report' && (
        <div className={styles.paneContainer}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#172B32' }}>
              File Site Incident & Maintenance Ticket
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#667085', margin: 0 }}>
              Official incident report. Dispatches directly to Project Management, safety marshals, and assigned trade workers.
            </p>
          </div>

          {formSuccess && (
            <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
              {formSuccess}
            </div>
          )}

          {formError && (
            <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleReportSubmit} className={styles.formGrid}>
            <div className={styles.formCardSectionTitle}>
              <Building size={16} />
              <span>Project & Incident Information</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned Project</label>
              <input type="text" className={styles.formInput} value={currentSupervisor.project} disabled style={{ background: '#ECEBE5', cursor: 'not-allowed' }} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned Site</label>
              <input type="text" className={styles.formInput} value={currentSupervisor.site} disabled style={{ background: '#ECEBE5', cursor: 'not-allowed' }} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Incident Category *</label>
              <select className={styles.formSelect} value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                <option value="Site Safety Hazard (EHS)">Site Safety Hazard (EHS)</option>
                <option value="Machinery Breakdown">Machinery Breakdown</option>
                <option value="Material Quality Rejection">Material Quality Rejection</option>
                <option value="Work Execution Delay">Work Execution Delay</option>
                <option value="Electrical Issue">Electrical Issue</option>
                <option value="Civil / Construction Issue">Civil / Construction Issue</option>
                <option value="Environmental Issue">Environmental Issue</option>
                <option value="Manpower Issue">Manpower Issue</option>
                <option value="Other">Other Operational Blocker</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Priority Level *</label>
              <select className={styles.formSelect} value={formPriority} onChange={e => setFormPriority(e.target.value as any)}>
                <option value="Critical">Critical (Immediate Hazard / Job Halt)</option>
                <option value="High">High (Resolution in 4 Hours)</option>
                <option value="Standard">Standard (Within 24 Hours)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Incident Time *</label>
              <input type="time" className={styles.formInput} value={formTime} onChange={e => setFormTime(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Exact Site Location / Grid *</label>
              <input type="text" className={styles.formInput} value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="e.g. Tower A Level 4 North Core Wall" required />
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Issue Title / Short Summary *</label>
              <input type="text" className={styles.formInput} value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Stairwell shaft core floor opening guardrail dislodged" required />
            </div>

            <div className={styles.formCardSectionTitle}>
              <AlertCircle size={16} />
              <span>Safety Assessment & Work Impact</span>
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Immediate Action Taken On Site *</label>
              <input type="text" className={styles.formInput} value={formImmediateAction} onChange={e => setFormImmediateAction(e.target.value)} placeholder="e.g. Cordoned off opening with red caution tape, posted standby safety marshal" required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Safety & EHS Risk Description</label>
              <input type="text" className={styles.formInput} value={formSafetyRisk} onChange={e => setFormSafetyRisk(e.target.value)} placeholder="e.g. Severe fall from height risk to workers" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Work Execution Impact</label>
              <input type="text" className={styles.formInput} value={formWorkImpact} onChange={e => setFormWorkImpact(e.target.value)} placeholder="e.g. Concrete transit halted across corridor" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assign Site Trade Worker (Optional)</label>
              <select className={styles.formSelect} value={assignedWorkerId} onChange={e => setAssignedWorkerId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Awaiting Admin / Auto-Assign</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.skill || w.category})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Detailed Incident Narrative / Remarks</label>
              <textarea className={styles.formTextarea} value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Explain the sequence of events, suspected root causes, and materials required for permanent repair..." />
            </div>

            <div className={styles.formActionBar}>
              <button type="submit" className={styles.btnActionPrimary} disabled={submitting}>
                <Send size={16} />
                <span>{submitting ? 'Transmitting Ticket...' : 'Submit Incident Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --------------------------------------------------------------------
         5. Pane: TABLE VIEW
         -------------------------------------------------------------------- */}
      {activeTab !== 'report' && (
        <div className={styles.paneContainer}>
          <div className={styles.tableToolbar}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={16} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search by Reference, title, location, worker..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.filterControls}>
              <select className={styles.selectInput} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="Site Safety Hazard (EHS)">Site Safety Hazard (EHS)</option>
                <option value="Machinery Breakdown">Machinery Breakdown</option>
                <option value="Electrical Issue">Electrical Issue</option>
                <option value="Material Quality Rejection">Material Quality Rejection</option>
              </select>

              <select className={styles.selectInput} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Standard">Standard</option>
              </select>

              <select className={styles.selectInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted / Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolution Submitted">Resolution Submitted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#667085' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading site issues & maintenance tickets...</div>
            </div>
          ) : displayedIssues.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertOctagon size={40} style={{ color: '#B58B59', opacity: 0.8 }} />
              <div className={styles.emptyStateTitle}>No Site Issues Found</div>
              <div className={styles.emptyStateSubtitle}>
                There are no incident records matching your active filter criteria.
              </div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Date</th>
                    <th>Issue Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Worker</th>
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
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, color: '#172B32', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={issue.title}>
                            {issue.title}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.76rem', background: '#F4F2EC', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#203A3B' }}>
                            {issue.category || 'General'}
                          </span>
                        </td>
                        <td style={{ color: '#203A3B' }}>{issue.exact_location || 'Site Core'}</td>
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
                            <button 
                              className={styles.tableActionBtn}
                              onClick={() => {
                                setSelectedIssue(issue);
                                setShowDrawer(true);
                              }}
                              title="View full audit particulars"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            {status === 'Resolution Submitted' && (
                              <button 
                                className={styles.tableActionBtn}
                                style={{ background: '#E8F5E9', color: '#1B5E20', borderColor: '#A5D6A7' }}
                                onClick={() => setReviewIssue(issue)}
                                title="Sign-off on site resolution"
                              >
                                <Check size={13} />
                                <span>Sign-off</span>
                              </button>
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
      )}

      {/* --------------------------------------------------------------------
         6. Slide-Over Detail Drawer
         -------------------------------------------------------------------- */}
      {showDrawer && selectedIssue && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#B58B59', fontWeight: 700, letterSpacing: '0.04em' }}>
                  SITE INCIDENT RECORD
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
                  <div className={styles.detailItemLabel}>Incident Time</div>
                  <div className={styles.detailItemValue}>{selectedIssue.incident_time || 'N/A'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Exact Site Location</div>
                  <div className={styles.detailItemValue}>{selectedIssue.exact_location || 'Site Core'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Assigned Trade Worker</div>
                  <div className={styles.detailItemValue}>{selectedIssue.assigned_worker_name || 'Unassigned'}</div>
                </div>
              </div>

              <div className={styles.detailBox}>
                <div className={styles.detailItemLabel}>Immediate Action Taken</div>
                <div style={{ fontSize: '0.85rem', color: '#172B32' }}>{selectedIssue.immediate_action || 'Area cordoned off'}</div>
              </div>

              {selectedIssue.safety_risk && (
                <div className={styles.detailBox} style={{ background: '#FFF8E1', borderColor: '#FFECB3' }}>
                  <div className={styles.detailItemLabel} style={{ color: '#B45309' }}>Safety & EHS Hazard Risk</div>
                  <div style={{ fontSize: '0.85rem', color: '#78350F' }}>{selectedIssue.safety_risk}</div>
                </div>
              )}

              {selectedIssue.resolution_description && (
                <div className={styles.detailBox} style={{ background: '#E8F5E9', borderColor: '#C8E6C9' }}>
                  <div className={styles.detailItemLabel} style={{ color: '#2E7D32' }}>Worker Resolution Submitted</div>
                  <div style={{ fontSize: '0.85rem', color: '#1B5E20' }}>{selectedIssue.resolution_description}</div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={15} />
                  <span>Immutable Activity & Audit History</span>
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

      {/* --------------------------------------------------------------------
         7. Sign-off Modal
         -------------------------------------------------------------------- */}
      {reviewIssue && (
        <div className={styles.drawerOverlay}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.5rem', width: '100%', maxWidth: '500px', margin: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#167C72', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Supervisor Physical Verification Sign-off
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1rem 0' }}>
              Confirm on-site physical inspection for <strong>{reviewIssue.issue_reference || `ISS-${reviewIssue.id}`}</strong> completed by <strong>{reviewIssue.assigned_worker_name}</strong>.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className={styles.formLabel}>Supervisor Inspection Remarks *</label>
              <textarea 
                className={styles.formTextarea}
                style={{ width: '100%', minHeight: '70px' }}
                value={reviewRemarks}
                onChange={e => setReviewRemarks(e.target.value)}
                placeholder="Confirm that scaffolding, mechanical repair, or electrical isolation was verified in person..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className={styles.btnActionSecondary} style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }} onClick={() => setReviewIssue(null)} disabled={submitting}>
                Cancel
              </button>
              <button className={styles.btnActionPrimary} onClick={handleVerifyResolution} disabled={submitting || !reviewRemarks.trim()}>
                {submitting ? 'Signing off...' : 'Confirm Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
