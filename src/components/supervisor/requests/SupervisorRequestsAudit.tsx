'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './RequestsAuditWorkspace.module.css';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  FileText,
  Layers,
  ArrowRight,
  Truck,
  Fuel,
  Receipt,
  AlertOctagon,
  Users,
  HardHat,
  X,
  MessageSquare,
  Send,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  fetchStrapiCollection,
  updateStrapiEntity
} from '@/services/strapiClient';
import { useRouter } from 'next/navigation';

export interface UnifiedSubmission {
  id: string | number;
  documentId: string;
  sourceCollection: 'supervisor-requests' | 'expenses';
  referenceId: string;
  title: string;
  category: string;
  requestType:
    | 'Material Request'
    | 'Site Issue'
    | 'Labour Requirement'
    | 'Task'
    | 'DPR'
    | 'Site Expense'
    | 'Fuel'
    | 'Machinery';
  project: string;
  site: string;
  priority: 'Critical' | 'High' | 'Standard' | 'Low';
  status:
    | 'Draft'
    | 'Submitted'
    | 'Under Review'
    | 'Revision Required'
    | 'Resubmitted'
    | 'In Progress'
    | 'Approved'
    | 'Rejected'
    | 'Closed';
  submittedDate: string;
  lastUpdated: string;
  submittedBy: string;
  assignedApprover?: string;
  adminRemarks?: string;
  revisionInstructions?: string;
  payloadSummary?: string;
  amount?: number;
  auditTimeline: Array<{
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }>;
  rawDetails?: any;
}

