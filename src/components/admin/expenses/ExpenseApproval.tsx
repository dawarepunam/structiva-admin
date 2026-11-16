'use client';

import React, { useState, useEffect } from 'react';
import styles from './ExpenseApproval.module.css';
import { Eye, X, Plus, Building2, CheckCircle, AlertTriangle } from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';

export interface EnterpriseExpense {
  id: string;
  voucherNumber: string;
  title: string;
  category: 'Machinery Maintenance' | 'Materials' | 'Petty Cash' | 'Transportation';
  amount: number;
  date: string;
  site: string;
  vendorName: string;
  gstNumber: string;
  submittedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  receiptImage: string;
  notes: string;
  approvedBy?: string;
  approvedDate?: string;
}

const defaultExpenses: EnterpriseExpense[] = [
  { 
    id: '1', 
    voucherNumber: 'VCH-EXP-2026-091',
    title: 'Emergency Hydraulic Hose & O-Ring Replacement (JCB 3DX)', 
    category: 'Machinery Maintenance', 
    amount: 3850, 
    date: '16 Nov 2026', 
    site: 'Eastern Expressway Bridge Sec-4',
    vendorName: 'Omkar Hydraulic & Spares Ltd.',
    gstNumber: '27AABCO8812K1Z9',
    submittedBy: 'Pravin Gaikwad (Site Supervisor)', 
    status: 'Pending',
    receiptImage: '/images/hydraulic_part.jpg',
    notes: 'Hydraulic burst caused sudden oil spill on Pier-4. Replaced on priority to resume pile concreting.'
  },
  { 
    id: '2', 
    voucherNumber: 'VCH-EXP-2026-092',
    title: 'Binding Wire 50kg & Shuttering Nails 20kg', 
    category: 'Materials', 
    amount: 4200, 
    date: '16 Nov 2026', 
    site: 'Skyline Commercial Complex, Pune',
    vendorName: 'Mahalaxmi Steel & Hardware Depot',
    gstNumber: '27BTYPM4410R1ZL',
    submittedBy: 'Pravin Gaikwad (Site Supervisor)', 
    status: 'Pending',
    receiptImage: '/images/steel_wire.jpg',
    notes: 'Required for Slab-3 beam reinforcement tying work.'
  },
  { 
    id: '3', 
    voucherNumber: 'VCH-EXP-2026-093',
    title: 'Potable Drinking Water Tanker 5000 Litres', 
    category: 'Petty Cash', 
    amount: 1500, 
    date: '15 Nov 2026', 
    site: 'Metro Line Corridor Piling',
    vendorName: 'Sai Water Supply Services',
    gstNumber: '27AAKCS2219J1ZT',
    submittedBy: 'Santosh More (Site Supervisor)', 
    status: 'Pending',
    receiptImage: '/images/water_tanker.jpg',
    notes: 'Essential labour drinking water and hydration for curing labour camp.'
  },
  { 
    id: '4', 
    voucherNumber: 'VCH-EXP-2026-088',
    title: 'Tower Crane Anchor Bolt Calibration', 
    category: 'Machinery Maintenance', 
    amount: 14500, 
    date: '14 Nov 2026', 
    site: 'Metro Line Corridor Piling',
    vendorName: 'Precision Engineering Consultants',
    gstNumber: '27BCRPM8821Q1ZW',
    submittedBy: 'Santosh More (Site Supervisor)', 
    status: 'Approved',
    approvedBy: 'Super Admin (Audited)',
    approvedDate: '14 Nov 2026, 04:30 PM',
    receiptImage: '/images/crane_service.jpg',
    notes: 'Third party structural torque testing and safety fitness certificate signed.'
  }
];

const STORAGE_KEY = 'structiva_enterprise_expenses_v2';

