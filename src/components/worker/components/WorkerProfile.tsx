'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  CreditCard,
  FileCheck2,
  AlertCircle,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  Upload,
  Edit3,
  X,
  History,
  Info
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';
import { 
  WorkerProfileCorrectionRecord, 
  getStoredCorrections, 
  submitWorkerProfileCorrection,
  fetchCorrectionsFromBackend
} from '@/services/profileCorrectionStorage';

interface WorkerProfileProps {
  worker: WorkerProfile;
  onProfileUpdated?: (updated: WorkerProfile) => void;
}

const EDITABLE_FIELDS = [
  { key: 'phone', label: 'Mobile Phone Number', placeholder: '+91 98220 XXXXX' },
  { key: 'email', label: 'Email Address', placeholder: 'name@structiva.internal' },
  { key: 'address', label: 'Current Residential Address', placeholder: 'Flat/Room, Chawl, Area, City, PIN' },
  { key: 'hometown', label: 'Hometown / Origin District', placeholder: 'e.g. Satara, Maharashtra' },
  { key: 'emergencyContact', label: 'Emergency Contact Phone', placeholder: '+91 94220 XXXXX' },
  { key: 'emergencyRelation', label: 'Emergency Contact Relationship', placeholder: 'e.g. Wife, Brother, Father' }
];

