'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { PackageOpen, Send, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { createStrapiEntity, fetchStrapiCollection } from '@/services/strapiClient';

export default function SupervisorMaterialRequests() {
  const [material, setMaterial] = useState('TMT Steel Rebar 16mm Fe-550D');
  const [quantity, setQuantity] = useState(12);
  const [unit, setUnit] = useState('Metric Tonnes');
  const [priority, setPriority] = useState<'Standard' | 'High' | 'Critical'>('High');
  const [remarks, setRemarks] = useState('Required for Level 5 slab beam reinforcement');
  
  const [existingIndents, setExistingIndents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function loadIndents() {
    try {
      const data = await fetchStrapiCollection('supervisor-requests', []);
      const matIndents = data.filter((d: any) => d.requestType === 'Material Request');
      setExistingIndents(matIndents);
    } catch {}
  }

  useEffect(() => {
    loadIndents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      requestType: 'Material Request',
      title: `Material Indent: ${material} (${quantity} ${unit})`,
      project: 'Skyline Commercial Complex',
      site: 'Tower A',
      category: 'Raw Materials & Rebar',
      priority,
      status: 'Submitted',
      details: { material, quantity, unit },
      remarks,
      submittedBy: 'Er. Pravin Gaikwad (Chief Supervisor)',
      submittedDate: new Date().toLocaleDateString('en-GB')
    };

    const res = await createStrapiEntity('supervisor-requests', payload);
    setExistingIndents(prev => [payload, ...prev]);
    setLoading(false);
    setSubmitted(true);
    setRemarks('');
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Material Indents & Requisitions</h2>
          <p>Official site material requisitions submitted to Central Procurement (Strapi Connected).</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Raise Material Requisition Indent</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Indent transmitted to central Strapi backend! Available in Admin Procurement Queue.
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Material Specification</label>
            <input type="text" className={styles.input} value={material} onChange={e => setMaterial(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Required Quantity</label>
            <input type="number" className={styles.input} value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Unit of Measurement</label>
            <input type="text" className={styles.input} value={unit} onChange={e => setUnit(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Indent Priority</label>
            <select className={styles.select} value={priority} onChange={e => setPriority(e.target.value as any)}>
              <option value="Critical">Critical &mdash; Site Work Halted</option>
              <option value="High">High &mdash; Within 48 Hours</option>
              <option value="Standard">Standard Delivery</option>
            </select>
          </div>
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Specific Location / Usage Remarks</label>
            <input type="text" className={styles.input} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Tower A slab beams" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={16} />
              <span>{loading ? 'Transmitting...' : 'Submit to Admin Desk'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Real Indents Table */}
      <div className={styles.tableWrapper}>
        <div style={{ padding: '0.85rem 1rem', background: '#F4F2EC', borderBottom: '1px solid #ECEBE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.88rem', color: '#172B32' }}>Active Indent Queue (Central Strapi Database)</strong>
          <button onClick={loadIndents} style={{ background: 'none', border: 'none', color: '#167C72', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Material Specification</th>
              <th>Quantity</th>
              <th>Priority</th>
              <th>Site</th>
              <th>Admin Status</th>
            </tr>
          </thead>
          <tbody>
            {existingIndents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#718096' }}>
                  No material indents found in database. Create one above.
                </td>
              </tr>
            ) : (
              existingIndents.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{item.submittedDate || 'Today'}</td>
                  <td style={{ fontWeight: 600 }}>{item.details?.material || item.title}</td>
                  <td>{item.details?.quantity ? `${item.details.quantity} ${item.details.unit}` : 'Standard Batch'}</td>
                  <td>
                    <span className={`${styles.badge} ${item.priority === 'Critical' ? styles.badgeWarning : styles.badgeSuccess}`}>
                      {item.priority || 'Standard'}
                    </span>
                  </td>
                  <td>{item.site || 'Tower A'}</td>
                  <td>
                    <span className={`${styles.badge} ${item.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {item.status || 'Submitted'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
