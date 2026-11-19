'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './MaterialManagement.module.css';
import {
  PackageOpen,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Building,
  Calendar,
  Layers,
  ArrowUpDown,
  History,
  Send,
  X,
  CreditCard,
  Search,
  RotateCcw,
  FileText,
  Trash2,
  Eye,
  Check,
  AlertTriangle
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from '@/services/strapiClient';

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

export default function SupervisorMaterialRequests() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'requests' | 'drafts' | 'pending' | 'approved' | 'revisions' | 'delivery'>('overview');

  // Strapi state
  const [indents, setIndents] = useState<MaterialRequestRecord[]>([]);
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticated supervisor identity
  const [currentSupervisor, setCurrentSupervisor] = useState({
    name: 'Er. Pravin Gaikwad (Chief Supervisor)',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A (Podium & Core)'
  });

  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [procurementFilter, setProcurementFilter] = useState('ALL');

  // Detail Drawer state
  const [selectedIndent, setSelectedIndent] = useState<MaterialRequestRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Delivery receipt confirmation modal state
  const [receiptIndent, setReceiptIndent] = useState<MaterialRequestRecord | null>(null);
  const [receiptQuantity, setReceiptQuantity] = useState<number>(0);
  const [shortageQuantity, setShortageQuantity] = useState<number>(0);
  const [receiptCondition, setReceiptCondition] = useState('Clean, sound condition, certified seals intact');

  // Create Form State
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formRequiredDate, setFormRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [formPriority, setFormPriority] = useState<'Standard' | 'High' | 'Critical'>('High');
  const [formWorkLocation, setFormWorkLocation] = useState('Tower A Level 5 Slab Deck');
  const [formPurpose, setFormPurpose] = useState('Structural reinforcement steel and binding wire for beam casting');
  const [formUrgencyReason, setFormUrgencyReason] = useState('Rebar bending schedule begins in 48 hours to avoid concrete cycle delay');
  const [formRemarks, setFormRemarks] = useState('');

  // Multi-item rows in create form
  const [formItems, setFormItems] = useState<RequisitionLineItem[]>([
    {
      id: 'item_1',
      materialCode: 'MAT-TMT-550D',
      materialName: 'TMT High-Yield Reinforcement Steel Bars',
      specification: '16mm Diameter Thermo-Mechanically Treated Bars',
      grade: 'IS 1786 Fe-550D',
      requestedQuantity: 10,
      unit: 'Metric Tonnes',
      preferredBrand: 'Tata Tiscon',
      technicalRemarks: 'Test Mill Certificate required on arrival',
      status: 'Pending Review'
    }
  ]);

  // Submit feedback
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load records from Strapi
  const loadMaterialData = async () => {
    try {
      setLoading(true);

      // Check session
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

      // Concurrently query supervisor-requests and material catalogue
      const [allReqs] = await Promise.all([
        fetchStrapiCollection('supervisor-requests', [])
      ]);

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

  // Multi-supervisor data isolation filter:
  // Supervisor only sees records for their assigned project (Skyline / Gaikwad)
  const authorizedIndents = useMemo(() => {
    return indents.filter(v => {
      const proj = v.project || '';
      const sub = v.submitted_by || v.submittedBy || '';
      return (
        proj.toLowerCase().includes('skyline') ||
        proj.toLowerCase().includes('tower a') ||
        sub.toLowerCase().includes('gaikwad') ||
        sub.toLowerCase().includes('kulkarni')
      );
    });
  }, [indents]);

  // 8-Metric Calculations
  const metrics = useMemo(() => {
    let totalRequests = authorizedIndents.length;
    let pendingReview = 0;
    let approved = 0;
    let revisionRequired = 0;
    let rejected = 0;
    let inProcurement = 0;
    let dispatched = 0;
    let partiallyReceived = 0;
    let fullyDelivered = 0;

    authorizedIndents.forEach(r => {
      const s = r.status || 'Submitted';
      const ps = r.procurement_status || 'Not Started';
      const ds = r.delivery_status || 'Not Delivered';

      if (s === 'Submitted' || s === 'Under Review') pendingReview++;
      else if (s === 'Approved' || s === 'Partially Approved') approved++;
      else if (s === 'Revision Required') revisionRequired++;
      else if (s === 'Rejected') rejected++;

      if (ps === 'Procurement In Progress' || ps === 'Ordered') inProcurement++;
      else if (ps === 'Dispatched' || ps === 'Partially Dispatched') dispatched++;

      if (ds === 'Partially Received') partiallyReceived++;
      else if (ds === 'Fully Received') fullyDelivered++;
    });

    return {
      totalRequests,
      pendingReview,
      approved,
      revisionRequired,
      rejected,
      inProcurement,
      dispatched,
      partiallyReceived,
      fullyDelivered
    };
  }, [authorizedIndents]);

  // Filtered indents for table
  const displayedIndents = useMemo(() => {
    let list = [...authorizedIndents];

    // Tab filter
    if (activeTab === 'drafts') list = list.filter(r => r.status === 'Draft');
    else if (activeTab === 'pending') list = list.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
    else if (activeTab === 'approved') list = list.filter(r => r.status === 'Approved' || r.status === 'Partially Approved');
    else if (activeTab === 'revisions') list = list.filter(r => r.status === 'Revision Required');
    else if (activeTab === 'delivery') list = list.filter(r => r.delivery_status === 'Partially Received' || r.delivery_status === 'Fully Received');

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.indent_number || r.indentNumber || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.purpose || '').toLowerCase().includes(q) ||
        (r.work_location || r.workLocation || '').toLowerCase().includes(q)
      );
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      list = list.filter(r => r.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(r => r.status === statusFilter);
    }

    // Procurement status
    if (procurementFilter !== 'ALL') {
      list = list.filter(r => (r.procurement_status || 'Not Started') === procurementFilter);
    }

    return list;
  }, [authorizedIndents, activeTab, searchQuery, priorityFilter, statusFilter, procurementFilter]);

  // Handle Add Item to Requisition Form
  const handleAddItemRow = () => {
    const newItem: RequisitionLineItem = {
      id: `item_${Date.now()}`,
      materialCode: 'MAT-CEM-53OPC',
      materialName: 'Ordinary Portland Cement 53 Grade',
      specification: '53 Grade OPC High Early Strength Cement',
      grade: 'IS 269:2015 Grade 53',
      requestedQuantity: 50,
      unit: 'Bags (50kg)',
      preferredBrand: 'UltraTech Cement',
      technicalRemarks: 'Fresh batch certified',
      status: 'Pending Review'
    };
    setFormItems(prev => [...prev, newItem]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (formItems.length === 1) {
      alert('A requisition must contain at least one material line item.');
      return;
    }
    setFormItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItemRow = (id: string, field: keyof RequisitionLineItem, value: any) => {
    setFormItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Submit Requisition (Draft or Official Submission)
  const handleRequisitionSubmit = async (saveAsDraft: boolean) => {
    setFormError(null);
    setFormSuccess(null);

    if (formItems.length === 0) {
      setFormError('Please add at least one material line item.');
      return;
    }

    // Validate quantities
    for (const itm of formItems) {
      if (!itm.requestedQuantity || itm.requestedQuantity <= 0) {
        setFormError(`Please enter a valid requested quantity for ${itm.materialName}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const indentCount = authorizedIndents.length + 101;
      const indentNumber = `IND-2026-${String(indentCount).padStart(3, '0')}`;
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const auditTrail: AuditEntry[] = [
        {
          timestamp: timestampStr,
          actor: currentSupervisor.name,
          action: saveAsDraft ? 'Requisition Saved as Draft' : 'Requisition Submitted to Central Procurement',
          note: `${formItems.length} material items requested for ${formWorkLocation}`
        }
      ];

      const summaryText = formItems.map(i => `${i.requestedQuantity} ${i.unit} ${i.materialName}`).join('; ');

      const payload = {
        request_type: 'Material Request',
        requestType: 'Material Request',
        title: `Material Indent: ${formItems[0]?.materialName || 'Site Materials'} (${formItems[0]?.requestedQuantity} ${formItems[0]?.unit}) + ${formItems.length - 1} items`,
        project: currentSupervisor.project,
        site: currentSupervisor.site,
        category: formItems[0]?.materialCode.includes('TMT') ? 'Steel & Rebar' : 'Cement & Concrete',
        priority: formPriority,
        status: saveAsDraft ? 'Draft' : 'Submitted',
        details: { summary: summaryText, itemCount: formItems.length },
        remarks: formRemarks,
        submitted_by: currentSupervisor.name,
        submittedBy: currentSupervisor.name,
        submitted_date: formDate,
        indent_number: indentNumber,
        indentNumber: indentNumber,
        required_delivery_date: formRequiredDate,
        urgency_reason: formUrgencyReason,
        work_location: formWorkLocation,
        purpose: formPurpose,
        procurement_status: 'Not Started',
        delivery_status: 'Not Delivered',
        items_json: JSON.stringify(formItems),
        audit_timeline_json: JSON.stringify(auditTrail)
      };

      await createStrapiEntity('supervisor-requests', payload);

      setFormSuccess(
        saveAsDraft 
          ? `✓ Requisition ${indentNumber} successfully saved as Draft.`
          : `✓ Requisition ${indentNumber} successfully transmitted to Central Procurement!`
      );

      // Reload
      await loadMaterialData();

      setTimeout(() => {
        setActiveTab(saveAsDraft ? 'drafts' : 'requests');
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      console.error('Failed to submit requisition:', err);
      setFormError('Failed to record requisition in Strapi backend. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delivery Receipt
  const handleConfirmDeliveryReceipt = async () => {
    if (!receiptIndent || receiptQuantity <= 0) {
      alert('Please enter a valid received quantity greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let existingItems: RequisitionLineItem[] = [];
      try {
        existingItems = JSON.parse(receiptIndent.items_json || '[]');
      } catch (e) {}

      // Update first line item received quantity
      if (existingItems.length > 0) {
        existingItems[0].receivedQuantity = (existingItems[0].receivedQuantity || 0) + receiptQuantity;
        existingItems[0].shortageQuantity = shortageQuantity;
        existingItems[0].status = existingItems[0].receivedQuantity >= (existingItems[0].orderedQuantity || existingItems[0].requestedQuantity) 
          ? 'Fully Received' 
          : 'Partially Received';
      }

      let existingAudit: AuditEntry[] = [];
      try {
        existingAudit = JSON.parse(receiptIndent.audit_timeline_json || '[]');
      } catch (e) {}

      existingAudit.push({
        timestamp: timestampStr,
        actor: currentSupervisor.name,
        action: `Goods Received at Site (${receiptQuantity} Units)`,
        note: `Condition: ${receiptCondition}. Shortage reported: ${shortageQuantity}`
      });

      const isFull = existingItems.length > 0 && (existingItems[0].receivedQuantity || 0) >= (existingItems[0].orderedQuantity || existingItems[0].requestedQuantity);

      const receiptRecord = {
        receivedDate: timestampStr,
        receivedQuantity: receiptQuantity,
        shortageQuantity,
        condition: receiptCondition,
        receivedBy: currentSupervisor.name
      };

      const updateData = {
        delivery_status: isFull ? 'Fully Received' : 'Partially Received',
        procurement_status: isFull ? 'Completed' : 'Dispatched',
        items_json: JSON.stringify(existingItems),
        receipt_details_json: JSON.stringify(receiptRecord),
        audit_timeline_json: JSON.stringify(existingAudit)
      };

      const targetId = String(receiptIndent.document_id || receiptIndent.documentId || receiptIndent.id);
      await updateStrapiEntity('supervisor-requests', targetId, updateData);

      setReceiptIndent(null);
      setReceiptQuantity(0);
      setShortageQuantity(0);
      await loadMaterialData();

      if (selectedIndent && selectedIndent.id === receiptIndent.id) {
        setShowDrawer(false);
      }
    } catch (err: any) {
      alert('Failed to record delivery receipt: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to parse items
  const parseItems = (indent: MaterialRequestRecord): RequisitionLineItem[] => {
    try {
      if (indent.items_json) return JSON.parse(indent.items_json);
    } catch (e) {}
    return [];
  };

  // Helper to parse audit
  const parseAudit = (indent: MaterialRequestRecord): AuditEntry[] => {
    try {
      if (indent.audit_timeline_json) return JSON.parse(indent.audit_timeline_json);
    } catch (e) {}
    return [
      {
        timestamp: indent.submitted_date || 'Recent',
        actor: indent.submitted_by || currentSupervisor.name,
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
            <span>Material Requisitions & Site Delivery</span>
          </h1>
          <p>
            Official multi-item material indents, procurement dispatch tracking, Goods Receipt Note (GRN) verification, and central warehouse synchronization.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.btnActionSecondary}
            onClick={() => loadMaterialData()}
            title="Refresh database records"
          >
            <RotateCcw size={15} />
            <span>Refresh</span>
          </button>
          <button 
            className={styles.btnActionPrimary}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={16} />
            <span>Raise Material Indent</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         2. Filter & Context Strip
         -------------------------------------------------------------------- */}
      <div className={styles.filterStrip}>
        <div className={styles.filterDateGroup}>
          <span className={styles.filterDateLabel}>Filter Priority:</span>
          <button 
            className={`${styles.btnDatePill} ${priorityFilter === 'ALL' ? styles.btnDatePillActive : ''}`}
            onClick={() => setPriorityFilter('ALL')}
          >
            All Priorities
          </button>
          <button 
            className={`${styles.btnDatePill} ${priorityFilter === 'Critical' ? styles.btnDatePillActive : ''}`}
            onClick={() => setPriorityFilter('Critical')}
          >
            Critical
          </button>
          <button 
            className={`${styles.btnDatePill} ${priorityFilter === 'High' ? styles.btnDatePillActive : ''}`}
            onClick={() => setPriorityFilter('High')}
          >
            High
          </button>
          <button 
            className={`${styles.btnDatePill} ${priorityFilter === 'Standard' ? styles.btnDatePillActive : ''}`}
            onClick={() => setPriorityFilter('Standard')}
          >
            Standard
          </button>
        </div>

        <div className={styles.projectBadgeInfo}>
          <Building size={15} />
          <span>{currentSupervisor.project} • {currentSupervisor.site}</span>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         3. 8-Metric Summary Overview Grid
         -------------------------------------------------------------------- */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Indents</span>
            <span className={styles.summaryValue}>{metrics.totalRequests}</span>
            <span className={styles.summarySubtext}>Site requisitions</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconSlate}`}>
            <PackageOpen size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Pending Review</span>
            <span className={styles.summaryValue}>{metrics.pendingReview}</span>
            <span className={styles.summarySubtext}>Under Admin audit</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <Clock size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Approved Indents</span>
            <span className={styles.summaryValue}>{metrics.approved}</span>
            <span className={styles.summarySubtext}>Approved for PO</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Revision Required</span>
            <span className={styles.summaryValue}>{metrics.revisionRequired}</span>
            <span className={styles.summarySubtext}>Action needed</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconRose}`}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>In Procurement</span>
            <span className={styles.summaryValue}>{metrics.inProcurement}</span>
            <span className={styles.summarySubtext}>PO Issued / Processing</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconBronze}`}>
            <CreditCard size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Dispatched</span>
            <span className={styles.summaryValue}>{metrics.dispatched}</span>
            <span className={styles.summarySubtext}>En route to site</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconTeal}`}>
            <Truck size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Partially Received</span>
            <span className={styles.summaryValue}>{metrics.partiallyReceived}</span>
            <span className={styles.summarySubtext}>Shortage / Batched</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <Layers size={20} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Fully Delivered</span>
            <span className={styles.summaryValue}>{metrics.fullyDelivered}</span>
            <span className={styles.summarySubtext}>GRN Verified on site</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         4. Workspace Tabs Bar
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
          className={`${styles.tabBtn} ${activeTab === 'create' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <PlusCircle size={16} />
          <span>Create Indent</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FileText size={16} />
          <span>My Requests</span>
          <span className={activeTab === 'requests' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
            {authorizedIndents.length}
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
          className={`${styles.tabBtn} ${activeTab === 'revisions' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('revisions')}
        >
          <AlertCircle size={16} />
          <span>Revision Required</span>
          {metrics.revisionRequired > 0 && (
            <span className={activeTab === 'revisions' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {metrics.revisionRequired}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'delivery' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          <Truck size={16} />
          <span>Delivery Tracking</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
         5. Pane Content: CREATE MULTI-ITEM INDENT FORM
         -------------------------------------------------------------------- */}
      {activeTab === 'create' && (
        <div className={styles.paneContainer}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#172B32' }}>
              Raise Multi-Item Material Requisition Indent
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#667085', margin: 0 }}>
              Authorized indent for central procurement. Add multiple line items, specifications, and delivery target dates.
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

          <div className={styles.formGrid}>
            {/* Project & Authorization */}
            <div className={styles.formCardSectionTitle}>
              <Building size={16} />
              <span>Project & Site Authorization</span>
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
              <label className={styles.formLabel}>Requisition Priority *</label>
              <select className={styles.formSelect} value={formPriority} onChange={e => setFormPriority(e.target.value as any)}>
                <option value="Standard">Standard (7-10 Days Delivery)</option>
                <option value="High">High (3-5 Days Delivery)</option>
                <option value="Critical">Critical (Within 48 Hours)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Indent Date *</label>
              <input type="date" className={styles.formInput} value={formDate} onChange={e => setFormDate(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Required Delivery Date *</label>
              <input type="date" className={styles.formInput} value={formRequiredDate} onChange={e => setFormRequiredDate(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Work Location / Zone / Floor *</label>
              <input type="text" className={styles.formInput} value={formWorkLocation} onChange={e => setFormWorkLocation(e.target.value)} placeholder="e.g. Tower A Level 5 Core and Slab" required />
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Purpose & Operational Justification *</label>
              <input type="text" className={styles.formInput} value={formPurpose} onChange={e => setFormPurpose(e.target.value)} placeholder="e.g. Structural concrete reinforcement and binding wire for transfer girder casting" required />
            </div>

            {formPriority === 'Critical' && (
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel} style={{ color: '#C62828' }}>Critical Urgency Rationale (Mandatory for Critical Indents) *</label>
                <input type="text" className={styles.formInput} value={formUrgencyReason} onChange={e => setFormUrgencyReason(e.target.value)} placeholder="State exact risk of structural downtime or crane idle cost..." required />
              </div>
            )}

            {/* Multiple Material Line Items */}
            <div className={styles.formCardSectionTitle}>
              <Layers size={16} />
              <span>Material Line Items ({formItems.length})</span>
            </div>

            <div className={styles.formGroupFull}>
              <div className={styles.tableWrapper}>
                <table className={styles.itemFormTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Material Name</th>
                      <th style={{ width: '15%' }}>Code / Category</th>
                      <th style={{ width: '20%' }}>Specification & Grade</th>
                      <th style={{ width: '12%' }}>Quantity</th>
                      <th style={{ width: '12%' }}>Unit</th>
                      <th style={{ width: '14%' }}>Preferred Brand</th>
                      <th style={{ width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                            value={item.materialName} 
                            onChange={e => handleUpdateItemRow(item.id, 'materialName', e.target.value)} 
                            placeholder="e.g. TMT Steel 16mm"
                            required
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                            value={item.materialCode} 
                            onChange={e => handleUpdateItemRow(item.id, 'materialCode', e.target.value)} 
                            placeholder="MAT-TMT-550D"
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                            value={item.specification} 
                            onChange={e => handleUpdateItemRow(item.id, 'specification', e.target.value)} 
                            placeholder="16mm Fe-550D"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className={styles.formInput} 
                            style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                            value={item.requestedQuantity} 
                            onChange={e => handleUpdateItemRow(item.id, 'requestedQuantity', Number(e.target.value))} 
                            required
                          />
                        </td>
                        <td>
                          <select 
                            className={styles.formSelect} 
                            style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                            value={item.unit}
                            onChange={e => handleUpdateItemRow(item.id, 'unit', e.target.value)}
                          >
                            <option value="Metric Tonnes">Metric Tonnes</option>
                            <option value="Bags (50kg)">Bags (50kg)</option>
                            <option value="Brass">Brass</option>
                            <option value="Sheets">Sheets</option>
                            <option value="Kilograms">Kilograms</option>
                            <option value="Lengths (6m)">Lengths (6m)</option>
                            <option value="Numbers">Numbers</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className={styles.formInput} 
                            style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                            value={item.preferredBrand} 
                            onChange={e => handleUpdateItemRow(item.id, 'preferredBrand', e.target.value)} 
                            placeholder="Tata / UltraTech"
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItemRow(item.id)}
                            style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.3rem' }}
                            title="Remove line item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className={styles.btnActionSecondary}
                  style={{ color: '#172B32', borderColor: '#172B32', background: '#F4F2EC' }}
                  onClick={handleAddItemRow}
                >
                  <PlusCircle size={14} />
                  <span>Add Material Item</span>
                </button>
              </div>
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>General Technical Remarks</label>
              <textarea 
                className={styles.formTextarea}
                value={formRemarks}
                onChange={e => setFormRemarks(e.target.value)}
                placeholder="Mention any delivery crane restrictions, offloading bay requirements, or specific test certificates required..."
              />
            </div>

            {/* Actions */}
            <div className={styles.formActionBar}>
              <button 
                type="button" 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }}
                onClick={() => {
                  setFormPurpose('');
                  setFormRemarks('');
                }}
                disabled={submitting}
              >
                Clear Form
              </button>
              <button 
                type="button" 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#172B32', background: '#F4F2EC' }}
                onClick={() => handleRequisitionSubmit(true)}
                disabled={submitting}
              >
                Save as Draft
              </button>
              <button 
                type="button" 
                className={styles.btnActionPrimary}
                onClick={() => handleRequisitionSubmit(false)}
                disabled={submitting}
              >
                <Send size={16} />
                <span>{submitting ? 'Transmitting...' : 'Submit to Central Procurement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
         6. Pane Content: TABLE VIEW (Overview, Requests, Pending, Approved, Revisions, Delivery)
         -------------------------------------------------------------------- */}
      {activeTab !== 'create' && (
        <div className={styles.paneContainer}>
          {/* Table Toolbar */}
          <div className={styles.tableToolbar}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={16} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search by Indent ID, material, work location, purpose..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.filterControls}>
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
                <option value="ALL">All Approvals</option>
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Draft">Draft</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Procurement Status */}
              <select 
                className={styles.selectInput}
                value={procurementFilter}
                onChange={e => setProcurementFilter(e.target.value)}
              >
                <option value="ALL">All Procurement Stages</option>
                <option value="Not Started">Not Started</option>
                <option value="Ordered">PO Issued / Ordered</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table Data */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#667085' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading authorized site material requisitions...</div>
            </div>
          ) : displayedIndents.length === 0 ? (
            <div className={styles.emptyState}>
              <PackageOpen size={40} style={{ color: '#B58B59', opacity: 0.8 }} />
              <div className={styles.emptyStateTitle}>No Material Requisitions Found</div>
              <div className={styles.emptyStateSubtitle}>
                There are no material requisitions matching your filter criteria or tab status.
              </div>
              <button 
                className={styles.btnActionPrimary}
                onClick={() => setActiveTab('create')}
              >
                <PlusCircle size={15} />
                <span>Raise New Indent</span>
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Indent ID</th>
                    <th>Date</th>
                    <th>Work Location</th>
                    <th>Material Summary</th>
                    <th>Required By</th>
                    <th>Priority</th>
                    <th>Approval Status</th>
                    <th>Procurement</th>
                    <th>Delivery Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIndents.map(indent => {
                    const status = indent.status || 'Submitted';
                    const procStatus = indent.procurement_status || 'Not Started';
                    const delStatus = indent.delivery_status || 'Not Delivered';
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
                        <td style={{ fontWeight: 600, color: '#172B32' }}>
                          {indent.work_location || indent.workLocation || 'Site Deck'}
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, color: '#172B32', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={indent.title}>
                            {indent.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#8391A1', marginTop: '2px' }}>
                            {items.length > 0 ? `${items.length} line item(s)` : 'General Indent'}
                          </div>
                        </td>
                        <td style={{ color: '#203A3B', whiteSpace: 'nowrap' }}>
                          {indent.required_delivery_date || indent.requiredDeliveryDate || 'ASAP'}
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
                            ${status === 'Draft' ? styles.badgeDraft : ''}
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
                            ${procStatus === 'Not Started' ? styles.badgeDraft : ''}
                          `}>
                            <span>{procStatus}</span>
                          </span>
                        </td>
                        <td>
                          <span className={`
                            ${styles.badge}
                            ${delStatus === 'Fully Received' ? styles.badgeReceived : ''}
                            ${delStatus === 'Partially Received' ? styles.badgePartial : ''}
                            ${delStatus === 'Not Delivered' ? styles.badgeDraft : ''}
                          `}>
                            {delStatus === 'Fully Received' ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                            <span>{delStatus}</span>
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
                              title="View full audit particulars"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            {(procStatus === 'Dispatched' || delStatus === 'Partially Received') && (
                              <button 
                                className={styles.tableActionBtn}
                                style={{ background: '#E8F5E9', color: '#1B5E20', borderColor: '#A5D6A7' }}
                                onClick={() => {
                                  setReceiptIndent(indent);
                                  const itms = parseItems(indent);
                                  const reqQty = itms[0]?.requestedQuantity || 10;
                                  setReceiptQuantity(reqQty);
                                }}
                                title="Confirm site goods receipt note"
                              >
                                <Check size={13} />
                                <span>GRN Receipt</span>
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
         7. Slide-Over Detail Drawer
         -------------------------------------------------------------------- */}
      {showDrawer && selectedIndent && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#B58B59', fontWeight: 700, letterSpacing: '0.04em' }}>
                  MATERIAL REQUISITION INDENT
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
              {/* Revision remarks if flagged */}
              {selectedIndent.status === 'Revision Required' && (
                <div className={styles.adminNoticeBox}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <AlertCircle size={15} />
                    <span>Revision Requested by Admin / Procurement</span>
                  </div>
                  <div>
                    {selectedIndent.admin_remarks || selectedIndent.revision_remarks || 'Please adjust quantities according to reusable site inventory.'}
                  </div>
                </div>
              )}

              {/* Grid Particulars */}
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Approval Status</div>
                  <div className={styles.detailItemValue}>
                    <span className={`${styles.badge} ${selectedIndent.status === 'Approved' ? styles.badgeApproved : styles.badgePending}`}>
                      {selectedIndent.status}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Procurement Stage</div>
                  <div className={styles.detailItemValue}>
                    <span className={styles.badge}>
                      {selectedIndent.procurement_status || 'Not Started'}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Delivery Status</div>
                  <div className={styles.detailItemValue}>
                    <span className={`${styles.badge} ${selectedIndent.delivery_status === 'Fully Received' ? styles.badgeReceived : styles.badgePartial}`}>
                      {selectedIndent.delivery_status || 'Not Delivered'}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Required By Date</div>
                  <div className={styles.detailItemValue}>{selectedIndent.required_delivery_date || 'ASAP'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Work Location</div>
                  <div className={styles.detailItemValue}>{selectedIndent.work_location || 'Site Core'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Priority Level</div>
                  <div className={styles.detailItemValue}>{selectedIndent.priority}</div>
                </div>
              </div>

              {/* Purpose Box */}
              <div className={styles.detailBox}>
                <div className={styles.detailItemLabel}>Operational Purpose / Scope</div>
                <div style={{ fontSize: '0.85rem', color: '#172B32', lineHeight: 1.45 }}>
                  {selectedIndent.purpose || selectedIndent.title}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Requested Line Items ({parseItems(selectedIndent).length})
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable} style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Spec / Grade</th>
                        <th>Req. Qty</th>
                        <th>Rcvd Qty</th>
                        <th>Brand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseItems(selectedIndent).map((itm, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{itm.materialName}</td>
                          <td>{itm.specification} ({itm.grade})</td>
                          <td style={{ fontWeight: 700 }}>{itm.requestedQuantity} {itm.unit}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{itm.receivedQuantity || 0} {itm.unit}</td>
                          <td>{itm.preferredBrand || 'Standard'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Timeline */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={15} />
                  <span>Immutable Procurement Timeline</span>
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
         8. Delivery Receipt (GRN) Confirmation Modal
         -------------------------------------------------------------------- */}
      {receiptIndent && (
        <div className={styles.drawerOverlay}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.5rem', width: '100%', maxWidth: '520px', margin: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#167C72', marginBottom: '0.75rem' }}>
              <Truck size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Confirm Goods Receipt Note (GRN)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1rem 0' }}>
              Recording actual material quantity received on site for <strong>{receiptIndent.indent_number || receiptIndent.indentNumber}</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Accepted Quantity *</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={receiptQuantity}
                  onChange={e => setReceiptQuantity(Number(e.target.value))}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Shortage / Damaged Qty</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={shortageQuantity}
                  onChange={e => setShortageQuantity(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className={styles.formLabel}>Material Condition & Inspection Remarks *</label>
              <textarea 
                className={styles.formTextarea} 
                style={{ width: '100%', minHeight: '60px' }} 
                value={receiptCondition}
                onChange={e => setReceiptCondition(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }}
                onClick={() => setReceiptIndent(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className={styles.btnActionPrimary}
                onClick={handleConfirmDeliveryReceipt}
                disabled={submitting || receiptQuantity <= 0}
              >
                {submitting ? 'Confirming...' : 'Verify GRN Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
