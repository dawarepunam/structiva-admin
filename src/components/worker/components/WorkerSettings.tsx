'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  Settings,
  KeyRound,
  Globe,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerSettingsProps {
  worker: WorkerProfile;
}

export default function WorkerSettingsView({ worker }: WorkerSettingsProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState('');

  const [language, setLanguage] = useState('en');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [shiftReminders, setShiftReminders] = useState(true);

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (newPin !== confirmPin) {
      setPinError('New PINs do not match.');
      return;
    }
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits.');
      return;
    }

    setPinSuccess(true);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinSuccess(false), 3000);
  };

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            Account Security & Preferences
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Manage portal PIN, notification preferences, and multi-lingual display
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Change Portal PIN */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <KeyRound size={18} color="#167C72" />
              <span>Change Portal Security PIN</span>
            </div>
          </div>

          {pinSuccess && (
            <div style={{ padding: '0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', color: '#065F46', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Security PIN updated successfully.
            </div>
          )}

          {pinError && (
            <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1rem' }}>
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinChange}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                Current 4-Digit PIN
              </label>
              <input 
                type="password" 
                maxLength={6} 
                required 
                placeholder="••••"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                  New PIN
                </label>
                <input 
                  type="password" 
                  maxLength={6} 
                  required 
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                  Confirm PIN
                </label>
                <input 
                  type="password" 
                  maxLength={6} 
                  required 
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
              <Lock size={15} /> Update Security PIN
            </button>
          </form>
        </div>

        {/* Language & Notifications */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Globe size={18} color="#167C72" />
              <span>Language & Portal Settings</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              Portal Display Language
            </label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
            >
              <option value="en">English (Default)</option>
              <option value="mr">मराठी (Marathi - Regional)</option>
              <option value="hi">हिन्दी (Hindi - National)</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem', display: 'block' }}>
              Multi-language audio assistance available in future release.
            </span>
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.88rem', color: '#172B32' }}>
              SMS & Mobile Notification Preferences
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={smsAlerts} 
                  onChange={(e) => setSmsAlerts(e.target.checked)} 
                  style={{ accentColor: '#167C72' }}
                />
                <span>SMS Alert upon Monthly Salary / Advance Bank Transfer</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={shiftReminders} 
                  onChange={(e) => setShiftReminders(e.target.checked)} 
                  style={{ accentColor: '#167C72' }}
                />
                <span>Daily 08:00 AM Shift Check-in & Tool-box Talk Reminder</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
