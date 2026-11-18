'use client';

import React, { useState } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { PackageOpen, Send, CheckCircle2 } from 'lucide-react';
import { createStrapiEntity } from '@/services/strapiClient';

export default function SupervisorMaterialRequests() {
  const [material, setMaterial] = useState('TMT Steel Rebar 16mm Fe-550D');
  const [quantity, setQuantity] = useState(12);
  const [unit, setUnit] = useState('Metric Tonnes');
  const [priority, setPriority] = useState('High');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStrapiEntity('expenses', {
      title: `Material Indent: ${material} (${quantity} ${unit})`,
      category: 'Material Indent',
      amount: 0,
      project: 'Skyline Commercial Complex',
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Pending Review',
      remarks: `Priority: ${priority}`
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Material Indents & Requisitions</h2>
          <p>Request construction materials from the central procurement warehouse.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Create Material Indent</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Material indent queued for Central Procurement approval!
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
            <select className={styles.select} value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="Urgent">Urgent (Within 24 Hours)</option>
              <option value="High">High (Within 3 Days)</option>
              <option value="Standard">Standard (Next Scheduled Delivery)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={16} />
              <span>Submit Indent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
