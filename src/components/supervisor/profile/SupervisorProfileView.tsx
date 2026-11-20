'use client';

import React, { useState, useEffect } from 'react';
import styles from './SupervisorProfileView.module.css';
import {
  UserCircle,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Calendar,
  Briefcase,
  DollarSign,
  FileText,
  Lock,
  Edit,
  CheckCircle,
  X,
  Award,
  Layers,
  MapPin,
  RefreshCw,
  Camera,
  History,
  CheckCircle2
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity } from '@/services/strapiClient';
import { 
  submitProfileCorrection, 
  fetchCorrectionsFromBackend, 
  ProfileCorrectionRecord 
} from '@/services/profileCorrectionStorage';

export interface SupervisorProfileData {
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
  accountStatus: string;
  monthlySalary: number;
  securityClearance: string;
  totalWorkersAssigned: number;
  avatar: string;
}

const DEFAULT_PROFILE: SupervisorProfileData = {
  id: 'sup_01',
  documentId: 'sup_prof_001',
  supervisorId: 'SUP-PUN-084',
  name: 'Er. Pravin Gaikwad',
  officialEmail: 'p.gaikwad@structiva.internal',
  phone: '+91 98220 99441',
  designation: 'Chief Site Operations Supervisor',
  department: 'Civil & Structural Engineering',
  employmentType: 'Full-Time Corporate Staff',
  joiningDate: '12 Mar 2022',
  assignedProject: 'Skyline Commercial Complex (Tower A)',
  assignedSite: 'Tower A (Core & Podium)',
  reportingAuthority: 'Er. Rajesh Kulkarni (Project Director)',
  accountStatus: 'Active',
  monthlySalary: 65000,
  securityClearance: 'Level 2 Field Operations',
  totalWorkersAssigned: 12,
  avatar: 'PG'
};

