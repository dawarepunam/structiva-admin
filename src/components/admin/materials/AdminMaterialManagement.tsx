'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdminMaterials.module.css';
import {
  PackageOpen,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Building,
  Layers,
  History,
  Send,
  X,
  CreditCard,
  Search,
  RotateCcw,
  FileText,
  Eye,
  Check,
  CheckSquare
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity } from '@/services/strapiClient';

interface RequisitionLineItem {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  grade: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  orderedQuantity?: number;
  dispatchedQuantity?: number;
  receivedQuantity?: number;
  shortageQuantity?: number;
  damagedQuantity?: number;
  unit: string;
  preferredBrand: string;
  technicalRemarks: string;
  status: string;
}

interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

interface MaterialRequestRecord {
  id: number;
  document_id?: string;
  documentId?: string;
  request_type?: string;
  requestType?: string;
  title: string;
  project: string;
  site?: string;
  category?: string;
  priority: 'Standard' | 'High' | 'Critical';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Partially Approved' | 'Revision Required' | 'Rejected';
  procurement_status?: 'Not Started' | 'Procurement In Progress' | 'Ordered' | 'Partially Dispatched' | 'Dispatched' | 'Completed';
  delivery_status?: 'Not Delivered' | 'Partially Received' | 'Fully Received' | 'Shortage Reported' | 'Damage Reported';
  indent_number?: string;
  indentNumber?: string;
  required_delivery_date?: string;
  requiredDeliveryDate?: string;
  urgency_reason?: string;
  urgencyReason?: string;
  work_location?: string;
  workLocation?: string;
  purpose?: string;
  remarks?: string;
  admin_remarks?: string;
  adminRemarks?: string;
  revision_remarks?: string;
  revisionRemarks?: string;
  submitted_by?: string;
  submittedBy?: string;
  submitted_date?: string;
  submittedDate?: string;
  items_json?: string;
  po_details_json?: string;
  dispatch_details_json?: string;
  receipt_details_json?: string;
  audit_timeline_json?: string;
}

