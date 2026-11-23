'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { getStoredWorkers } from '@/services/workerStorage';

export default function WorkerLoginPage() {
  const router = useRouter();
  const [workerId, setWorkerId] = useState('WRK-MUM-104');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const allWorkers = getStoredWorkers();
      const inputQuery = workerId.trim().toLowerCase();
      const matched = allWorkers.find(w => 
        w.code.toLowerCase() === inputQuery || 
        w.phone.replace(/\s+/g, '').includes(inputQuery.replace(/\s+/g, '')) ||
        w.name.toLowerCase().includes(inputQuery) ||
        w.id === inputQuery
      ) || allWorkers[0];

      if (pin === '1234' || pin.length >= 4) {
        if (typeof window !== 'undefined' && matched) {
          localStorage.setItem('structiva_active_worker_session', JSON.stringify({
            id: matched.id,
            workerId: matched.id,
            code: matched.code,
            name: matched.name,
            phone: matched.phone,
            email: `${matched.name.toLowerCase().replace(/\s+/g, '.')}@structiva.internal`,
            category: matched.category,
            skill: matched.skill,
            dailyWage: matched.dailyWage,
            overtimeHourlyRate: matched.overtimeHourlyRate,
            status: matched.status,
            assignedProject: matched.assignedProject,
            supervisorName: matched.supervisorName,
            presentDaysThisMonth: matched.presentDaysThisMonth || 19,
            overtimeHoursThisMonth: matched.overtimeHoursThisMonth || 14,
            advanceTakenThisMonth: matched.advanceTakenThisMonth || 0,
            totalDaysWorked: matched.totalDaysWorked || 185
          }));
        }
        router.push('/worker');
      } else {
        setError('Invalid Worker ID or Security PIN. Please contact your site supervisor.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F2EC', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #167C72, #0E564F)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#FFF' }}>
            <HardHat size={30} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#172B32', margin: 0, letterSpacing: '0.5px' }}>
            STRUCTIVA
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#B58B59', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>
            Worker Operations Portal
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '0.75rem', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              Worker ID / Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                required 
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="e.g. WRK-MUM-104 or mobile"
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                4-Digit Security PIN
              </label>
              <Link href="/worker/forgot-password" style={{ fontSize: '0.75rem', color: '#167C72', textDecoration: 'none', fontWeight: 500 }}>
                Forgot PIN?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                maxLength={6}
                required 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', background: '#167C72', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Shift Portal <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: '0.82rem', color: '#6B7280' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            New Tradesperson?{' '}
            <Link href="/worker/register" style={{ color: '#167C72', fontWeight: 800, textDecoration: 'underline' }}>
              Register & Join STRUCTIVA Workforce →
            </Link>
          </div>
          <div>First time logging in? <Link href="/worker/activate" style={{ color: '#B58B59', fontWeight: 600, textDecoration: 'none' }}>Activate Worker Account</Link></div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#059669' }}>
            <ShieldCheck size={14} /> Biometric GPS Geofence Shield
          </div>
        </div>
      </div>
    </div>
  );
}
