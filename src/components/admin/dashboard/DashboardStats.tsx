'use client';

import React, { useState, useEffect } from 'react';
import styles from './DashboardStats.module.css';
import { Building2, Users, Truck, Receipt, X, ArrowRight, CheckCircle, AlertTriangle, MapPin, HardHat } from 'lucide-react';
import Link from 'next/link';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';

type ModalType = 'projects' | 'workers' | 'fleet' | 'approvals' | null;

const STORAGE_KEY = 'structiva_enterprise_expenses_v2';

export default function DashboardStats() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingCount, setPendingCount] = useState(3);
  const [pendingAmount, setPendingAmount] = useState(9550);
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  // Real-time dynamic workforce stats
  const [workersList, setWorkersList] = useState<EnterpriseWorkerRecord[]>([]);

  // Dynamically sync counts from real saved expenses in LocalStorage
  const syncExpenseStats = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const pendings = parsed.filter((e: any) => e.status === 'Pending');
        setPendingCount(pendings.length);
        setPendingAmount(pendings.reduce((acc: number, curr: any) => acc + curr.amount, 0));
        setPendingItems(pendings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncWorkforceStats = () => {
    try {
      const stored = getStoredWorkers();
      setWorkersList(stored);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    syncExpenseStats();
    syncWorkforceStats();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      syncExpenseStats();
      syncWorkforceStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('workersUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('workersUpdated', handleStorageChange);
    };
  }, []);

  const totalWorkersCount = workersList.length;
  const skilledCount = workersList.filter(w => w.category === 'Skilled').length;
  const semiCount = workersList.filter(w => w.category === 'Semi-Skilled').length;
  const unskilledCount = workersList.filter(w => w.category === 'Unskilled').length;
  const totalDailyWages = workersList.reduce((acc, curr) => acc + (curr.dailyWage || 0), 0);

  const handleQuickApprove = (id: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((e: any) => {
          if (e.id === id) {
            return {
              ...e,
              status: 'Approved',
              approvedBy: 'Super Admin (Quick Desk)',
              approvedDate: 'Just Now'
            };
          }
          return e;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        syncExpenseStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className={styles.statsGrid}>
        {/* Card 1: Active Projects */}
        <div 
          className={styles.statCard} 
          onClick={() => setActiveModal('projects')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Contract Portfolio</span>
            <div className={styles.statValue}>3 Sites</div>
            <span className={styles.statSubtext}>₹ 25.5 Cr Active Contracts</span>
            <span className={styles.clickBadge}>Click to view site budgets →</span>
          </div>
          <div className={`${styles.statIconBox} ${styles.iconNavy}`}>
            <Building2 size={24} />
          </div>
        </div>

        {/* Card 2: Workers Present Today */}
        <div 
          className={styles.statCard} 
          onClick={() => setActiveModal('workers')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Workforce Deployed</span>
            <div className={styles.statValue}>{totalWorkersCount} Real Labour</div>
            <span className={styles.statSubtext} style={{ color: '#059669' }}>
              {totalWorkersCount > 0 ? `${totalWorkersCount} Verified On-Site` : 'No workers deployed'}
            </span>
            <span className={styles.clickBadge}>View live labour categories →</span>
          </div>
          <div className={`${styles.statIconBox} ${styles.iconGreen}`}>
            <Users size={24} />
          </div>
        </div>

        {/* Card 3: Fleet & Machinery Active */}
        <div 
          className={styles.statCard} 
          onClick={() => setActiveModal('fleet')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Heavy Fleet In Operation</span>
            <div className={styles.statValue}>3 Heavy Assets</div>
            <span className={styles.statSubtext}>JCB • Tipper • 75T Crane</span>
            <span className={styles.clickBadge}>Inspect running hours & GPS →</span>
          </div>
          <div className={`${styles.statIconBox} ${styles.iconAmber}`}>
            <Truck size={24} />
          </div>
        </div>

        {/* Card 4: Real-time Pending Approvals */}
        <div 
          className={styles.statCard} 
          onClick={() => setActiveModal('approvals')}
          role="button"
          tabIndex={0}
          style={{ borderColor: pendingCount > 0 ? '#f59e0b' : '#e2e8f0' }}
        >
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Pending Authorizations</span>
            <div className={styles.statValue} style={{ color: pendingCount > 0 ? '#d97706' : '#059669' }}>
              {pendingCount} Vouchers
            </div>
            <span className={styles.statSubtext} style={{ color: pendingCount > 0 ? '#b45309' : '#059669' }}>
              {pendingCount > 0 ? `₹ ${pendingAmount.toLocaleString('en-IN')} awaiting sign-off` : 'All Vouchers Cleared'}
            </span>
            <span className={styles.clickBadge}>Open Quick Action Desk →</span>
          </div>
          <div className={`${styles.statIconBox} ${styles.iconRed}`}>
            <Receipt size={24} />
          </div>
        </div>
      </div>

      {/* Modal 1: Real Projects Portfolio Breakdown */}
      {activeModal === 'projects' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Active Project Portfolio (MNC Contracts)</h3>
              <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Skyline Commercial Complex, Pune</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client: K Raheja Corp • Kharadi IT Park</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#f59e0b' }}>₹ 4.2 Cr Budget</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>68% Executed</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Eastern Expressway Bridge Sec-4</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client: NHAI • Thane Bypass</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#f59e0b' }}>₹ 12.8 Cr Budget</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>84% Executed</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Metro Line Corridor Piling</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client: MMRDA • Andheri Line 7</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#f59e0b' }}>₹ 8.5 Cr Budget</div>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>42% Executed</span>
                </div>
              </div>

              <Link 
                href="/admin/projects" 
                className={styles.btnPrimary} 
                style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}
                onClick={() => setActiveModal(null)}
              >
                Go to Full Projects Portal →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Real Labour Breakdown */}
      {activeModal === 'workers' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Live Workforce Muster Roll Summary</h3>
              <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>SKILLED TRADES</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e40af' }}>{skilledCount}</div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>₹ 950 - ₹ 1,200 / day</span>
                </div>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>SEMI-SKILLED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>{semiCount}</div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>₹ 650 / day</span>
                </div>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>GENERAL LABOUR</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#334155' }}>{unskilledCount}</div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>₹ 500 / day</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 700 }}>Total Verified Daily Wages</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>Calculated dynamically from {totalWorkersCount} active worker records</div>
                </div>
                <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem' }}>
                  ₹ {totalDailyWages.toLocaleString('en-IN')} / day
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link 
                  href="/admin/workforce" 
                  className={styles.btnPrimary} 
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}
                  onClick={() => setActiveModal(null)}
                >
                  Manage / Onboard Workers →
                </Link>
                <Link 
                  href="/admin/attendance" 
                  className={styles.btnPrimary} 
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', background: '#059669' }}
                  onClick={() => setActiveModal(null)}
                >
                  Supervisor Attendance Ledger →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Fleet in Operations */}
      {activeModal === 'fleet' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Live Machinery Telematics Status</h3>
              <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 800 }}>JCB 3DX Super (MH 12 AB 4590)</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Skyline Site A • Driver: Santosh Shinde</div>
                </div>
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                  Active (1,420 hrs)
                </span>
              </div>

              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 800 }}>Tata Prima Tipper 16m³ (MH 14 CD 7821)</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Eastern Expressway • Driver: Akash Jadhav</div>
                </div>
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                  Active (42,150 KM)
                </span>
              </div>

              <div className={styles.detailRow}>
                <div>
                  <div style={{ fontWeight: 800 }}>Sany 75T Crawler Crane (MH 12 EF 9081)</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Metro Line Corridor • Driver: Ganesh More</div>
                </div>
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                  Active (3,120 hrs)
                </span>
              </div>

              <Link 
                href="/admin/fleet" 
                className={styles.btnPrimary} 
                style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}
                onClick={() => setActiveModal(null)}
              >
                Go to Fleet & Machinery Hub →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Quick Approvals Desk */}
      {activeModal === 'approvals' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Quick Action Approvals Desk</h3>
              <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {pendingItems.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>All Vouchers Approved!</p>
                  <span style={{ fontSize: '0.8rem' }}>No pending expenses in the queue.</span>
                </div>
              ) : (
                pendingItems.map((item: any) => (
                  <div key={item.id} className={styles.detailRow}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.site} • {item.submittedBy}</div>
                      <div style={{ fontWeight: 900, color: '#059669', fontSize: '1rem', marginTop: 3 }}>
                        ₹ {item.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => handleQuickApprove(item.id)}>
                      One-Tap Sign Off
                    </button>
                  </div>
                ))
              )}

              <Link 
                href="/admin/approvals" 
                style={{ textAlign: 'center', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', display: 'block', marginTop: 6 }}
                onClick={() => setActiveModal(null)}
              >
                Go to Executive Approvals Desk →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