export default function AdminMaterialManagement() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'pending' | 'approved' | 'procurement' | 'dispatched' | 'revisions'>('overview');

  // Strapi state
  const [indents, setIndents] = useState<MaterialRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer state
  const [selectedIndent, setSelectedIndent] = useState<MaterialRequestRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Review & Action modal state
  const [actionIndent, setActionIndent] = useState<MaterialRequestRecord | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | 'po' | 'dispatch' | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [vendorName, setVendorName] = useState('Shree Mahalakshmi Cement Agencies');
  const [poRate, setPoRate] = useState<number>(385);
  const [challanNo, setChallanNo] = useState('DC-2026-8812');
  const [vehicleNo, setVehicleNo] = useState('MH-12-RN-4821');
  const [driverName, setDriverName] = useState('Sanjay Shinde (+91 98221 44001)');
  const [submitting, setSubmitting] = useState(false);

  // Load records from Strapi
  const loadMaterialData = async () => {
    try {
      setLoading(true);
      const allReqs = await fetchStrapiCollection('supervisor-requests', []);
      const materialReqs = (allReqs || []).filter((r: any) => 
        r.request_type === 'Material Request' || r.requestType === 'Material Request'
      );
      setIndents(materialReqs);
    } catch (err) {
      console.error('Failed to load material indents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterialData();
  }, []);

  // 8-Metric Calculations
  const metrics = useMemo(() => {
    let totalRequests = indents.length;
    let pendingReview = 0;
    let approved = 0;
    let revisionRequired = 0;
    let rejected = 0;
    let inProcurement = 0;
    let dispatched = 0;
    let fullyDelivered = 0;

    indents.forEach(r => {
      const s = r.status || 'Submitted';
      const ps = r.procurement_status || 'Not Started';
      const ds = r.delivery_status || 'Not Delivered';

      if (s === 'Submitted' || s === 'Under Review') pendingReview++;
      else if (s === 'Approved' || s === 'Partially Approved') approved++;
      else if (s === 'Revision Required') revisionRequired++;
      else if (s === 'Rejected') rejected++;

      if (ps === 'Procurement In Progress' || ps === 'Ordered') inProcurement++;
      else if (ps === 'Dispatched' || ps === 'Partially Dispatched') dispatched++;

      if (ds === 'Fully Received') fullyDelivered++;
    });

    return {
      totalRequests,
      pendingReview,
      approved,
      revisionRequired,
      rejected,
      inProcurement,
      dispatched,
      fullyDelivered
    };
  }, [indents]);

  // Filtered indents for table
  const displayedIndents = useMemo(() => {
    let list = [...indents];

    // Tab filter
    if (activeTab === 'pending') list = list.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
    else if (activeTab === 'approved') list = list.filter(r => r.status === 'Approved' || r.status === 'Partially Approved');
    else if (activeTab === 'procurement') list = list.filter(r => r.procurement_status === 'Ordered' || r.procurement_status === 'Procurement In Progress');
    else if (activeTab === 'dispatched') list = list.filter(r => r.procurement_status === 'Dispatched' || r.procurement_status === 'Partially Dispatched');
    else if (activeTab === 'revisions') list = list.filter(r => r.status === 'Revision Required');

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.indent_number || r.indentNumber || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.project || '').toLowerCase().includes(q) ||
        (r.submitted_by || r.submittedBy || '').toLowerCase().includes(q)
      );
    }

    // Project filter
    if (projectFilter !== 'ALL') {
      list = list.filter(r => r.project.includes(projectFilter));
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      list = list.filter(r => r.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(r => r.status === statusFilter);
    }

    return list;
  }, [indents, activeTab, searchQuery, projectFilter, priorityFilter, statusFilter]);

  // Handle Admin Action (Approve, Reject, Revision, PO, Dispatch)
  const handleExecuteAction = async () => {
    if (!actionIndent || !actionType) return;

    setSubmitting(true);
    try {
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let existingAudit: AuditEntry[] = [];
      try {
        existingAudit = JSON.parse(actionIndent.audit_timeline_json || '[]');
      } catch (e) {}

      let existingItems: RequisitionLineItem[] = [];
      try {
        existingItems = JSON.parse(actionIndent.items_json || '[]');
      } catch (e) {}

      let updateData: any = {};

      if (actionType === 'approve') {
        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin / Project Manager)',
          action: 'Requisition Approved',
          note: actionRemarks || 'Approved full quantity against site casting schedule'
        });

        // Set approved quantities
        existingItems.forEach(i => {
          i.approvedQuantity = i.requestedQuantity;
          i.status = 'Approved';
        });

        updateData = {
          status: 'Approved',
          admin_remarks: actionRemarks || 'Approved by Project Manager',
          items_json: JSON.stringify(existingItems),
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'reject') {
        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin / Project Manager)',
          action: 'Requisition Rejected',
          note: actionRemarks || 'Declined due to budget ceiling'
        });

        updateData = {
          status: 'Rejected',
          admin_remarks: actionRemarks,
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'revision') {
        existingAudit.push({
          timestamp: timestampStr,
          actor: 'PM Kulkarni (Admin / Project Manager)',
          action: 'Revision Requested',
          note: actionRemarks
        });

        updateData = {
          status: 'Revision Required',
          admin_remarks: actionRemarks,
          revision_remarks: actionRemarks,
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'po') {
        const poRecord = {
          poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
          vendor: vendorName,
          ratePerUnit: poRate,
          orderDate: timestampStr
        };

        existingAudit.push({
          timestamp: timestampStr,
          actor: 'Central Procurement Officer',
          action: `Purchase Order Issued (${poRecord.poNumber})`,
          note: `PO issued to ${vendorName} @ ₹${poRate}/unit`
        });

        existingItems.forEach(i => {
          i.orderedQuantity = i.approvedQuantity || i.requestedQuantity;
        });

        updateData = {
          procurement_status: 'Ordered',
          po_details_json: JSON.stringify(poRecord),
          items_json: JSON.stringify(existingItems),
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      } else if (actionType === 'dispatch') {
        const dispatchRecord = {
          dispatchRef: `DSP-2026-${Math.floor(100 + Math.random() * 900)}`,
          challanNo,
          vehicleNo,
          driverName,
          dispatchedDate: timestampStr
        };

        existingAudit.push({
          timestamp: timestampStr,
          actor: 'Warehouse Dispatch Manager',
          action: `Material Dispatched via ${vehicleNo}`,
          note: `Challan: ${challanNo}. Driver: ${driverName}`
        });

        existingItems.forEach(i => {
          i.dispatchedQuantity = i.orderedQuantity || i.requestedQuantity;
        });

        updateData = {
          procurement_status: 'Dispatched',
          dispatch_details_json: JSON.stringify(dispatchRecord),
          items_json: JSON.stringify(existingItems),
          audit_timeline_json: JSON.stringify(existingAudit)
        };
      }

      const targetId = String(actionIndent.document_id || actionIndent.documentId || actionIndent.id);
      await updateStrapiEntity('supervisor-requests', targetId, updateData);

      setActionIndent(null);
      setActionType(null);
      setActionRemarks('');
      await loadMaterialData();

      if (selectedIndent && selectedIndent.id === actionIndent.id) {
        setShowDrawer(false);
      }
    } catch (err: any) {
      alert('Operation failed: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  const parseItems = (indent: MaterialRequestRecord): RequisitionLineItem[] => {
    try {
      if (indent.items_json) return JSON.parse(indent.items_json);
    } catch (e) {}
    return [];
  };

  const parseAudit = (indent: MaterialRequestRecord): AuditEntry[] => {
    try {
      if (indent.audit_timeline_json) return JSON.parse(indent.audit_timeline_json);
    } catch (e) {}
    return [
      {
        timestamp: indent.submitted_date || 'Recent',
        actor: indent.submitted_by || 'Field Supervisor',
        action: 'Requisition Created',
        note: indent.purpose || 'Initial submittal'
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
            <PackageOpen size={28} />
            <span>Central Material Management & Procurement Desk</span>
          </h1>
          <p>
            Enterprise requisition audit, purchase order issuance, vendor supply logistics, and site goods receipt reconciliation.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.btnActionSecondary}
            onClick={() => loadMaterialData()}
            title="Refresh database records"
          >
            <RotateCcw size={15} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         2. 8-Metric Summary Overview Grid
         -------------------------------------------------------------------- */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Site Indents</span>
            <span className={styles.summaryValue}>{metrics.totalRequests}</span>
            <span className={styles.summarySubtext}>Company requisitions</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconSlate}`}>
            <PackageOpen size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Pending Review</span>
            <span className={styles.summaryValue}>{metrics.pendingReview}</span>
            <span className={styles.summarySubtext}>Awaiting audit</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <Clock size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Approved Indents</span>
            <span className={styles.summaryValue}>{metrics.approved}</span>
            <span className={styles.summarySubtext}>Ready for PO</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Revision Required</span>
            <span className={styles.summaryValue}>{metrics.revisionRequired}</span>
            <span className={styles.summarySubtext}>Returned to field</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconRose}`}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>PO Issued / Ordered</span>
            <span className={styles.summaryValue}>{metrics.inProcurement}</span>
            <span className={styles.summarySubtext}>Vendor processing</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconBronze}`}>
            <CreditCard size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>In Transit / Dispatched</span>
            <span className={styles.summaryValue}>{metrics.dispatched}</span>
            <span className={styles.summarySubtext}>En route to sites</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconTeal}`}>
            <Truck size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Rejected Indents</span>
            <span className={styles.summaryValue}>{metrics.rejected}</span>
            <span className={styles.summarySubtext}>Declined by finance</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconRose}`}>
            <XCircle size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Fully Delivered</span>
            <span className={styles.summaryValue}>{metrics.fullyDelivered}</span>
            <span className={styles.summarySubtext}>GRN Reconciled</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckSquare size={20} />
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
          <PackageOpen size={16} />
          <span>Overview</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FileText size={16} />
          <span>All Indents</span>
          <span className={activeTab === 'all' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
            {indents.length}
          </span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={16} />
          <span>Pending Review</span>
          {metrics.pendingReview > 0 && (
            <span className={activeTab === 'pending' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.pendingReview}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'approved' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <CheckCircle2 size={16} />
          <span>Approved</span>
          <span className={activeTab === 'approved' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
            {metrics.approved}
          </span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'procurement' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('procurement')}
        >
          <CreditCard size={16} />
          <span>PO Issued</span>
          {metrics.inProcurement > 0 && (
            <span className={activeTab === 'procurement' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.inProcurement}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'dispatched' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('dispatched')}
        >
          <Truck size={16} />
          <span>Dispatched</span>
          {metrics.dispatched > 0 && (
            <span className={activeTab === 'dispatched' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.dispatched}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'revisions' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('revisions')}
        >
          <AlertCircle size={16} />
          <span>Revisions</span>
          {metrics.revisionRequired > 0 && (
            <span className={activeTab === 'revisions' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.revisionRequired}
            </span>
          )}
        </button>
      </div>

      {/* --------------------------------------------------------------------
         4. Main Table View
         -------------------------------------------------------------------- */}
      <div className={styles.paneContainer}>
        {/* Table Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={16} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search Indent ID, project, supervisor, material..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterControls}>
            {/* Project Filter */}
            <select 
              className={styles.selectInput}
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="ALL">All Projects</option>
              <option value="Skyline">Skyline Commercial Complex</option>
              <option value="Expressway">Eastern Expressway Link</option>
            </select>

            {/* Priority Filter */}
            <select 
              className={styles.selectInput}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
            </select>

            {/* Status Filter */}
            <select 
              className={styles.selectInput}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted / Pending</option>
              <option value="Approved">Approved</option>
              <option value="Revision Required">Revision Required</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Data */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#667085' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading company material requisitions...</div>
          </div>
        ) : displayedIndents.length === 0 ? (
          <div className={styles.emptyState}>
            <PackageOpen size={40} style={{ color: '#B58B59', opacity: 0.8 }} />
            <div className={styles.emptyStateTitle}>No Material Indents Found</div>
            <div className={styles.emptyStateSubtitle}>
              There are no requisitions matching your filter parameters.
            </div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Indent ID</th>
                  <th>Date</th>
                  <th>Project & Site</th>
                  <th>Supervisor</th>
                  <th>Material Summary</th>
                  <th>Priority</th>
                  <th>Approval</th>
                  <th>Procurement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedIndents.map(indent => {
                  const status = indent.status || 'Submitted';
                  const procStatus = indent.procurement_status || 'Not Started';
                  const indId = indent.indent_number || indent.indentNumber || `IND-${indent.id}`;
                  const items = parseItems(indent);

                  return (
                    <tr key={indent.id}>
                      <td style={{ fontWeight: 700, color: '#172B32' }}>
                        {indId}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: '#667085' }}>
                        {indent.submitted_date || 'Recent'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#172B32' }}>{indent.project}</div>
                        <div style={{ fontSize: '0.74rem', color: '#8391A1' }}>{indent.site || 'Main Site'}</div>
                      </td>
                      <td style={{ color: '#203A3B', whiteSpace: 'nowrap' }}>
                        {indent.submitted_by || indent.submittedBy || 'Er. Pravin Gaikwad'}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#172B32', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={indent.title}>
                          {indent.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8391A1', marginTop: '2px' }}>
                          {items.length > 0 ? `${items.length} line item(s)` : 'General Requisition'}
                        </div>
                      </td>
                      <td>
                        <span className={`
                          ${styles.badge}
                          ${indent.priority === 'Critical' ? styles.badgePriorityCritical : ''}
                          ${indent.priority === 'High' ? styles.badgePriorityHigh : ''}
                          ${indent.priority === 'Standard' ? styles.badgePriorityStandard : ''}
                        `}>
                          {indent.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`
                          ${styles.badge} 
                          ${status === 'Approved' ? styles.badgeApproved : ''}
                          ${status === 'Submitted' || status === 'Under Review' ? styles.badgePending : ''}
                          ${status === 'Revision Required' ? styles.badgeRevision : ''}
                          ${status === 'Rejected' ? styles.badgeRejected : ''}
                        `}>
                          {status === 'Approved' && <CheckCircle2 size={12} />}
                          {(status === 'Submitted' || status === 'Under Review') && <Clock size={12} />}
                          {status === 'Revision Required' && <AlertCircle size={12} />}
                          {status === 'Rejected' && <XCircle size={12} />}
                          <span>{status}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`
                          ${styles.badge}
                          ${procStatus === 'Dispatched' ? styles.badgeDispatched : ''}
                          ${procStatus === 'Ordered' ? styles.badgeApproved : ''}
                          ${procStatus === 'Completed' ? styles.badgeReceived : ''}
                          ${procStatus === 'Not Started' ? styles.badgePending : ''}
                        `}>
                          <span>{procStatus}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            className={styles.tableActionBtn}
                            onClick={() => {
                              setSelectedIndent(indent);
                              setShowDrawer(true);
                            }}
                            title="View particulars"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {status === 'Submitted' && (
                            <>
                              <button 
                                className={styles.tableActionBtn}
                                style={{ background: '#E8F5E9', color: '#1B5E20', borderColor: '#A5D6A7' }}
                                onClick={() => {
                                  setActionIndent(indent);
                                  setActionType('approve');
                                }}
                                title="Approve indent"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button 
                                className={styles.tableActionBtn}
                                style={{ background: '#FFF8E1', color: '#B45309', borderColor: '#FDE68A' }}
                                onClick={() => {
                                  setActionIndent(indent);
                                  setActionType('revision');
                                }}
                                title="Request revision"
                              >
                                <span>Revise</span>
                              </button>
                            </>
                          )}

                          {status === 'Approved' && procStatus === 'Not Started' && (
                            <button 
                              className={styles.tableActionBtn}
                              style={{ background: '#E0F2F1', color: '#00695C', borderColor: '#80CBC4' }}
                              onClick={() => {
                                setActionIndent(indent);
                                setActionType('po');
                              }}
                              title="Create Purchase Order"
                            >
                              <CreditCard size={13} />
                              <span>Issue PO</span>
                            </button>
                          )}

                          {procStatus === 'Ordered' && (
                            <button 
                              className={styles.tableActionBtn}
                              style={{ background: '#E0F2F1', color: '#00695C', borderColor: '#80CBC4' }}
                              onClick={() => {
                                setActionIndent(indent);
                                setActionType('dispatch');
                              }}
                              title="Record Logistics Dispatch"
                            >
                              <Truck size={13} />
                              <span>Dispatch</span>
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

      {/* --------------------------------------------------------------------
         5. Slide-Over Detail Drawer
         -------------------------------------------------------------------- */}
      {showDrawer && selectedIndent && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#B58B59', fontWeight: 700, letterSpacing: '0.04em' }}>
                  ADMIN REQUISITION REVIEW
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedIndent.indent_number || selectedIndent.indentNumber || `IND-${selectedIndent.id}`}
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: '#ECEBE5', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Project</div>
                  <div className={styles.detailItemValue}>{selectedIndent.project}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Site / Zone</div>
                  <div className={styles.detailItemValue}>{selectedIndent.site || 'Main Site'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Supervisor</div>
                  <div className={styles.detailItemValue}>{selectedIndent.submitted_by || 'Er. Pravin Gaikwad'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Required Date</div>
                  <div className={styles.detailItemValue}>{selectedIndent.required_delivery_date || 'ASAP'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Approval Status</div>
                  <div className={styles.detailItemValue}>{selectedIndent.status}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Procurement Stage</div>
                  <div className={styles.detailItemValue}>{selectedIndent.procurement_status || 'Not Started'}</div>
                </div>
              </div>

              <div className={styles.detailBox}>
                <div className={styles.detailItemLabel}>Operational Purpose</div>
                <div style={{ fontSize: '0.85rem', color: '#172B32' }}>{selectedIndent.purpose || selectedIndent.title}</div>
              </div>

              {selectedIndent.admin_remarks && (
                <div className={styles.detailBox} style={{ background: '#E8F5E9', borderColor: '#C8E6C9' }}>
                  <div className={styles.detailItemLabel} style={{ color: '#2E7D32' }}>Admin Verification Remarks</div>
                  <div style={{ fontSize: '0.85rem', color: '#1B5E20' }}>{selectedIndent.admin_remarks}</div>
                </div>
              )}

              {/* Items Table */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Line Items ({parseItems(selectedIndent).length})
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable} style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Spec</th>
                        <th>Req. Qty</th>
                        <th>Apprv. Qty</th>
                        <th>Ordered</th>
                        <th>Rcvd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseItems(selectedIndent).map((itm, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{itm.materialName}</td>
                          <td>{itm.specification}</td>
                          <td style={{ fontWeight: 700 }}>{itm.requestedQuantity} {itm.unit}</td>
                          <td style={{ color: '#167C72', fontWeight: 700 }}>{itm.approvedQuantity || 0} {itm.unit}</td>
                          <td>{itm.orderedQuantity || 0} {itm.unit}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{itm.receivedQuantity || 0} {itm.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={15} />
                  <span>Procurement History</span>
                </div>
                <div className={styles.timelineList}>
                  {parseAudit(selectedIndent).map((entry, idx) => (
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
              <button 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#FFFFFF' }}
                onClick={() => window.print()}
              >
                <FileText size={15} />
                <span>Print Indent</span>
              </button>
              <button 
                className={styles.btnActionPrimary}
                onClick={() => setShowDrawer(false)}
              >
                Close Particulars
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
         6. Action Modal (Approve, Reject, Revision, PO, Dispatch)
         -------------------------------------------------------------------- */}
      {actionIndent && actionType && (
        <div className={styles.drawerOverlay}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.5rem', width: '100%', maxWidth: '520px', margin: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#167C72', marginBottom: '0.75rem' }}>
              <PackageOpen size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {actionType === 'approve' && 'Approve Material Requisition'}
                {actionType === 'reject' && 'Reject Material Requisition'}
                {actionType === 'revision' && 'Request Requisition Revision'}
                {actionType === 'po' && 'Issue Official Purchase Order (PO)'}
                {actionType === 'dispatch' && 'Record Warehouse Dispatch'}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1rem 0' }}>
              Processing indent <strong>{actionIndent.indent_number || actionIndent.indentNumber}</strong> ({actionIndent.project}).
            </p>

            {actionType === 'po' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>Authorized Vendor *</label>
                  <input type="text" className={styles.formInput} style={{ width: '100%' }} value={vendorName} onChange={e => setVendorName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>PO Rate (₹ / Unit) *</label>
                  <input type="number" className={styles.formInput} style={{ width: '100%' }} value={poRate} onChange={e => setPoRate(Number(e.target.value))} required />
                </div>
              </div>
            )}

            {actionType === 'dispatch' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>Delivery Challan No. *</label>
                    <input type="text" className={styles.formInput} style={{ width: '100%' }} value={challanNo} onChange={e => setChallanNo(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>Transport Vehicle No. *</label>
                    <input type="text" className={styles.formInput} style={{ width: '100%' }} value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>Driver Details & Contact *</label>
                  <input type="text" className={styles.formInput} style={{ width: '100%' }} value={driverName} onChange={e => setDriverName(e.target.value)} required />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>
                {actionType === 'revision' ? 'Specific Revision Instructions *' : 'Audit / Verification Remarks'}
              </label>
              <textarea 
                className={styles.formTextarea} 
                style={{ width: '100%', minHeight: '60px' }} 
                value={actionRemarks} 
                onChange={e => setActionRemarks(e.target.value)}
                placeholder={actionType === 'revision' ? 'Mention exact stock deductions or required specs...' : 'Add any technical or budgetary approval notes...'}
                required={actionType === 'revision' || actionType === 'reject'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }}
                onClick={() => {
                  setActionIndent(null);
                  setActionType(null);
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className={styles.btnActionPrimary}
                style={{ 
                  background: actionType === 'reject' ? '#DC2626' : '#167C72',
                  borderColor: actionType === 'reject' ? '#B91C1C' : '#12635B'
                }}
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
