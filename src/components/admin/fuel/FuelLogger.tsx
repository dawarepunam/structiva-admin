'use client';

import React, { useState } from 'react';
import styles from './FuelLogger.module.css';

export default function FuelLogger() {
  const [liters, setLiters] = useState<number>(50);
  const [rate, setRate] = useState<number>(92.5);

  const total = liters * rate;

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
          Record Fuel Voucher
        </h3>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Select Vehicle / Machine</label>
            <select className={styles.input}>
              <option>JCB 3DX Super (MH 12 AB 4590)</option>
              <option>Tata Prima Tipper (MH 14 CD 7821)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Fuel Type</label>
            <select className={styles.input}>
              <option>Diesel</option>
              <option>Petrol</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Quantity (Liters)</label>
            <input 
              type="number" 
              className={styles.input} 
              value={liters} 
              onChange={e => setLiters(Number(e.target.value))} 
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Rate Per Liter (₹)</label>
            <input 
              type="number" 
              className={styles.input} 
              value={rate} 
              onChange={e => setRate(Number(e.target.value))} 
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Total Amount (₹)</label>
            <input 
              type="text" 
              className={styles.input} 
              readOnly 
              value={`₹ ${total.toLocaleString('en-IN')}`} 
              style={{ backgroundColor: '#f8fafc', fontWeight: 700, color: '#0f172a' }}
            />
          </div>
        </div>

        <button className={styles.submitBtn}>Submit Fuel Record</button>
      </div>
    </div>
  );
}
