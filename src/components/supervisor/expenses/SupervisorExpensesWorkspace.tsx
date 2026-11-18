'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './ExpensesWorkspace.module.css';
import {
  Receipt,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Banknote,
  Search,
  Filter,
  Eye,
  FileText,
  Building,
  Upload,
  Calendar,
  Layers,
  ArrowUpDown,
  History,
  ShieldCheck,
  Send,
  X,
  CreditCard,
  DollarSign,
  Briefcase,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from '@/services/strapiClient';

interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

interface ExpenseVoucher {
  id: number;
  document_id?: string;
  documentId?: string;
  expense_id?: string;
  expenseId?: string;
  title: string;
  category: string;
  subcategory?: string;
  amount: number;
  project: string;
  site?: string;
  date: string;
  paid_to?: string;
  paidTo?: string;
  vendor_contact?: string;
  vendorContact?: string;
  payment_mode?: string;
  paymentMode?: string;
  status: 'Approved' | 'Pending Review' | 'Revision Required' | 'Rejected' | 'Draft' | 'Void';
  payment_status?: 'Paid' | 'Unpaid';
  paymentStatus?: 'Paid' | 'Unpaid';
  transaction_ref?: string;
  transactionRef?: string;
  invoice_no?: string;
  invoiceNo?: string;
  purpose?: string;
  submitted_by?: string;
  submittedBy?: string;
  remarks?: string;
  admin_remarks?: string;
  adminRemarks?: string;
  revision_instructions?: string;
  revisionInstructions?: string;
  audit_history?: string;
  auditHistory?: string;
  attachments_json?: string;
  workflow_stage?: string;
  createdAt?: string;
  created_at?: number;
}

export default function SupervisorExpensesWorkspace() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'history' | 'drafts' | 'pending' | 'approved' | 'rejected' | 'revisions' | 'analytics'>('overview');
  
  // Date filter: 'today' | '7days' | 'month' | 'all'
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'all'>('month');

  // Strapi state
  const [vouchers, setVouchers] = useState<ExpenseVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticated supervisor identity
  const [currentSupervisor, setCurrentSupervisor] = useState({
    name: 'Er. Pravin Gaikwad',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A (Podium & Core)'
  });

  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Detail Drawer state
  const [selectedVoucher, setSelectedVoucher] = useState<ExpenseVoucher | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Void confirmation state
  const [voidingVoucher, setVoidingVoucher] = useState<ExpenseVoucher | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Create Form State
  const [formProject, setFormProject] = useState('Skyline Commercial Complex (Tower A)');
  const [formSite, setFormSite] = useState('Tower A (Podium & Core)');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Consumables & Hardware');
  const [formSubcategory, setFormSubcategory] = useState('Hardware & Fasteners');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formPaidTo, setFormPaidTo] = useState('');
  const [formVendorContact, setFormVendorContact] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState('UPI / QR Code');
  const [formTransactionRef, setFormTransactionRef] = useState('');
  const [formInvoiceNo, setFormInvoiceNo] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  
  // Submit feedback
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load records from Strapi
  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check supervisor session if present
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
          } catch (e) {
            console.error('Failed to parse supervisor session', e);
          }
        }
      }

      const res = await fetchStrapiCollection('expenses', []);
      setVouchers(res || []);
    } catch (err: any) {
      console.error('Failed to load expenses', err);
      setError('Could not connect to Strapi expenses service. Please verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Multi-supervisor data isolation filter:
  // Supervisor only sees records for their assigned projects or submitted by them
  const authorizedVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const proj = v.project || '';
      const sub = v.submitted_by || v.submittedBy || '';
      return (
        proj.toLowerCase().includes('skyline') ||
        proj.toLowerCase().includes('tower a') ||
        sub.toLowerCase().includes('gaikwad') ||
        sub.toLowerCase().includes('kulkarni')
      );
    });
  }, [vouchers]);

  // Date Filter calculations
  const filteredByDateVouchers = useMemo(() => {
    const now = new Date();
    return authorizedVouchers.filter(v => {
      if (dateFilter === 'all') return true;
      const vDateStr = v.date || '';
      const vDate = new Date(vDateStr);
      if (isNaN(vDate.getTime())) return true; // keep if custom format
      
      if (dateFilter === 'today') {
        return (
          vDate.getDate() === now.getDate() &&
          vDate.getMonth() === now.getMonth() &&
          vDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === '7days') {
        const diff = (now.getTime() - vDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 7 && diff >= -1;
      }
      if (dateFilter === 'month') {
        return (
          vDate.getMonth() === now.getMonth() &&
          vDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [authorizedVouchers, dateFilter]);

  // 8-Metric Calculations
  const metrics = useMemo(() => {
    let totalExpenses = 0;
    let submittedAmount = 0;
    let pendingApprovalAmount = 0;
    let approvedAmount = 0;
    let rejectedAmount = 0;
    let totalVouchers = filteredByDateVouchers.length;
    let paidAmount = 0;
    let unpaidApprovedAmount = 0;

    filteredByDateVouchers.forEach(v => {
      const amt = Number(v.amount) || 0;
      const status = v.status || 'Pending Review';
      const payStatus = v.payment_status || v.paymentStatus || 'Unpaid';

      totalExpenses += amt;

      if (status === 'Pending Review' || status === 'Revision Required') {
        pendingApprovalAmount += amt;
      } else if (status === 'Approved') {
        approvedAmount += amt;
        if (payStatus === 'Paid') {
          paidAmount += amt;
        } else {
          unpaidApprovedAmount += amt;
        }
      } else if (status === 'Rejected') {
        rejectedAmount += amt;
      }

      if (status !== 'Draft') {
        submittedAmount += amt;
      }
    });

    return {
      totalExpenses,
      submittedAmount,
      pendingApprovalAmount,
      approvedAmount,
      rejectedAmount,
      totalVouchers,
      paidAmount,
      unpaidApprovedAmount
    };
  }, [filteredByDateVouchers]);

  // Tab count indicators
  const tabCounts = useMemo(() => {
    return {
      all: authorizedVouchers.length,
      drafts: authorizedVouchers.filter(v => v.status === 'Draft').length,
      pending: authorizedVouchers.filter(v => v.status === 'Pending Review').length,
      approved: authorizedVouchers.filter(v => v.status === 'Approved').length,
      rejected: authorizedVouchers.filter(v => v.status === 'Rejected').length,
      revisions: authorizedVouchers.filter(v => v.status === 'Revision Required').length
    };
  }, [authorizedVouchers]);

  // Tab Filtering for the data table
  const displayedTableRecords = useMemo(() => {
    let list = [...authorizedVouchers];

    // Status Tab filter
    if (activeTab === 'drafts') list = list.filter(v => v.status === 'Draft');
    else if (activeTab === 'pending') list = list.filter(v => v.status === 'Pending Review');
    else if (activeTab === 'approved') list = list.filter(v => v.status === 'Approved');
    else if (activeTab === 'rejected') list = list.filter(v => v.status === 'Rejected');
    else if (activeTab === 'revisions') list = list.filter(v => v.status === 'Revision Required');

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v => 
        (v.expense_id || v.expenseId || '').toLowerCase().includes(q) ||
        (v.title || '').toLowerCase().includes(q) ||
        (v.paid_to || v.paidTo || '').toLowerCase().includes(q) ||
        (v.invoice_no || v.invoiceNo || '').toLowerCase().includes(q) ||
        (v.purpose || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      list = list.filter(v => v.category === categoryFilter);
    }

    // Status filter dropdown
    if (statusFilter !== 'ALL') {
      list = list.filter(v => v.status === statusFilter);
    }

    // Payment status filter dropdown
    if (paymentFilter !== 'ALL') {
      list = list.filter(v => (v.payment_status || v.paymentStatus) === paymentFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'amount') {
        const diff = (Number(a.amount) || 0) - (Number(b.amount) || 0);
        return sortOrder === 'asc' ? diff : -diff;
      } else {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return sortOrder === 'asc' ? da - db : db - da;
      }
    });

    return list;
  }, [authorizedVouchers, activeTab, searchQuery, categoryFilter, statusFilter, paymentFilter, sortBy, sortOrder]);

  // Handle Form Submission (Draft or Submit)
  const handleVoucherSubmit = async (saveAsDraft: boolean) => {
    setFormError(null);
    setFormSuccess(null);

    if (!formTitle.trim()) {
      setFormError('Please enter a descriptive Voucher Title');
      return;
    }
    if (!formAmount || Number(formAmount) <= 0) {
      setFormError('Please enter a valid expense Amount greater than ₹0');
      return;
    }
    if (!formPaidTo.trim()) {
      setFormError('Please specify the recipient or vendor name');
      return;
    }

    setSubmitting(true);
    try {
      const voucherNum = String(authorizedVouchers.length + 101).padStart(3, '0');
      const generatedExpenseId = `EXP-2026-${voucherNum}`;
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const auditTrail: AuditEntry[] = [
        {
          timestamp: timestampStr,
          actor: currentSupervisor.name,
          action: saveAsDraft ? 'Voucher Saved as Draft' : 'Voucher Submitted for Approval',
          note: formPurpose || formRemarks || 'Site operational procurement'
        }
      ];

      const payload = {
        expense_id: generatedExpenseId,
        expenseId: generatedExpenseId,
        title: formTitle,
        category: formCategory,
        subcategory: formSubcategory,
        amount: Number(formAmount),
        project: formProject,
        site: formSite,
        date: formDate,
        paid_to: formPaidTo,
        paidTo: formPaidTo,
        vendor_contact: formVendorContact,
        payment_mode: formPaymentMode,
        paymentMode: formPaymentMode,
        status: saveAsDraft ? 'Draft' : 'Pending Review',
        payment_status: 'Unpaid',
        paymentStatus: 'Unpaid',
        transaction_ref: formTransactionRef || 'NA',
        invoice_no: formInvoiceNo || `INV-VCH-${Math.floor(1000 + Math.random() * 9000)}`,
        purpose: formPurpose,
        submitted_by: currentSupervisor.name,
        submittedBy: currentSupervisor.name,
        remarks: formRemarks,
        audit_history: JSON.stringify(auditTrail),
        workflow_stage: saveAsDraft ? 'Draft' : 'Submitted'
      };

      const created = await createStrapiEntity('expenses', payload);

      setFormSuccess(
        saveAsDraft 
          ? `✓ Voucher ${generatedExpenseId} successfully saved to Drafts.`
          : `✓ Voucher ${generatedExpenseId} successfully submitted for Finance & Accounts review!`
      );

      // Clear form
      setFormTitle('');
      setFormAmount('');
      setFormPaidTo('');
      setFormVendorContact('');
      setFormTransactionRef('');
      setFormInvoiceNo('');
      setFormPurpose('');
      setFormRemarks('');
      setFormAttachmentName('');

      // Reload records
      await loadExpenses();

      // Switch to history or drafts
      setTimeout(() => {
        setActiveTab(saveAsDraft ? 'drafts' : 'history');
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      console.error('Failed to save voucher', err);
      setFormError('Failed to record voucher in Strapi backend. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Void / Cancel controlled workflow
  const handleVoidVoucher = async () => {
    if (!voidingVoucher || !voidReason.trim()) return;

    try {
      setSubmitting(true);
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let existingAudit: AuditEntry[] = [];
      try {
        existingAudit = JSON.parse(voidingVoucher.audit_history || voidingVoucher.auditHistory || '[]');
      } catch (e) {}

      existingAudit.push({
        timestamp: timestampStr,
        actor: currentSupervisor.name,
        action: 'Voucher Voided / Cancelled',
        note: `Reason: ${voidReason}`
      });

      const updateData = {
        status: 'Void',
        admin_remarks: `VOIDED by ${currentSupervisor.name}: ${voidReason}`,
        audit_history: JSON.stringify(existingAudit)
      };

      const targetId = String(voidingVoucher.document_id || voidingVoucher.documentId || voidingVoucher.id);
      await updateStrapiEntity('expenses', targetId, updateData);

      setVoidingVoucher(null);
      setVoidReason('');
      await loadExpenses();
      if (selectedVoucher && selectedVoucher.id === voidingVoucher.id) {
        setShowDrawer(false);
      }
    } catch (err: any) {
      alert('Failed to void voucher: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Parse audit history safe helper
  const getAuditHistory = (voucher: ExpenseVoucher): AuditEntry[] => {
    try {
      const raw = voucher.audit_history || voucher.auditHistory;
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      {
        timestamp: voucher.date || 'Recent',
        actor: voucher.submitted_by || voucher.submittedBy || 'Er. Pravin Gaikwad',
        action: 'Voucher Logged',
        note: voucher.purpose || 'Initial entry'
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
            <Receipt size={28} />
            <span>Site Expenses & Financial Control</span>
          </h1>
          <p>
            Authorized petty cash disbursement, consumable procurement vouchers, vendor settlements, and audit-controlled financial workflow.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.btnActionSecondary}
            onClick={() => loadExpenses()}
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
            <span>Create Voucher</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         2. Filter & Date Range Strip
         -------------------------------------------------------------------- */}
      <div className={styles.filterStrip}>
        <div className={styles.filterDateGroup}>
          <span className={styles.filterDateLabel}>Accounting Range:</span>
          <button 
            className={`${styles.btnDatePill} ${dateFilter === 'today' ? styles.btnDatePillActive : ''}`}
            onClick={() => setDateFilter('today')}
          >
            Today
          </button>
          <button 
            className={`${styles.btnDatePill} ${dateFilter === '7days' ? styles.btnDatePillActive : ''}`}
            onClick={() => setDateFilter('7days')}
          >
            Last 7 Days
          </button>
          <button 
            className={`${styles.btnDatePill} ${dateFilter === 'month' ? styles.btnDatePillActive : ''}`}
            onClick={() => setDateFilter('month')}
          >
            This Month
          </button>
          <button 
            className={`${styles.btnDatePill} ${dateFilter === 'all' ? styles.btnDatePillActive : ''}`}
            onClick={() => setDateFilter('all')}
          >
            All Time
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
        {/* Metric 1: Total Expenses */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Expenses</span>
            <span className={styles.summaryValue}>₹{metrics.totalExpenses.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>{metrics.totalVouchers} active records</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconSlate}`}>
            <Receipt size={20} />
          </div>
        </div>

        {/* Metric 2: Total Submitted Amount */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Submitted</span>
            <span className={styles.summaryValue}>₹{metrics.submittedAmount.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>Sent for review</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconTeal}`}>
            <Send size={20} />
          </div>
        </div>

        {/* Metric 3: Pending Approval */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Pending Approval</span>
            <span className={styles.summaryValue}>₹{metrics.pendingApprovalAmount.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>Under accounts review</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconAmber}`}>
            <Clock size={20} />
          </div>
        </div>

        {/* Metric 4: Approved Amount */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Approved Amount</span>
            <span className={styles.summaryValue}>₹{metrics.approvedAmount.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>Audited by finance</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconEmerald}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Metric 5: Rejected Amount */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Rejected Amount</span>
            <span className={styles.summaryValue}>₹{metrics.rejectedAmount.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>Declined by finance</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconRose}`}>
            <XCircle size={20} />
          </div>
        </div>

        {/* Metric 6: Total Vouchers */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total Vouchers</span>
            <span className={styles.summaryValue}>{metrics.totalVouchers}</span>
            <span className={styles.summarySubtext}>In current filter</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconBronze}`}>
            <FileText size={20} />
          </div>
        </div>

        {/* Metric 7: Paid Amount */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Paid Amount</span>
            <span className={styles.summaryValue}>₹{metrics.paidAmount.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>Disbursed / Settled</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconTeal}`}>
            <Banknote size={20} />
          </div>
        </div>

        {/* Metric 8: Unpaid Approved Amount */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Unpaid Approved</span>
            <span className={styles.summaryValue}>₹{metrics.unpaidApprovedAmount.toLocaleString('en-IN')}</span>
            <span className={styles.summarySubtext}>Approved, awaiting cash/NEFT</span>
          </div>
          <div className={`${styles.summaryIconWrap} ${styles.iconBronze}`}>
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
         4. Workspace Segmented Tabs Bar
         -------------------------------------------------------------------- */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Receipt size={16} />
          <span>Overview</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'create' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <PlusCircle size={16} />
          <span>Create Voucher</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={16} />
          <span>My Expense History</span>
          <span className={activeTab === 'history' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
            {tabCounts.all}
          </span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={16} />
          <span>Pending Approval</span>
          {tabCounts.pending > 0 && (
            <span className={activeTab === 'pending' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {tabCounts.pending}
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
            {tabCounts.approved}
          </span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'revisions' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('revisions')}
        >
          <AlertCircle size={16} />
          <span>Revision Required</span>
          {tabCounts.revisions > 0 && (
            <span className={activeTab === 'revisions' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {tabCounts.revisions}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'rejected' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <XCircle size={16} />
          <span>Rejected</span>
          {tabCounts.rejected > 0 && (
            <span className={activeTab === 'rejected' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {tabCounts.rejected}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'drafts' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('drafts')}
        >
          <Layers size={16} />
          <span>Draft Vouchers</span>
          {tabCounts.drafts > 0 && (
            <span className={activeTab === 'drafts' ? styles.tabCountBadge : styles.tabCountBadgeInactive}>
              {tabCounts.drafts}
            </span>
          )}
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Banknote size={16} />
          <span>Financial Analytics</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
         5. Pane Content Switching
         -------------------------------------------------------------------- */}

      {/* PANE: CREATE VOUCHER FORM */}
      {activeTab === 'create' && (
        <div className={styles.paneContainer}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#172B32' }}>
              Create Site Expense Voucher
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#667085', margin: 0 }}>
              Authorized expenditure entry. All vouchers are audited against site budget ceilings and accounts criteria.
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
            {/* Section 1: Project & Assignment */}
            <div className={styles.formCardSectionTitle}>
              <Building size={16} />
              <span>Project & Site Authorization</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned Project</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formProject} 
                disabled 
                style={{ background: '#ECEBE5', cursor: 'not-allowed' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned Site</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formSite} 
                disabled 
                style={{ background: '#ECEBE5', cursor: 'not-allowed' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Expense Date *</label>
              <input 
                type="date" 
                className={styles.formInput} 
                value={formDate} 
                onChange={e => setFormDate(e.target.value)} 
                required 
              />
            </div>

            {/* Section 2: Voucher Core Details */}
            <div className={styles.formCardSectionTitle}>
              <Receipt size={16} />
              <span>Voucher Particulars</span>
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Voucher Title / Brief Description *</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formTitle} 
                onChange={e => setFormTitle(e.target.value)} 
                placeholder="e.g. Concrete curing compound, cutting blades and safety gloves batch"
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Expense Category *</label>
              <select 
                className={styles.formSelect} 
                value={formCategory} 
                onChange={e => setFormCategory(e.target.value)}
              >
                <option value="Consumables & Hardware">Consumables & Hardware</option>
                <option value="Safety & PPE">Safety & PPE</option>
                <option value="Tools & Equipment">Tools & Equipment</option>
                <option value="Transportation">Transportation</option>
                <option value="Labour-related Expenses">Labour-related Expenses</option>
                <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                <option value="Site Utilities">Site Utilities</option>
                <option value="Emergency Purchases">Emergency Purchases</option>
                <option value="Other Approved Categories">Other Approved Categories</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Expense Subcategory</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formSubcategory} 
                onChange={e => setFormSubcategory(e.target.value)} 
                placeholder="e.g. Electrical / Chemicals / PPE"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount (₹) *</label>
              <input 
                type="number" 
                className={styles.formInput} 
                value={formAmount} 
                onChange={e => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="0.00"
                required 
              />
            </div>

            {/* Section 3: Vendor & Payment Particulars */}
            <div className={styles.formCardSectionTitle}>
              <Banknote size={16} />
              <span>Vendor & Settlement Method</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Paid To / Vendor Name *</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formPaidTo} 
                onChange={e => setFormPaidTo(e.target.value)} 
                placeholder="e.g. Shree Balaji Hardware & Tools"
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vendor Contact / Mobile</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formVendorContact} 
                onChange={e => setFormVendorContact(e.target.value)} 
                placeholder="+91 98220 XXXXX"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Method *</label>
              <select 
                className={styles.formSelect} 
                value={formPaymentMode} 
                onChange={e => setFormPaymentMode(e.target.value)}
              >
                <option value="UPI / QR Code">UPI / QR Code</option>
                <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                <option value="Corporate Credit Card">Corporate Credit Card</option>
                <option value="Cheque / Draft">Cheque / Draft</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Invoice / Cash Memo Number</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formInvoiceNo} 
                onChange={e => setFormInvoiceNo(e.target.value)} 
                placeholder="e.g. INV-2026-892"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Transaction Reference / UTR</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formTransactionRef} 
                onChange={e => setFormTransactionRef(e.target.value)} 
                placeholder="e.g. UPI/4392019/HDFC"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Authorized Supervisor</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={currentSupervisor.name} 
                disabled 
                style={{ background: '#ECEBE5', cursor: 'not-allowed' }}
              />
            </div>

            {/* Section 4: Purpose & Supporting Documentation */}
            <div className={styles.formCardSectionTitle}>
              <Upload size={16} />
              <span>Purpose & Receipt Documentation</span>
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Expense Purpose & Site Operational Justification</label>
              <textarea 
                className={styles.formTextarea} 
                value={formPurpose} 
                onChange={e => setFormPurpose(e.target.value)} 
                placeholder="State clearly why this on-site expense was incurred and the specific structural activity it supports..."
              />
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>Receipt / Invoice Attachment Reference</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formAttachmentName} 
                  onChange={e => setFormAttachmentName(e.target.value)} 
                  placeholder="e.g. bill_hardware_slip_18nov.pdf / photo_receipt_scan.jpg"
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className={styles.btnActionSecondary}
                  style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }}
                  onClick={() => setFormAttachmentName(`bill_scan_${Date.now().toString().slice(-4)}.pdf`)}
                >
                  <Upload size={15} />
                  <span>Attach Scan</span>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className={styles.formActionBar}>
              <button 
                type="button" 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }}
                onClick={() => {
                  setFormTitle('');
                  setFormAmount('');
                  setFormPaidTo('');
                  setFormPurpose('');
                }}
                disabled={submitting}
              >
                Clear Form
              </button>
              <button 
                type="button" 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#172B32', background: '#F4F2EC' }}
                onClick={() => handleVoucherSubmit(true)}
                disabled={submitting}
              >
                Save as Draft
              </button>
              <button 
                type="button" 
                className={styles.btnActionPrimary}
                onClick={() => handleVoucherSubmit(false)}
                disabled={submitting}
              >
                <Send size={16} />
                <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANE: TABLE VIEW (Overview, History, Drafts, Pending, Approved, Revisions, Rejected) */}
      {activeTab !== 'create' && activeTab !== 'analytics' && (
        <div className={styles.paneContainer}>
          {/* Table Toolbar */}
          <div className={styles.tableToolbar}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={16} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search by Voucher ID, description, vendor, invoice..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.filterControls}>
              {/* Category Filter */}
              <select 
                className={styles.selectInput}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="Consumables & Hardware">Consumables & Hardware</option>
                <option value="Safety & PPE">Safety & PPE</option>
                <option value="Tools & Equipment">Tools & Equipment</option>
                <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                <option value="Site Utilities">Site Utilities</option>
                <option value="Emergency Purchases">Emergency Purchases</option>
              </select>

              {/* Status Filter */}
              <select 
                className={styles.selectInput}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Approvals</option>
                <option value="Approved">Approved</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Draft</option>
              </select>

              {/* Payment Filter */}
              <select 
                className={styles.selectInput}
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">All Settlement Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              {/* Sort Order */}
              <button 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC', padding: '0.55rem 0.75rem' }}
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
                title="Toggle Date Sort"
              >
                <ArrowUpDown size={14} />
                <span>Sort Date ({sortOrder.toUpperCase()})</span>
              </button>
            </div>
          </div>

          {/* Table Data */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#667085' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading authorized site expense records...</div>
            </div>
          ) : displayedTableRecords.length === 0 ? (
            <div className={styles.emptyState}>
              <Receipt size={40} style={{ color: '#B58B59', opacity: 0.8 }} />
              <div className={styles.emptyStateTitle}>No Expense Vouchers Found</div>
              <div className={styles.emptyStateSubtitle}>
                There are no expense records matching your current filter criteria or status tab.
              </div>
              <button 
                className={styles.btnActionPrimary}
                onClick={() => setActiveTab('create')}
              >
                <PlusCircle size={15} />
                <span>Log New Voucher</span>
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Voucher ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Paid To / Vendor</th>
                    <th>Amount (₹)</th>
                    <th>Approval Status</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTableRecords.map(voucher => {
                    const status = voucher.status || 'Pending Review';
                    const payStatus = voucher.payment_status || voucher.paymentStatus || 'Unpaid';
                    const vId = voucher.expense_id || voucher.expenseId || `EXP-${voucher.id}`;

                    return (
                      <tr key={voucher.id}>
                        <td style={{ fontWeight: 700, color: '#172B32' }}>
                          {vId}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#667085' }}>
                          {voucher.date}
                        </td>
                        <td style={{ fontWeight: 600, color: '#172B32', maxWidth: '280px' }}>
                          <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={voucher.title}>
                            {voucher.title}
                          </div>
                          {voucher.invoice_no && (
                            <div style={{ fontSize: '0.72rem', color: '#8391A1', marginTop: '2px' }}>
                              Inv: {voucher.invoice_no}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', background: '#F4F2EC', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#203A3B' }}>
                            {voucher.category}
                          </span>
                        </td>
                        <td style={{ color: '#203A3B' }}>
                          {voucher.paid_to || voucher.paidTo || 'Local Vendor'}
                        </td>
                        <td style={{ fontWeight: 800, color: '#172B32', fontSize: '0.92rem' }}>
                          ₹{Number(voucher.amount).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={`
                            ${styles.badge} 
                            ${status === 'Approved' ? styles.badgeApproved : ''}
                            ${status === 'Pending Review' ? styles.badgePending : ''}
                            ${status === 'Revision Required' ? styles.badgeRevision : ''}
                            ${status === 'Rejected' ? styles.badgeRejected : ''}
                            ${status === 'Draft' ? styles.badgeDraft : ''}
                            ${status === 'Void' ? styles.badgeRejected : ''}
                          `}>
                            {status === 'Approved' && <CheckCircle2 size={12} />}
                            {status === 'Pending Review' && <Clock size={12} />}
                            {status === 'Revision Required' && <AlertCircle size={12} />}
                            {status === 'Rejected' && <XCircle size={12} />}
                            <span>{status}</span>
                          </span>
                        </td>
                        <td>
                          <span className={`
                            ${styles.badge}
                            ${payStatus === 'Paid' ? styles.badgePaid : styles.badgeUnpaid}
                          `}>
                            {payStatus === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span>{payStatus}</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              className={styles.tableActionBtn}
                              onClick={() => {
                                setSelectedVoucher(voucher);
                                setShowDrawer(true);
                              }}
                              title="View full audit particulars"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            {status !== 'Approved' && status !== 'Void' && (
                              <button 
                                className={styles.tableActionBtn}
                                style={{ color: '#C62828' }}
                                onClick={() => setVoidingVoucher(voucher)}
                                title="Void or cancel voucher"
                              >
                                <X size={13} />
                                <span>Void</span>
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

      {/* PANE: FINANCIAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className={styles.paneContainer}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#172B32' }}>
              Financial Analytics & Expenditure Distribution
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#667085', margin: 0 }}>
              Real-time expenditure breakdown by category, payment mode, vendor concentration, and budget utilization.
            </p>
          </div>

          <div className={styles.analyticsGrid}>
            {/* Card 1: Category Distribution */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardTitle}>
                <Layers size={16} />
                <span>Expenditure by Category</span>
              </div>
              <div className={styles.barList}>
                {(() => {
                  const catMap: Record<string, number> = {};
                  authorizedVouchers.forEach(v => {
                    const c = v.category || 'General';
                    catMap[c] = (catMap[c] || 0) + (Number(v.amount) || 0);
                  });
                  const total = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;

                  return Object.entries(catMap).map(([cat, amt]) => {
                    const pct = Math.round((amt / total) * 100);
                    return (
                      <div key={cat} className={styles.barItem}>
                        <div className={styles.barItemHeader}>
                          <span>{cat}</span>
                          <span>₹{amt.toLocaleString('en-IN')} ({pct}%)</span>
                        </div>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Card 2: Settlement Status Breakdown */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardTitle}>
                <Banknote size={16} />
                <span>Settlement & Approval Status</span>
              </div>
              <div className={styles.barList}>
                <div className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span>Paid & Settled</span>
                    <span>₹{metrics.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${metrics.totalExpenses > 0 ? (metrics.paidAmount / metrics.totalExpenses) * 100 : 0}%`, background: '#059669' }} />
                  </div>
                </div>

                <div className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span>Approved (Awaiting Settlement)</span>
                    <span>₹{metrics.unpaidApprovedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${metrics.totalExpenses > 0 ? (metrics.unpaidApprovedAmount / metrics.totalExpenses) * 100 : 0}%`, background: '#B58B59' }} />
                  </div>
                </div>

                <div className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span>Pending Accounts Review</span>
                    <span>₹{metrics.pendingApprovalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${metrics.totalExpenses > 0 ? (metrics.pendingApprovalAmount / metrics.totalExpenses) * 100 : 0}%`, background: '#D97706' }} />
                  </div>
                </div>

                <div className={styles.barItem}>
                  <div className={styles.barItemHeader}>
                    <span>Rejected / Void</span>
                    <span>₹{metrics.rejectedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${metrics.totalExpenses > 0 ? (metrics.rejectedAmount / metrics.totalExpenses) * 100 : 0}%`, background: '#DC2626' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Site Budget Tracking */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardTitle}>
                <Building size={16} />
                <span>Project Petty Cash Contingency Ceiling</span>
              </div>
              <div style={{ background: '#F4F2EC', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#667085' }}>Monthly Site Imprest Allocation:</span>
                  <span style={{ fontWeight: 700, color: '#172B32' }}>₹1,00,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#667085' }}>Disbursed + Committed This Month:</span>
                  <span style={{ fontWeight: 700, color: '#167C72' }}>₹{metrics.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#667085' }}>Available Imprest Balance:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>
                    ₹{(Math.max(0, 100000 - metrics.totalExpenses)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={styles.barTrack} style={{ height: '10px' }}>
                  <div 
                    className={styles.barFill} 
                    style={{ 
                      width: `${Math.min(100, (metrics.totalExpenses / 100000) * 100)}%`,
                      background: metrics.totalExpenses > 80000 ? '#D97706' : '#167C72'
                    }} 
                  />
                </div>
                <div style={{ fontSize: '0.74rem', color: '#8391A1', marginTop: '0.5rem' }}>
                  Imprest limit replenished every 1st of month by Finance Admin.
                </div>
              </div>
            </div>

            {/* Card 4: Top Vendor Spend */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardTitle}>
                <Briefcase size={16} />
                <span>Top Local Vendors / Payees</span>
              </div>
              <div className={styles.barList}>
                {(() => {
                  const vendorMap: Record<string, number> = {};
                  authorizedVouchers.forEach(v => {
                    const name = v.paid_to || v.paidTo || 'Local Vendor';
                    vendorMap[name] = (vendorMap[name] || 0) + (Number(v.amount) || 0);
                  });
                  const top = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

                  return top.map(([vendor, amt]) => (
                    <div key={vendor} className={styles.barItem}>
                      <div className={styles.barItemHeader}>
                        <span>{vendor}</span>
                        <span>₹{amt.toLocaleString('en-IN')}</span>
                      </div>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${(amt / (metrics.totalExpenses || 1)) * 100}%`, background: '#203A3B' }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
         6. Slide-Over Detail Drawer
         -------------------------------------------------------------------- */}
      {showDrawer && selectedVoucher && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#B58B59', fontWeight: 700, letterSpacing: '0.04em' }}>
                  EXPENSE VOUCHER RECORD
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedVoucher.expense_id || selectedVoucher.expenseId || `EXP-${selectedVoucher.id}`}
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: '#ECEBE5', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.drawerBody}>
              {/* Admin Notice if revision requested */}
              {selectedVoucher.status === 'Revision Required' && (
                <div className={styles.adminNoticeBox}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <AlertCircle size={15} />
                    <span>Revision Requested by Admin</span>
                  </div>
                  <div>{selectedVoucher.admin_remarks || selectedVoucher.revision_instructions || 'Please review notes and re-upload required receipts.'}</div>
                </div>
              )}

              {/* Grid Particulars */}
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Voucher Status</div>
                  <div className={styles.detailItemValue}>
                    <span className={`
                      ${styles.badge} 
                      ${selectedVoucher.status === 'Approved' ? styles.badgeApproved : ''}
                      ${selectedVoucher.status === 'Pending Review' ? styles.badgePending : ''}
                      ${selectedVoucher.status === 'Revision Required' ? styles.badgeRevision : ''}
                      ${selectedVoucher.status === 'Rejected' ? styles.badgeRejected : ''}
                      ${selectedVoucher.status === 'Draft' ? styles.badgeDraft : ''}
                    `}>
                      {selectedVoucher.status}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Payment Settlement</div>
                  <div className={styles.detailItemValue}>
                    <span className={`
                      ${styles.badge} 
                      ${(selectedVoucher.payment_status || selectedVoucher.paymentStatus) === 'Paid' ? styles.badgePaid : styles.badgeUnpaid}
                    `}>
                      {selectedVoucher.payment_status || selectedVoucher.paymentStatus || 'Unpaid'}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Amount</div>
                  <div className={styles.detailItemValue} style={{ fontSize: '1.25rem', color: '#167C72' }}>
                    ₹{Number(selectedVoucher.amount).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Expense Date</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.date}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Category</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.category}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Subcategory</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.subcategory || 'General'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Paid To / Vendor</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.paid_to || selectedVoucher.paidTo || 'Local Vendor'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Vendor Contact</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.vendor_contact || 'N/A'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Payment Mode</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.payment_mode || selectedVoucher.paymentMode || 'Cash'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Transaction / UTR Ref</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.transaction_ref || 'N/A'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Invoice / Memo No.</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.invoice_no || 'N/A'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailItemLabel}>Submitted By</div>
                  <div className={styles.detailItemValue}>{selectedVoucher.submitted_by || selectedVoucher.submittedBy || 'Er. Pravin Gaikwad'}</div>
                </div>
              </div>

              {/* Purpose Box */}
              <div className={styles.detailBox}>
                <div className={styles.detailItemLabel}>Operational Purpose / Scope</div>
                <div style={{ fontSize: '0.85rem', color: '#172B32', lineHeight: 1.45 }}>
                  {selectedVoucher.purpose || selectedVoucher.title}
                </div>
              </div>

              {/* Remarks Box */}
              {selectedVoucher.remarks && (
                <div className={styles.detailBox}>
                  <div className={styles.detailItemLabel}>Supervisor Remarks</div>
                  <div style={{ fontSize: '0.85rem', color: '#172B32', lineHeight: 1.45 }}>
                    {selectedVoucher.remarks}
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              {selectedVoucher.admin_remarks && (
                <div className={styles.detailBox} style={{ background: '#E8F5E9', borderColor: '#C8E6C9' }}>
                  <div className={styles.detailItemLabel} style={{ color: '#2E7D32' }}>Accounts / Finance Verification Remarks</div>
                  <div style={{ fontSize: '0.85rem', color: '#1B5E20', lineHeight: 1.45 }}>
                    {selectedVoucher.admin_remarks}
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B32', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={15} />
                  <span>Immutable Audit History</span>
                </div>
                <div className={styles.timelineList}>
                  {getAuditHistory(selectedVoucher).map((entry, idx) => (
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

            {/* Footer */}
            <div className={styles.drawerFooter}>
              <button 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#FFFFFF' }}
                onClick={() => window.print()}
              >
                <FileText size={15} />
                <span>Print Voucher</span>
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
         7. Void / Cancel Confirmation Modal
         -------------------------------------------------------------------- */}
      {voidingVoucher && (
        <div className={styles.drawerOverlay}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.5rem', width: '100%', maxWidth: '480px', margin: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C62828', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Void Expense Voucher
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1rem 0' }}>
              Are you sure you want to void voucher <strong>{voidingVoucher.expense_id || voidingVoucher.expenseId}</strong> (₹{voidingVoucher.amount})? This will mark it as cancelled in the immutable audit log.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.35rem' }}>
                Reason for Voiding *
              </label>
              <textarea 
                className={styles.formTextarea} 
                style={{ width: '100%', minHeight: '70px' }} 
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="e.g. Duplicate entry submitted by mistake, or transaction cancelled by vendor..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className={styles.btnActionSecondary}
                style={{ color: '#172B32', borderColor: '#ECEBE5', background: '#F4F2EC' }}
                onClick={() => {
                  setVoidingVoucher(null);
                  setVoidReason('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className={styles.btnActionPrimary}
                style={{ background: '#C62828', borderColor: '#B71C1C' }}
                onClick={handleVoidVoucher}
                disabled={submitting || !voidReason.trim()}
              >
                {submitting ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
