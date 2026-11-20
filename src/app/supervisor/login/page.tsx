'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Login.module.css';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { setStrapiToken } from '@/services/strapiClient';

function SupervisorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/supervisor/dashboard';

  const [identifier, setIdentifier] = useState('SUP-PUN-084');
  const [password, setPassword] = useState('StructivaPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated with a valid session, automatically redirect to dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingSession = localStorage.getItem('structiva_supervisor_session');
      const existingToken = localStorage.getItem('structiva_strapi_jwt');
      if (existingSession && existingToken) {
        router.replace(returnUrl);
      }
    }
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError('Please enter your Supervisor Official ID or Email.');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate against Strapi backend /api/auth/local
      const res = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedId, password })
      });

      const data = await res.json();

      if (!res.ok || !data.jwt) {
        const errorMsg = data?.error?.message || 'Invalid Official ID, Email, or Password. Please check your credentials.';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // 2. Fetch official supervisor profile details from Strapi /api/supervisors
      let supervisorDetails = null;
      try {
        const filterQuery = trimmedId.includes('@')
          ? `filters[officialEmail][$eq]=${encodeURIComponent(trimmedId)}`
          : `filters[supervisorId][$eq]=${encodeURIComponent(trimmedId)}`;
        
        const supRes = await fetch(`http://localhost:1337/api/supervisors?${filterQuery}`, {
          headers: {
            'Authorization': `Bearer ${data.jwt}`
          }
        });

        if (supRes.ok) {
          const supData = await supRes.json();
          if (supData?.data && supData.data.length > 0) {
            supervisorDetails = supData.data[0];
          }
        }
      } catch (profileErr) {
        console.warn('Could not retrieve detailed supervisor profile, using authentication record:', profileErr);
      }

      // 3. Verify Account Status
      if (supervisorDetails && supervisorDetails.accountStatus && supervisorDetails.accountStatus !== 'Active') {
        setError(`Your account status is ${supervisorDetails.accountStatus}. Please contact Project Director.`);
        setLoading(false);
        return;
      }

      // 4. Store authenticated JWT and session
      setStrapiToken(data.jwt);

      const sessionPayload = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        name: supervisorDetails?.name || 'Er. Pravin Gaikwad',
        supervisorId: supervisorDetails?.supervisorId || data.user.username,
        designation: supervisorDetails?.designation || 'Chief Site Operations Supervisor',
        department: supervisorDetails?.department || 'Civil & Structural Engineering',
        assignedProject: supervisorDetails?.assignedProject || 'Skyline Commercial Complex (Tower A)',
        assignedSite: supervisorDetails?.assignedSite || 'Tower A (Core & Podium)',
        role: 'Supervisor',
        authenticatedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('structiva_supervisor_session', JSON.stringify(sessionPayload));
      }

      // 5. Navigate to destination
      router.replace(returnUrl);
    } catch (err: any) {
      console.error('Supervisor login network error:', err);
      setError('Unable to reach authentication server. Please verify backend connectivity.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>S</div>
          <h1 className={styles.brandName}>STRUCTIVA</h1>
          <p className={styles.portalTitle}>Chief Field Supervisor Operations Portal</p>
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="supervisor-id">
              Supervisor Official ID or Email
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input 
                id="supervisor-id"
                type="text" 
                required 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                className={styles.inputField} 
                placeholder="e.g. SUP-PUN-084 or p.gaikwad@structiva.internal"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="supervisor-password">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input 
                id="supervisor-password"
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={styles.inputField} 
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePasswordBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Sign In to Supervisor Portal</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.footerNote}>
          <span>2026 STRUCTIVA ENTERPRISE OS</span>
          <span>High Security Field Operations Node • Level 2 Clearance</span>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorLoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.loginContainer}>
        <div className={styles.loginCard} style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: '#167C72' }} />
        </div>
      </div>
    }>
      <SupervisorLoginForm />
    </Suspense>
  );
}
