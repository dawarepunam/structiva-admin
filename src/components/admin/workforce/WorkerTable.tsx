'use client';

import React, { useState, useEffect } from 'react';
import styles from './WorkerTable.module.css';
import { Search, Phone, ShieldCheck, MapPin, X, ArrowRight, Award, Plus, CheckCircle } from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';
import { EnterpriseWorkerRecord, getStoredWorkers, saveWorkers } from '@/services/workerStorage';
import { getStoredProjects, EnterpriseProjectRecord } from '@/services/projectStorage';

export default function WorkerTable() {
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [availableProjects, setAvailableProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<EnterpriseWorkerRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Skilled' as 'Skilled' | 'Semi-Skilled' | 'Unskilled',
    skill: '',
    dailyWage: 950,
    phone: '',
    assignedProject: 'Skyline Commercial Complex',
    emergencyContact: '',
    bloodGroup: 'B+',
    safetyCertified: true,
    aadhaarNumber: ''
  });

  // Load from persistent local storage on mount
  useEffect(() => {
    setWorkers(getStoredWorkers());
    setAvailableProjects(getStoredProjects());

    const handleStorage = () => {
      setWorkers(getStoredWorkers());
      setAvailableProjects(getStoredProjects());
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

  const filtered = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.skill.toLowerCase().includes(search.toLowerCase()) ||
    w.assignedProject.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newWorkerId = (Date.now()).toString();
    const newWorkerCode = `WRK-${formData.assignedProject.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newWorker: EnterpriseWorkerRecord = {
      id: newWorkerId,
      name: formData.name,
      code: newWorkerCode,
      category: formData.category,
      skill: formData.skill || (formData.category === 'Skilled' ? 'Site Specialist' : 'Civil Labour'),
      dailyWage: Number(formData.dailyWage) || 750,
      phone: formData.phone || '+91 98220 00000',
      status: 'Active',
      assignedProject: formData.assignedProject,
      avatar: '/images/worker1.jpg',
      emergencyContact: formData.emergencyContact || 'Verified Relative',
      bloodGroup: formData.bloodGroup || 'O+',
      safetyCertified: formData.safetyCertified,
      aadhaarNumber: formData.aadhaarNumber ? `XXXX-XXXX-${formData.aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-9988',
      totalDaysWorked: 1
    };

    const updated = [newWorker, ...workers];
    setWorkers(updated);
    saveWorkers(updated);
    setShowAddModal(false);

    // Reset Form
    setFormData({
      name: '',
      category: 'Skilled',
      skill: '',
      dailyWage: 950,
      phone: '',
      assignedProject: 'Skyline Commercial Complex',
      emergencyContact: '',
      bloodGroup: 'B+',
      safetyCertified: true,
      aadhaarNumber: ''
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 14px', borderRadius: 8, border: '1px solid #cbd5e1', width: 340 }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search workers by name, skill, project..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Total Registered Workforce: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{filtered.length} Real-world Personnel</strong>
          </span>
          <button className={styles.btnAddWorker} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Onboard New Worker</span>
          </button>
        </div>
      </div>

      <div className={styles.workerGrid}>
        {filtered.map(w => (
          <div key={w.id} className={styles.card} onClick={() => setSelectedWorker(w)}>
            <div className={styles.profileHeader}>
              <SafeImage src={w.avatar} alt={w.name} fallbackType="worker" className={styles.avatar} />
              <div className={styles.info}>
                <span className={styles.code}>{w.code}</span>
                <h3 className={styles.name}>{w.name}</h3>
                <span className={`${styles.categoryBadge} ${
                  w.category === 'Skilled' ? styles.skilled : 
                  w.category === 'Semi-Skilled' ? styles.semi : styles.unskilled
                }`}>
                  {w.category}
                </span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.row}>
                <span style={{ color: '#64748b' }}>Trade / Skill:</span>
                <span style={{ fontWeight: 600 }}>{w.skill}</span>
              </div>
              <div className={styles.row}>
                <span style={{ color: '#64748b' }}>Current Site:</span>
                <span style={{ fontWeight: 600 }}>{w.assignedProject}</span>
              </div>
              <div className={styles.row}>
                <span style={{ color: '#64748b' }}>Phone:</span>
                <span>{w.phone}</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>DAILY RATE</span>
                <span className={styles.wageBadge}>₹ {w.dailyWage} / day</span>
              </div>
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                View Dossier <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Worker Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Onboard New Site Worker</h2>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Direct Entry into Master Labour Ledger</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Worker Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Anand Kulkarni"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Skill Classification</label>
                  <select 
                    className={styles.formSelect}
                    value={formData.category}
                    onChange={e => {
                      const cat = e.target.value as any;
                      const wage = cat === 'Skilled' ? 950 : cat === 'Semi-Skilled' ? 650 : 500;
                      setFormData({ ...formData, category: cat, dailyWage: wage });
                    }}
                  >
                    <option value="Skilled">Skilled (Mason/Bar Bender/Operator)</option>
                    <option value="Semi-Skilled">Semi-Skilled (Carpenter/Helper)</option>
                    <option value="Unskilled">Unskilled (Civil Handling/Curing)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Daily Wage Rate (₹) *</label>
                  <input 
                    type="number" 
                    required
                    className={styles.formInput}
                    value={formData.dailyWage}
                    onChange={e => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trade / Specialization</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Shuttering Carpenter"
                    className={styles.formInput}
                    value={formData.skill}
                    onChange={e => setFormData({ ...formData, skill: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Assigned Construction Project</label>
                  <select 
                    className={styles.formSelect}
                    value={formData.assignedProject}
                    onChange={e => setFormData({ ...formData, assignedProject: e.target.value })}
                  >
                    {availableProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 98000 00000"
                    className={styles.formInput}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Aadhaar Number (Last 4 Digits)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 8492"
                    maxLength={4}
                    className={styles.formInput}
                    value={formData.aadhaarNumber}
                    onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  type="submit"
                  style={{
                    flex: 1, padding: '10px', background: '#059669', color: '#ffffff',
                    border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Confirm & Save Worker</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px', background: '#f1f5f9', color: '#475569',
                    border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Worker Profile Modal */}
      {selectedWorker && (
        <div className={styles.modalOverlay} onClick={() => setSelectedWorker(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SafeImage src={selectedWorker.avatar} alt={selectedWorker.name} fallbackType="worker" className={styles.modalAvatar} />
                <div>
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>{selectedWorker.code}</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0' }}>{selectedWorker.name}</h2>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{selectedWorker.skill}</span>
                </div>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedWorker(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.statsGrid3}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>DAILY WAGE</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>₹ {selectedWorker.dailyWage}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>DAYS WORKED</span>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>{selectedWorker.totalDaysWorked} Days</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>BLOOD GROUP</span>
                  <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.1rem' }}>{selectedWorker.bloodGroup}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                  <span style={{ color: '#64748b' }}>Assigned Project Site:</span>
                  <strong>{selectedWorker.assignedProject}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                  <span style={{ color: '#64748b' }}>Aadhaar Identity Verification:</span>
                  <strong style={{ color: '#059669' }}>Verified ({selectedWorker.aadhaarNumber})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                  <span style={{ color: '#64748b' }}>Emergency Family Contact:</span>
                  <strong>{selectedWorker.emergencyContact}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                  <span style={{ color: '#64748b' }}>MNC PPE Safety Compliance:</span>
                  <span style={{ color: selectedWorker.safetyCertified ? '#10b981' : '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={14} /> {selectedWorker.safetyCertified ? 'Certified & Equipped' : 'Pending Induction'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedWorker(null)}
                style={{
                  padding: '10px', background: '#0f172a', color: '#ffffff',
                  border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 6
                }}
              >
                Close Labour Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
