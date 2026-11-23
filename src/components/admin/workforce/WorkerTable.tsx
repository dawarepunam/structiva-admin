'use client';

import React, { useState, useEffect } from 'react';
import styles from './WorkerTable.module.css';
import { 
  Search, Phone, ShieldCheck, MapPin, X, ArrowRight, Award, Plus, 
  CheckCircle, Users, UserCheck, UserX, Clock, AlertCircle, LayoutGrid, List,
  Filter, Calendar, DollarSign, FileText, ChevronRight, Briefcase, Sparkles, UserMinus, Edit, Save, Trash2
} from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';
import { EnterpriseWorkerRecord, getStoredWorkers, saveWorkers } from '@/services/workerStorage';
import { getStoredProjects, EnterpriseProjectRecord } from '@/services/projectStorage';
import { getStoredSupervisors, SupervisorOption } from '@/services/supervisorStorage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WorkerTable() {
  const router = useRouter();
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [availableProjects, setAvailableProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [employmentFilter, setEmploymentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [editingWorker, setEditingWorker] = useState<EnterpriseWorkerRecord | null>(null);
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);

  // Quick Project Deployment Modal State
  const [showQuickDeployModal, setShowQuickDeployModal] = useState(false);
  const [selectedDeployProject, setSelectedDeployProject] = useState('');
  const [selectedDeploySupervisor, setSelectedDeploySupervisor] = useState('');
  const [selectedWorkerIdsToDeploy, setSelectedWorkerIdsToDeploy] = useState<string[]>([]);

  // When project changes in Quick Deploy, auto-populate assigned supervisor
  const handleDeployProjectChange = (projectName: string) => {
    setSelectedDeployProject(projectName);
    const proj = availableProjects.find(p => p.name === projectName);
    if (proj?.projectSupervisor) {
      setSelectedDeploySupervisor(proj.projectSupervisor);
    }
  };

  const toggleWorkerSelectionForDeploy = (wId: string) => {
    if (selectedWorkerIdsToDeploy.includes(wId)) {
      setSelectedWorkerIdsToDeploy(selectedWorkerIdsToDeploy.filter(id => id !== wId));
    } else {
      setSelectedWorkerIdsToDeploy([...selectedWorkerIdsToDeploy, wId]);
    }
  };

  const handleExecuteQuickDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeployProject || selectedWorkerIdsToDeploy.length === 0) return;

    const updated = workers.map(w => {
      if (selectedWorkerIdsToDeploy.includes(w.id)) {
        return {
          ...w,
          assignedProject: selectedDeployProject,
          supervisorName: selectedDeploySupervisor || w.supervisorName,
          status: 'Active' as const
        };
      }
      return w;
    });

    setWorkers(updated);
    saveWorkers(updated);
    setShowQuickDeployModal(false);
    setSelectedWorkerIdsToDeploy([]);
    setSelectedDeployProject('');
    setSelectedDeploySupervisor('');
  };

  const handleDeleteWorker = (workerId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = workers.filter(w => w.id !== workerId);
    setWorkers(updated);
    saveWorkers(updated);
    setDeletingWorkerId(null);
  };

  // Edit worker form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    category: 'Skilled' as 'Skilled' | 'Semi-Skilled' | 'Unskilled',
    skill: '',
    assignedProject: '',
    supervisorName: '',
    dailyWage: 950,
    overtimeHourlyRate: 140,
    experienceYears: 5,
    employmentType: 'Direct Payroll' as 'Direct Payroll' | 'Subcontractor Crew' | 'Daily Muster',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const openEditWorkerModal = (worker: EnterpriseWorkerRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorker(worker);
    setEditFormData({
      name: worker.name,
      phone: worker.phone,
      category: worker.category,
      skill: worker.skill,
      assignedProject: worker.assignedProject || 'Unassigned',
      supervisorName: worker.supervisorName || '',
      dailyWage: worker.dailyWage || 950,
      overtimeHourlyRate: worker.overtimeHourlyRate || 140,
      experienceYears: worker.experienceYears || 5,
      employmentType: worker.employmentType || 'Direct Payroll',
      status: worker.status || 'Active'
    });
  };

  const handleUpdateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    const updatedList = workers.map(w => {
      if (w.id === editingWorker.id) {
        return {
          ...w,
          name: editFormData.name,
          phone: editFormData.phone,
          category: editFormData.category,
          skill: editFormData.skill,
          assignedProject: editFormData.assignedProject,
          supervisorName: editFormData.supervisorName,
          dailyWage: Number(editFormData.dailyWage) || w.dailyWage,
          overtimeHourlyRate: Number(editFormData.overtimeHourlyRate) || w.overtimeHourlyRate,
          experienceYears: Number(editFormData.experienceYears) || w.experienceYears,
          employmentType: editFormData.employmentType,
          status: editFormData.status
        };
      }
      return w;
    });

    setWorkers(updatedList);
    saveWorkers(updatedList);
    setEditingWorker(null);
  };

  // 5-Section Master Onboarding Form State
  const [formData, setFormData] = useState({
    // Section 1: Personal
    name: '',
    phone: '',
    dob: '1992-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: '',
    hometown: '',
    aadhaarNumber: '',
    bloodGroup: 'B+',
    emergencyContact: '',
    emergencyRelation: 'Spouse',
    
    // Section 2: Professional
    category: 'Skilled' as 'Skilled' | 'Semi-Skilled' | 'Unskilled',
    skill: '',
    additionalSkills: '',
    experienceYears: 5,
    employmentType: 'Direct Payroll' as 'Direct Payroll' | 'Subcontractor Crew' | 'Daily Muster',
    supervisorName: 'Er. Rajesh Kulkarni',
    safetyCertified: true,
    inductionDate: '2026-11-17',
    
    // Section 3: Project Assignment
    assignedProject: 'Skyline Commercial Complex',
    roleInProject: 'Lead Mason & Bar Bender',
    
    // Section 4: Documents
    docAadhaarProvided: true,
    docSafetyCardProvided: true,
    docMedicalProvided: false,
    
    // Section 5: Salary & Bank
    dailyWage: 950,
    overtimeHourlyRate: 140,
    paymentMode: 'Bank Transfer' as 'Bank Transfer' | 'Direct Cash Voucher' | 'UPI',
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: 'SBIN0001234'
  });

  // Load stored workers & projects
  useEffect(() => {
    setWorkers(getStoredWorkers());
    setAvailableProjects(getStoredProjects());
    setSupervisors(getStoredSupervisors());

    const handleStorage = () => {
      setWorkers(getStoredWorkers());
      setAvailableProjects(getStoredProjects());
      setSupervisors(getStoredSupervisors());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('workersUpdated', handleStorage);
    window.addEventListener('projectsUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('workersUpdated', handleStorage);
      window.removeEventListener('projectsUpdated', handleStorage);
    };
  }, []);

  // Compute Permanent Workforce KPIs (Master Information Only)
  const totalCount = workers.length;
  const activeCount = workers.filter(w => w.status === 'Active').length;
  const inactiveCount = workers.filter(w => w.status === 'Inactive').length;
  const skilledCount = workers.filter(w => w.category === 'Skilled').length;
  const directPayrollCount = workers.filter(w => w.employmentType === 'Direct Payroll').length;
  const unassignedCount = workers.filter(w => !w.assignedProject || w.assignedProject === 'Unassigned').length;

  // Filter & Search Logic
  let filtered = workers.filter(w => {
    const matchSearch = 
      w.name.toLowerCase().includes(search.toLowerCase()) || 
      w.skill.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.includes(search) ||
      w.assignedProject.toLowerCase().includes(search.toLowerCase()) ||
      (w.supervisorName && w.supervisorName.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = categoryFilter === 'All' || w.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || w.status === statusFilter;
    const matchProject = projectFilter === 'All' || w.assignedProject === projectFilter;
    const matchEmployment = employmentFilter === 'All' || w.employmentType === employmentFilter;

    return matchSearch && matchCategory && matchStatus && matchProject && matchEmployment;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'dailyWage') return b.dailyWage - a.dailyWage;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    if (sortBy === 'daysWorked') return b.totalDaysWorked - a.totalDaysWorked;
    return a.name.localeCompare(b.name);
  });

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newWorkerId = (Date.now()).toString();
    const projSlug = formData.assignedProject === 'Unassigned' ? 'GEN' : formData.assignedProject.slice(0, 3).toUpperCase();
    const newWorkerCode = `WRK-${projSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newWorker: EnterpriseWorkerRecord = {
      id: newWorkerId,
      name: formData.name,
      code: newWorkerCode,
      phone: formData.phone || '+91 98220 00000',
      category: formData.category,
      skill: formData.skill || (formData.category === 'Skilled' ? 'Master Structural Artisan' : 'Civil Labour'),
      additionalSkills: formData.additionalSkills ? formData.additionalSkills.split(',').map(s => s.trim()) : [],
      dailyWage: Number(formData.dailyWage) || 800,
      overtimeHourlyRate: Number(formData.overtimeHourlyRate) || 120,
      status: 'Active',
      assignedProject: formData.assignedProject,
      avatar: '/images/worker1.jpg',
      
      dob: formData.dob || '1992-05-15',
      gender: formData.gender,
      address: formData.address || 'Site Labour Colony Camp #2, Pune',
      hometown: formData.hometown || 'Satara, Maharashtra',
      aadhaarNumber: formData.aadhaarNumber ? `XXXX-XXXX-${formData.aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-8910',
      bloodGroup: formData.bloodGroup,
      emergencyContact: formData.emergencyContact || '+91 94220 00000',
      emergencyRelation: formData.emergencyRelation,
      
      joiningDate: '17 Nov 2026',
      experienceYears: Number(formData.experienceYears) || 4,
      employmentType: formData.employmentType,
      supervisorName: formData.supervisorName,
      safetyCertified: formData.safetyCertified,
      inductionDate: formData.inductionDate,
      
      bankName: formData.bankName,
      accountNumberMasked: formData.accountNumber ? `•••• •••• ${formData.accountNumber.slice(-4)}` : '•••• •••• 5521',
      ifscCode: formData.ifscCode,
      paymentMode: formData.paymentMode,
      
      totalDaysWorked: 1,
      presentDaysThisMonth: 1,
      overtimeHoursThisMonth: 0,
      advanceTakenThisMonth: 0,
      
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Aadhaar Card Copy',
          category: 'Aadhaar Card',
          uploadedAt: '17 Nov 2026',
          status: 'Verified',
          url: '#'
        },
        ...(formData.docSafetyCardProvided ? [{
          id: `doc-${Date.now()}-2`,
          name: 'Site EHS Induction Clearance',
          category: 'Safety Induction Certificate' as const,
          uploadedAt: '17 Nov 2026',
          expiryDate: '16 Nov 2027',
          status: 'Verified' as const,
          url: '#'
        }] : [])
      ],
      leaves: [],
      projectHistory: [
        {
          projectId: '1',
          projectName: formData.assignedProject,
          role: formData.roleInProject || formData.skill || 'Site Worker',
          startDate: '17 Nov 2026',
          status: 'Current',
          performanceRating: 5.0
        }
      ],
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          date: 'Today',
          time: '09:00 AM',
          type: 'Site Check-in',
          description: 'Onboarded to Structiva Enterprise OS and registered for biometric muster',
          site: formData.assignedProject
        }
      ]
    };

    const updated = [newWorker, ...workers];
    setWorkers(updated);
    saveWorkers(updated);
    setShowAddModal(false);
    setOnboardingStep(1);

    // Reset Form
    setFormData({
      name: '',
      phone: '',
      dob: '1992-05-15',
      gender: 'Male',
      address: '',
      hometown: '',
      aadhaarNumber: '',
      bloodGroup: 'B+',
      emergencyContact: '',
      emergencyRelation: 'Spouse',
      category: 'Skilled',
      skill: '',
      additionalSkills: '',
      experienceYears: 5,
      employmentType: 'Direct Payroll',
      supervisorName: 'Er. Rajesh Kulkarni',
      safetyCertified: true,
      inductionDate: '2026-11-17',
      assignedProject: 'Skyline Commercial Complex',
      roleInProject: 'Lead Mason & Bar Bender',
      docAadhaarProvided: true,
      docSafetyCardProvided: true,
      docMedicalProvided: false,
      dailyWage: 950,
      overtimeHourlyRate: 140,
      paymentMode: 'Bank Transfer',
      bankName: 'State Bank of India',
      accountNumber: '',
      ifscCode: 'SBIN0001234'
    });
  };

  return (
    <div className={styles.container}>
      {/* Top 6 Master Information KPI Cards */}
      <div className={styles.kpiGrid}>
        <div 
          className={`${styles.kpiCard} ${statusFilter === 'All' ? styles.kpiActive : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Registered</span>
            <div className={`${styles.kpiIconBox} ${styles.iconTeal}`}>
              <Users size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{totalCount}</span>
            <span className={styles.kpiBadge}>Central Registry</span>
          </div>
          <span className={styles.kpiSubtext}>Permanent worker master records</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${statusFilter === 'Active' ? styles.kpiActive : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Service</span>
            <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{activeCount}</span>
            <span className={styles.kpiBadgeEmerald}>Employment Active</span>
          </div>
          <span className={styles.kpiSubtext}>Available for site allocation</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${statusFilter === 'Inactive' ? styles.kpiActive : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Inactive' ? 'All' : 'Inactive')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Inactive / Archived</span>
            <div className={`${styles.kpiIconBox} ${styles.iconDanger}`}>
              <UserMinus size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{inactiveCount}</span>
            <span className={styles.kpiBadgeDanger}>Off-Duty</span>
          </div>
          <span className={styles.kpiSubtext}>Relieved or past workers</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${categoryFilter === 'Skilled' ? styles.kpiActive : ''}`}
          onClick={() => setCategoryFilter(categoryFilter === 'Skilled' ? 'All' : 'Skilled')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Skilled Artisans</span>
            <div className={`${styles.kpiIconBox} ${styles.iconBronze}`}>
              <Award size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{skilledCount}</span>
            <span className={styles.kpiBadgeBronze}>Specialists</span>
          </div>
          <span className={styles.kpiSubtext}>Certified trade masters</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${employmentFilter === 'Direct Payroll' ? styles.kpiActive : ''}`}
          onClick={() => setEmploymentFilter(employmentFilter === 'Direct Payroll' ? 'All' : 'Direct Payroll')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Direct Company Payroll</span>
            <div className={`${styles.kpiIconBox} ${styles.iconTeal}`}>
              <Briefcase size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{directPayrollCount}</span>
            <span className={styles.kpiBadge}>Company Staff</span>
          </div>
          <span className={styles.kpiSubtext}>Direct statutory compliance</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${projectFilter === 'Unassigned' ? styles.kpiActive : ''}`}
          onClick={() => setProjectFilter(projectFilter === 'Unassigned' ? 'All' : 'Unassigned')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Unassigned Pool</span>
            <div className={`${styles.kpiIconBox} ${styles.iconMuted}`}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{unassignedCount}</span>
            <span className={styles.kpiBadgeMuted}>Reserve Pool</span>
          </div>
          <span className={styles.kpiSubtext}>Ready for site deployment</span>
        </div>
      </div>

      {/* Control & Search Toolbar */}
      <div className={styles.topBar}>
        <div className={styles.searchAndFilters}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by worker name, code, trade, mobile or supervisor..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className={styles.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className={styles.filterGroup}>
            <div className={styles.filterItem}>
              <Filter size={14} className={styles.filterIcon} />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Skilled">Skilled</option>
                <option value="Semi-Skilled">Semi-Skilled</option>
                <option value="Unskilled">Unskilled</option>
              </select>
            </div>

            <div className={styles.filterItem}>
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="All">All Projects</option>
                <option value="Unassigned">Unassigned (Pool)</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterItem}>
              <select value={employmentFilter} onChange={(e) => setEmploymentFilter(e.target.value)}>
                <option value="All">All Employment Types</option>
                <option value="Direct Payroll">Direct Payroll</option>
                <option value="Subcontractor Crew">Subcontractor Crew</option>
                <option value="Daily Muster">Daily Muster</option>
              </select>
            </div>

            <div className={styles.filterItem}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by: Name (A-Z)</option>
                <option value="dailyWage">Sort by: Daily Wage (High to Low)</option>
                <option value="experience">Sort by: Site Experience</option>
                <option value="daysWorked">Sort by: Total Days Logged</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Toggle & Onboard Button */}
        <div className={styles.actionButtons}>
          <div className={styles.viewToggleGroup}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => {
                if (availableProjects.length > 0) {
                  const defaultProj = projectFilter !== 'All' ? projectFilter : availableProjects[0].name;
                  handleDeployProjectChange(defaultProj);
                }
                setShowQuickDeployModal(true);
              }} 
              className={styles.btnSecondary}
              style={{
                background: '#167C72',
                color: '#FFFFFF',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              title="Quickly assign multiple workers to a project and supervisor"
            >
              <Briefcase size={15} />
              <span>Project Worker Allocation</span>
            </button>

            <button onClick={() => setShowAddModal(true)} className={styles.btnAddWorker}>
              <Plus size={16} />
              <span>+ Register New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        <div className={styles.workerGrid}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={44} className={styles.emptyIcon} />
              <h3>No worker master records found</h3>
              <p>Try adjusting your search criteria or filter tags.</p>
              <button 
                onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); setProjectFilter('All'); setEmploymentFilter('All'); }} 
                className={styles.resetBtn}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filtered.map(w => (
              <div 
                key={w.id} 
                className={styles.card}
                onClick={() => router.push(`/admin/workforce/${w.id}`)}
                role="button"
                tabIndex={0}
              >
                {/* Header with Avatar & Employment Status */}
                <div className={styles.profileHeader}>
                  <div className={styles.avatarWrapper}>
                    <SafeImage 
                      src={w.avatar} 
                      alt={w.name} 
                      fallbackType="worker" 
                      className={styles.avatar} 
                    />
                    <span className={`${styles.statusDot} ${styles[w.status.toLowerCase()]}`} />
                  </div>

                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <h4 className={styles.name}>{w.name}</h4>
                      <span className={`${styles.categoryBadge} ${styles[w.category.toLowerCase().replace('-', '')]}`}>
                        {w.category}
                      </span>
                    </div>

                    <div className={styles.codeRow}>
                      <span className={styles.workerCode}>{w.code}</span>
                      <span className={`${styles.employmentBadge} ${styles[w.status.toLowerCase()]}`}>
                        ● {w.status}
                      </span>
                    </div>
                    <span className={styles.tradeSkill}>{w.skill}</span>
                  </div>
                </div>

                {/* Permanent Project Assignment & Supervisor */}
                <div className={styles.siteAllocationRow}>
                  <MapPin size={13} className={styles.siteIcon} />
                  <span className={styles.siteName}>
                    {w.assignedProject || 'Unassigned (Reserve Pool)'}
                  </span>
                </div>

                {/* Key Master Metrics Grid */}
                <div className={styles.cardMetrics}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Standard Wage</span>
                    <strong className={styles.metricValue}>₹ {w.dailyWage}/d</strong>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Experience</span>
                    <strong className={styles.metricValue}>{w.experienceYears} Years</strong>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Engagement</span>
                    <strong className={styles.metricValueSmall}>{w.employmentType || 'Direct'}</strong>
                  </div>
                </div>

                {/* Footer with Contact, Edit & Link */}
                <div className={styles.cardFooter}>
                  <div className={styles.phoneChip}>
                    <Phone size={11} />
                    <span>{w.phone}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={(e) => openEditWorkerModal(w, e)} 
                      className={styles.editActionBtn}
                      title="Edit Worker Details"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeletingWorkerId(w.id); }} 
                      className={styles.deleteActionBtn}
                      title="Remove Worker"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className={styles.viewProfileBtn}>
                      <span>Profile</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View Mode with Desktop Full Table & Android Responsive Card Fallback */
        <>
          <div className={`${styles.tablePanel} ${styles.desktopOnlyTable}`}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Worker & ID</th>
                  <th>Category & Trade</th>
                  <th>Current Project Assignment</th>
                  <th>Supervisor</th>
                  <th>Standard Wage</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id} onClick={() => router.push(`/admin/workforce/${w.id}`)} className={styles.tableRowClickable}>
                    <td>
                      <div className={styles.tableWorkerInfo}>
                        <SafeImage src={w.avatar} alt={w.name} fallbackType="worker" className={styles.tableAvatar} />
                        <div>
                          <strong className={styles.tableWorkerName}>{w.name}</strong>
                          <span className={styles.tableWorkerCode}>{w.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableTradeInfo}>
                        <span className={`${styles.categoryBadge} ${styles[w.category.toLowerCase().replace('-', '')]}`}>
                          {w.category}
                        </span>
                        <span className={styles.tableSkillName}>{w.skill}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.tableProjectTag}>
                        {w.assignedProject || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.supervisorNameText}>{w.supervisorName || 'Er. Rajesh Kulkarni'}</span>
                    </td>
                    <td>
                      <strong>₹ {w.dailyWage}</strong>
                      <span className={styles.subTextMuted}>/ day</span>
                    </td>
                    <td>{w.experienceYears} Years</td>
                    <td>
                      <span className={`${styles.employmentBadge} ${styles[w.status.toLowerCase()]}`}>
                        ● {w.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={(e) => openEditWorkerModal(w, e)} 
                          className={styles.editActionBtn}
                          title="Edit Worker Details"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingWorkerId(w.id); }} 
                          className={styles.deleteActionBtn}
                          title="Remove Worker"
                        >
                          <Trash2 size={13} />
                        </button>
                        <Link href={`/admin/workforce/${w.id}`} className={styles.tableActionLink} onClick={e => e.stopPropagation()}>
                          Profile
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Android Mobile Table Mode -> Compact List Cards */}
          <div className={styles.mobileWorkerList}>
            {filtered.map(w => (
              <div 
                key={w.id}
                className={styles.mobileWorkerCard}
                onClick={() => router.push(`/admin/workforce/${w.id}`)}
              >
                <div className={styles.mobileWorkerHeader}>
                  <div className={styles.mobileWorkerIdentity}>
                    <SafeImage src={w.avatar} alt={w.name} fallbackType="worker" className={styles.mobileWorkerThumb} />
                    <div>
                      <strong className={styles.mobileWorkerName}>{w.name}</strong>
                      <span className={styles.mobileWorkerCode}>{w.code} • {w.skill}</span>
                    </div>
                  </div>
                  <span className={`${styles.employmentBadge} ${styles[w.status.toLowerCase()]}`}>
                    ● {w.status}
                  </span>
                </div>
                <div className={styles.mobileWorkerMeta}>
                  <span>Site: <strong>{w.assignedProject || 'Reserve'}</strong></span>
                  <span>Wage: <strong>₹ {w.dailyWage}/d</strong></span>
                </div>
                <div className={styles.mobileWorkerFooter}>
                  <span>Supervisor: {w.supervisorName || 'Er. Rajesh K.'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={(e) => openEditWorkerModal(w, e)} 
                      className={styles.editActionBtn}
                      title="Edit Worker"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeletingWorkerId(w.id); }} 
                      className={styles.deleteActionBtn}
                      title="Remove Worker"
                    >
                      <Trash2 size={12} />
                    </button>
                    <Link href={`/admin/workforce/${w.id}`} className={styles.tableActionLink} onClick={e => e.stopPropagation()}>
                      Profile <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 5-Section Enterprise Onboarding Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.onboardingModalBox} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <div className={styles.modalHeaderIcon}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3>Worker Onboarding & Central Registration</h3>
                  <p>Enterprise construction worker lifecycle registration</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className={styles.stepperTabs}>
              <button 
                type="button" 
                className={`${styles.stepTab} ${onboardingStep === 1 ? styles.stepTabActive : ''}`}
                onClick={() => setOnboardingStep(1)}
              >
                <span className={styles.stepNum}>1</span>
                <span>Personal</span>
              </button>
              <button 
                type="button" 
                className={`${styles.stepTab} ${onboardingStep === 2 ? styles.stepTabActive : ''}`}
                onClick={() => setOnboardingStep(2)}
              >
                <span className={styles.stepNum}>2</span>
                <span>Professional</span>
              </button>
              <button 
                type="button" 
                className={`${styles.stepTab} ${onboardingStep === 3 ? styles.stepTabActive : ''}`}
                onClick={() => setOnboardingStep(3)}
              >
                <span className={styles.stepNum}>3</span>
                <span>Site Allocation</span>
              </button>
              <button 
                type="button" 
                className={`${styles.stepTab} ${onboardingStep === 4 ? styles.stepTabActive : ''}`}
                onClick={() => setOnboardingStep(4)}
              >
                <span className={styles.stepNum}>4</span>
                <span>Documents</span>
              </button>
              <button 
                type="button" 
                className={`${styles.stepTab} ${onboardingStep === 5 ? styles.stepTabActive : ''}`}
                onClick={() => setOnboardingStep(5)}
              >
                <span className={styles.stepNum}>5</span>
                <span>Salary & Bank</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateWorker} className={styles.onboardingForm}>
              {/* Step 1: Personal Details */}
              {onboardingStep === 1 && (
                <div className={styles.stepSection}>
                  <h4 className={styles.sectionTitle}>Section 1: Personal Details & Identity</h4>
                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label>Full Legal Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Shankar Patil"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Mobile Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98220 12345"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow3}>
                    <div className={styles.formGroup}>
                      <label>Date of Birth</label>
                      <input 
                        type="date" 
                        value={formData.dob} 
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Gender</label>
                      <select 
                        value={formData.gender} 
                        onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Blood Group</label>
                      <select 
                        value={formData.bloodGroup} 
                        onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label>Aadhaar / ID Number</label>
                      <input 
                        type="text" 
                        value={formData.aadhaarNumber} 
                        onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        placeholder="12-digit Aadhaar number"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Native Hometown & State</label>
                      <input 
                        type="text" 
                        value={formData.hometown} 
                        onChange={e => setFormData({ ...formData, hometown: e.target.value })}
                        placeholder="e.g. Satara, Maharashtra"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Current Residential Address / Camp Details</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Room 14, Kharadi Labour Colony, Pune"
                    />
                  </div>

                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label>Emergency Contact Phone</label>
                      <input 
                        type="tel" 
                        value={formData.emergencyContact} 
                        onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="+91 94220 88771"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Emergency Contact Relationship</label>
                      <input 
                        type="text" 
                        value={formData.emergencyRelation} 
                        onChange={e => setFormData({ ...formData, emergencyRelation: e.target.value })}
                        placeholder="e.g. Sunita Patil (Wife)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Details */}
              {onboardingStep === 2 && (
                <div className={styles.stepSection}>
                  <h4 className={styles.sectionTitle}>Section 2: Professional Skills & Safety Compliance</h4>
                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label>Labour Classification *</label>
                      <select 
                        value={formData.category} 
                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                      >
                        <option value="Skilled">Skilled Artisan</option>
                        <option value="Semi-Skilled">Semi-Skilled Crew</option>
                        <option value="Unskilled">Unskilled Civil Labour</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Primary Trade / Specialization *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.skill} 
                        onChange={e => setFormData({ ...formData, skill: e.target.value })}
                        placeholder="e.g. Master Bar Bender & Structural Mason"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Additional Skills (comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.additionalSkills} 
                      onChange={e => setFormData({ ...formData, additionalSkills: e.target.value })}
                      placeholder="e.g. Rebar Tying, Shuttering, Aluform, Scaffolding"
                    />
                  </div>

                  <div className={styles.formRow3}>
                    <div className={styles.formGroup}>
                      <label>Years of Site Experience</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="40" 
                        value={formData.experienceYears} 
                        onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Employment Engagement</label>
                      <select 
                        value={formData.employmentType} 
                        onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                      >
                        <option value="Direct Payroll">Direct Payroll</option>
                        <option value="Subcontractor Crew">Subcontractor Crew</option>
                        <option value="Daily Muster">Daily Muster</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Reporting Supervisor</label>
                      <select 
                        value={formData.supervisorName} 
                        onChange={e => setFormData({ ...formData, supervisorName: e.target.value })}
                      >
                        <option value="">Select Supervisor</option>
                        {supervisors.map(s => (
                          <option key={s.id} value={s.name}>{s.name} ({s.supervisorId})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={formData.safetyCertified} 
                        onChange={e => setFormData({ ...formData, safetyCertified: e.target.checked })}
                      />
                      <span>Safety Induction Completed (EHS Certified with PPE kit issued)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Project Allocation */}
              {onboardingStep === 3 && (
                <div className={styles.stepSection}>
                  <h4 className={styles.sectionTitle}>Section 3: Project Site Assignment</h4>
                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label>Assign to Construction Project</label>
                      <select 
                        value={formData.assignedProject} 
                        onChange={e => setFormData({ ...formData, assignedProject: e.target.value })}
                      >
                        <option value="Unassigned">Unassigned (Reserve Labour Pool)</option>
                        {availableProjects.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Designated Site Role</label>
                      <input 
                        type="text" 
                        value={formData.roleInProject} 
                        onChange={e => setFormData({ ...formData, roleInProject: e.target.value })}
                        placeholder="e.g. Lead Bar Bender Pier P-12"
                      />
                    </div>
                  </div>
                  <div className={styles.infoCallout}>
                    <AlertCircle size={18} className={styles.infoIcon} />
                    <div>
                      <strong>Automated Site Allocation</strong>
                      <p>Once assigned to a project, the worker appears on the site supervisor's roster and biometric terminal for daily shift muster.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {onboardingStep === 4 && (
                <div className={styles.stepSection}>
                  <h4 className={styles.sectionTitle}>Section 4: Verification & Compliance Documents</h4>
                  <div className={styles.docCheckList}>
                    <label className={styles.docItem}>
                      <input 
                        type="checkbox" 
                        checked={formData.docAadhaarProvided} 
                        onChange={e => setFormData({ ...formData, docAadhaarProvided: e.target.checked })}
                      />
                      <div>
                        <strong>Government Identity Proof (Aadhaar / Voter ID)</strong>
                        <span>Mandatory for statutory compliance and insurance enrollment</span>
                      </div>
                    </label>

                    <label className={styles.docItem}>
                      <input 
                        type="checkbox" 
                        checked={formData.docSafetyCardProvided} 
                        onChange={e => setFormData({ ...formData, docSafetyCardProvided: e.target.checked })}
                      />
                      <div>
                        <strong>Safety Induction Training Certificate</strong>
                        <span>Issued by Site EHS Officer upon helmet, boots, and harness training</span>
                      </div>
                    </label>

                    <label className={styles.docItem}>
                      <input 
                        type="checkbox" 
                        checked={formData.docMedicalProvided} 
                        onChange={e => setFormData({ ...formData, docMedicalProvided: e.target.checked })}
                      />
                      <div>
                        <strong>Annual Medical Fitness Certificate</strong>
                        <span>Vision, blood pressure, and heights clearance report</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 5: Salary & Bank */}
              {onboardingStep === 5 && (
                <div className={styles.stepSection}>
                  <h4 className={styles.sectionTitle}>Section 5: Daily Wage, Overtime & Bank Details</h4>
                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label>Daily Standard Wage (₹ / Day) *</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.dailyWage} 
                        onChange={e => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                        placeholder="950"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Overtime Hourly Rate (₹ / Hour)</label>
                      <input 
                        type="number" 
                        value={formData.overtimeHourlyRate} 
                        onChange={e => setFormData({ ...formData, overtimeHourlyRate: Number(e.target.value) })}
                        placeholder="140"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow3}>
                    <div className={styles.formGroup}>
                      <label>Disbursement Mode</label>
                      <select 
                        value={formData.paymentMode} 
                        onChange={e => setFormData({ ...formData, paymentMode: e.target.value as any })}
                      >
                        <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                        <option value="Direct Cash Voucher">Direct Cash Voucher</option>
                        <option value="UPI">UPI Digital Payment</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Bank Name</label>
                      <input 
                        type="text" 
                        value={formData.bankName} 
                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="State Bank of India"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>IFSC Code</label>
                      <input 
                        type="text" 
                        value={formData.ifscCode} 
                        onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Bank Account Number</label>
                    <input 
                      type="password" 
                      value={formData.accountNumber} 
                      onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Account number for direct salary credit"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className={styles.modalFooter}>
                <div className={styles.footerNavLeft}>
                  {onboardingStep > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setOnboardingStep(onboardingStep - 1)} 
                      className={styles.btnSecondary}
                    >
                      Back to Step {onboardingStep - 1}
                    </button>
                  )}
                </div>

                <div className={styles.footerNavRight}>
                  {onboardingStep < 5 ? (
                    <button 
                      type="button" 
                      onClick={() => setOnboardingStep(onboardingStep + 1)} 
                      className={styles.btnPrimary}
                    >
                      <span>Continue</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button type="submit" className={styles.btnSuccess}>
                      <CheckCircle size={16} />
                      <span>Complete Onboarding & Register Worker</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className={styles.modalBackdrop} onClick={() => setEditingWorker(null)}>
          <div className={styles.onboardingModalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <div className={styles.modalHeaderIcon}>
                  <Edit size={20} />
                </div>
                <div>
                  <h3>Edit Worker Record ({editingWorker.code})</h3>
                  <p>Update deployment, trade skill, wage and reporting supervisor</p>
                </div>
              </div>
              <button onClick={() => setEditingWorker(null)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateWorker} className={styles.onboardingForm} style={{ padding: '1.25rem' }}>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Full Legal Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={editFormData.name} 
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mobile Contact *</label>
                  <input 
                    type="tel" 
                    required 
                    value={editFormData.phone} 
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select 
                    value={editFormData.category} 
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value as any })}
                  >
                    <option value="Skilled">Skilled</option>
                    <option value="Semi-Skilled">Semi-Skilled</option>
                    <option value="Unskilled">Unskilled</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Primary Skill / Trade *</label>
                  <input 
                    type="text" 
                    required 
                    value={editFormData.skill} 
                    onChange={e => setEditFormData({ ...editFormData, skill: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Assigned Project *</label>
                  <select 
                    value={editFormData.assignedProject} 
                    onChange={e => setEditFormData({ ...editFormData, assignedProject: e.target.value })}
                  >
                    <option value="Unassigned">Unassigned (Reserve Pool)</option>
                    {availableProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Designated Site Supervisor *</label>
                  <select 
                    value={editFormData.supervisorName} 
                    onChange={e => setEditFormData({ ...editFormData, supervisorName: e.target.value })}
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.supervisorId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow3}>
                <div className={styles.formGroup}>
                  <label>Daily Wage (₹ / Day) *</label>
                  <input 
                    type="number" 
                    required 
                    value={editFormData.dailyWage} 
                    onChange={e => setEditFormData({ ...editFormData, dailyWage: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Overtime Rate (₹ / Hr)</label>
                  <input 
                    type="number" 
                    value={editFormData.overtimeHourlyRate} 
                    onChange={e => setEditFormData({ ...editFormData, overtimeHourlyRate: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Experience (Years)</label>
                  <input 
                    type="number" 
                    value={editFormData.experienceYears} 
                    onChange={e => setEditFormData({ ...editFormData, experienceYears: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Employment Type</label>
                  <select 
                    value={editFormData.employmentType} 
                    onChange={e => setEditFormData({ ...editFormData, employmentType: e.target.value as any })}
                  >
                    <option value="Direct Payroll">Direct Payroll</option>
                    <option value="Subcontractor Crew">Subcontractor Crew</option>
                    <option value="Daily Muster">Daily Muster</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Employment Status</label>
                  <select 
                    value={editFormData.status} 
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter} style={{ marginTop: '1.25rem', padding: '1rem 0 0 0' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingWorker(null)} 
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnSuccess}>
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Project Worker Allocation Dropdown Modal */}
      {showQuickDeployModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowQuickDeployModal(false)}>
          <div className={styles.onboardingModalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', padding: '1.5rem' }}>
            <div className={styles.modalHeader} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#E6F4F2', color: '#167C72', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>Project Worker & Supervisor Allocation</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Quickly assign multiple workers to a specific project and supervisor</p>
                </div>
              </div>
              <button onClick={() => setShowQuickDeployModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteQuickDeploy}>
              {/* Step 1: Select Project Dropdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className={styles.formGroup}>
                  <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', marginBottom: '4px' }}>
                    1. Select Construction Project *
                  </label>
                  <select 
                    value={selectedDeployProject} 
                    onChange={e => handleDeployProjectChange(e.target.value)}
                    required
                    style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Choose Target Project --</option>
                    {availableProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Select Supervisor Dropdown */}
                <div className={styles.formGroup}>
                  <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', marginBottom: '4px' }}>
                    2. Designated Site Supervisor
                  </label>
                  <select 
                    value={selectedDeploySupervisor} 
                    onChange={e => setSelectedDeploySupervisor(e.target.value)}
                    style={{ padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Choose Supervisor --</option>
                    {supervisors.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.supervisorId})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Select Workers Multi-list */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155' }}>
                    3. Select Workers to Assign ({selectedWorkerIdsToDeploy.length} Selected) *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setSelectedWorkerIdsToDeploy(workers.map(w => w.id))}
                      style={{ background: 'none', border: 'none', color: '#167C72', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Select All
                    </button>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedWorkerIdsToDeploy([])}
                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px', background: '#F8FAFC' }}>
                  {workers.map(w => {
                    const isSelected = selectedWorkerIdsToDeploy.includes(w.id);
                    return (
                      <div 
                        key={w.id} 
                        onClick={() => toggleWorkerSelectionForDeploy(w.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isSelected ? '#E6F4F2' : '#FFFFFF',
                          border: isSelected ? '1px solid #167C72' : '1px solid #F1F5F9',
                          marginBottom: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => {}} // handled by row click
                            style={{ cursor: 'pointer' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>{w.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{w.code} • {w.skill}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                          <span style={{ 
                            background: w.assignedProject === selectedDeployProject ? '#D1FAE5' : '#F1F5F9',
                            color: w.assignedProject === selectedDeployProject ? '#065F46' : '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            {w.assignedProject || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button 
                  type="button" 
                  onClick={() => setShowQuickDeployModal(false)} 
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedDeployProject || selectedWorkerIdsToDeploy.length === 0}
                  className={styles.btnSuccess}
                  style={{ opacity: (!selectedDeployProject || selectedWorkerIdsToDeploy.length === 0) ? 0.6 : 1 }}
                >
                  <CheckCircle size={15} />
                  <span>Assign {selectedWorkerIdsToDeploy.length} Workers to Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWorkerId && (
        <div className={styles.modalBackdrop} onClick={() => setDeletingWorkerId(null)}>
          <div className={styles.onboardingModalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '0.75rem' }}>
              <Trash2 size={22} />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Remove Worker</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Are you sure you want to remove this worker from the active enterprise workforce register?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setDeletingWorkerId(null)} 
                className={styles.btnSecondary}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handleDeleteWorker(deletingWorkerId)} 
                style={{
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