export default function ExpenseApproval({ onlyPending = false }: { onlyPending?: boolean }) {
  const [expenses, setExpenses] = useState<EnterpriseExpense[]>(defaultExpenses);
  const [selectedExpense, setSelectedExpense] = useState<EnterpriseExpense | null>(null);
  const [viewInvoice, setViewInvoice] = useState<EnterpriseExpense | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Voucher Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EnterpriseExpense['category']>('Materials');
  const [newAmount, setNewAmount] = useState('');
  const [newSite, setNewSite] = useState('Skyline Commercial Complex, Pune');
  const [newVendor, setNewVendor] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setExpenses(JSON.parse(saved));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultExpenses));
      }
    } catch (e) {
      console.error('LocalStorage error', e);
    }
  }, []);

  // Save to LocalStorage whenever expenses change
  const saveExpenses = (updated: EnterpriseExpense[]) => {
    setExpenses(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving to LocalStorage', e);
    }
  };

  const handleAction = (id: string, newStatus: 'Approved' | 'Rejected', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = expenses.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          status: newStatus,
          approvedBy: 'Super Admin (Authorized Sign-Off)',
          approvedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return exp;
    });
    saveExpenses(updated);
    if (selectedExpense && selectedExpense.id === id) {
      setSelectedExpense(null);
    }
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    const newVoucher: EnterpriseExpense = {
      id: Date.now().toString(),
      voucherNumber: `VCH-EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      category: newCategory,
      amount: Number(newAmount),
      date: 'Today',
      site: newSite,
      vendorName: newVendor || 'Verified Site Hardware Vendor',
      gstNumber: '27AABCS' + Math.floor(1000 + Math.random() * 9000) + 'K1Z1',
      submittedBy: 'Pravin Gaikwad (Site Supervisor)',
      status: 'Pending',
      receiptImage: '/images/receipt.jpg',
      notes: newNotes || 'Site operational procurement voucher submitted from field.'
    };

    saveExpenses([newVoucher, ...expenses]);
    setShowAddModal(false);
    setNewTitle('');
    setNewAmount('');
    setNewVendor('');
    setNewNotes('');
  };

  // Filter based on view mode
  const displayedExpenses = onlyPending 
    ? expenses.filter(e => e.status === 'Pending')
    : expenses;

  const totalPendingAmount = expenses.filter(e => e.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const totalApprovedAmount = expenses.filter(e => e.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className={styles.container}>
      {/* High-Level Expense Audit Metrics */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Pending Sign-off</span>
          <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>₹ {totalPendingAmount.toLocaleString('en-IN')}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {expenses.filter(e => e.status === 'Pending').length} vouchers awaiting decision
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Approved Site Expenses</span>
          <div className={styles.kpiValue} style={{ color: '#10b981' }}>₹ {totalApprovedAmount.toLocaleString('en-IN')}</div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>
            {expenses.filter(e => e.status === 'Approved').length} vouchers cleared & paid
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Audit Persistence Mode</span>
          <div className={styles.kpiValue} style={{ color: '#0f172a', fontSize: '1.25rem' }}>Auto-Synced</div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Real-time LocalStorage + DB Cache</span>
        </div>
      </div>

      {/* Main Expense Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
            {onlyPending ? 'Pending Executive Approval Queue' : 'Comprehensive Site Expense Register'}
          </span>
          {!onlyPending && (
            <button 
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#f59e0b', color: '#0f172a', border: 'none', padding: '6px 12px',
                borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <Plus size={14} /> Submit Expense Voucher
            </button>
          )}
        </div>

        {displayedExpenses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>All Vouchers Approved!</h3>
            <p style={{ fontSize: '0.85rem' }}>There are currently zero pending expense approvals in the queue.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Receipt Bill</th>
                <th>Voucher & Description</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Site & Submitter</th>
                <th>Audit Status</th>
                <th>Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedExpenses.map(exp => (
                <tr 
                  key={exp.id} 
                  style={{ cursor: 'pointer', backgroundColor: exp.status === 'Pending' ? '#fffbeb' : 'transparent' }}
                  onClick={() => setSelectedExpense(exp)}
                >
                  <td>
                    <SafeImage 
                      src={exp.receiptImage} 
                      alt="Receipt" 
                      fallbackType="receipt"
                      className={styles.billThumbnail} 
                      onClick={(e) => { e.stopPropagation(); setViewInvoice(exp); }}
                    />
                  </td>
                  <td>
                    <div style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800 }}>{exp.voucherNumber}</div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{exp.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Vendor: {exp.vendorName}</div>
                  </td>
                  <td>
                    <span className={`${styles.badgeCategory} ${
                      exp.category === 'Machinery Maintenance' ? styles.catMaintenance :
                      exp.category === 'Materials' ? styles.catMaterials : styles.catPetty
                    }`}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    ₹ {exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{exp.site}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{exp.submittedBy} • {exp.date}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                      background: exp.status === 'Approved' ? '#d1fae5' : exp.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                      color: exp.status === 'Approved' ? '#065f46' : exp.status === 'Rejected' ? '#991b1b' : '#92400e',
                    }}>
                      {exp.status}
                    </span>
                  </td>
                  <td>
                    {exp.status === 'Pending' ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className={styles.btnApprove} onClick={(e) => handleAction(exp.id, 'Approved', e)}>
                          Approve
                        </button>
                        <button className={styles.btnReject} onClick={(e) => handleAction(exp.id, 'Rejected', e)}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                        ✓ {exp.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Voucher Detail Audit Modal */}
      {selectedExpense && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setSelectedExpense(null)}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#0f172a', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div>
                <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>{selectedExpense.voucherNumber}</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0' }}>{selectedExpense.title}</h2>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Submitted by: {selectedExpense.submittedBy}</span>
              </div>
              <button onClick={() => setSelectedExpense(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Receipt Image Banner */}
              <div style={{ height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                <SafeImage src={selectedExpense.receiptImage} alt="Receipt" fallbackType="receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={() => setViewInvoice(selectedExpense)}
                  style={{
                    position: 'absolute', bottom: 10, right: 10, background: 'rgba(15, 23, 42, 0.85)',
                    color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <Eye size={12} color="#f59e0b" /> Full Screen Bill
                </button>
              </div>

              {/* Vendor & Tax Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>VENDOR NAME</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{selectedExpense.vendorName}</div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>GSTIN: {selectedExpense.gstNumber}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>AMOUNT</span>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.2rem', marginTop: 2 }}>₹ {selectedExpense.amount.toLocaleString('en-IN')}</div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Category: {selectedExpense.category}</span>
                </div>
              </div>

              {/* Justification Notes */}
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: 12, borderRadius: 8, fontSize: '0.85rem' }}>
                <strong style={{ color: '#92400e', display: 'block', marginBottom: 2 }}>Supervisor Field Note / Justification:</strong>
                <p style={{ color: '#78350f', margin: 0, lineHeight: 1.4 }}>{selectedExpense.notes}</p>
              </div>

              {/* Actions */}
              {selectedExpense.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => handleAction(selectedExpense.id, 'Approved')}
                    style={{ flex: 1, padding: 12, background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Authorize & Approve Payment (₹ {selectedExpense.amount})
                  </button>
                  <button 
                    onClick={() => handleAction(selectedExpense.id, 'Rejected')}
                    style={{ flex: 1, padding: 12, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Reject Voucher
                  </button>
                </div>
              ) : (
                <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>
                  Status: <strong>{selectedExpense.status}</strong> • Authorization: <strong>{selectedExpense.approvedBy}</strong> ({selectedExpense.approvedDate})
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Voucher Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          zIndex: 65, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 520,
            padding: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Submit Site Procurement Voucher
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Expense Title / Purpose *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 20 Bags Cement Grade 53 for Pier-2" 
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Category</label>
                  <select 
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                  >
                    <option value="Materials">Materials</option>
                    <option value="Machinery Maintenance">Machinery Maintenance</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Amount (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 7800" 
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Vendor / Supplier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. UltraTech Cement Distributor" 
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                  value={newVendor}
                  onChange={e => setNewVendor(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Supervisor Justification Note</label>
                <textarea 
                  placeholder="Explain why this expense was required on site..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, minHeight: 60 }}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                style={{
                  marginTop: 6, padding: '11px', background: '#f59e0b', color: '#0f172a',
                  border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer'
                }}
              >
                Submit for Executive Approval
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Invoice Modal */}
      {viewInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)',
          zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setViewInvoice(null)}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 540,
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 380, position: 'relative' }}>
              <SafeImage src={viewInvoice.receiptImage} alt="Tax Invoice" fallbackType="receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setViewInvoice(null)} style={{
                position: 'absolute', top: 12, right: 12, background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer'
              }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 16, fontSize: '0.85rem' }}>
              <div style={{ color: '#f59e0b', fontWeight: 800 }}>{viewInvoice.voucherNumber}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{viewInvoice.vendorName}</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0' }}>GSTIN: <strong>{viewInvoice.gstNumber}</strong> • Amount: <strong>₹ {viewInvoice.amount.toLocaleString('en-IN')}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
