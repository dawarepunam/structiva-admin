'use client';

import React, { useState, useEffect } from 'react';
import styles from './DashboardStats.module.css';
import { 
  Briefcase, 
  Building2, 
  Users, 
  CalendarCheck, 
  Truck, 
  CheckCircle,
  TrendingUp,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { getStoredWorkers } from '@/services/workerStorage';

type ModalType = 'projects' | 'workers' | 'fleet' | 'approvals' | 'attendance' | 'portfolio' | null;

const STORAGE_KEY = 'structiva_enterprise_expenses_v2';

export default function DashboardStats() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingCount, setPendingCount] = useState(18);
  const [workersCount, setWorkersCount] = useState(245);

  useEffect(() => {
    try {
      const storedWorkers = getStoredWorkers();
      if (storedWorkers && storedWorkers.length > 0) {
        setWorkersCount(storedWorkers.length > 200 ? storedWorkers.length : 245);
      }
      const savedExpenses = localStorage.getItem(STORAGE_KEY);
      if (savedExpenses) {
        const parsed = JSON.parse(savedExpenses);
        const pending = parsed.filter((e: any) => e.status === 'Pending');
        if (pending.length > 0) {
          setPendingCount(pending.length);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className={styles.statsWrapper}>
      {/* 6 Executive KPI Cards in MNC Deep Forest Teal / Porcelain White */}
      <div className={styles.kpiGrid}>
        
        {/* Card 1: Contract Portfolio */}
        <div 
          className={`${styles.kpiCard} ${styles.highlightCard}`}
          onClick={() => setActiveModal('portfolio')}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleEmerald}>
              <Briefcase size={16} />
            </div>
            <span className={styles.cardLabel}>Contract Portfolio</span>
          </div>
          <div className={styles.cardMetric}>
            <span className={styles.metricNumber}>₹ 45.8 Cr</span>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.trendUp}>↑ 12%</span>
            <div className={styles.sparklineContainer}>
              <svg viewBox="0 0 70 20" className={styles.sparkSvg}>
                <path 
                  d="M0 16 Q 15 18, 30 11 T 55 6 T 70 2" 
                  fill="none" 
                  stroke="#167C72" 
                  strokeWidth="2.2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Active Projects */}
        <div 
          className={styles.kpiCard}
          onClick={() => setActiveModal('projects')}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleLight}>
              <Building2 size={16} />
            </div>
            <span className={styles.cardLabel}>Active Projects</span>
          </div>
          <div className={styles.cardMetric}>
            <span className={styles.metricNumber}>12</span>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.trendUp}>↑ 8%</span>
            <div className={styles.sparklineContainer}>
              <svg viewBox="0 0 70 20" className={styles.sparkSvg}>
                <path 
                  d="M0 15 Q 20 16, 35 10 T 55 7 T 70 3" 
                  fill="none" 
                  stroke="#23845D" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Workforce Deployed */}
        <div 
          className={`${styles.kpiCard} ${styles.highlightCard}`}
          onClick={() => setActiveModal('workers')}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleEmerald}>
              <Users size={16} />
            </div>
            <span className={styles.cardLabel}>Workforce Deployed</span>
          </div>
          <div className={styles.cardMetric}>
            <span className={styles.metricNumber}>{workersCount}</span>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.trendUp}>↑ 10%</span>
            <div className={styles.sparklineContainer}>
              <svg viewBox="0 0 70 20" className={styles.sparkSvg}>
                <path 
                  d="M0 17 Q 20 18, 35 8 T 55 6 T 70 2" 
                  fill="none" 
                  stroke="#167C72" 
                  strokeWidth="2.2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Today's Attendance */}
        <div 
          className={styles.kpiCard}
          onClick={() => setActiveModal('attendance')}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleLight}>
              <CalendarCheck size={16} />
            </div>
            <span className={styles.cardLabel}>Today's Attendance</span>
          </div>
          <div className={styles.cardMetric}>
            <span className={styles.metricNumber}>92%</span>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.trendUp}>↑ 2%</span>
            <div className={styles.sparklineContainer}>
              <svg viewBox="0 0 70 20" className={styles.sparkSvg}>
                <path 
                  d="M0 14 Q 25 15, 40 10 T 55 6 T 70 2" 
                  fill="none" 
                  stroke="#23845D" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 5: Heavy Fleet */}
        <div 
          className={styles.kpiCard}
          onClick={() => setActiveModal('fleet')}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleLight}>
              <Truck size={16} />
            </div>
            <span className={styles.cardLabel}>Heavy Fleet</span>
          </div>
          <div className={styles.cardMetric}>
            <span className={styles.metricNumber}>28</span>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.trendUp}>↑ 6%</span>
            <div className={styles.sparklineContainer}>
              <svg viewBox="0 0 70 20" className={styles.sparkSvg}>
                <path 
                  d="M0 18 Q 20 15, 38 12 T 58 7 T 70 4" 
                  fill="none" 
                  stroke="#B58B59" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 6: Pending Approvals */}
        <div 
          className={styles.kpiCard}
          onClick={() => setActiveModal('approvals')}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconCircleWarning}>
              <CheckCircle size={16} />
            </div>
            <span className={styles.cardLabel}>Pending Approvals</span>
          </div>
          <div className={styles.cardMetric}>
            <span className={styles.metricNumber}>{pendingCount}</span>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.trendNeutral}>↑ 3%</span>
            <div className={styles.sparklineContainer}>
              <svg viewBox="0 0 70 20" className={styles.sparkSvg}>
                <path 
                  d="M0 14 Q 20 15, 40 11 T 55 8 T 70 5" 
                  fill="none" 
                  stroke="#D69B42" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Modal Dialogs */}
      {activeModal && (
        <div className={styles.modalBackdrop} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {activeModal === 'portfolio' && 'MNC Contract Portfolio Details'}
                {activeModal === 'projects' && 'Active Construction Projects'}
                {activeModal === 'workers' && 'Deployed Labour Force Overview'}
                {activeModal === 'attendance' && 'Daily Attendance Summary'}
                {activeModal === 'fleet' && 'Heavy Machinery & Fleet Status'}
                {activeModal === 'approvals' && 'Pending Approval Vouchers'}
              </span>
              <button 
                onClick={() => setActiveModal(null)} 
                className={styles.closeBtn}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                {activeModal === 'portfolio' && 'Total consolidated multi-site contract valuation across Pune, Thane, and Mumbai infrastructure packages: ₹ 45.8 Cr.'}
                {activeModal === 'projects' && '12 commercial & highway infrastructure packages are currently executing on site schedule.'}
                {activeModal === 'workers' && '245 workers verified present today via biometric geofenced field checkpoints.'}
                {activeModal === 'attendance' && '92% muster attendance recorded across civil, mechanical, and MEP subcontractors.'}
                {activeModal === 'fleet' && '28 heavy machines active on site (JCB 3DX, Tata Prima Tippers, Sany Cranes, Piling Rigs).'}
                {activeModal === 'approvals' && '18 site expense vouchers and material purchase requisitions awaiting Super Admin authorization.'}
              </p>

              <div className={styles.modalActions}>
                <Link 
                  href={
                    activeModal === 'projects' || activeModal === 'portfolio' ? '/admin/projects' :
                    activeModal === 'workers' ? '/admin/workforce' :
                    activeModal === 'attendance' ? '/admin/attendance' :
                    activeModal === 'fleet' ? '/admin/fleet' : '/admin/approvals'
                  }
                  className={styles.modalLinkBtn}
                  onClick={() => setActiveModal(null)}
                >
                  <span>Open Full Management Module</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
