'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ProjectTable.module.css';
import { Plus, Search, MapPin, Building2, Calendar, HardHat, Truck, ArrowRight, X, CheckCircle, Edit, Trash2, Upload, AlertTriangle } from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';
import { EnterpriseProjectRecord, getStoredProjects, saveProjects } from '@/services/projectStorage';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';

export default function ProjectTable() {
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<EnterpriseProjectRecord | null>(null);
  
  // Modal states
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
    budget: '',
    spent: '0',
    progress: '0',
    status: 'Active' as 'Active' | 'Under Review' | 'Completed',
    projectManager: '',
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

  // Helper to calculate REAL worker count for any given project
  const getProjectWorkerCount = (projectName: string) => {
    if (!workers || workers.length === 0) return 0;
    const count = workers.filter(w => {
      const p = (w.assignedProject || '').toLowerCase();
      const target = projectName.toLowerCase();
      return p.includes(target) || target.includes(p);
    }).length;
    return count;
  };

  // Open Create Form
  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      code: '',
      client: '',
      location: '',
      budget: '',
      spent: '0',
      progress: '0',
      status: 'Active',
      projectManager: '',
      startDate: '',
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
      budget: p.budget.toString(),
      spent: p.spent.toString(),
      progress: p.progress.toString(),
      status: p.status,
      projectManager: p.projectManager,
      startDate: p.startDate,
      expectedCompletion: p.expectedCompletion,
      deployedMachinery: p.deployedMachinery.toString(),
      image: p.image,
      description: p.description
    });
    setShowAddModal(true);
  };

  // Handle Image File Upload (Converts to Base64 Data URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingProject) {
      // UPDATE existing project
      const updatedList = projects.map(p => {
        if (p.id === editingProject.id) {
          return {
            ...p,
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            client: formData.client.trim() || 'L&T Infrastructure',
            location: formData.location.trim() || 'Pune, Maharashtra',
            budget: Number(formData.budget) || p.budget,
            spent: Number(formData.spent) || p.spent,
            progress: Number(formData.progress) || p.progress,
            status: formData.status,
            startDate: formData.startDate || p.startDate,
            expectedCompletion: formData.expectedCompletion || p.expectedCompletion,
            image: formData.image,
            projectManager: formData.projectManager.trim() || p.projectManager,
            deployedMachinery: Number(formData.deployedMachinery) || p.deployedMachinery,
            description: formData.description.trim() || p.description
          };
        }
        return p;
      });

      setProjects(updatedList);
      saveProjects(updatedList);
    } else {
      // CREATE brand new project
      const newPrj: EnterpriseProjectRecord = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        client: formData.client.trim() || 'L&T Infrastructure',
        location: formData.location.trim() || 'Pune, Maharashtra',
        budget: Number(formData.budget) || 25000000,
        spent: 0,
        status: formData.status,
        progress: Number(formData.progress) || 0,
        startDate: formData.startDate || 'Nov 2026',
        expectedCompletion: formData.expectedCompletion || 'Dec 2027',
        image: formData.image,
        projectManager: formData.projectManager.trim() || 'Er. Rajesh Kulkarni',
        deployedMachinery: Number(formData.deployedMachinery) || 2,
        description: formData.description.trim() || 'Newly initialized enterprise construction site operations adhering to Structiva quality standards.'
      };

      const updated = [newPrj, ...projects];
      setProjects(updated);
      saveProjects(updated);
    }

    setShowAddModal(false);
    setEditingProject(null);
  };

  // Delete Project Handler
  const confirmDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProjectId(id);
  };

  const executeDelete = () => {
    if (!deletingProjectId) return;
    const remaining = projects.filter(p => p.id !== deletingProjectId);
    setProjects(remaining);
    saveProjects(remaining);
    setDeletingProjectId(null);
    if (selectedProject?.id === deletingProjectId) {
      setSelectedProject(null);
    }
  };

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Top Controls */}
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search projects by name, code, city..." 
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Active Sites: <strong style={{ color: '#0f172a' }}>{filtered.length} Projects Under Structiva OS</strong>
          </span>
          <button className={styles.btnNew} onClick={openCreateModal}>
            <Plus size={16} />
            <span>New Enterprise Project</span>
          </button>
        </div>
      </div>

      {/* Modern Visual Project Cards */}
      <div className={styles.projectGrid}>
        {filtered.map(p => {
          const realWorkerCount = getProjectWorkerCount(p.name);

          return (
            <div key={p.id} className={styles.card} onClick={() => setSelectedProject(p)}>
              <div className={styles.imageWrapper}>
                <SafeImage src={p.image} alt={p.name} fallbackType="project" className={styles.projectImage} />
                
                {/* Quick Action Edit / Delete Overlay */}
                <div className={styles.cardQuickActions} onClick={e => e.stopPropagation()}>
                  <button 
                    title="Edit Site Dossier" 
                    className={styles.btnActionIcon}
                    onClick={(e) => openEditModal(p, e)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    title="Delete Project Site" 
                    className={`${styles.btnActionIcon} ${styles.btnActionIconDanger}`}
                    onClick={(e) => confirmDeleteProject(p.id, e)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className={styles.statusOverlay}>
                  <span className={styles.statusDot}></span>
                  <span>{p.status}</span>
                </div>
                <span className={styles.codeOverlay}>{p.code}</span>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.titleArea}>
                  <h3 className={styles.projectTitle}>{p.name}</h3>
                  <div className={styles.clientLocation}>
                    <MapPin size={13} color="#f59e0b" />
                    <span>{p.location} • {p.client}</span>
                  </div>
                </div>

                <div className={styles.metricsRow}>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Total Contract</span>
                    <span className={styles.metricValue}>₹ {(p.budget / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className={styles.metricBlock} style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1rem' }}>
                    <span className={styles.metricLabel}>Spent to Date</span>
                    <span className={styles.metricValue} style={{ color: '#64748b' }}>₹ {(p.spent / 10000000).toFixed(2)} Cr</span>
                  </div>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressMeta}>
                    <span>Civil Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.3rem', 
                      fontWeight: 700,
                      color: realWorkerCount > 0 ? '#059669' : '#64748b',
                      background: realWorkerCount > 0 ? '#ecfdf5' : '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.78rem'
                    }}>
                      <HardHat size={14} color={realWorkerCount > 0 ? '#059669' : '#94a3b8'} /> 
                      {realWorkerCount} {realWorkerCount === 1 ? 'Worker' : 'Workers'} On Site
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#475569' }}>
                      <Truck size={14} color="#0f172a" /> {p.deployedMachinery} Machines
                    </span>
                  </div>
                  <span className={styles.viewDetailsText}>
                    Explore Site <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingProjectId && (
        <div className={styles.modalOverlay} onClick={() => setDeletingProjectId(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 440, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: 10, borderRadius: '50%' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Delete Construction Project?</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Action cannot be reversed</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '10px 0 16px 0' }}>
              Are you sure you want to remove this project from the active portfolio? This will update the Overview Dashboard and clear assigned site records.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button 
                className={styles.btnCancel} 
                onClick={() => setDeletingProjectId(null)}
              >
                Cancel
              </button>
              <button 
                style={{
                  background: '#dc2626', color: '#ffffff', border: 'none',
                  padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer'
                }}
                onClick={executeDelete}
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Project Detail Hub Modal */}
      {selectedProject && (() => {
        const modalWorkerCount = getProjectWorkerCount(selectedProject.name);
        const assignedWorkers = workers.filter(w => {
          const p = (w.assignedProject || '').toLowerCase();
          const target = selectedProject.name.toLowerCase();
          return p.includes(target) || target.includes(p);
        });

        return (
          <div className={styles.modalOverlay} onClick={() => setSelectedProject(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHero}>
                <SafeImage src={selectedProject.image} alt={selectedProject.name} fallbackType="project" className={styles.modalHeroImage} />
                <button className={styles.modalCloseBtn} onClick={() => setSelectedProject(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                        {selectedProject.code}
                      </span>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                        {selectedProject.name}
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Client: <strong>{selectedProject.client}</strong> • Location: <strong>{selectedProject.location}</strong>
                      </p>
                    </div>
                    <span style={{ background: '#d1fae5', color: '#065f46', fontWeight: 800, fontSize: '0.8rem', padding: '6px 14px', borderRadius: 20 }}>
                      {selectedProject.status} Operations
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
                  {selectedProject.description}
                </p>

                {/* Detailed Operational KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PROJECT MANAGER</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: 4 }}>{selectedProject.projectManager}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TOTAL BUDGET</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginTop: 4 }}>₹ {(selectedProject.budget / 10000000).toFixed(2)} Cr</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>REAL WORKFORCE ON SITE</span>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem', marginTop: 4 }}>
                      {modalWorkerCount} Verified Active
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>HEAVY MACHINERY</span>
                    <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem', marginTop: 4 }}>{selectedProject.deployedMachinery} Units</div>
                  </div>
                </div>

                {/* Real Workers List On This Site */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                      ASSIGNED PERSONNEL ROSTER ({assignedWorkers.length})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Live Master Sync</span>
                  </div>
                  {assignedWorkers.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {assignedWorkers.map(w => (
                        <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 20 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{w.name}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({w.category})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      No workers currently assigned directly to this project. Onboard personnel from the Workforce directory to deploy them here.
                    </p>
                  )}
                </div>

                {/* Timeline Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#0f172a', color: '#ffffff', borderRadius: 10, fontSize: '0.85rem' }}>
                  <div>Start Date: <strong>{selectedProject.startDate}</strong></div>
                  <div>Target Commissioning: <strong>{selectedProject.expectedCompletion}</strong></div>
                  <div>Civil Progress: <strong style={{ color: '#10b981' }}>{selectedProject.progress}% Completed</strong></div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add / Edit Project Modal with Image Upload */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 640, padding: '1.75rem' }}>
            <div className={styles.formHeader}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <Building2 color="#f59e0b" size={22} /> 
                  {editingProject ? 'Edit Construction Project Dossier' : 'Initialize Enterprise Site Project'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {editingProject ? `Updating ${editingProject.code}` : 'Compliant site record stored permanently under Structiva OS'}
                </span>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Name / Contract Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pune Metro Line 3 Corridor Extension" 
                  className={styles.formInput}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. PRJ-MTR-12" 
                    className={styles.formInput}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Client / Government Body *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NHAI / MMRDA / Tata" 
                    className={styles.formInput}
                    value={formData.client}
                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Site Location (City & State) *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hinjewadi Phase 3, Pune" 
                    className={styles.formInput}
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Total Contract Budget (₹ INR) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 65000000 (6.5 Cr)" 
                    className={styles.formInput}
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project Manager / Site Engineer</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Er. Mahesh Shinde" 
                    className={styles.formInput}
                    value={formData.projectManager}
                    onChange={e => setFormData({ ...formData, projectManager: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Civil Progress (% Complete)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    placeholder="e.g. 45" 
                    className={styles.formInput}
                    value={formData.progress}
                    onChange={e => setFormData({ ...formData, progress: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Commencement Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 01 Jan 2026"
                    className={styles.formInput}
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Target Completion Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 31 Dec 2027"
                    className={styles.formInput}
                    value={formData.expectedCompletion}
                    onChange={e => setFormData({ ...formData, expectedCompletion: e.target.value })}
                  />
                </div>
              </div>

              {/* Photo Upload & Selection Feature */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Site Photo (Choose Preset or Upload Real Image)</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select 
                    className={styles.formSelect}
                    style={{ flex: 1 }}
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  >
                    <option value="/images/commercial_tower.jpg">Preset: Commercial IT Tower (High-Rise)</option>
                    <option value="/images/highway_bridge.jpg">Preset: Highway / Flyover Bridge</option>
                    <option value="/images/metro_piling.jpg">Preset: Metro Rail Piling & Infrastructure</option>
                  </select>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                  />

                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: '#0f172a', color: '#ffffff', border: 'none',
                      padding: '8px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    <Upload size={14} /> Upload Custom Photo
                  </button>
                </div>

                {formData.image && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #cbd5e1' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      ✓ Selected image ready for site card & dossier
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Operational Scope & Structural Description</label>
                <textarea 
                  rows={2}
                  placeholder="Key milestones, RCC specifications, civil foundation scope..." 
                  className={styles.formTextarea}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.btnCancel}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                >
                  <CheckCircle size={16} />
                  <span>{editingProject ? 'Save Changes' : 'Deploy & Launch Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
