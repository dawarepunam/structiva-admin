'use client';

import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerProfileProps {
  worker: WorkerProfile;
  onProfileUpdated?: (updated: WorkerProfile) => void;
}

export default function WorkerProfileView({ worker }: WorkerProfileProps) {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [fieldName, setFieldName] = useState('phone');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulating Strapi request submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedMessage(true);
      setTimeout(() => {
        setSubmittedMessage(false);
        setShowCorrectionModal(false);
        setRequestedValue('');
        setReason('');
      }, 2000);
    }, 600);
  };

  return (
    <div>
      {/* Header Profile Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#167C72', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
            {worker.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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

          <button 
            className={styles.btnSecondary}
            onClick={() => setShowCorrectionModal(true)}
          >
            Request Profile Correction
          </button>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Personal & Contact Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <User size={18} color="#167C72" />
              <span>Personal & Contact Information</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: '#6B7280' }}>Mobile Phone:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.phone || '+91 98220 12345'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Email Address:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.email || 'ramesh.patil@structiva.internal'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Date of Birth:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.dob || '15 Jun 1988'}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Gender / Blood Group:</span>
              <div style={{ fontWeight: 600, color: '#172B32' }}>{worker.gender || 'Male'} • {worker.bloodGroup || 'B+'}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#6B7280' }}>Current Residential Address:</span>
              <div style={{ fontWeight: 500, color: '#172B32', marginTop: '0.2rem' }}>
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

        {/* Trade & Employment Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Briefcase size={18} color="#167C72" />
              <span>Employment & Wage Profile</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.82rem' }}>
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
        <div className={styles.card} style={{ gridColumn: 'span 2' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <CreditCard size={18} color="#167C72" />
              <span>Banking & Government Compliance</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.82rem' }}>
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

      {/* Profile Correction Request Modal */}
      {showCorrectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '500px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#172B32' }}>
              Request Profile Information Correction
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Wages, skills and site assignments can only be authorized by Admin / HR. You may request corrections for phone, address or emergency contact.
            </p>

            {submittedMessage ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Request Submitted to HR Admin</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>Ticket generated. You will be notified once verified.</p>
              </div>
            ) : (
              <form onSubmit={handleCorrectionSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Field to Correct
                  </label>
                  <select 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                  >
                    <option value="phone">Mobile Phone Number</option>
                    <option value="address">Residential Address</option>
                    <option value="emergencyContact">Emergency Contact Number</option>
                    <option value="bankAccount">Bank Account / IFSC</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    New / Corrected Value
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter corrected information..." 
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Reason for Correction
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Provide justification or document reference..." 
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
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
