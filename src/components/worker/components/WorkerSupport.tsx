'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  PhoneCall,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerSupportProps {
  worker: WorkerProfile;
}

export default function WorkerSupportView({ worker }: WorkerSupportProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Wages & Overtime');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [tickets, setTickets] = useState([
    {
      id: 'TKT-2026-041',
      subject: 'Clarification regarding 2 hours Sunday overtime punch',
      category: 'Wages & Overtime',
      date: '04 Nov 2026',
      status: 'Resolved',
      description: 'Worked extra shift on 04 Nov during slab casting. Overtime was verified by Er. Pravin Gaikwad.',
      response: 'Overtime hours approved by HR and added to November muster register.'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setTickets([
        {
          id: `TKT-2026-0${tickets.length + 42}`,
          subject,
          category,
          date: '19 Nov 2026',
          status: 'Open',
          description,
          response: 'Assigned to Site HR Desk. Expected resolution within 24 hours.'
        },
        ...tickets
      ]);

      setTimeout(() => {
        setSuccessMsg(false);
        setSubject('');
        setDescription('');
      }, 1500);
    }, 600);
  };

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            Worker Help Desk & Grievance Redressal
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Submit tickets for wage questions, PPE equipment requests, or accommodation assistance
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Submit Ticket Form */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <MessageSquare size={18} color="#167C72" />
              <span>Raise a Help Desk Ticket</span>
            </div>
          </div>

          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#059669' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem auto' }} />
              <h4 style={{ margin: 0 }}>Ticket Generated Successfully</h4>
              <p style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '0.3rem' }}>
                HR Officer will contact you or update the ticket status.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                  Category
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="Wages & Overtime">Wages, Overtime & Muster Corrections</option>
                  <option value="PPE & Equipment">PPE Replacement (Gloves, Boots, Harness)</option>
                  <option value="Accommodation">Worker Colony Accommodation & Water</option>
                  <option value="Health & Medical">First Aid & Medical Reimbursement</option>
                  <option value="General Grievance">General Site Grievance</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                  Subject / Summary
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Brief summary of request..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                  Detailed Description
                </label>
                <textarea 
                  rows={4} 
                  required 
                  placeholder="Explain your question or grievance clearly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <button 
                type="submit" 
                className={styles.btnPrimary} 
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={16} /> {submitting ? 'Submitting...' : 'Send to HR Help Desk'}
              </button>
            </form>
          )}
        </div>

        {/* Previous Support Tickets */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Clock size={18} color="#167C72" />
              <span>Ticket History & Resolution</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {tickets.map((tkt) => (
              <div key={tkt.id} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F8F9FA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <div style={{ fontWeight: 600, color: '#172B32', fontSize: '0.9rem' }}>
                    {tkt.subject}
                  </div>
                  <span className={`${styles.badge} ${tkt.status === 'Resolved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {tkt.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                  Ref: {tkt.id} • {tkt.date} • {tkt.category}
                </div>

                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', color: '#4B5563' }}>
                  {tkt.description}
                </p>

                {tkt.response && (
                  <div style={{ background: '#ECFDF5', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#065F46' }}>
                    <strong>HR Response:</strong> {tkt.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
