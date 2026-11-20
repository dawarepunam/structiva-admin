'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, CheckCircle2, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function WorkerActivatePage() {
  const router = useRouter();
  const [workerCode, setWorkerCode] = useState('WRK-MUM-104');
  const [mobileOtp, setMobileOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setActivated(true);
    setTimeout(() => {
      router.push('/worker/login');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F2EC', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #167C72, #0E564F)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#FFF' }}>
            <HardHat size={30} />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#172B32', margin: 0 }}>
            Activate Worker Credentials
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.3rem' }}>
            Set your secret 4-digit security PIN for daily site muster & work orders
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '0.75rem', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {activated ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
            <CheckCircle2 size={44} style={{ margin: '0 auto 0.5rem auto' }} />
            <h3 style={{ margin: 0 }}>Account Activated!</h3>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '0.3rem' }}>
              Redirecting to Worker Portal login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleActivate}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                Assigned Worker ID Code
              </label>
              <input 
                type="text" 
                required 
                value={workerCode}
                onChange={(e) => setWorkerCode(e.target.value)}
                placeholder="e.g. WRK-MUM-104"
                style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                Activation SMS OTP / Supervisor Code
              </label>
              <input 
                type="text" 
                required 
                placeholder="Enter 6-digit OTP received on mobile"
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                  Create 4-Digit PIN
                </label>
                <input 
                  type="password" 
                  maxLength={6} 
                  required 
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
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
                  style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '0.75rem', background: '#167C72', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              Activate Account & Set PIN <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
          Already activated? <Link href="/worker/login" style={{ color: '#167C72', fontWeight: 600, textDecoration: 'none' }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
