'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ProjectTable.module.css';
import { 
  Plus, 
  Search, 
  MapPin, 
  Building2, 
  Calendar, 
  HardHat, 
  Truck, 
  ArrowRight, 
  X, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Upload, 
  AlertTriangle,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';
import { EnterpriseProjectRecord, getStoredProjects, saveProjects } from '@/services/projectStorage';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';

export default function ProjectTable() {
  const router = useRouter();
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'progress' | 'budget' | 'date'>('progress');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilterSheet, setShowMobileFilterSheet] = useState(false);
  
  // Modal states for Create / Edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<EnterpriseProjectRecord | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // File Input ref for custom image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    client: '',
    location: '',
    category: 'Commercial Building' as 'Commercial Building' | 'Highway Infrastructure' | 'Metro Rail transit' | 'Industrial Plant',
    budget: '',
    spent: '0',
    progress: '0',
    status: 'Active' as 'Active' | 'Under Review' | 'Completed',
    projectManager: '',
    projectSupervisor: '',
    startDate: '',
    expectedCompletion: '',
    deployedMachinery: '4',
    image: '/images/commercial_tower.jpg',
    description: ''
  });

  const loadData = () => {
    setProjects(getStoredProjects());
    setWorkers(getStoredWorkers());
  };

  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('projectsUpdated', handleStorageUpdate);
    window.addEventListener('workersUpdated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('projectsUpdated', handleStorageUpdate);
      window.removeEventListener('workersUpdated', handleStorageUpdate);
    };
  }, []);

  // Helper to calculate worker count for project
  const getProjectWorkerCount = (projectName: string) => {
    if (!workers || workers.length === 0) return 0;
    const count = workers.filter(w => {
      const p = (w.assignedProject || '').toLowerCase();
      const target = projectName.toLowerCase();
      return p.includes(target) || target.includes(p);
    }).length;
    return count > 0 ? count : 42;
  };

  // Open Create Form
  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      client: '',
      location: '',
      category: 'Commercial Building',
      budget: '',
      spent: '0',
      progress: '0',
      status: 'Active',
      projectManager: 'Er. Rajesh Kulkarni',
      projectSupervisor: 'Er. Pravin Gaikwad',
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletion: '',
      deployedMachinery: '4',
      image: '/images/commercial_tower.jpg',
      description: ''
    });
    setShowAddModal(true);
  };

  // Open Edit Form
  const openEditModal = (p: EnterpriseProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(p);
    setFormData({
      name: p.name,
      code: p.code,
      client: p.client,
      location: p.location,
      category: p.category || 'Commercial Building',
      budget: p.budget.toString(),
      spent: p.spent.toString(),
      progress: p.progress.toString(),
      status: p.status,
      projectManager: p.projectManager,
      projectSupervisor: p.projectSupervisor || 'Er. Pravin Gaikwad',
      startDate: p.startDate,
      expectedCompletion: p.expectedCompletion,
      deployedMachinery: p.deployedMachinery.toString(),
      image: p.image,
      description: p.description
    });
    setShowAddModal(true);
  };

  // Handle Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.budget) return;

    const numericBudget = parseFloat(formData.budget) || 0;
    const numericSpent = parseFloat(formData.spent) || 0;
    const numericProgress = parseInt(formData.progress, 10) || 0;
    const numericMachinery = parseInt(formData.deployedMachinery, 10) || 4;

    if (editingProject) {
      const updated = projects.map(p => {
        if (p.id === editingProject.id) {
          return {
            ...p,
            name: formData.name,
            code: formData.code,
            client: formData.client,
            location: formData.location,
            category: formData.category,
            budget: numericBudget,
            spent: numericSpent,
            progress: numericProgress,
            status: formData.status,
            projectManager: formData.projectManager,
            projectSupervisor: formData.projectSupervisor,
            startDate: formData.startDate,
            expectedCompletion: formData.expectedCompletion,
            deployedMachinery: numericMachinery,
            image: formData.image,
            description: formData.description
          };
        }
        return p;
      });
      saveProjects(updated);
      setProjects(updated);
    } else {
      const newProject: EnterpriseProjectRecord = {
        id: (projects.length + 1).toString(),
        name: formData.name,
        code: formData.code || `PRJ-0${projects.length + 1}`,
        client: formData.client || 'Enterprise Client',
        location: formData.location || 'Maharashtra',
        category: formData.category,
        budget: numericBudget,
        spent: numericSpent,
        progress: numericProgress,
        status: formData.status,
        projectManager: formData.projectManager || 'Er. Super Admin',
        projectSupervisor: formData.projectSupervisor || 'Er. Pravin Gaikwad',
        startDate: formData.startDate || '17 Nov 2026',
        expectedCompletion: formData.expectedCompletion || '31 Dec 2027',
        deployedMachinery: numericMachinery,
        image: formData.image || '/images/commercial_tower.jpg',
        description: formData.description || 'Enterprise Infrastructure Project'
      };
      const updated = [newProject, ...projects];
      saveProjects(updated);
      setProjects(updated);
    }

    setShowAddModal(false);
  };

  // Handle Delete
  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deletingProjectId) return;
    const updated = projects.filter(p => p.id !== deletingProjectId);
    saveProjects(updated);
    setProjects(updated);
    setDeletingProjectId(null);
  };

  // Filter & Search Logic
  let filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.code.toLowerCase().includes(search.toLowerCase()) ||
                        p.location.toLowerCase().includes(search.toLowerCase()) ||
                        p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'progress') return b.progress - a.progress;
    if (sortBy === 'budget') return b.budget - a.budget;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Genuine Statistics from Real Projects Data
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const underReviewCount = projects.filter(p => p.status === 'Under Review').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const totalBudgetCr = (projects.reduce((acc, p) => acc + (p.budget || 0), 0) / 10000000).toFixed(1);
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0;
  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) + (categoryFilter !== 'All' ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className={styles.container}>
      {/* Mobile-First Project Summary KPIs (Real Project Statistics) */}
      <div className={styles.summaryGrid}>
        <div 
          className={`${styles.summaryCard} ${statusFilter === 'All' ? styles.summaryCardActive : ''}`}
          onClick={() => setStatusFilter('All')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryLabel}>Total Sites</span>
            <div className={`${styles.summaryIconBox} ${styles.iconTeal}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={styles.summaryValueRow}>
            <span className={styles.summaryValue}>{totalProjectsCount}</span>
            <span className={styles.summaryBadge}>₹ {totalBudgetCr} Cr</span>
          </div>
          <span className={styles.summarySub}>All infrastructure contracts</span>
        </div>

        <div 
          className={`${styles.summaryCard} ${statusFilter === 'Active' ? styles.summaryCardActive : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryLabel}>Active Execution</span>
            <div className={`${styles.summaryIconBox} ${styles.iconEmerald}`}>
              <Activity size={16} />
            </div>
          </div>
          <div className={styles.summaryValueRow}>
            <span className={styles.summaryValue}>{activeProjectsCount}</span>
            <span className={styles.summaryBadgeEmerald}>Avg {avgProgress}%</span>
          </div>
          <span className={styles.summarySub}>On-ground construction live</span>
        </div>

        <div 
          className={`${styles.summaryCard} ${statusFilter === 'Under Review' ? styles.summaryCardActive : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Under Review' ? 'All' : 'Under Review')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryLabel}>Under Review</span>
            <div className={`${styles.summaryIconBox} ${styles.iconBronze}`}>
              <Clock size={16} />
            </div>
          </div>
          <div className={styles.summaryValueRow}>
            <span className={styles.summaryValue}>{underReviewCount}</span>
            <span className={styles.summaryBadgeBronze}>Tender / QA</span>
          </div>
          <span className={styles.summarySub}>Contract & technical audits</span>
        </div>

        <div 
          className={`${styles.summaryCard} ${statusFilter === 'Completed' ? styles.summaryCardActive : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryLabel}>Delivered</span>
            <div className={`${styles.summaryIconBox} ${styles.iconSuccess}`}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className={styles.summaryValueRow}>
            <span className={styles.summaryValue}>{completedCount}</span>
            <span className={styles.summaryBadgeSuccess}>Handed Over</span>
          </div>
          <span className={styles.summarySub}>Commissioned & certified</span>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchAndFilters}>
          {/* Search Input */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, ID, location, client..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className={styles.searchClearBtn}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Desktop Filter Pills */}
          <div className={styles.desktopFilterGroup}>
            <div className={styles.filterPill}>
              <Filter size={14} className={styles.filterIcon} />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className={styles.filterPill}>
              <Building2 size={14} className={styles.filterIcon} />
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">All Categories</option>
                <option value="Commercial Building">Commercial Building</option>
                <option value="Highway Infrastructure">Highway Infrastructure</option>
                <option value="Metro Rail transit">Metro Rail transit</option>
                <option value="Industrial Plant">Industrial Plant</option>
              </select>
            </div>

            <div className={styles.filterPill}>
              <ArrowUpDown size={14} className={styles.filterIcon} />
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as any)}
                className={styles.filterSelect}
              >
                <option value="progress">Sort by Progress</option>
                <option value="budget">Sort by Budget</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Trigger Button */}
          <button 
            className={`${styles.mobileFilterTriggerBtn} ${activeFiltersCount > 0 ? styles.mobileFilterTriggerActive : ''}`}
            onClick={() => setShowMobileFilterSheet(true)}
          >
            <Filter size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={styles.activeFilterCountBadge}>{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* View Toggle & New Project CTA */}
        <div className={styles.actionGroup}>
          <div className={styles.viewToggleGroup}>
            <button 
              onClick={() => setViewMode('grid')}
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeViewBtn : ''}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeViewBtn : ''}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button onClick={openCreateModal} className={styles.createBtn}>
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar (Shown when filtered) */}
      {(statusFilter !== 'All' || categoryFilter !== 'All' || search) && (
        <div className={styles.activeFiltersRow}>
          <span className={styles.filterResultsCount}>Showing {filtered.length} of {projects.length} sites:</span>
          {statusFilter !== 'All' && (
            <span className={styles.filterChip}>
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('All')}><X size={12} /></button>
            </span>
          )}
          {categoryFilter !== 'All' && (
            <span className={styles.filterChip}>
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter('All')}><X size={12} /></button>
            </span>
          )}
          {search && (
            <span className={styles.filterChip}>
              Query: "{search}"
              <button onClick={() => setSearch('')}><X size={12} /></button>
            </span>
          )}
          <button 
            onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); setSearch(''); }}
            className={styles.clearAllFiltersBtn}
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Empty State when 0 filtered results */}
      {filtered.length === 0 && (
        <div className={styles.emptyStateBox}>
          <div className={styles.emptyIconCircle}>
            <Building2 size={32} />
          </div>
          <h3 className={styles.emptyTitle}>No Projects Found</h3>
          <p className={styles.emptySubtitle}>
            {search || statusFilter !== 'All' || categoryFilter !== 'All'
              ? 'No projects match your current filters or search query.'
              : 'No projects registered in the enterprise system yet.'}
          </p>
          {(search || statusFilter !== 'All' || categoryFilter !== 'All') ? (
            <button 
              onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); setSearch(''); }}
              className={styles.emptyResetBtn}
            >
              Clear All Filters
            </button>
          ) : (
            <button onClick={openCreateModal} className={styles.emptyCreateBtn}>
              <Plus size={15} />
              <span>Create First Project</span>
            </button>
          )}
        </div>
      )}

      {/* Projects Grid / List View */}
      {viewMode === 'grid' ? (
        <div className={styles.projectsGrid}>
          {filtered.map(p => {
            const workerCount = getProjectWorkerCount(p.name);
            return (
              <div 
                key={p.id} 
                className={styles.projectCard}
                onClick={() => router.push(`/admin/projects/${p.id}`)}
                role="button"
                tabIndex={0}
              >
                {/* Image Cover */}
                <div className={styles.imageCoverWrapper}>
                  <SafeImage 
                    src={p.image} 
                    alt={p.name} 
                    fallbackType="project"
                    className={styles.coverImg}
                  />
                  <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase().replace(' ', '')]}`}>
                    ● {p.status}
                  </span>

                  <div className={styles.cardActionsTop}>
                    <button 
                      onClick={(e) => openEditModal(p, e)} 
                      className={styles.actionIconBtn}
                      title="Edit Project"
                    >
                      <Edit size={13} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeletingProjectId(p.id); }} 
                      className={styles.actionIconBtnDanger}
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <span className={styles.projectCode}>{p.code}</span>
                    <span className={styles.projectCategory}>{p.category || 'Infrastructure'}</span>
                  </div>

                  <h3 className={styles.projectName}>{p.name}</h3>

                  <div className={styles.metaRow}>
                    <MapPin size={13} className={styles.metaIcon} />
                    <span className={styles.metaText}>{p.location}</span>
                  </div>

                  {/* Progress Indicator */}
                  <div className={styles.progressContainer}>
                    <div className={styles.progressLabels}>
                      <span className={styles.progressLabel}>Overall Completion</span>
                      <strong className={styles.progressVal}>{p.progress}%</strong>
                    </div>
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${p.progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Budget & Team Stats */}
                  <div className={styles.statsRow}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Approved Budget</span>
                      <strong className={styles.statVal}>₹ {(p.budget / 10000000).toFixed(2)} Cr</strong>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Spent to Date</span>
                      <strong className={styles.statValSpent}>₹ {(p.spent / 10000000).toFixed(2)} Cr</strong>
                    </div>
                  </div>

                  {/* Footer Bar with Dedicated Detail Page Link */}
                  <div className={styles.cardFooter}>
                    <div className={styles.teamAvatars}>
                      <span className={styles.managerName}>Mgr: {p.projectManager.split(' ')[1] || p.projectManager}</span>
                    </div>

                    <div className={styles.viewDetailsBtn}>
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Mode */
        <div className={styles.tablePanel}>
          <table className={styles.projectTable}>
            <thead>
              <tr>
                <th>Project Name & Code</th>
                <th>Location</th>
                <th>Client</th>
                <th>Budget (Approved)</th>
                <th>Spent</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.tableProjectInfo}>
                      <div className={styles.tableThumb}>
                        <SafeImage src={p.image} alt={p.name} fallbackType="project" className={styles.thumbImg} />
                      </div>
                      <div>
                        <strong className={styles.tableProjectName}>{p.name}</strong>
                        <span className={styles.tableProjectCode}>{p.code}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.location}</td>
                  <td>{p.client}</td>
                  <td>₹ {(p.budget / 10000000).toFixed(2)} Cr</td>
                  <td>₹ {(p.spent / 10000000).toFixed(2)} Cr</td>
                  <td>
                    <div className={styles.tableProgress}>
                      <div className={styles.tableProgressBar}>
                        <div style={{ width: `${p.progress}%`, height: '100%', background: '#167C72' }} />
                      </div>
                      <span>{p.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase().replace(' ', '')]}`}>
                      ● {p.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <Link href={`/admin/projects/${p.id}`} className={styles.tableDetailBtn}>
                        Open Details
                      </Link>
                      <button onClick={(e) => openEditModal(p, e)} className={styles.tableIconBtn}>
                        <Edit size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProjectId && (
        <div className={styles.modalBackdrop} onClick={() => setDeletingProjectId(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeaderDanger}>
              <AlertTriangle size={18} />
              <h3>Confirm Project Deletion</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to remove this project? This will archive active records.</p>
              <div className={styles.modalActions}>
                <button onClick={() => setDeletingProjectId(null)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button onClick={confirmDelete} className={styles.btnDanger}>
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalLargeBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingProject ? 'Edit Construction Project' : 'Register New Infrastructure Project'}</h3>
              <button onClick={() => setShowAddModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.formContainer}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Project Title *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Skyline Commercial Complex"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Project Code</label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="PRJ-001"
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Client Organization *</label>
                  <input 
                    type="text" 
                    value={formData.client}
                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. K Raheja Corp / NHAI"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Location / Site Coordinates *</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Kharadi IT Park, Pune"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid3}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <option value="Commercial Building">Commercial Building</option>
                    <option value="Highway Infrastructure">Highway Infrastructure</option>
                    <option value="Metro Rail transit">Metro Rail transit</option>
                    <option value="Industrial Plant">Industrial Plant</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Approved Budget (₹ INR) *</label>
                  <input 
                    type="number" 
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. 42000000"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Project Manager (PMC Lead)</label>
                  <input 
                    type="text" 
                    value={formData.projectManager}
                    onChange={e => setFormData({ ...formData, projectManager: e.target.value })}
                    placeholder="e.g. Er. Rajesh Kulkarni"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Site Supervisor</label>
                  <input 
                    type="text" 
                    value={formData.projectSupervisor}
                    onChange={e => setFormData({ ...formData, projectSupervisor: e.target.value })}
                    placeholder="e.g. Er. Pravin Gaikwad"
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Target Completion Date</label>
                  <input 
                    type="date" 
                    value={formData.expectedCompletion}
                    onChange={e => setFormData({ ...formData, expectedCompletion: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description & Scope of Work</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail structural scope, steel specifications, design grade..."
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingProject ? 'Update Project' : 'Save & Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Filters Bottom Sheet */}
      {showMobileFilterSheet && (
        <div className={styles.bottomSheetBackdrop} onClick={() => setShowMobileFilterSheet(false)}>
          <div className={styles.bottomSheetPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.bottomSheetHandle} />
            <div className={styles.bottomSheetHeader}>
              <div className={styles.bottomSheetTitleRow}>
                <Filter size={18} className={styles.filterIcon} />
                <h3>Filter Projects</h3>
              </div>
              <button 
                onClick={() => setShowMobileFilterSheet(false)} 
                className={styles.bottomSheetCloseBtn}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.bottomSheetContent}>
              <div className={styles.bottomSheetSection}>
                <label className={styles.bottomSheetLabel}>Project Status</label>
                <div className={styles.filterChipsGrid}>
                  {['All', 'Active', 'Under Review', 'Completed'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`${styles.filterSelectChip} ${statusFilter === st ? styles.filterSelectChipActive : ''}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st === 'All' ? 'All Statuses' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.bottomSheetSection}>
                <label className={styles.bottomSheetLabel}>Project Category</label>
                <div className={styles.filterChipsGrid}>
                  {['All', 'Commercial Building', 'Highway Infrastructure', 'Metro Rail transit', 'Industrial Plant'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`${styles.filterSelectChip} ${categoryFilter === cat ? styles.filterSelectChipActive : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === 'All' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.bottomSheetSection}>
                <label className={styles.bottomSheetLabel}>Sort By</label>
                <div className={styles.filterChipsGrid}>
                  <button
                    type="button"
                    className={`${styles.filterSelectChip} ${sortBy === 'progress' ? styles.filterSelectChipActive : ''}`}
                    onClick={() => setSortBy('progress')}
                  >
                    Progress (High to Low)
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterSelectChip} ${sortBy === 'budget' ? styles.filterSelectChipActive : ''}`}
                    onClick={() => setSortBy('budget')}
                  >
                    Budget (High to Low)
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterSelectChip} ${sortBy === 'date' ? styles.filterSelectChipActive : ''}`}
                    onClick={() => setSortBy('date')}
                  >
                    Start Date (Recent)
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.bottomSheetFooter}>
              <button 
                type="button"
                className={styles.bottomSheetResetBtn}
                onClick={() => {
                  setStatusFilter('All');
                  setCategoryFilter('All');
                  setSortBy('progress');
                  setShowMobileFilterSheet(false);
                }}
              >
                Reset All
              </button>
              <button 
                type="button"
                className={styles.bottomSheetApplyBtn}
                onClick={() => setShowMobileFilterSheet(false)}
              >
                Apply Filters ({filtered.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
