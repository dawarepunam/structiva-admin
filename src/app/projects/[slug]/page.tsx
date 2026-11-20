'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HomeHeader from '@/components/home/components/HomeHeader';
import HomeFooter from '@/components/home/components/HomeFooter';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { StrapiProjectData } from '@/components/home/types/homeTypes';
import { 
  Building2, 
  MapPin, 
  Lock, 
  UserCheck, 
  HardHat, 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Coins, 
  Truck,
  Users2,
  Calendar
} from 'lucide-react';

export default function ProtectedProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [project, setProject] = useState<StrapiProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check local storage or session for Supervisor or Worker session
    const supervisorAuth = typeof window !== 'undefined' ? localStorage.getItem('structiva_supervisor_auth') : null;
    const workerAuth = typeof window !== 'undefined' ? localStorage.getItem('structiva_worker_auth') : null;
    const strapiJwt = typeof window !== 'undefined' ? localStorage.getItem('structiva_strapi_jwt') : null;

    if (supervisorAuth || workerAuth || strapiJwt) {
      setIsAuthorized(true);
    }

    // Fetch project matching slug
    fetchStrapiCollection<StrapiProjectData>('projects', [])
      .then((data) => {
        const found = (data || []).find((p) => {
          const s = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return s === slug;
        });
        setProject(found || (data && data[0]) || null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <div style={{ textAlign: 'center' }}>
          <Building2 size={36} color="#167C72" style={{ animation: 'spin 1s infinite linear' }} />
          <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#172B32' }}>Loading project security credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#172B32', paddingTop: '80px', position: 'relative' }}>
      <HomeHeader />

      {/* Main Project Dossier (Blurred when unauthenticated) */}
      <div style={{ 
        filter: !isAuthorized ? 'blur(10px)' : 'none', 
        pointerEvents: !isAuthorized ? 'none' : 'auto',
        userSelect: !isAuthorized ? 'none' : 'auto',
        transition: 'filter 0.3s ease'
      }}>
        {/* Project Hero Banner */}
        <div style={{ height: '360px', position: 'relative', background: '#172B32', overflow: 'hidden' }}>
          <img 
            src={project?.image || '/images/commercial_tower.jpg'} 
            alt={project?.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(23,43,50,0.6) 0%, #172B32 100%)' }} />

          <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ECEBE5', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <ArrowLeft size={16} /> Back to Project Directory
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: '#167C72', color: '#FFF', padding: '0.3rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {project?.category}
              </span>
              <span style={{ background: '#059669', color: '#FFF', padding: '0.3rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {project?.status || 'Active Execution'}
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {project?.name}
            </h1>
          </div>
        </div>

        {/* Detailed Spec Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Executive Engineering Scope</h2>
              <p style={{ fontSize: '1rem', color: '#4B5563', lineHeight: '1.7', marginBottom: '2rem' }}>
                {project?.description}
              </p>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Quality & Structural Controls</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <strong>Concrete Mix Specification:</strong>
                  <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>Grade M50 / M60 with micro-silica durability blend.</div>
                </div>
                <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <strong>Weld NDT Certification:</strong>
                  <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>100% Ultrasonic & Magnetic Particle Inspection (MPI).</div>
                </div>
              </div>
            </div>

            {/* Sidebar Specifications */}
            <div>
              <div style={{ background: '#F8F9FA', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#172B32' }}>Commercial & Fleet Metrics</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: '0.75rem' }}>Client Authority</span>
                    <strong style={{ color: '#172B32' }}>{project?.client}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: '0.75rem' }}>Project Location</span>
                    <strong style={{ color: '#172B32' }}>{project?.location}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: '0.75rem' }}>Contract Value</span>
                    <strong style={{ color: '#059669', fontSize: '1.1rem' }}>₹{(Number(project?.budget || 0) / 10000000).toFixed(2)} Crores</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: '0.75rem' }}>Machinery Deployed</span>
                    <strong style={{ color: '#2563EB' }}>{project?.deployedMachinery || 12} Plants & Heavy Units</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', fontSize: '0.75rem' }}>Execution Progress</span>
                    <strong style={{ color: '#167C72' }}>{project?.progress}% Milestone Accomplished</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Login Required Modal for Protected Projects */}
      {!isAuthorized && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(23, 43, 50, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FFFBEB',
              border: '2px solid #FDE68A',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Lock size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#172B32', margin: '0 0 0.5rem 0' }}>
              Authentication Required
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.6', margin: '0 0 1.75rem 0' }}>
              This project dossier contains proprietary engineering specifications, tender drawings, and contractor muster logs. Please authenticate via your certified STRUCTIVA personnel credentials to unlock full access.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <Link 
                href={`/supervisor/login?returnUrl=/projects/${slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem',
                  background: '#167C72',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  transition: 'background 0.2s'
                }}
              >
                <UserCheck size={18} />
                <span>Sign In as Authorized Supervisor</span>
              </Link>

              <Link 
                href={`/worker/login?returnUrl=/projects/${slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem',
                  background: '#172B32',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  transition: 'background 0.2s'
                }}
              >
                <HardHat size={18} />
                <span>Sign In as Registered Site Worker</span>
              </Link>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E7EB' }}>
              <Link href="/projects" style={{ fontSize: '0.82rem', color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>
                Cancel and return to public project overview
              </Link>
            </div>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
}