export default function SupervisorProfileView() {
  const [profile, setProfile] = useState<SupervisorProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'attendance' | 'security'>('overview');

  // Edit Permitted Fields & Photo Correction Request Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [correctionType, setCorrectionType] = useState<'phone' | 'photo'>('phone');
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [correctionReason, setCorrectionReason] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [myCorrections, setMyCorrections] = useState<ProfileCorrectionRecord[]>([]);

  // Load from Strapi & Corrections
  const loadProfile = async () => {
    setLoading(true);
    try {
      const [data, correctionsList] = await Promise.all([
        fetchStrapiCollection<any>('supervisor-requests', []),
        fetchCorrectionsFromBackend()
      ]);

      const myCorr = correctionsList.filter(c => 
        c.userRole === 'Supervisor' && 
        (c.workerCode === profile.supervisorId || c.workerName.includes('Gaikwad'))
      );
      setMyCorrections(myCorr);

      const found = data.find(
        (r) =>
          r.requestType === 'Supervisor Profile' &&
          (r.documentId === 'sup_prof_001' || (r.details && r.details.supervisorId === 'SUP-PUN-084'))
      );

      if (found && found.details) {
        setProfile({
          ...DEFAULT_PROFILE,
          ...found.details,
          id: found.id,
          documentId: found.documentId
        });
        setEditPhone(found.details.phone || DEFAULT_PROFILE.phone);
      }
    } catch (err) {
      console.warn('Could not load profile from Strapi, using defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile / Photo Correction to Admin
  const handleSaveContact = async () => {
    if (!correctionReason.trim()) {
      alert('Please enter a reason / justification for Admin review.');
      return;
    }
    if (correctionType === 'photo' && !photoPreview) {
      alert('Please select a photo file.');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      await submitProfileCorrection({
        userRole: 'Supervisor',
        workerId: 'sup-1',
        workerName: profile.name,
        workerCode: profile.supervisorId,
        project: profile.assignedProject,
        site: profile.assignedSite,
        supervisorName: 'Executive HR Admin Desk',
        fieldName: correctionType === 'photo' ? 'avatar' : 'phone',
        fieldLabel: correctionType === 'photo' ? 'Official Field Avatar' : 'Official Mobile Phone',
        oldValue: correctionType === 'photo' ? profile.avatar : profile.phone,
        newValue: correctionType === 'photo' ? (photoPreview || '') : editPhone,
        isPhotoChange: correctionType === 'photo',
        oldPhotoUrl: profile.avatar,
        newPhotoUrl: photoPreview || undefined,
        reason: correctionReason.trim(),
        submittedDate: today
      });

      setSubmitSuccess(true);
      await loadProfile();
      setTimeout(() => {
        setSubmitSuccess(false);
        setEditModalOpen(false);
        setCorrectionReason('');
        setPhotoPreview(null);
      }, 1500);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Banner Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>
            <UserCircle size={26} color="#FFFFFF" /> My Profile
          </h1>
          <p>
            Employee identity, verified field credentials, authorized operational scopes, and attendance summary.
          </p>
        </div>

        <button className={styles.btnSecondary} onClick={loadProfile} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Identity Master Hero Card */}
      <div className={styles.identityCard}>
        <div className={styles.identityLeft}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>{profile.avatar}</div>
          </div>

          <div className={styles.identityInfo}>
            <h2>{profile.name}</h2>
            <p>
              {profile.designation} &bull; <strong>{profile.supervisorId}</strong>
            </p>
            <div className={styles.identityMetaPills}>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                <CheckCircle size={12} /> {profile.accountStatus} Field Node
              </span>
              <span className={`${styles.badge} ${styles.badgeInfo}`}>
                <ShieldCheck size={12} /> {profile.securityClearance}
              </span>
              <span className={styles.badge} style={{ background: '#ECEBE5', color: '#172B32' }}>
                <Building size={12} /> {profile.assignedSite}
              </span>
            </div>
          </div>
        </div>

        <button className={styles.btnPrimary} onClick={() => setEditModalOpen(true)}>
          <Edit size={14} /> Update Contact Info
        </button>
      </div>

      {/* Profile Section Tabs */}
      <div className={styles.profileTabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Briefcase size={16} /> Operational Overview
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'employment' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('employment')}
        >
          <Award size={16} /> Employment & Compensation
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'attendance' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Calendar size={16} /> Attendance & Muster Record
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={16} /> Security & Node Status
        </button>
      </div>

      {/* TAB 1: OPERATIONAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className={styles.sectionGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Building size={17} color="#167C72" /> Project & Site Jurisdiction
              </h3>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Assigned Project</span>
              <span className={styles.detailVal}>{profile.assignedProject}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Assigned Site</span>
              <span className={styles.detailVal}>{profile.assignedSite}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Reporting Manager</span>
              <span className={styles.detailVal}>{profile.reportingAuthority}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Assigned Trade Workforce</span>
              <span className={styles.detailVal}>{profile.totalWorkersAssigned} Active Site Workers</span>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Mail size={17} color="#167C72" /> Official Contact & Communication
              </h3>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Official Email</span>
              <span className={styles.detailVal}>{profile.officialEmail}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Mobile Phone</span>
              <span className={styles.detailVal}>{profile.phone}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Internal Radio Channel</span>
              <span className={styles.detailVal}>Channel 4 (Skyline Tower A Core)</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Emergency Site Contact</span>
              <span className={styles.detailVal}>+91 98221 00911 (EHS Safety Desk)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYMENT & COMPENSATION */}
      {activeTab === 'employment' && (
        <div className={styles.sectionGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Briefcase size={17} color="#167C72" /> Employment Contract Details
              </h3>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Employee Code</span>
              <span className={styles.detailVal}>{profile.supervisorId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Department</span>
              <span className={styles.detailVal}>{profile.department}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Employment Type</span>
              <span className={styles.detailVal}>{profile.employmentType}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Joining Date</span>
              <span className={styles.detailVal}>{profile.joiningDate}</span>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <DollarSign size={17} color="#167C72" /> Compensation Structure (Admin Controlled)
              </h3>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Monthly Gross CTC</span>
              <span className={styles.detailVal} style={{ color: '#167C72', fontSize: '1.05rem' }}>
                ₹{profile.monthlySalary.toLocaleString('en-IN')}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Calculated Daily Rate</span>
              <span className={styles.detailVal}>₹{Math.round(profile.monthlySalary / 30).toLocaleString('en-IN')} / Day</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Pay Cycle</span>
              <span className={styles.detailVal}>1st - 30th of each calendar month</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Bank Disbursement Mode</span>
              <span className={styles.detailVal}>Direct NEFT / Corporate Salary Account</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE & MUSTER RECORD */}
      {activeTab === 'attendance' && (
        <div className={styles.sectionGrid}>
          <div className={styles.sectionCard} style={{ gridColumn: '1 / -1' }}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <Calendar size={17} color="#167C72" /> Monthly Supervisor Shift & Attendance Performance
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #ECEBE5' }}>
                <span style={{ fontSize: '0.72rem', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Total Working Days</span>
                <h4 style={{ margin: '0.25rem 0', fontSize: '1.4rem', color: '#172B32' }}>24 Days</h4>
                <span style={{ fontSize: '0.72rem', color: '#718096' }}>Current calendar cycle</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #ECEBE5' }}>
                <span style={{ fontSize: '0.72rem', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Verified Present</span>
                <h4 style={{ margin: '0.25rem 0', fontSize: '1.4rem', color: '#047857' }}>22 Days</h4>
                <span style={{ fontSize: '0.72rem', color: '#718096' }}>Biometric & Geofence matched</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #ECEBE5' }}>
                <span style={{ fontSize: '0.72rem', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Authorized Leaves</span>
                <h4 style={{ margin: '0.25rem 0', fontSize: '1.4rem', color: '#B45309' }}>2 Days</h4>
                <span style={{ fontSize: '0.72rem', color: '#718096' }}>Sanctioned casual leaves</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #ECEBE5' }}>
                <span style={{ fontSize: '0.72rem', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Payable Attendance Ratio</span>
                <h4 style={{ margin: '0.25rem 0', fontSize: '1.4rem', color: '#167C72' }}>100.0%</h4>
                <span style={{ fontSize: '0.72rem', color: '#718096' }}>Zero unexcused absences</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & NODE STATUS */}
      {activeTab === 'security' && (
        <div className={styles.sectionGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <ShieldCheck size={17} color="#167C72" /> Field Node Security Credentials
              </h3>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Security Clearance Level</span>
              <span className={styles.detailVal}>{profile.securityClearance}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Authorized Permissions</span>
              <span className={styles.detailVal}>Read/Write Indents, DPR, Attendance, Petty Cash</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Two-Factor Authentication</span>
              <span className={styles.detailVal}>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Enforced</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Terminal Hardware ID</span>
              <span className={styles.detailVal}>WIN11-FIELD-STATION-PUN-084</span>
            </div>
          </div>
        </div>
      )}

      {/* MY CORRECTION REQUESTS HISTORY */}
      {myCorrections.length > 0 && (
        <div className={styles.sectionCard} style={{ marginTop: '1.25rem' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <History size={18} color="#167C72" />
              <span>My Profile Correction Requests</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            {myCorrections.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#172B32' }}>
                    {item.fieldLabel} &middot; <span style={{ color: '#167C72' }}>{item.newValue}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Reason: {item.reason} &middot; Submitted on {item.submittedDate}
                  </div>
                  {item.adminRemarks && (
                    <div style={{ fontSize: '0.72rem', color: '#065F46', background: '#ECFDF5', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.35rem' }}>
                      Admin: {item.adminRemarks}
                    </div>
                  )}
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '12px',
                  background: item.status === 'Approved' ? '#D1FAE5' : item.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                  color: item.status === 'Approved' ? '#065F46' : item.status === 'Rejected' ? '#991B1B' : '#92400E'
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT CONTACT & PHOTO CORRECTION MODAL */}
      {editModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setEditModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Request Profile Correction</h4>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem 0 1.25rem', borderBottom: '1px solid #ECEBE5' }}>
              <button
                type="button"
                onClick={() => setCorrectionType('phone')}
                style={{
                  background: correctionType === 'phone' ? '#167C72' : '#F4F2EC',
                  color: correctionType === 'phone' ? '#FFF' : '#172B32',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Mobile Phone
              </button>
              <button
                type="button"
                onClick={() => setCorrectionType('photo')}
                style={{
                  background: correctionType === 'photo' ? '#167C72' : '#F4F2EC',
                  color: correctionType === 'photo' ? '#FFF' : '#172B32',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Profile Photo / Avatar
              </button>
            </div>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: '#167C72' }}>
                <CheckCircle2 size={42} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Request Submitted to HR Admin!</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
                  Your request is queued for verification. Changes will reflect once approved.
                </p>
              </div>
            ) : (
              <div className={styles.modalBody}>
                {correctionType === 'phone' ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#718096', marginBottom: '0.25rem' }}>
                        Supervisor ID (Locked)
                      </label>
                      <input type="text" className={styles.formInput} value={profile.supervisorId} disabled />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#172B32', marginBottom: '0.25rem' }}>
                        Proposed Mobile Phone *
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 98220 99441"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#172B32', marginBottom: '0.35rem' }}>
                      Choose New Profile Photo (JPG, PNG)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      style={{ fontSize: '0.82rem', marginTop: '0.25rem' }} 
                    />
                    {photoPreview && (
                      <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #167C72' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#172B32', marginBottom: '0.25rem' }}>
                    Reason for Correction *
                  </label>
                  <textarea
                    rows={2}
                    className={styles.formInput}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Provide justification or document reference..."
                  />
                </div>
              </div>
            )}

            {!submitSuccess && (
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button className={styles.btnPrimary} onClick={handleSaveContact} disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
