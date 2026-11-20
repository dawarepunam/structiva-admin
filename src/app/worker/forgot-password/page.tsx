'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkerForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F2EC', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #167C72, #0E564F)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#FFF' }}>
            <HardHat size={30} />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#172B32', margin: 0 }}>
            Reset Security PIN
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.3rem' }}>
            Enter your Worker ID or Registered Phone Number
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
            <CheckCircle2 size={44} style={{ margin: '0 auto 0.5rem auto' }} />
            <h3 style={{ margin: 0 }}>Reset Request Sent</h3>
            <p style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '0.4rem', lineHeight: '1.5' }}>
              Your Site Supervisor (Er. Pravin Gaikwad) has received a PIN reset token request. Please contact your site office or check your registered mobile phone for OTP.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/worker/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#167C72', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                <ArrowLeft size={16} /> Return to Worker Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                Worker ID / Registered Mobile
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. WRK-MUM-104 or +91 98220 12345"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '0.75rem', background: '#167C72', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              Send Reset Instructions <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <Link href="/worker/login" style={{ color: '#6B7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
