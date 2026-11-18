'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Fuel, Send, CheckCircle2 } from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity } from '@/services/strapiClient';

export default function SupervisorFuelView() {
  const [fuels, setFuels] = useState<any[]>([]);
  const [assetCode, setAssetCode] = useState('EQP-JCB-01');
  const [litres, setLitres] = useState(45);
  const [rate, setRate] = useState(92.5);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchStrapiCollection('fuels', []);
      setFuels(data);
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      assetCode,
      assetName: 'JCB 3DX Plus Backhoe',
      date: new Date().toLocaleDateString('en-GB'),
      litresDisbursed: litres,
      ratePerLitre: rate,
      totalCost: litres * rate,
      meterReading: '1420.5 Hours',
      fuelPumpOrBowser: 'Site Mobile Diesel Bowser 01',
      receiptInvoiceNo: 'BWS-PUN-' + Math.floor(1000 + Math.random() * 9000),
      supervisorName: 'Er. Pravin Gaikwad'
    };

    await createStrapiEntity('fuels', payload);
    setFuels(prev => [payload, ...prev]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Site Fuel & Mobile Bowser Logger</h2>
          <p>Disburse diesel allocations directly to deployed site machinery.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Disburse Diesel Fuel</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Fuel disburse entry successfully recorded in Strapi database!
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Target Machinery</label>
            <select className={styles.select} value={assetCode} onChange={e => setAssetCode(e.target.value)}>
              <option value="EQP-JCB-01">JCB 3DX Plus Backhoe (EQP-JCB-01)</option>
              <option value="EQP-CRN-02">Potain MC 85B Tower Crane (EQP-CRN-02)</option>
              <option value="VEH-TIP-03">Tata Prima 2830.K Tipper (VEH-TIP-03)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantity Disbursed (Litres)</label>
            <input type="number" className={styles.input} value={litres} onChange={e => setLitres(Number(e.target.value))} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Rate Per Litre (₹)</label>
            <input type="number" className={styles.input} value={rate} onChange={e => setRate(Number(e.target.value))} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Calculated Cost</label>
            <input type="text" className={styles.input} value={`₹${(litres * rate).toLocaleString('en-IN')}`} disabled />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={16} />
              <span>Record Fuel Entry</span>
            </button>
          </div>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset Code</th>
              <th>Asset Name</th>
              <th>Litres</th>
              <th>Rate / L</th>
              <th>Total Cost</th>
              <th>Dispenser Bowser</th>
            </tr>
          </thead>
          <tbody>
            {fuels.map((f, idx) => (
              <tr key={f.id || idx}>
                <td>{f.date}</td>
                <td style={{ fontWeight: 600 }}>{f.assetCode}</td>
                <td>{f.assetName}</td>
                <td>{f.litresDisbursed} L</td>
                <td>₹{f.ratePerLitre}</td>
                <td>₹{f.totalCost}</td>
                <td>{f.fuelPumpOrBowser}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
