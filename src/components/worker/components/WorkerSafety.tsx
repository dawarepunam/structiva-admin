'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  ShieldAlert,
  AlertTriangle,
  Camera,
  CheckCircle2,
  PhoneCall,
  Flame,
  HardHat,
  HeartPulse
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerSafetyProps {
  worker: WorkerProfile;
}

export default function WorkerSafetyView({ worker }: WorkerSafetyProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [hazardType, setHazardType] = useState('Fall Hazard / Missing Edge Protection');
  const [severity, setSeverity] = useState('Critical');
  const [location, setLocation] = useState('Level 14 East Face');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [incidents, setIncidents] = useState([
    {
      id: 'SAF-2026-012',
      title: 'Damaged Edge Protection Guardrail at Level 14 East Face',
      category: 'Fall Hazard',
      severity: 'Critical',
      location: 'Level 14 Core Zone',
      time: '19 Nov 2026, 09:15 AM',
      status: 'In Progress',
      actionTaken: 'Red barricade tape deployed; scaffold gang assigned for welded replacement.'
    },
    {
      id: 'SAF-2026-008',
      title: 'Damaged 3-Phase Extension Cable Insulation near Tower Crane Base',
      category: 'Electrical Hazard',
      severity: 'High',
      location: 'Ground Podium A',
      time: '10 Nov 2026, 02:40 PM',
      status: 'Resolved',
      actionTaken: 'Site electrician replaced industrial cable reel and certified ELCB trip testing.'
    }
  ]);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setIncidents([
        {
          id: `SAF-2026-0${incidents.length + 13}`,
          title: `${hazardType} at ${location}`,
          category: 'Safety Hazard',
          severity,
          location,
          time: 'Just now',
          status: 'Submitted',
          actionTaken: 'Safety Officer and Site Supervisor alerted via radio.'
        },
        ...incidents
      ]);

      setTimeout(() => {
        setSuccessMsg(false);
        setShowReportModal(false);
        setDescription('');
      }, 1500);
    }, 600);
  };

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            Site Safety Center & Hazard Reporting
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Zero-harm safety policy • Report hazards, near-misses and unsafe conditions
          </div>
        </div>

        <button 
          className={styles.btnPrimary} 
          style={{ background: '#DC2626' }}
          onClick={() => setShowReportModal(true)}
        >
          <ShieldAlert size={16} /> Report Safety Hazard
        </button>
      </div>

      {/* Emergency Contacts Banner */}
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#991B1B', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartPulse size={18} /> Immediate Site Emergency Contacts
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.82rem', color: '#7F1D1D' }}>
          <div>
            <strong>Site First Aid Room:</strong>
            <div>Ground Floor Podium A (+91 98220 33412)</div>
          </div>
          <div>
            <strong>Safety Officer Desk:</strong>
            <div>Officer Vikas Deshmukh (+91 98220 55621)</div>
          </div>
          <div>
            <strong>Emergency Ambulance:</strong>
            <div>Columbia Asia Hospital Kharadi (108 / 020-6165 6666)</div>
          </div>
        </div>
      </div>

      {/* Reported Hazards Log */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <AlertTriangle size={18} color="#D97706" />
            <span>Hazard Submittals & Rectification Logs</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {incidents.map((inc) => (
            <div key={inc.id} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F8F9FA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 600, color: '#172B32', fontSize: '0.95rem' }}>
                  {inc.title}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={`${styles.badge} ${inc.severity === 'Critical' ? styles.badgeDanger : styles.badgeWarning}`}>
                    {inc.severity}
                  </span>
                  <span className={`${styles.badge} ${inc.status === 'Resolved' ? styles.badgeSuccess : styles.badgeInfo}`}>
                    {inc.status}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.4rem' }}>
                Reported at {inc.time} • Location: {inc.location} • Category: {inc.category}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#065F46', background: '#ECFDF5', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                <strong>Rectification Action:</strong> {inc.actionTaken}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Hazard Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '500px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={20} /> Report Site Hazard / Unsafe Condition
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>
              Your report immediately alerts the Site Safety Officer and Supervisor on duty.
            </p>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Safety Incident Alert Transmitted</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>
                  Safety Officer Deshmukh and Er. Pravin Gaikwad notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Hazard Type
                  </label>
                  <select 
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="Fall Hazard / Missing Edge Protection">Fall Hazard / Missing Edge Protection</option>
                    <option value="Scaffolding / Shuttering Instability">Scaffolding / Shuttering Instability</option>
                    <option value="Electrical Cable / Power Hazard">Electrical Cable / Power Hazard</option>
                    <option value="Heavy Machinery / Crane Clearance">Heavy Machinery / Crane Clearance</option>
                    <option value="Falling Objects / Overhead Danger">Falling Objects / Overhead Danger</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                      Severity Level
                    </label>
                    <select 
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      <option value="Critical">Critical (Immediate stop work)</option>
                      <option value="High">High (High potential injury)</option>
                      <option value="Medium">Medium (Attention required)</option>
                      <option value="Low">Low (Minor housekeeping)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                      Exact Location / Level
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Describe Hazard & Risk
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Describe what is damaged, missing, or hazardous..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    onClick={() => setShowReportModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.btnPrimary} 
                    style={{ background: '#DC2626' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Transmitting...' : 'Send Safety Report'}
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