export default function SupervisorRequestsAudit() {
  const router = useRouter();

  // Raw fetched lists
  const [loading, setLoading] = useState<boolean>(true);
  const [requestsList, setRequestsList] = useState<UnifiedSubmission[]>([]);

  // Filter State
  const [kpiFilter, setKpiFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'ATTENTION'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Request Drawer
  const [selectedItem, setSelectedItem] = useState<UnifiedSubmission | null>(null);

  // Resubmission Modal
  const [resubmitModalOpen, setResubmitModalOpen] = useState<boolean>(false);
  const [resubmitComment, setResubmitComment] = useState<string>('');
  const [resubmitting, setResubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch from both Strapi collections and normalize
  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setFeedbackMsg(null);
    try {
      // 1. Fetch supervisor-requests
      const supReqs = await fetchStrapiCollection<any>('supervisor-requests', []);
      // 2. Fetch expenses
      const expenseReqs = await fetchStrapiCollection<any>('expenses', []);

      const normalized: UnifiedSubmission[] = [];

      // Normalize supervisor-requests (Filtering for Skyline Tower A / Er. Pravin Gaikwad)
      supReqs.forEach((r) => {
        // Exclude system settings configuration
        if (r.requestType === 'Supervisor Preferences') return;

        // Multi-supervisor isolation: prioritize Pravin Gaikwad / Skyline Commercial Complex
        const isSupervisorPravin =
          (r.submittedBy && r.submittedBy.includes('Gaikwad')) ||
          (r.project && r.project.includes('Skyline')) ||
          !r.submittedBy;

        if (!isSupervisorPravin) return;

        // Parse audit timeline
        let timeline: any[] = [];
        if (r.auditTimelineJson) {
          try {
            timeline = typeof r.auditTimelineJson === 'string' ? JSON.parse(r.auditTimelineJson) : r.auditTimelineJson;
          } catch {}
        }
        if (!timeline || timeline.length === 0) {
          timeline = [
            {
              timestamp: `${r.submittedDate || '18 Nov 2026'}, 09:30 AM`,
              actor: r.submittedBy || 'Er. Pravin Gaikwad',
              action: 'Submission Created & Forwarded to Approvals',
              note: r.remarks || 'Initial field submittal'
            }
          ];
          if (r.adminRemarks) {
            timeline.push({
              timestamp: '18 Nov 2026, 02:15 PM',
              actor: 'Admin / PM Kulkarni',
              action: r.status === 'Approved' ? 'Request Approved' : 'Review Decision Logged',
              note: r.adminRemarks
            });
          }
        }

        // Map status safely
        let statusNormalized: UnifiedSubmission['status'] = 'Submitted';
        const rawStatus = (r.status || '').toLowerCase();
        if (rawStatus.includes('approved')) statusNormalized = 'Approved';
        else if (rawStatus.includes('revision')) statusNormalized = 'Revision Required';
        else if (rawStatus.includes('resubmitted')) statusNormalized = 'Resubmitted';
        else if (rawStatus.includes('reject')) statusNormalized = 'Rejected';
        else if (rawStatus.includes('closed')) statusNormalized = 'Closed';
        else if (rawStatus.includes('in progress')) statusNormalized = 'In Progress';
        else if (rawStatus.includes('under review')) statusNormalized = 'Under Review';
        else statusNormalized = 'Submitted';

        const ref =
          r.indentNumber ||
          r.issueReference ||
          (r.details && r.details.taskId) ||
          (r.documentId ? r.documentId.toUpperCase().slice(0, 12) : `REQ-${r.id}`);

        normalized.push({
          id: r.id,
          documentId: r.documentId,
          sourceCollection: 'supervisor-requests',
          referenceId: ref,
          title: r.title || 'Field Indent / Request',
          category: r.category || r.requestType || 'General',
          requestType: r.requestType || 'Material Request',
          project: r.project || 'Skyline Commercial Complex (Tower A)',
          site: r.site || 'Tower A',
          priority: r.priority || 'Standard',
          status: statusNormalized,
          submittedDate: r.submittedDate || '18 Nov 2026',
          lastUpdated: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-GB') : 'Today',
          submittedBy: r.submittedBy || 'Er. Pravin Gaikwad',
          assignedApprover: r.adminRemarks ? 'Er. Rajesh Kulkarni (PM)' : 'Awaiting PM Allocation',
          adminRemarks: r.adminRemarks,
          revisionInstructions: r.revisionRemarks || r.adminRemarks,
          auditTimeline: timeline,
          rawDetails: r.details
        });
      });

      // Normalize expenses (Vouchers)
      expenseReqs.forEach((e) => {
        const isSupervisorPravin =
          (e.submittedBy && e.submittedBy.includes('Gaikwad')) ||
          (e.project && e.project.includes('Skyline'));

        if (!isSupervisorPravin) return;

        let timeline: any[] = [];
        if (e.auditHistory) {
          try {
            timeline = typeof e.auditHistory === 'string' ? JSON.parse(e.auditHistory) : e.auditHistory;
          } catch {}
        }
        if (!timeline || timeline.length === 0) {
          timeline = [
            {
              timestamp: `${e.date || '18 Nov 2026'}, 10:00 AM`,
              actor: e.submittedBy || 'Er. Pravin Gaikwad',
              action: 'Expense Voucher Filed',
              note: e.remarks || e.title
            }
          ];
          if (e.adminRemarks) {
            timeline.push({
              timestamp: '18 Nov 2026, 04:00 PM',
              actor: 'Finance Controller / Admin',
              action: e.status === 'Approved' ? 'Voucher Authorized' : 'Audit Feedback',
              note: e.adminRemarks
            });
          }
        }

        let statusNormalized: UnifiedSubmission['status'] = 'Submitted';
        const rawStatus = (e.status || '').toLowerCase();
        if (rawStatus.includes('approved')) statusNormalized = 'Approved';
        else if (rawStatus.includes('revision')) statusNormalized = 'Revision Required';
        else if (rawStatus.includes('resubmitted')) statusNormalized = 'Resubmitted';
        else if (rawStatus.includes('reject')) statusNormalized = 'Rejected';
        else statusNormalized = 'Under Review';

        normalized.push({
          id: e.id,
          documentId: e.documentId,
          sourceCollection: 'expenses',
          referenceId: e.expenseId || `EXP-2026-00${e.id}`,
          title: e.title,
          category: e.category || 'Site Expenses',
          requestType: 'Site Expense',
          project: e.project || 'Skyline Commercial Complex (Tower A)',
          site: e.site || 'Tower A',
          priority: 'Standard',
          status: statusNormalized,
          submittedDate: e.date || '18 Nov 2026',
          lastUpdated: e.updatedAt ? new Date(e.updatedAt).toLocaleDateString('en-GB') : '18 Nov 2026',
          submittedBy: e.submittedBy || 'Er. Pravin Gaikwad',
          assignedApprover: 'Chief Accounts / PM Kulkarni',
          adminRemarks: e.adminRemarks,
          revisionInstructions: e.revisionInstructions || e.adminRemarks,
          amount: e.amount,
          auditTimeline: timeline,
          rawDetails: {
            paidTo: e.paidTo,
            paymentMode: e.paymentMode,
            invoiceNo: e.invoiceNo,
            purpose: e.purpose
          }
        });
      });

      setRequestsList(normalized);
    } catch (err: any) {
      console.error('Failed to load requests audit:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Dynamic KPI Counts
  const kpiCounts = useMemo(() => {
    const total = requestsList.length;
    const pending = requestsList.filter((r) =>
      ['Submitted', 'Under Review', 'Resubmitted', 'In Progress'].includes(r.status)
    ).length;
    const approved = requestsList.filter((r) => r.status === 'Approved' || r.status === 'Closed').length;
    const attention = requestsList.filter((r) =>
      ['Revision Required', 'Rejected'].includes(r.status)
    ).length;

    return { total, pending, approved, attention };
  }, [requestsList]);

  // Filtering Pipeline
  const filteredSubmissions = useMemo(() => {
    return requestsList.filter((item) => {
      // 1. KPI Filter
      if (kpiFilter === 'PENDING') {
        if (!['Submitted', 'Under Review', 'Resubmitted', 'In Progress'].includes(item.status)) return false;
      } else if (kpiFilter === 'APPROVED') {
        if (!['Approved', 'Closed'].includes(item.status)) return false;
      } else if (kpiFilter === 'ATTENTION') {
        if (!['Revision Required', 'Rejected'].includes(item.status)) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'MATERIAL' && item.requestType !== 'Material Request') return false;
        if (selectedCategory === 'ISSUES' && item.requestType !== 'Site Issue') return false;
        if (selectedCategory === 'LABOUR' && item.requestType !== 'Labour Requirement') return false;
        if (selectedCategory === 'TASKS' && item.requestType !== 'Task') return false;
        if (selectedCategory === 'DPR' && item.requestType !== 'DPR') return false;
        if (selectedCategory === 'EXPENSES' && item.requestType !== 'Site Expense') return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // 4. Priority Filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;

      // 5. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRef = item.referenceId.toLowerCase().includes(query);
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesProject = item.project.toLowerCase().includes(query);
        const matchesSite = item.site.toLowerCase().includes(query);
        if (!matchesRef && !matchesTitle && !matchesProject && !matchesSite) return false;
      }

      return true;
    });
  }, [requestsList, kpiFilter, selectedCategory, statusFilter, priorityFilter, searchQuery]);

  // Handle Supervisor Resubmission Workflow
  const handleResubmit = async () => {
    if (!selectedItem) return;
    if (!resubmitComment.trim()) {
      alert('Please enter your revision remarks/clarification before resubmitting.');
      return;
    }

    setResubmitting(true);
    try {
      const nowStr = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const updatedTimeline = [
        ...selectedItem.auditTimeline,
        {
          timestamp: nowStr,
          actor: 'Er. Pravin Gaikwad',
          action: 'Revised & Resubmitted',
          note: resubmitComment
        }
      ];

      if (selectedItem.sourceCollection === 'supervisor-requests') {
        await updateStrapiEntity('supervisor-requests', selectedItem.documentId, {
          status: 'Resubmitted',
          revisionRemarks: resubmitComment,
          auditTimelineJson: JSON.stringify(updatedTimeline)
        });
      } else if (selectedItem.sourceCollection === 'expenses') {
        await updateStrapiEntity('expenses', selectedItem.documentId, {
          status: 'Resubmitted',
          remarks: `Resubmitted: ${resubmitComment}`,
          auditHistory: JSON.stringify(updatedTimeline)
        });
      }

      setFeedbackMsg({
        type: 'success',
        text: `Request ${selectedItem.referenceId} has been successfully updated and resubmitted to Admin Approvals desk.`
      });

      setResubmitModalOpen(false);
      setSelectedItem(null);
      setResubmitComment('');
      // Reload lists
      await loadSubmissions();
    } catch (err: any) {
      alert(`Resubmission failed: ${err.message || 'Network error'}`);
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Banner Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>
            <Inbox size={26} color="#FFFFFF" /> My Requests
          </h1>
          <p>
            Unified tracking and audit center for material indents, DPRs, site expenses, issues, and crew mobilization.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={loadSubmissions} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div className={feedbackMsg.type === 'success' ? styles.badgeSuccess : styles.badgeDanger} style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          {feedbackMsg.text}
        </div>
      )}

      {/* KPI Dynamic Summary Cards */}
      <div className={styles.kpiGrid}>
        <div
          className={`${styles.kpiCard} ${kpiFilter === 'ALL' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter('ALL')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(23, 43, 50, 0.08)', color: '#172B32' }}>
            <Layers size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Total Requests</span>
            <span className={styles.kpiValue}>{kpiCounts.total}</span>
            <span className={styles.kpiSubtitle}>All authenticated field items</span>
          </div>
        </div>

        <div
          className={`${styles.kpiCard} ${kpiFilter === 'PENDING' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter('PENDING')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Pending Approval</span>
            <span className={styles.kpiValue} style={{ color: '#D97706' }}>
              {kpiCounts.pending}
            </span>
            <span className={styles.kpiSubtitle}>Submitted & Under Review</span>
          </div>
        </div>

        <div
          className={`${styles.kpiCard} ${kpiFilter === 'APPROVED' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter('APPROVED')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Approved</span>
            <span className={styles.kpiValue} style={{ color: '#047857' }}>
              {kpiCounts.approved}
            </span>
            <span className={styles.kpiSubtitle}>Granted sign-offs</span>
          </div>
        </div>

        <div
          className={`${styles.kpiCard} ${kpiFilter === 'ATTENTION' ? styles.kpiCardActive : ''}`}
          onClick={() => setKpiFilter('ATTENTION')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#DC2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Needs Attention</span>
            <span className={styles.kpiValue} style={{ color: '#DC2626' }}>
              {kpiCounts.attention}
            </span>
            <span className={styles.kpiSubtitle}>Revision Required / Rejected</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className={styles.toolbarCard}>
        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'ALL' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Submissions
          </button>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'MATERIAL' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('MATERIAL')}
          >
            <Truck size={14} /> Material Indents
          </button>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'DPR' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('DPR')}
          >
            <FileText size={14} /> Daily Reports (DPR)
          </button>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'EXPENSES' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('EXPENSES')}
          >
            <Receipt size={14} /> Site Expenses
          </button>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'ISSUES' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('ISSUES')}
          >
            <AlertOctagon size={14} /> Site Issues
          </button>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'LABOUR' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('LABOUR')}
          >
            <Users size={14} /> Labour & Crew
          </button>
          <button
            className={`${styles.tabBtn} ${selectedCategory === 'TASKS' ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedCategory('TASKS')}
          >
            <HardHat size={14} /> Tasks & Activities
          </button>
        </div>

        {/* Search & Selectors Row */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Request ID, Title, Project, or Site..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterPills}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Revision Required">Revision Required</option>
              <option value="Resubmitted">Resubmitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className={styles.filterSelect}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
              <option value="Low">Low</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || selectedCategory !== 'ALL' || kpiFilter !== 'ALL') && (
              <button
                className={styles.btnClearFilter}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setSelectedCategory('ALL');
                  setKpiFilter('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Request Listing Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderBar}>
          <span className={styles.tableCountInfo}>
            Showing {filteredSubmissions.length} of {requestsList.length} authenticated requests
          </span>
          <span style={{ fontSize: '0.78rem', color: '#718096' }}>
            Site Jurisdiction: Skyline Commercial Complex (Tower A)
          </span>
        </div>

        {/* Desktop Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Request Title</th>
                <th>Category</th>
                <th>Project / Site</th>
                <th>Priority</th>
                <th>Submitted Date</th>
                <th>Approval Status</th>
                <th>Approver / Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#718096' }}>
                    {loading ? 'Retrieving authenticated Strapi requests...' : 'No matching requests found.'}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item) => (
                  <tr key={`${item.sourceCollection}-${item.id}`}>
                    <td>
                      <code style={{ fontSize: '0.8rem', fontWeight: 700, color: '#167C72' }}>
                        {item.referenceId}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#172B32' }}>{item.title}</div>
                      {item.amount && (
                        <div style={{ fontSize: '0.75rem', color: '#167C72', fontWeight: 700 }}>
                          Amount: ₹{item.amount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={styles.badgeNeutral}>{item.requestType}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.site}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096' }}>{item.project}</div>
                    </td>
                    <td>
                      <span
                        className={`${styles.priorityDot} ${
                          item.priority === 'Critical'
                            ? styles.priorityCritical
                            : item.priority === 'High'
                            ? styles.priorityHigh
                            : styles.priorityStandard
                        }`}
                      ></span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.priority}</span>
                    </td>
                    <td>{item.submittedDate}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.status === 'Approved' || item.status === 'Closed'
                            ? styles.badgeSuccess
                            : item.status === 'Revision Required'
                            ? styles.badgeDanger
                            : item.status === 'Resubmitted'
                            ? styles.badgeInfo
                            : styles.badgeWarning
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4A5568' }}>
                        {item.assignedApprover}
                      </div>
                      {item.adminRemarks && (
                        <div style={{ fontSize: '0.72rem', color: '#718096', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          &ldquo;{item.adminRemarks}&rdquo;
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Request Cards */}
        <div className={styles.mobileCardList}>
          {filteredSubmissions.map((item) => (
            <div key={`mob-${item.sourceCollection}-${item.id}`} className={styles.mobileCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <code style={{ fontSize: '0.8rem', fontWeight: 700, color: '#167C72' }}>
                  {item.referenceId}
                </code>
                <span
                  className={`${styles.badge} ${
                    item.status === 'Approved'
                      ? styles.badgeSuccess
                      : item.status === 'Revision Required'
                      ? styles.badgeDanger
                      : styles.badgeWarning
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem' }}>{item.title}</h4>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: '#718096' }}>
                {item.site} &bull; {item.requestType} &bull; {item.submittedDate}
              </p>
              <button
                className={styles.btnSecondary}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setSelectedItem(item)}
              >
                <Eye size={14} /> Inspect Details & Timeline
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDE-OVER DETAIL DRAWER */}
      {selectedItem && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className={styles.drawerTitle}>{selectedItem.referenceId}</h3>
                <p className={styles.drawerSubtitle}>{selectedItem.title}</p>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                onClick={() => setSelectedItem(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Revision Required Alert Box */}
              {selectedItem.status === 'Revision Required' && (
                <div className={styles.revisionBox}>
                  <div className={styles.revisionTitle}>
                    <AlertTriangle size={18} /> Revision Requested by Admin
                  </div>
                  <div className={styles.revisionText}>
                    <strong>Instructions:</strong> {selectedItem.revisionInstructions || selectedItem.adminRemarks}
                  </div>
                  <div style={{ marginTop: '0.85rem' }}>
                    <button
                      className={styles.btnPrimary}
                      style={{ background: '#B45309', border: 'none' }}
                      onClick={() => setResubmitModalOpen(true)}
                    >
                      <Send size={14} /> Submit Revision Update
                    </button>
                  </div>
                </div>
              )}

              {/* Section 1: Overview Information */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Inbox size={15} color="#167C72" /> Submission Summary
                </div>
                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Request Type</span>
                    <span className={styles.fieldVal}>{selectedItem.requestType}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Current Status</span>
                    <span className={styles.fieldVal}>
                      <span
                        className={`${styles.badge} ${
                          selectedItem.status === 'Approved'
                            ? styles.badgeSuccess
                            : selectedItem.status === 'Revision Required'
                            ? styles.badgeDanger
                            : styles.badgeWarning
                        }`}
                      >
                        {selectedItem.status}
                      </span>
                    </span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Designated Site</span>
                    <span className={styles.fieldVal}>{selectedItem.site}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Project Node</span>
                    <span className={styles.fieldVal}>{selectedItem.project}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Priority Level</span>
                    <span className={styles.fieldVal}>{selectedItem.priority}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Submitted Date</span>
                    <span className={styles.fieldVal}>{selectedItem.submittedDate}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Specific Payload Details */}
              {selectedItem.amount && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>
                    <Receipt size={15} color="#167C72" /> Financial Voucher Details
                  </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailField}>
                      <span className={styles.fieldKey}>Total Voucher Amount</span>
                      <span className={styles.fieldVal} style={{ fontSize: '1.1rem', color: '#167C72' }}>
                        ₹{selectedItem.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className={styles.detailField}>
                      <span className={styles.fieldKey}>Vendor / Payee</span>
                      <span className={styles.fieldVal}>{selectedItem.rawDetails?.paidTo || 'Site Hardware Stores'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Approvals & Admin Remarks */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <CheckCircle2 size={15} color="#167C72" /> Approval Information
                </div>
                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Assigned Approver</span>
                    <span className={styles.fieldVal}>{selectedItem.assignedApprover}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.fieldKey}>Last Updated</span>
                    <span className={styles.fieldVal}>{selectedItem.lastUpdated}</span>
                  </div>
                </div>
                {selectedItem.adminRemarks && (
                  <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #ECEBE5' }}>
                    <span className={styles.fieldKey}>Admin Remarks</span>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#172B32' }}>
                      {selectedItem.adminRemarks}
                    </p>
                  </div>
                )}
              </div>

              {/* Section 4: Audit Timeline */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={15} color="#167C72" /> Chronological Audit Trail
                </div>
                <div className={styles.timeline}>
                  {selectedItem.auditTimeline.map((step, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineHeader}>
                        <span>{step.action}</span>
                        <span className={styles.timelineTime}>{step.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#167C72', fontWeight: 600 }}>
                        {step.actor}
                      </div>
                      {step.note && <div className={styles.timelineNote}>{step.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESUBMISSION MODAL */}
      {resubmitModalOpen && selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setResubmitModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Send size={20} color="#167C72" />
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#172B32' }}>
                Resubmit {selectedItem.referenceId}
              </h4>
            </div>

            <div className={styles.modalBody}>
              <div style={{ marginBottom: '1rem', background: '#FEF3C7', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#92400E' }}>
                <strong>Admin Instruction:</strong> {selectedItem.revisionInstructions}
              </div>

              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Supervisor Revision Remarks / Clarification:
              </label>
              <textarea
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #ECEBE5',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                placeholder="Describe changes made, updated quantities, or attached clarification test notes..."
                value={resubmitComment}
                onChange={(e) => setResubmitComment(e.target.value)}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setResubmitModalOpen(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleResubmit} disabled={resubmitting}>
                {resubmitting ? 'Submitting...' : 'Submit to Admin Approvals'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