export default function WorkerProfileView({ worker, onProfileUpdated }: WorkerProfileProps) {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionType, setCorrectionType] = useState<'field' | 'photo'>('field');
  const [selectedFieldKey, setSelectedFieldKey] = useState('phone');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Photo change state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileError, setPhotoFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // My Correction Requests list
  const [myCorrections, setMyCorrections] = useState<WorkerProfileCorrectionRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const loadWorkerCorrections = async () => {
    setLoadingRequests(true);
    try {
      const all = await fetchCorrectionsFromBackend();
      const filtered = all.filter(c => 
        String(c.workerId) === String(worker.id) || 
        c.workerCode === worker.code
      );
      setMyCorrections(filtered);
    } catch {
      const local = getStoredCorrections().filter(c => 
        String(c.workerId) === String(worker.id) || 
        c.workerCode === worker.code
      );
      setMyCorrections(local);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadWorkerCorrections();

    const handleUpdate = () => {
      const local = getStoredCorrections().filter(c => 
        String(c.workerId) === String(worker.id) || 
        c.workerCode === worker.code
      );
      setMyCorrections(local);
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('correctionsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('correctionsUpdated', handleUpdate);
    };
  }, [worker.id, worker.code]);

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setPhotoFileError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }

    // Validate size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setPhotoFileError('File size must be less than 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const currentFieldMeta = useMemo(() => {
    return EDITABLE_FIELDS.find(f => f.key === selectedFieldKey) || EDITABLE_FIELDS[0];
  }, [selectedFieldKey]);

  const currentFieldValue = useMemo(() => {
    return (worker as any)[selectedFieldKey] || 'Not specified';
  }, [worker, selectedFieldKey]);

  const handleOpenCorrection = (type: 'field' | 'photo' = 'field', defaultField?: string) => {
    setCorrectionType(type);
    if (defaultField) setSelectedFieldKey(defaultField);
    setRequestedValue('');
    setReason('');
    setPhotoPreview(null);
    setPhotoFileError(null);
    setSubmittedMessage(false);
    setShowCorrectionModal(true);
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please enter a justification / reason for correction.');
      return;
    }

    if (correctionType === 'field' && !requestedValue.trim()) {
      alert('Please enter the proposed new value.');
      return;
    }

    if (correctionType === 'photo' && !photoPreview) {
      alert('Please select and preview a new profile photo.');
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      await submitWorkerProfileCorrection({
        workerId: String(worker.id),
        workerName: worker.name,
        workerCode: worker.code,
        project: worker.assignedProject || 'Skyline Commercial Complex (Tower A)',
        site: 'Tower A Core & Podium',
        supervisorName: worker.supervisorName || 'Er. Pravin Gaikwad',
        fieldName: correctionType === 'photo' ? 'avatar' : selectedFieldKey,
        fieldLabel: correctionType === 'photo' ? 'Official Profile Photo' : currentFieldMeta.label,
        oldValue: correctionType === 'photo' ? (worker.avatar || '/images/default_avatar.png') : String(currentFieldValue),
        newValue: correctionType === 'photo' ? (photoPreview || '') : requestedValue,
        isPhotoChange: correctionType === 'photo',
        oldPhotoUrl: worker.avatar || '/images/default_avatar.png',
        newPhotoUrl: photoPreview || undefined,
        reason: reason.trim(),
        submittedDate: today
      });

      setSubmittedMessage(true);
      await loadWorkerCorrections();
      setTimeout(() => {
        setSubmittedMessage(false);
        setShowCorrectionModal(false);
        setRequestedValue('');
        setReason('');
        setPhotoPreview(null);
      }, 1500);
    } catch (err) {
      console.error('Error submitting correction:', err);
      alert('Failed to submit correction request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header Profile Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            {worker.avatar && worker.avatar !== '#' ? (
              <img 
                src={worker.avatar} 
                alt={worker.name} 
                style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #167C72' }}
              />
            ) : (
              <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: '#167C72', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700 }}>
                {worker.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
            <button 
              onClick={() => handleOpenCorrection('photo')}
              title="Request profile photo change"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#172B32',
                color: '#FFF',
                border: '2px solid #FFF',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Camera size={13} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#172B32' }}>
                {worker.name}
              </h2>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                {worker.status || 'Active'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '0.2rem' }}>
              <strong>Worker ID:</strong> {worker.code} • <strong>Trade:</strong> {worker.skill || worker.category}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
              Assigned to <strong>{worker.assignedProject}</strong> under Supervisor <strong>{worker.supervisorName || 'Er. Pravin Gaikwad'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={styles.btnSecondary}
              onClick={() => handleOpenCorrection('photo')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Camera size={14} /> Change Photo
            </button>
            <button 
              className={styles.btnPrimary}
              onClick={() => handleOpenCorrection('field')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Edit3 size={14} /> Edit Profile Data
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Profile Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Personal & Contact Details */}
        <div className={styles.card} style={{ margin: 0 }}>
          <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={styles.cardTitle}>
              <User size={18} color="#167C72" />
              <span>Personal & Contact Information</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Permitted for Correction
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: '#6B7280' }}>Mobile Phone:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.phone || '+91 98220 12345'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Email Address:</span>
              <div style={{ fontWeight: 600, color: '#172B32', wordBreak: 'break-all' }}>{worker.email || 'ramesh.patil@structiva.internal'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Date of Birth:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.dob || '15 Jun 1988'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Gender / Blood Group:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.gender || 'Male'} • {worker.bloodGroup || 'B+'}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#6B7280' }}>Current Residential Address:</span>
              <div style={{ fontWeight: 500, color: '#172B32', marginTop: '0.2rem', lineHeight: '1.4' }}>
                {worker.address || 'Room 14, Chawl No. 4, Kharadi Gaon, Pune, Maharashtra 411014'}
              </div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Hometown / Origin:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.hometown || 'Satara, Maharashtra'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Emergency Contact:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.emergencyContact || '+91 94220 88771'} ({worker.emergencyRelation || 'Wife'})</div>
            </div>
          </div>
        </div>

        {/* Trade & Employment Details (PROTECTED ADMIN FIELDS) */}
        <div className={styles.card} style={{ margin: 0 }}>
          <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={styles.cardTitle}>
              <Briefcase size={18} color="#167C72" />
              <span>Employment & Wage Profile</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Admin Controlled (Protected)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: '#6B7280' }}>Skill Category:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.category}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Designation:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.skill || 'Structural Tradesperson'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Daily Base Wage:</span>
              <div style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>₹{worker.dailyWage || 950} / day</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Overtime Rate:</span>
              <div style={{ fontWeight: 700, color: '#2563EB', fontSize: '1rem' }}>₹{worker.overtimeHourlyRate || 140} / hr</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Employment Type:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.employmentType || 'Direct Payroll'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Joining Date:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.joiningDate || '10 Apr 2023'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Safety Certified:</span>
              <div style={{ fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={16} /> Certified (Induction Complete)
              </div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Total Days Worked:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.totalDaysWorked || 185} Days</div>
            </div>
          </div>
        </div>

        {/* Bank & Compliance Details */}
        <div className={styles.card} style={{ gridColumn: '1 / -1', margin: 0 }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <CreditCard size={18} color="#167C72" />
              <span>Banking & Government Compliance</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: '#6B7280' }}>Bank Name:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.bankName || 'State Bank of India'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Account Number:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.accountNumberMasked || '•••• •••• 4519'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>IFSC Code:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.ifscCode || 'SBIN0004521'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Aadhaar Number:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.aadhaarNumber || 'XXXX-XXXX-8921'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: MY CORRECTION REQUESTS
          ───────────────────────────────────────────────────────────── */}
      <div className={styles.card} style={{ marginTop: '1.5rem' }}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className={styles.cardTitle}>
            <History size={18} color="#167C72" />
            <span>My Correction Requests</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Showing {myCorrections.length} correction submittals
          </span>
        </div>

        {loadingRequests ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
            Loading your correction requests history...
          </div>
        ) : myCorrections.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
            No profile correction requests submitted yet. You can request changes to phone, address, emergency contact or profile photo anytime.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {myCorrections.map(req => {
              const statusColor = 
                req.status === 'Approved' ? '#059669' :
                req.status === 'Rejected' ? '#DC2626' : '#D97706';
              const statusBg = 
                req.status === 'Approved' ? '#D1FAE5' :
                req.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7';

              return (
                <div 
                  key={req.id}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#172B32', fontSize: '0.92rem' }}>
                          {req.fieldLabel || req.fieldName}
                        </span>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          color: statusColor, 
                          background: statusBg, 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '12px' 
                        }}>
                          {req.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                        Ticket ID: <strong>{req.id}</strong> &middot; Submitted on {req.submittedDate}
                      </div>
                    </div>

                    {req.reviewedDate && (
                      <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>
                        Reviewed on <strong>{req.reviewedDate}</strong> by {req.reviewedBy || 'Admin'}
                      </div>
                    )}
                  </div>

                  {/* Values comparison */}
                  {req.isPhotoChange ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.2rem' }}>Original Photo</div>
                        <img 
                          src={req.oldPhotoUrl || '/images/default_avatar.png'} 
                          alt="Old photo" 
                          style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #D1D5DB' }}
                        />
                      </div>
                      <span style={{ color: '#9CA3AF', fontSize: '1.2rem' }}>&rarr;</span>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#167C72', fontWeight: 600, marginBottom: '0.2rem' }}>Requested Photo</div>
                        <img 
                          src={req.newPhotoUrl || '/images/default_avatar.png'} 
                          alt="New photo" 
                          style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #167C72' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#FFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#6B7280' }}>Previous Value:</span>
                        <div style={{ fontWeight: 600, color: '#4B5563', wordBreak: 'break-all' }}>{req.oldValue || '—'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#167C72' }}>Requested New Value:</span>
                        <div style={{ fontWeight: 600, color: '#167C72', wordBreak: 'break-all' }}>{req.newValue}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.78rem', color: '#4B5563' }}>
                    <strong>Reason:</strong> {req.reason}
                  </div>

                  {req.adminRemarks && (
                    <div style={{ 
                      fontSize: '0.78rem', 
                      background: req.status === 'Approved' ? '#ECFDF5' : '#FEF2F2', 
                      padding: '0.55rem 0.75rem', 
                      borderRadius: '6px', 
                      border: `1px solid ${req.status === 'Approved' ? '#A7F3D0' : '#FECACA'}`,
                      color: req.status === 'Approved' ? '#065F46' : '#991B1B'
                    }}>
                      <strong>Admin Feedback:</strong> {req.adminRemarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT PROFILE / PHOTO CORRECTION REQUEST
          ───────────────────────────────────────────────────────────── */}
      {showCorrectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '520px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#172B32' }}>
                {correctionType === 'photo' ? 'Request Profile Photo Change' : 'Request Profile Information Correction'}
              </h3>
              <button 
                onClick={() => setShowCorrectionModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.65rem' }}>
              <button 
                type="button"
                onClick={() => setCorrectionType('field')}
                style={{
                  background: correctionType === 'field' ? '#167C72' : '#F3F4F6',
                  color: correctionType === 'field' ? '#FFF' : '#4B5563',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Personal Data
              </button>
              <button 
                type="button"
                onClick={() => setCorrectionType('photo')}
                style={{
                  background: correctionType === 'photo' ? '#167C72' : '#F3F4F6',
                  color: correctionType === 'photo' ? '#FFF' : '#4B5563',
                  border: 'none',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Profile Photo
              </button>
            </div>

            {submittedMessage ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Correction Request Submitted to Admin</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>
                  The change will appear on your official profile once verified and approved by Admin.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCorrectionSubmit}>
                {correctionType === 'field' ? (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                        Select Field to Correct
                      </label>
                      <select 
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                        value={selectedFieldKey}
                        onChange={(e) => {
                          setSelectedFieldKey(e.target.value);
                          setRequestedValue('');
                        }}
                      >
                        {EDITABLE_FIELDS.map(f => (
                          <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem', background: '#F9FAFB', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <span style={{ color: '#6B7280' }}>Current Value on Record:</span>
                      <div style={{ fontWeight: 600, color: '#172B32', marginTop: '0.15rem' }}>
                        {String(currentFieldValue)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                        Proposed New Value *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder={currentFieldMeta.placeholder} 
                        style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                        value={requestedValue}
                        onChange={(e) => setRequestedValue(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '0.3rem' }}>Current Photo</div>
                          <img 
                            src={worker.avatar || '/images/default_avatar.png'} 
                            alt="Current" 
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D1D5DB' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#167C72', fontWeight: 600, marginBottom: '0.3rem' }}>Proposed Photo</div>
                          {photoPreview ? (
                            <img 
                              src={photoPreview} 
                              alt="New preview" 
                              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #167C72' }}
                            />
                          ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F3F4F6', border: '2px dashed #9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.7rem' }}>
                              Select File
                            </div>
                          )}
                        </div>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        onChange={handlePhotoSelect} 
                        style={{ display: 'none' }} 
                      />

                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className={styles.btnSecondary}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={14} /> Choose Image File (Max 3MB)
                      </button>

                      {photoFileError && (
                        <div style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                          {photoFileError}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Reason for Correction *
                  </label>
                  <textarea 
                    rows={2} 
                    required 
                    placeholder="Explain why this change is necessary..." 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    onClick={() => setShowCorrectionModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.btnPrimary} 
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Correction Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
