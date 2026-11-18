'use client';

import React, { useState, useEffect } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { Receipt, Send, CheckCircle2 } from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity } from '@/services/strapiClient';

export default function SupervisorExpensesView() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Consumables & Hardware');
  const [amount, setAmount] = useState(1500);
  const [paidTo, setPaidTo] = useState('Site Local Hardware Store');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchStrapiCollection('expenses', []);
      setExpenses(data);
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      category,
      amount,
      project: 'Skyline Commercial Complex',
      date: new Date().toLocaleDateString('en-GB'),
      paidTo,
      paymentMode: 'Site Cash Voucher',
      status: 'Pending Review',
      submittedBy: 'Er. Pravin Gaikwad'
    };

    await createStrapiEntity('expenses', payload);
    setExpenses(prev => [payload, ...prev]);
    setTitle('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Site Petty Cash & Incidentals</h2>
          <p>Submit on-site purchase vouchers and emergency consumable bills.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Log Site Expenditure Voucher</h3>
        {submitted && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.65rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ✓ Expense voucher successfully transmitted to Strapi backend for accounts approval!
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Voucher Description / Title</label>
            <input type="text" className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Binding wire & cutting discs" required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Expense Category</label>
            <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Consumables & Hardware">Consumables & Hardware</option>
              <option value="Safety & PPE">Safety & PPE</option>
              <option value="Emergency Machinery Spares">Emergency Machinery Spares</option>
              <option value="Labour Refreshment">Labour Refreshment</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Amount (₹)</label>
            <input type="number" className={styles.input} value={amount} onChange={e => setAmount(Number(e.target.value))} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Paid To / Vendor</label>
            <input type="text" className={styles.input} value={paidTo} onChange={e => setPaidTo(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={16} />
              <span>Submit Voucher</span>
            </button>
          </div>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Voucher Title</th>
              <th>Category</th>
              <th>Paid To</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, idx) => (
              <tr key={exp.id || idx}>
                <td>{exp.date}</td>
                <td style={{ fontWeight: 600 }}>{exp.title}</td>
                <td>{exp.category}</td>
                <td>{exp.paidTo}</td>
                <td>₹{exp.amount}</td>
                <td>
                  <span className={`${styles.badge} ${exp.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {exp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
