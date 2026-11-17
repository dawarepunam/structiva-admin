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
  List
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

  return (
    <div className={styles.container}>
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
          </div>

          {/* Status Filter */}
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

          {/* Sort Selector */}
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
    </div>
  );
}
