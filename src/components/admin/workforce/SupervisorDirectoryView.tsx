'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './SupervisorDirectoryView.module.css';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Edit,
  X,
  CheckCircle,
  Key
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from '@/services/strapiClient';

export interface EnterpriseSupervisor {
  id: string | number;
  documentId: string;
  supervisorId: string;
  name: string;
  officialEmail: string;
  phone: string;
  designation: string;
  department: string;
  employmentType: string;
  joiningDate: string;
  assignedProject: string;
  assignedSite: string;
  reportingAuthority: string;
  accountStatus: 'Active' | 'Suspended' | 'Pending Verification';
  monthlySalary: number;
  securityClearance: string;
  totalWorkersAssigned: number;
  avatar: string;
}

export default function SupervisorDirectoryView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [supervisors, setSupervisors] = useState<EnterpriseSupervisor[]>([]);
  const [search, setSearch] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('All');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState({
    supervisorId: 'SUP-NEW-099',
    name: '',
    officialEmail: '',
    phone: '',
    designation: 'Site Operations Supervisor',
    department: 'Civil & Structural Engineering',
    employmentType: 'Full-Time Corporate Staff',
    joiningDate: '19 Nov 2026',
    assignedProject: 'Skyline Commercial Complex (Tower A)',
    assignedSite: 'Tower A',
    reportingAuthority: 'Er. Rajesh Kulkarni (Project Director)',
    accountStatus: 'Active' as 'Active' | 'Suspended' | 'Pending Verification',
    monthlySalary: 65000,
    securityClearance: 'Level 2 Field Operations'
  });

  // Load from Strapi
  const loadSupervisors = async () => {
    setLoading(true);
    try {
      const allRequests = await fetchStrapiCollection<any>('supervisor-requests', []);
      const sups: EnterpriseSupervisor[] = [];

      allRequests.forEach((item) => {
        if (item.requestType === 'Supervisor Profile' && item.details) {
          const d = item.details;
          sups.push({
            id: item.id,
            documentId: item.documentId,
            supervisorId: d.supervisorId || 'SUP-001',
            name: d.name || item.title,
            officialEmail: d.officialEmail || 'supervisor@structiva.internal',
            phone: d.phone || '+91 98000 00000',
            designation: d.designation || 'Site Supervisor',
            department: d.department || 'Operations',
            employmentType: d.employmentType || 'Full-Time',
            joiningDate: d.joiningDate || '2026-01-01',
            assignedProject: item.project || d.assignedProject || 'Skyline Commercial Complex (Tower A)',
            assignedSite: item.site || d.assignedSite || 'Tower A',
            reportingAuthority: d.reportingAuthority || 'Er. Rajesh Kulkarni',
            accountStatus: d.accountStatus || 'Active',
            monthlySalary: d.monthlySalary || 65000,
            securityClearance: d.securityClearance || 'Level 2',
            totalWorkersAssigned: d.totalWorkersAssigned || 15,
            avatar: d.avatar || 'SP'
          });
        }
      });

      setSupervisors(sups);
    } catch (err) {
      console.error('Failed to load supervisors from Strapi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, []);

  // Filtered List
  const filtered = useMemo(() => {
    return supervisors.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.supervisorId.toLowerCase().includes(search.toLowerCase()) ||
        s.assignedProject.toLowerCase().includes(search.toLowerCase());

      const matchProject = projectFilter === 'All' || s.assignedProject === projectFilter;

      return matchSearch && matchProject;
    });
  }, [supervisors, search, projectFilter]);

  // Handle Save / Add Supervisor
  const handleSaveSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.officialEmail) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      const initials = formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const payload = {
        ...formData,
        avatar: initials,
        totalWorkersAssigned: 12
      };

      if (editingDocId) {
        await updateStrapiEntity('supervisor-requests', editingDocId, {
          title: `Supervisor Profile: ${formData.name} (${formData.supervisorId})`,
          project: formData.assignedProject,
          site: formData.assignedSite,
          status: formData.accountStatus,
          details: payload
        });
      } else {
        await createStrapiEntity('supervisor-requests', {
          requestType: 'Supervisor Profile',
          title: `Supervisor Profile: ${formData.name} (${formData.supervisorId})`,
          project: formData.assignedProject,
          site: formData.assignedSite,
          category: 'Employee Identity',
          priority: 'Standard',
          status: formData.accountStatus,
          details: payload,
          remarks: 'Admin-provisioned chief supervisor master record',
          submittedBy: 'Super Admin (Executive Office)',
          submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
      }

      setModalOpen(false);
      setEditingDocId(null);
      await loadSupervisors();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingDocId(null);
    setFormData({
      supervisorId: `SUP-GEN-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      officialEmail: '',
      phone: '+91 ',
      designation: 'Site Operations Supervisor',
      department: 'Civil & Structural Engineering',
      employmentType: 'Full-Time Corporate Staff',
      joiningDate: new Date().toLocaleDateString('en-GB'),
      assignedProject: 'Skyline Commercial Complex (Tower A)',
      assignedSite: 'Tower A',
      reportingAuthority: 'Er. Rajesh Kulkarni (Project Director)',
      accountStatus: 'Active',
      monthlySalary: 65000,
      securityClearance: 'Level 2 Field Operations'
    });
    setModalOpen(true);
  };

  const openEditModal = (sup: EnterpriseSupervisor) => {
    setEditingDocId(sup.documentId);
    setFormData({
      supervisorId: sup.supervisorId,
      name: sup.name,
      officialEmail: sup.officialEmail,
      phone: sup.phone,
      designation: sup.designation,
      department: sup.department,
      employmentType: sup.employmentType,
      joiningDate: sup.joiningDate,
      assignedProject: sup.assignedProject,
      assignedSite: sup.assignedSite,
      reportingAuthority: sup.reportingAuthority,
      accountStatus: sup.accountStatus,
      monthlySalary: sup.monthlySalary,
      securityClearance: sup.securityClearance
    });
    setModalOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* 4 KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(23, 43, 50, 0.08)', color: '#172B32' }}>
            <Users size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Total Supervisors</span>
            <span className={styles.kpiValue}>{supervisors.length}</span>
            <span className={styles.kpiSubtitle}>Authorized field commanders</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>
            <ShieldCheck size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Active Field Nodes</span>
            <span className={styles.kpiValue} style={{ color: '#047857' }}>
              {supervisors.filter((s) => s.accountStatus === 'Active').length}
            </span>
            <span className={styles.kpiSubtitle}>Biometric & GPS enabled</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(22, 124, 114, 0.12)', color: '#167C72' }}>
            <Building2 size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Site Deployments</span>
            <span className={styles.kpiValue} style={{ color: '#167C72' }}>
              2 Active Sites
            </span>
            <span className={styles.kpiSubtitle}>Skyline Tower A & Highway Sec-3</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(181, 139, 89, 0.15)', color: '#B58B59' }}>
            <DollarSign size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Supervisor Monthly Payroll</span>
            <span className={styles.kpiValue} style={{ color: '#172B32' }}>
              ₹
              {supervisors
                .reduce((sum, s) => sum + s.monthlySalary, 0)
                .toLocaleString('en-IN')}
            </span>
            <span className={styles.kpiSubtitle}>Executive compensation pool</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchBox}>
          <Search size={16} color="#718096" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search Supervisor by Name, ID, or Project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select
            className={styles.selectInput}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            <option value="Skyline Commercial Complex (Tower A)">Skyline Commercial Complex (Tower A)</option>
            <option value="Eastern Expressway Link Highway">Eastern Expressway Link Highway</option>
          </select>

          <button className={styles.btnSecondary} onClick={loadSupervisors} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <button className={styles.btnPrimary} onClick={openCreateModal}>
            <UserPlus size={14} /> Add New Supervisor
          </button>
        </div>
      </div>

      {/* Supervisors Cards Grid */}
      <div className={styles.supervisorsGrid}>
        {filtered.map((sup) => (
          <div key={sup.id} className={styles.supervisorCard}>
            <div className={styles.cardTopRow}>
              <div className={styles.avatar}>{sup.avatar}</div>
              <div className={styles.supInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h3>{sup.name}</h3>
                  <span
                    className={`${styles.badge} ${
                      sup.accountStatus === 'Active' ? styles.badgeSuccess : styles.badgeDanger
                    }`}
                  >
                    {sup.accountStatus}
                  </span>
                </div>
                <p>
                  {sup.designation} &bull; <strong>{sup.supervisorId}</strong>
                </p>
              </div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Project:</span>
                <span className={styles.detailVal}>{sup.assignedProject}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Site:</span>
                <span className={styles.detailVal}>{sup.assignedSite}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Reporting To:</span>
                <span className={styles.detailVal}>{sup.reportingAuthority}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Official Email:</span>
                <span className={styles.detailVal}>{sup.officialEmail}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Mobile Phone:</span>
                <span className={styles.detailVal}>{sup.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Monthly Salary:</span>
                <span className={styles.detailVal} style={{ color: '#167C72' }}>
                  ₹{sup.monthlySalary.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                className={styles.btnSecondary}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => openEditModal(sup)}
              >
                <Edit size={13} /> Edit Profile & Scope
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supervisor Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveSupervisor}>
              <div className={styles.modalHeader}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  {editingDocId ? 'Edit Supervisor Profile' : 'Authorize New Chief Field Supervisor'}
                </h4>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Supervisor ID *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.supervisorId}
                      onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Full Official Name *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Er. Pravin Gaikwad"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Official Email *</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="p.gaikwad@structiva.internal"
                      value={formData.officialEmail}
                      onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="+91 98220 99441"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Designation *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Assigned Project *</label>
                    <select
                      className={styles.formInput}
                      value={formData.assignedProject}
                      onChange={(e) => setFormData({ ...formData, assignedProject: e.target.value })}
                    >
                      <option value="Skyline Commercial Complex (Tower A)">Skyline Commercial Complex (Tower A)</option>
                      <option value="Eastern Expressway Link Highway">Eastern Expressway Link Highway</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Assigned Site *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.assignedSite}
                      onChange={(e) => setFormData({ ...formData, assignedSite: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Monthly Salary (INR) *</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                  {submitting ? 'Saving to Strapi...' : 'Save & Authorize Supervisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
