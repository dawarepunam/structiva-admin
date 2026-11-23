'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HardHat, 
  Truck, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

type UserRole = 'worker' | 'driver';
type AuthStep = 'email_entry' | 'verify_otp' | 'security_pin';

export default function UnifiedWorkerDriverLoginPage() {
  const router = useRouter();

  // 1. Role Selection: Site Worker vs Commercial Driver
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');

  // 2. Primary Identification: Registered Email Address
  const [email, setEmail] = useState('ramesh.patil@structiva.internal');

  // 3. Two-Step Authentication State
  const [authStep, setAuthStep] = useState<AuthStep>('email_entry');
  const [otpCode, setOtpCode] = useState('');
  const [securityPin, setSecurityPin] = useState('1234');
  
  // 4. UI feedback & cooldown timer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Quick switch role preset
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setSuccessMsg('');
    if (role === 'worker') {
      setEmail('ramesh.patil@structiva.internal');
    } else {
      setEmail('santosh.shinde@structiva.internal'); // Registered Heavy Equipment Operator / Driver
    }
  };

  // Cooldown countdown timer
  const startCooldown = (seconds = 45) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // STEP 1: Request Email OTP Dispatch
  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/worker-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: email.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setSuccessMsg(
        data.sandboxCode 
          ? `Verification OTP generated. [Dev Code: ${data.sandboxCode}]` 
          : `Verification code sent to ${email}. Valid for 5 minutes.`
      );
      if (data.sandboxCode) {
        setOtpCode(data.sandboxCode);
      }
      setAuthStep('verify_otp');
      startCooldown(45);
    } catch (err: any) {
      setError(err.message || 'Email OTP dispatch failed. Check network or email format.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Email OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/worker-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: email.trim(),
          otp: otpCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      // Progress to Step 3: Security PIN confirmation
      setSuccessMsg('Email verified successfully! Enter your 4-digit Security PIN to complete login.');
      setAuthStep('security_pin');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Unified Login with Strict Server-Side Role Authorization
  const handleCompleteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          identifier: email.trim(),
          pin: securityPin.trim(),
          authMethod: 'two_factor'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication rejected by security policy.');
      }

      // Store authenticated session
      if (typeof window !== 'undefined') {
        const sessionPayload = {
          ...data.user,
          authenticatedAt: new Date().toISOString(),
          sessionToken: data.token
        };

        if (selectedRole === 'worker') {
          localStorage.setItem('structiva_active_worker_session', JSON.stringify(sessionPayload));
          router.push('/worker');
        } else {
          localStorage.setItem('structiva_active_driver_session', JSON.stringify(sessionPayload));
          localStorage.setItem('structiva_active_worker_session', JSON.stringify(sessionPayload));
          router.push(data.portalRoute || '/worker#tasks');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  // Direct PIN login option for backward compatibility & recognized field devices
  const handleDirectPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          identifier: email.trim(),
          pin: securityPin.trim(),
          authMethod: 'pin'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication rejected.');
      }

      if (typeof window !== 'undefined') {
        const sessionPayload = {
          ...data.user,
          authenticatedAt: new Date().toISOString(),
          sessionToken: data.token
        };

        if (selectedRole === 'worker') {
          localStorage.setItem('structiva_active_worker_session', JSON.stringify(sessionPayload));
          router.push('/worker');
        } else {
          localStorage.setItem('structiva_active_driver_session', JSON.stringify(sessionPayload));
          localStorage.setItem('structiva_active_worker_session', JSON.stringify(sessionPayload));
          router.push(data.portalRoute || '/worker#tasks');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Direct PIN login failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F2EC', padding: '1.25rem', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEBE5', padding: '2.25rem 2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '54px', height: '54px', background: selectedRole === 'worker' ? 'linear-gradient(135deg, #167C72, #0E564F)' : 'linear-gradient(135deg, #203A3B, #172B32)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#FFF' }}>
            {selectedRole === 'worker' ? <HardHat size={30} /> : <Truck size={30} />}
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172B32', margin: 0, letterSpacing: '0.5px' }}>
            STRUCTIVA
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#B58B59', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>
            Unified Workforce & Driver Access
          </div>
        </div>

        {/* Role Switcher Pill Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px', background: '#F4F2EC', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => handleRoleChange('worker')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              background: selectedRole === 'worker' ? '#FFFFFF' : 'transparent',
              color: selectedRole === 'worker' ? '#167C72' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: selectedRole === 'worker' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <HardHat size={15} />
            <span>Site Worker</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('driver')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              background: selectedRole === 'driver' ? '#FFFFFF' : 'transparent',
              color: selectedRole === 'driver' ? '#203A3B' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: selectedRole === 'driver' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Truck size={15} />
            <span>Commercial Driver</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '0.75rem', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '0.75rem', color: '#065F46', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── STEP 1: Enter Registered Email Address ── */}
        {authStep === 'email_entry' && (
          <form onSubmit={handleRequestEmailOtp}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Registered Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@structiva.internal"
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.35rem' }}>
                Registered email address for two-step OTP verification
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: selectedRole === 'worker' ? '#167C72' : '#203A3B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
            >
              {loading ? 'Verifying Account...' : (
                <>
                  Send Email Verification Code <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Quick PIN login option */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setAuthStep('security_pin')}
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Log in directly with Security PIN →
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Verify Email OTP ── */}
        {authStep === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                  6-Digit Email Verification Code
                </label>
                {resendCooldown > 0 ? (
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestEmailOtp}
                    style={{ background: 'none', border: 'none', color: '#167C72', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  maxLength={6}
                  required 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || otpCode.length < 6}
              style={{ width: '100%', padding: '0.75rem', background: '#167C72', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
            >
              {loading ? 'Verifying...' : (
                <>
                  Verify Code & Continue <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setAuthStep('email_entry'); setError(''); }}
              style={{ width: '100%', background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              ← Change Email Address
            </button>
          </form>
        )}

        {/* ── STEP 3: Security PIN Confirmation ── */}
        {authStep === 'security_pin' && (
          <form onSubmit={handleDirectPinLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Registered Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.88rem', background: '#F8FAFC' }}
              />
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
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="••••"
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: selectedRole === 'worker' ? '#167C72' : '#203A3B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
            >
              {loading ? 'Authorizing Session...' : (
                <>
                  Authenticate as {selectedRole === 'worker' ? 'Site Worker' : 'Commercial Driver'} <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setAuthStep('email_entry'); setError(''); }}
              style={{ width: '100%', background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              ← Use Email OTP Verification
            </button>
          </form>
        )}

        {/* Footer Actions */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: '0.82rem', color: '#6B7280' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            New Tradesperson or Driver?{' '}
            <Link href="/worker/register" style={{ color: '#167C72', fontWeight: 800, textDecoration: 'underline' }}>
              Register & Join STRUCTIVA Workforce →
            </Link>
          </div>
          <div>First time logging in? <Link href="/worker/activate" style={{ color: '#B58B59', fontWeight: 600, textDecoration: 'none' }}>Activate Security Credentials</Link></div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#059669' }}>
            <ShieldCheck size={14} /> Biometric GPS Geofence & Role Authorization Shield
          </div>
        </div>

      </div>
    </div>
  );
}
