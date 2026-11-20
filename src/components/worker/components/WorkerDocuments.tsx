'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerDocumentsProps {
  worker: WorkerProfile;
}

export default function WorkerDocumentsView({ worker }: WorkerDocumentsProps) {
  const documents = [
    {
      id: 'doc-01',
      title: 'Aadhaar Card Identification Proof',
      category: 'Government ID',
      fileType: 'PDF (1.2 MB)',
      uploadedDate: '12 Apr 2023',
      verifiedDate: '14 Apr 2023',
      verifiedBy: 'HR Admin Deshmukh',
      status: 'Verified',
      maskedRef: 'XXXX-XXXX-8921'
    },
    {
      id: 'doc-02',
      title: 'Site Safety Induction Passport & Card',
      category: 'Safety Compliance',
      fileType: 'PDF (850 KB)',
      uploadedDate: '15 Apr 2023',
      verifiedDate: '15 Apr 2023',
      verifiedBy: 'Safety Officer Vikas Deshmukh',
      status: 'Verified',
      expiryDate: '15 Apr 2027',
      maskedRef: 'SAF-PASS-0921'
    },
    {
      id: 'doc-03',
      title: 'Annual Pre-Deployment Medical Fitness Certificate',
      category: 'Medical Health',
      fileType: 'PDF (1.8 MB)',
      uploadedDate: '10 Jan 2026',
      verifiedDate: '12 Jan 2026',
      verifiedBy: 'Dr. S. Kulkarni (Site Medical Officer)',
      status: 'Verified',
      expiryDate: '10 Jan 2027',
      maskedRef: 'Fit for Height Work > 15m'
    },
    {
      id: 'doc-04',
      title: 'Bank Passbook / Cancelled Cheque Copy',
      category: 'Payroll Compliance',
      fileType: 'JPG (640 KB)',
      uploadedDate: '12 Apr 2023',
      verifiedDate: '14 Apr 2023',
      verifiedBy: 'Accounts Dept.',
      status: 'Verified',
      maskedRef: 'SBI Kharadi Branch'
    }
  ];

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            My Verified Credentials & Compliance Documents
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Official identity records, trade certifications and medical clearances on file
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.card} style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#172B32', fontWeight: 600 }}>
                      {doc.title}
                    </h3>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      {doc.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                    Category: <strong>{doc.category}</strong> • Format: {doc.fileType} • Reference: {doc.maskedRef}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.3rem' }}>
                    Uploaded {doc.uploadedDate} • Verified by {doc.verifiedBy}
                    {doc.expiryDate && <span> • <strong>Valid till:</strong> {doc.expiryDate}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.btnSecondary}
                  onClick={() => alert(`Downloading verified copy of: ${doc.title}`)}
                >
                  <Download size={15} /> Download Copy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
