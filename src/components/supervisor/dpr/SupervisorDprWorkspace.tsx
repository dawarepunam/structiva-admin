'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './DprWorkspace.module.css';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  HardHat, 
  Truck, 
  Fuel, 
  Layers, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Printer, 
  Eye, 
  Edit3, 
  X, 
  Save, 
  RotateCcw,
  ShieldCheck,
  Building,
  Check
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from '@/services/strapiClient';
import { EnterpriseProjectRecord } from '@/services/projectStorage';

export default function SupervisorDPRWorkspace() {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'history' | 'drafts' | 'revision'>('history');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Authenticated Supervisor Session
  const [supervisorUser, setSupervisorUser] = useState({
    name: 'Er. Pravin Gaikwad',
    empId: 'EMP-SUP-084',
    role: 'Supervisor'
  });

  // Raw Database Collections from Strapi v5
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Detail / Print Preview Drawer State
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Form State (for Create & Edit)
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reportDate: '18 Nov 2026',
    shift: 'Shift-1 (Day)',
    weather: 'Clear Sky & Dry (28°C)',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A',
    workforceCount: 3,
    skilledWorkers: 1,
    semiSkilledWorkers: 1,
    unskilledWorkers: 1,
    machineryCount: 1,
    equipmentUsed: 'EQP-JCB-01 (JCB 3DX Plus Backhoe)',
    machineryHours: 8.0,
    dieselConsumedLitres: 50,
    workCompletedToday: '',
    workInProgress: '',
    plannedQty: 150,
    actualQty: 145,
    unit: 'm³',
    safetyObservations: 'Zero LTIs. Mandatory hard hats and safety harnesses inspected.',
    qualityIssues: 'None. Concrete slump and temperature tests certified.',
    delaysBlockers: 'None.',
    nextDayPlan: 'Water ponding curing and rebar fabrication for columns C1-C6.',
    supervisorRemarks: ''
  });

  const [formSavedSuccess, setFormSavedSuccess] = useState(false);

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

  async function loadDprData() {
    setLoading(true);
    try {
      const [requestsRes, projectsRes] = await Promise.all([
        fetchStrapiCollection('supervisor-requests', []),
        fetchStrapiCollection<EnterpriseProjectRecord>('projects', [])
      ]);

      setAllRequests(requestsRes || []);
      setProjects(projectsRes || []);
    } catch (err) {
      console.error('Failed to load DPR records from Strapi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDprData();
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await loadDprData();
    setSyncing(false);
  };

  // ─────────────────────────────────────────────────────────────
  // STRICT IDENTITY-BASED PROJECT & DPR ASSIGNMENT FILTERING
  // ─────────────────────────────────────────────────────────────
  const assignedProjects = useMemo(() => {
    const supQuery = supervisorUser.name.toLowerCase().trim();
    return projects.filter((p: any) => {
      if (!p.projectSupervisor) return false;
      const assigned = p.projectSupervisor.toLowerCase().trim();
      return assigned.includes(supQuery) || supQuery.includes(assigned);
    });
  }, [projects, supervisorUser.name]);

  const assignedDprs = useMemo(() => {
    const projectNames = assignedProjects.map(p => p.name.toLowerCase().split('(')[0].trim());
    const supervisorQuery = supervisorUser.name.toLowerCase().trim();

    return allRequests
      .filter((r: any) => r.requestType === 'DPR')
      .filter((r: any) => {
        if (r.submittedBy && r.submittedBy.toLowerCase().includes(supervisorQuery)) return true;
        if (r.project) {
          const dprProj = r.project.toLowerCase();
          return projectNames.some(pName => dprProj.includes(pName));
        }
        return false;
      })
      .map((r: any) => {
        let details: any = {};
        try {
          details = typeof r.details === 'string' ? JSON.parse(r.details) : (r.details || {});
        } catch {
          details = {};
        }

        return {
          id: r.id || r.documentId,
          documentId: r.documentId,
          title: r.title,
          project: r.project || 'Skyline Commercial Complex (Tower A)',
          site: r.site || 'Tower A',
          category: r.category || 'Daily Progress Report',
          priority: r.priority || 'Standard',
          status: r.status || 'Submitted',
          remarks: r.remarks || '',
          adminRemarks: r.adminRemarks || '',
          submittedBy: r.submittedBy,
          submittedDate: r.submittedDate || '18 Nov 2026',
          // Detailed structured fields
          dprNumber: details.dprNumber || `DPR-${r.id || '101'}`,
          reportDate: details.reportDate || r.submittedDate || '18 Nov 2026',
          shift: details.shift || 'Shift-1 (Day)',
          weather: details.weather || 'Clear Sky & Dry (28°C)',
          workforceCount: details.workforceCount || 3,
          skilledWorkers: details.skilledWorkers || 1,
          semiSkilledWorkers: details.semiSkilledWorkers || 1,
          unskilledWorkers: details.unskilledWorkers || 1,
          machineryCount: details.machineryCount || 1,
          equipmentUsed: details.equipmentUsed || 'EQP-JCB-01',
          machineryHours: details.machineryHours || 8.0,
          dieselConsumedLitres: details.dieselConsumedLitres || 50,
          workCompletedToday: details.workCompletedToday || r.remarks || '',
          workInProgress: details.workInProgress || '',
          plannedQty: details.plannedQty || 150,
          actualQty: details.actualQty || 145,
          unit: details.unit || 'm³',
          safetyObservations: details.safetyObservations || 'Zero LTIs.',
          qualityIssues: details.qualityIssues || 'None.',
          delaysBlockers: details.delaysBlockers || 'None.',
          nextDayPlan: details.nextDayPlan || 'Scheduled pour continued.',
          supervisorRemarks: details.supervisorRemarks || r.remarks || ''
        };
      });
  }, [allRequests, assignedProjects, supervisorUser.name]);

  // ─────────────────────────────────────────────────────────────
  // 7-METRIC DPR DASHBOARD OVERVIEW (100% REAL CALCULATIONS)
  // ─────────────────────────────────────────────────────────────
  const overviewStats = useMemo(() => {
    const total = assignedDprs.length;
    const draft = assignedDprs.filter(d => d.status === 'Draft').length;
    const submitted = assignedDprs.filter(d => d.status === 'Submitted').length;
    const underReview = assignedDprs.filter(d => d.status === 'Under Review').length;
    const approved = assignedDprs.filter(d => d.status === 'Approved').length;
    const revision = assignedDprs.filter(d => d.status === 'Revision Required').length;
    const rejected = assignedDprs.filter(d => d.status === 'Rejected').length;

    return {
      total,
      draft,
      submitted,
      underReview,
      approved,
      revision,
      rejected
    };
  }, [assignedDprs]);

  // Client-Side Search & Filters
  const filteredDprs = useMemo(() => {
    return assignedDprs.filter(d => {
      // Tab filter
      if (activeTab === 'drafts' && d.status !== 'Draft') return false;
      if (activeTab === 'revision' && d.status !== 'Revision Required') return false;

      const matchesSearch = 
        d.dprNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.workCompletedToday.toLowerCase().includes(search.toLowerCase()) ||
        d.project.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesProj = projectFilter === 'All' || d.project === projectFilter;

      return matchesSearch && matchesStatus && matchesProj;
    });
  }, [assignedDprs, activeTab, search, statusFilter, projectFilter]);

  // Open Form for Editing
  const handleEditDpr = (report: any) => {
    setEditingDocumentId(report.documentId);
    setFormData({
      reportDate: report.reportDate,
      shift: report.shift,
      weather: report.weather,
      project: report.project,
      site: report.site,
      workforceCount: report.workforceCount,
      skilledWorkers: report.skilledWorkers,
      semiSkilledWorkers: report.semiSkilledWorkers,
      unskilledWorkers: report.unskilledWorkers,
      machineryCount: report.machineryCount,
      equipmentUsed: report.equipmentUsed,
      machineryHours: report.machineryHours,
      dieselConsumedLitres: report.dieselConsumedLitres,
      workCompletedToday: report.workCompletedToday,
      workInProgress: report.workInProgress,
      plannedQty: report.plannedQty,
      actualQty: report.actualQty,
      unit: report.unit,
      safetyObservations: report.safetyObservations,
      qualityIssues: report.qualityIssues,
      delaysBlockers: report.delaysBlockers,
      nextDayPlan: report.nextDayPlan,
      supervisorRemarks: report.supervisorRemarks
    });
    setActiveTab('create');
  };

  // Submit / Save Form
  const handleSaveOrSubmit = async (targetStatus: 'Draft' | 'Submitted') => {
    const dprPayload = {
      requestType: 'DPR',
      title: `DPR: ${formData.shift} - ${formData.reportDate}`,
      project: formData.project,
      site: formData.site,
      category: 'Daily Progress Report',
      priority: 'Standard',
      status: targetStatus,
      details: JSON.stringify({
        dprNumber: editingDocumentId ? `REV-${formData.reportDate.replace(/ /g, '')}` : `DPR-SKY-${Date.now().toString().slice(-4)}`,
        reportDate: formData.reportDate,
        shift: formData.shift,
        weather: formData.weather,
        workforceCount: formData.workforceCount,
        skilledWorkers: formData.skilledWorkers,
        semiSkilledWorkers: formData.semiSkilledWorkers,
        unskilledWorkers: formData.unskilledWorkers,
        machineryCount: formData.machineryCount,
        equipmentUsed: formData.equipmentUsed,
        machineryHours: formData.machineryHours,
        dieselConsumedLitres: formData.dieselConsumedLitres,
        workCompletedToday: formData.workCompletedToday,
        workInProgress: formData.workInProgress,
        plannedQty: formData.plannedQty,
        actualQty: formData.actualQty,
        unit: formData.unit,
        safetyObservations: formData.safetyObservations,
        qualityIssues: formData.qualityIssues,
        delaysBlockers: formData.delaysBlockers,
        nextDayPlan: formData.nextDayPlan,
        supervisorRemarks: formData.supervisorRemarks
      }),
      remarks: formData.workCompletedToday,
      submittedBy: supervisorUser.name,
      submittedDate: formData.reportDate
    };

    if (editingDocumentId) {
      await updateStrapiEntity('supervisor-requests', editingDocumentId, dprPayload);
    } else {
      await createStrapiEntity('supervisor-requests', dprPayload);
    }

    setFormSavedSuccess(true);
    await loadDprData();
    setTimeout(() => {
      setFormSavedSuccess(false);
      setEditingDocumentId(null);
      setActiveTab('history');
    }, 1500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.titleArea}>
          <h1>Daily Progress Report (DPR) Workspace</h1>
          <p>
            Official daily site logs, execution records, revision feedback, and submission audits for Supervisor <strong>{supervisorUser.name}</strong> ({supervisorUser.empId}).
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.badge}>CENTRAL STRAPI PERSISTED</span>
          <button 
            onClick={() => {
              setEditingDocumentId(null);
              setActiveTab('create');
            }} 
            className={styles.createToggleBtn}
          >
            <Plus size={14} />
            <span>Create New DPR</span>
          </button>
          <button 
            onClick={handleRefresh} 
            disabled={syncing || loading} 
            className={styles.refreshBtn}
            title="Refresh DPR records from central Strapi backend"
          >
            <RefreshCw size={13} className={syncing ? styles.spin : ''} />
            <span>{syncing ? 'Refreshing...' : 'Revalidate'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          7-METRIC DASHBOARD OVERVIEW STRIP
          ───────────────────────────────────────────────────────── */}
      <section className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total DPRs</span>
          <strong className={styles.overviewValue}>{overviewStats.total}</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>All Site Reports</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Drafts</span>
          <strong className={styles.overviewValue}>{overviewStats.draft}</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>Unsubmitted</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Submitted</span>
          <strong className={styles.overviewValue}>{overviewStats.submitted}</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>Queued for Review</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Under Review</span>
          <strong className={styles.overviewValue}>{overviewStats.underReview}</strong>
          <span className={`${styles.overviewTag} ${styles.tagAmber}`}>PM Evaluating</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Approved</span>
          <strong className={styles.overviewValue}>{overviewStats.approved}</strong>
          <span className={`${styles.overviewTag} ${styles.tagGreen}`}>Certified</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Revision Required</span>
          <strong className={styles.overviewValue}>{overviewStats.revision}</strong>
          <span className={`${styles.overviewTag} ${overviewStats.revision > 0 ? styles.tagAmber : styles.tagGreen}`}>
            {overviewStats.revision > 0 ? 'Feedback Waiting' : 'None'}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Rejected</span>
          <strong className={styles.overviewValue}>{overviewStats.rejected}</strong>
          <span className={`${styles.overviewTag} ${styles.tagRed}`}>
            {overviewStats.rejected === 0 ? 'Zero' : 'Review Reason'}
          </span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          TABS NAVIGATION WORKSPACE
          ───────────────────────────────────────────────────────── */}
      <div className={styles.tabsBar}>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTabBtn : ''}`}
        >
          <FileText size={14} />
          <span>My DPR History ({assignedDprs.length})</span>
        </button>
        <button 
          onClick={() => {
            setEditingDocumentId(null);
            setActiveTab('create');
          }} 
          className={`${styles.tabBtn} ${activeTab === 'create' ? styles.activeTabBtn : ''}`}
        >
          <Plus size={14} />
          <span>{editingDocumentId ? 'Edit / Resubmit DPR' : 'Create New DPR'}</span>
        </button>
        <button 
          onClick={() => setActiveTab('drafts')} 
          className={`${styles.tabBtn} ${activeTab === 'drafts' ? styles.activeTabBtn : ''}`}
        >
          <span>Drafts ({overviewStats.draft})</span>
        </button>
        <button 
          onClick={() => setActiveTab('revision')} 
          className={`${styles.tabBtn} ${activeTab === 'revision' ? styles.activeTabBtn : ''}`}
        >
          <span>Revision Requests ({overviewStats.revision})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          TAB CONTENT: CREATE & EDIT FORM
          ───────────────────────────────────────────────────────── */}
      {activeTab === 'create' && (
        <div className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <FileText size={18} className={styles.sectionIcon} />
            <h3>{editingDocumentId ? 'Update & Resubmit Daily Progress Report' : 'Draft New Daily Progress Report (DPR)'}</h3>
          </div>

          {formSavedSuccess && (
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
              DPR record saved successfully to Strapi central database!
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className={styles.formSection}>
            <span className={styles.label}>1. Basic Information & Site Shift</span>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Report Date</label>
                <input 
                  type="text" 
                  value={formData.reportDate} 
                  onChange={e => setFormData({ ...formData, reportDate: e.target.value })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Site Shift</label>
                <select 
                  value={formData.shift} 
                  onChange={e => setFormData({ ...formData, shift: e.target.value })} 
                  className={styles.select}
                >
                  <option value="Shift-1 (Day)">Shift-1 (Day: 08:00 AM - 05:30 PM)</option>
                  <option value="Shift-2 (Night)">Shift-2 (Night: 08:00 PM - 05:30 AM)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Weather Conditions</label>
                <input 
                  type="text" 
                  value={formData.weather} 
                  onChange={e => setFormData({ ...formData, weather: e.target.value })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Parent Project & Site</label>
                <input 
                  type="text" 
                  value={`${formData.project} - ${formData.site}`} 
                  disabled 
                  className={styles.input} 
                  style={{ opacity: 0.8 }} 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Physical Work Executed */}
          <div className={styles.formSection}>
            <span className={styles.label}>2. Physical Work Executed (Today)</span>
            <div className={styles.formGroup}>
              <label className={styles.label}>Work Completed Today (Detailed Activity & Grids)</label>
              <textarea 
                rows={3} 
                value={formData.workCompletedToday} 
                onChange={e => setFormData({ ...formData, workCompletedToday: e.target.value })} 
                className={styles.textarea}
                placeholder="e.g. 145 m³ M-35 Ready-mix concrete poured across Level 14 slab Grid C3 to E7..."
              />
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Planned Target Quantity</label>
                <input 
                  type="number" 
                  value={formData.plannedQty} 
                  onChange={e => setFormData({ ...formData, plannedQty: Number(e.target.value) })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Actual Completed Quantity</label>
                <input 
                  type="number" 
                  value={formData.actualQty} 
                  onChange={e => setFormData({ ...formData, actualQty: Number(e.target.value) })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Unit of Measurement</label>
                <input 
                  type="text" 
                  value={formData.unit} 
                  onChange={e => setFormData({ ...formData, unit: e.target.value })} 
                  className={styles.input} 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Workforce, Machinery & Fuel Telemetry */}
          <div className={styles.formSection}>
            <span className={styles.label}>3. Workforce, Equipment & Fuel Telemetry</span>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Total Workforce Present</label>
                <input 
                  type="number" 
                  value={formData.workforceCount} 
                  onChange={e => setFormData({ ...formData, workforceCount: Number(e.target.value) })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Active Machinery (Equipment Logged)</label>
                <input 
                  type="text" 
                  value={formData.equipmentUsed} 
                  onChange={e => setFormData({ ...formData, equipmentUsed: e.target.value })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Machinery Run Hours</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={formData.machineryHours} 
                  onChange={e => setFormData({ ...formData, machineryHours: Number(e.target.value) })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Diesel Disbursed (Litres)</label>
                <input 
                  type="number" 
                  value={formData.dieselConsumedLitres} 
                  onChange={e => setFormData({ ...formData, dieselConsumedLitres: Number(e.target.value) })} 
                  className={styles.input} 
                />
              </div>
            </div>
          </div>

          {/* Section 4: Site Safety & Next Day Planning */}
          <div className={styles.formSection}>
            <span className={styles.label}>4. Safety Observations & Next Day Planning</span>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Safety Observations (Zero-LTI Compliance)</label>
                <input 
                  type="text" 
                  value={formData.safetyObservations} 
                  onChange={e => setFormData({ ...formData, safetyObservations: e.target.value })} 
                  className={styles.input} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tomorrow's Work Plan</label>
                <input 
                  type="text" 
                  value={formData.nextDayPlan} 
                  onChange={e => setFormData({ ...formData, nextDayPlan: e.target.value })} 
                  className={styles.input} 
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Supervisor Remarks / Notes for Project Manager</label>
              <textarea 
                rows={2} 
                value={formData.supervisorRemarks} 
                onChange={e => setFormData({ ...formData, supervisorRemarks: e.target.value })} 
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={() => handleSaveOrSubmit('Draft')} 
              className={styles.draftBtn}
            >
              <Save size={14} />
              <span>Save as Draft</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleSaveOrSubmit('Submitted')} 
              className={styles.submitBtn}
            >
              <Send size={14} />
              <span>Submit DPR to Project Manager</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          TAB CONTENT: MY DPR HISTORY TABLE
          ───────────────────────────────────────────────────────── */}
      {activeTab !== 'create' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Controls Strip */}
          <div className={styles.controlsStrip}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by DPR number, date, or work summary..."
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
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Draft">Draft</option>
              </select>

              {(search || statusFilter !== 'All') && (
                <button 
                  onClick={() => { setSearch(''); setStatusFilter('All'); }} 
                  className={styles.clearBtn}
                >
                  <RotateCcw size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className={styles.stateBox}>
              <Clock size={32} />
              <h3 className={styles.stateTitle}>Loading Daily Progress Reports...</h3>
              <p className={styles.stateText}>Querying verified Strapi v5 central log records.</p>
            </div>
          ) : assignedDprs.length === 0 ? (
            <div className={styles.stateBox}>
              <FileText size={36} className={styles.stateIcon} />
              <h3 className={styles.stateTitle}>No Daily Progress Reports on File</h3>
              <p className={styles.stateText}>
                No DPRs have been created for your active project assignments. Click "Create New DPR" above to submit today's site log.
              </p>
            </div>
          ) : filteredDprs.length === 0 ? (
            <div className={styles.stateBox}>
              <Search size={36} className={styles.stateIcon} />
              <h3 className={styles.stateTitle}>No Matching DPR Reports Found</h3>
              <p className={styles.stateText}>
                No reports matched your search criteria "{search}". Try clearing your filters.
              </p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>DPR Number</th>
                      <th>Date & Shift</th>
                      <th>Work Progress Summary</th>
                      <th>Workforce</th>
                      <th>Machinery & Fuel</th>
                      <th>Status</th>
                      <th>Admin Feedback</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDprs.map((report: any) => {
                      const statusClass = 
                        report.status === 'Approved' ? styles.statusApproved :
                        report.status === 'Submitted' ? styles.statusSubmitted :
                        report.status === 'Revision Required' ? styles.statusRevision :
                        report.status === 'Rejected' ? styles.statusRejected :
                        styles.statusDraft;

                      return (
                        <tr key={report.id || report.documentId}>
                          <td className={styles.dprCode}>{report.dprNumber}</td>
                          <td>
                            <strong>{report.reportDate}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>{report.shift}</div>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <div style={{ fontWeight: 600, color: '#172B32' }}>
                              {report.workCompletedToday.slice(0, 75)}...
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#167C72', fontWeight: 700 }}>
                              {report.actualQty} / {report.plannedQty} {report.unit}
                            </div>
                          </td>
                          <td>
                            <strong>{report.workforceCount} Men</strong>
                            <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>
                              {report.skilledWorkers}S / {report.semiSkilledWorkers}SS / {report.unskilledWorkers}U
                            </div>
                          </td>
                          <td>
                            <div>{report.machineryHours} hrs</div>
                            <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>{report.dieselConsumedLitres} L Diesel</div>
                          </td>
                          <td>
                            <span className={`${styles.statusSubmitted} ${statusClass}`}>
                              {report.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            {report.adminRemarks ? (
                              <div style={{ fontSize: '0.72rem', color: '#203A3B', fontStyle: 'italic' }}>
                                "{report.adminRemarks}"
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Awaiting PM review</span>
                            )}
                          </td>
                          <td>
                            <div className={styles.actionBtnGroup}>
                              <button 
                                onClick={() => setSelectedReport(report)} 
                                className={styles.viewBtn}
                                title="View full details and print report"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>
                              {(report.status === 'Draft' || report.status === 'Revision Required') && (
                                <button 
                                  onClick={() => handleEditDpr(report)} 
                                  className={styles.editBtn}
                                  title="Edit or submit revision"
                                >
                                  <Edit3 size={13} />
                                  <span>{report.status === 'Revision Required' ? 'Revise' : 'Edit'}</span>
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
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          DPR VIEW DETAILS & PRINT PREVIEW DRAWER
          ───────────────────────────────────────────────────────── */}
      {selectedReport && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span className={styles.badge}>{selectedReport.dprNumber}</span>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.2rem', fontWeight: 700 }}>
                  Daily Progress Report &bull; {selectedReport.reportDate}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#ECEBE5' }}>
                  {selectedReport.shift} &middot; {selectedReport.project}
                </span>
              </div>
              <div className={styles.drawerActions}>
                <button onClick={handlePrint} className={styles.printBtn} title="Print official DPR document">
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button onClick={() => setSelectedReport(null)} className={styles.drawerCloseBtn}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.drawerBody}>
              
              {/* Admin Directives */}
              {selectedReport.adminRemarks && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '0.85rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', marginBottom: '0.2rem' }}>
                    Project Manager Feedback / Certification Remarks:
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#78350F' }}>
                    {selectedReport.adminRemarks}
                  </div>
                </div>
              )}

              {/* General Scope */}
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>Site Shift & Environment</h4>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Parent Project</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.project}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Designated Site</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.site}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Weather Conditions</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.weather}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Approval Status</span>
                  <span className={styles.drawerFieldValue} style={{ color: '#167C72', fontWeight: 700 }}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Physical Execution */}
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>Physical Work Executed</h4>
                <div style={{ background: '#F4F2EC', padding: '0.85rem', borderRadius: '6px', fontSize: '0.82rem', color: '#172B32', lineHeight: '1.4' }}>
                  {selectedReport.workCompletedToday}
                </div>
                <div className={styles.drawerFieldRow} style={{ marginTop: '0.5rem' }}>
                  <span className={styles.drawerFieldLabel}>Actual Quantity Poured / Tied</span>
                  <span className={styles.drawerFieldValue}>
                    <strong>{selectedReport.actualQty}</strong> / {selectedReport.plannedQty} {selectedReport.unit}
                  </span>
                </div>
              </div>

              {/* Workforce & Machinery */}
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>Workforce, Machinery & Bowser Telemetry</h4>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Total Workforce Present</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.workforceCount} Tradespersons</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Skill Breakdown</span>
                  <span className={styles.drawerFieldValue}>
                    {selectedReport.skilledWorkers} Skilled &middot; {selectedReport.semiSkilledWorkers} Semi-Skilled &middot; {selectedReport.unskilledWorkers} Unskilled
                  </span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Equipment Deployed</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.equipmentUsed}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Equipment Run Hours</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.machineryHours} Hours</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Diesel Fuel Consumed</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.dieselConsumedLitres} Litres</span>
                </div>
              </div>

              {/* Safety & Next Day */}
              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>Safety & Next Day Work Plan</h4>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Safety Compliance</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.safetyObservations}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Tomorrow's Work Plan</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.nextDayPlan}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Submitted By</span>
                  <span className={styles.drawerFieldValue}>{selectedReport.submittedBy}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
