'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import {
  Building2,
  MapPin,
  UserCheck,
  ShieldAlert,
  Clock,
  Compass,
  FileText
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerProjectsProps {
  worker: WorkerProfile;
}

export default function WorkerProjectsView({ worker }: WorkerProjectsProps) {
  return (
    <div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <Building2 size={18} color="#167C72" />
            <span>Currently Assigned Project & Site</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            Active Deployment
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#172B32' }}>
              {worker.assignedProject}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <MapPin size={16} color="#DC2626" />
              <span>Plot 42, Kharadi IT Park Road, Kharadi, Pune, Maharashtra 411014</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.5' }}>
              Twin-tower commercial office development (G+24 floors) comprising composite structural steel and Grade M50/M60 reinforced concrete core shear walls.
            </p>

            <div style={{ background: '#F8F9FA', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #E5E7EB' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', color: '#172B32' }}>
                Assigned Site Operations Team
              </h4>
              <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: '1.6' }}>
                <div><strong>Site Supervisor:</strong> {worker.supervisorName || 'Er. Pravin Gaikwad'} (+91 98220 99441)</div>
                <div><strong>Project Director:</strong> Er. Rajesh Kulkarni (Head Office)</div>
                <div><strong>Safety Officer:</strong> Officer Vikas Deshmukh (+91 98220 33412)</div>
                <div><strong>First Aid Post:</strong> Ground Floor Medical Room (Podium A)</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: '#F4F2EC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E0D8' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: '#172B32', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#167C72" /> Site Shift & Working Hours
              </h4>
              <div style={{ fontSize: '0.82rem', color: '#374151', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: '#6B7280' }}>Morning Shift Check-in:</span>
                  <div style={{ fontWeight: 600 }}>08:00 AM – 08:30 AM</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Evening Shift Close:</span>
                  <div style={{ fontWeight: 600 }}>05:30 PM</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Lunch Break:</span>
                  <div style={{ fontWeight: 600 }}>01:00 PM – 02:00 PM</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Tea Breaks:</span>
                  <div style={{ fontWeight: 600 }}>10:30 AM & 04:00 PM</div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #D6D3C8' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={16} /> Site Safety & PPE Mandates
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#4B5563', lineHeight: '1.5' }}>
                  <li>Class 1 certified hardhat must be buckled at all times.</li>
                  <li>Double lanyard safety harness must be tied when working above 2 meters.</li>
                  <li>Report any missing edge barriers or scaffold defects immediately to Er. Pravin Gaikwad.</li>
                  <li>Smoking or consumption of alcohol/tobacco strictly prohibited on site premises.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
