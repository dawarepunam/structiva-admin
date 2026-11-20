'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import {
  CalendarCheck2,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardHat,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { WorkerProfile, WorkerTaskRecord } from '../data/workerTypes';

interface WorkerDashboardProps {
  worker: WorkerProfile;
  tasks: WorkerTaskRecord[];
  onNavigateTab: (tab: string) => void;
}

export default function WorkerDashboard({
  worker,
  tasks,
  onNavigateTab
}: WorkerDashboardProps) {
  const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Assigned');
  const currentTask = activeTasks[0];

  const dailyWage = worker.dailyWage || 950;
  const presentDays = worker.presentDaysThisMonth || 19;
  const overtimeHours = worker.overtimeHoursThisMonth || 14;
  const overtimeRate = worker.overtimeHourlyRate || 140;
  const estimatedEarnings = (presentDays * dailyWage) + (overtimeHours * overtimeRate);

  return (
    <div>
      {/* Top Banner / Today's Shift Status */}
      <div className={styles.card} style={{ background: 'linear-gradient(135deg, #172B32, #203A3B)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className={styles.badge} style={{ background: '#167C72', color: '#FFFFFF' }}>
                TODAY'S SHIFT ACTIVE
              </span>
              <span style={{ fontSize: '0.8rem', color: '#A0B2B6' }}>19 Nov 2026</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
              {worker.name} • {worker.code}
            </h2>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#ECEBE5', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building size={15} color="#B58B59" /> {worker.assignedProject}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={15} color="#167C72" /> Supv: {worker.supervisorName || 'Er. Pravin Gaikwad'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#A0B2B6' }}>Check-in Verified</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34D399' }}>08:30 AM (GPS OK)</div>
            <div style={{ fontSize: '0.75rem', color: '#E2E0D8' }}>Standard 9-Hr Muster Shift</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className={styles.grid4}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{presentDays} Days</div>
            <div className={styles.statLabel}>Present This Month</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{overtimeHours} Hrs</div>
            <div className={styles.statLabel}>Approved Overtime</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Coins size={22} />
          </div>
          <div>
            <div className={styles.statVal}>₹{estimatedEarnings.toLocaleString('en-IN')}</div>
            <div className={styles.statLabel}>Gross Earned (Est.)</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{activeTasks.length} Work Items</div>
            <div className={styles.statLabel}>Assigned Tasks</div>
          </div>
        </div>
      </div>

      {/* Current Task & Quick Actions */}
      <div className={styles.grid2} style={{ marginTop: '1.25rem' }}>
        {/* Active Work Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <HardHat size={18} color="#167C72" />
              <span>Current Assigned Task</span>
            </div>
            <button 
              className={styles.btnSecondary} 
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => onNavigateTab('tasks')}
            >
              View All Tasks <ArrowRight size={14} />
            </button>
          </div>

          {currentTask ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#172B32' }}>
                  {currentTask.title}
                </h4>
                <span className={`${styles.badge} ${currentTask.priority === 'Critical' ? styles.badgeDanger : styles.badgeInfo}`}>
                  {currentTask.priority}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.45', marginBottom: '0.85rem' }}>
                {currentTask.details || currentTask.remarks || 'No detailed instructions available.'}
              </p>

              <div style={{ background: '#F8F9FA', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                <div><strong>Location:</strong> {currentTask.exactLocation || currentTask.site || 'Site Grid'}</div>
                <div><strong>Status:</strong> <span style={{ color: '#167C72', fontWeight: 600 }}>{currentTask.status}</span></div>
                <div><strong>Assigned By:</strong> {currentTask.assignedSupervisor || 'Site Engineer'}</div>
                <div><strong>Target:</strong> Today's Pouring Cycle</div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button 
                  className={styles.btnPrimary} 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onNavigateTab('tasks')}
                >
                  <CheckCircle2 size={16} /> Update Progress & Photos
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6B7280' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>All current tasks completed!</p>
              <span style={{ fontSize: '0.78rem' }}>Check with supervisor Er. Pravin Gaikwad for new work orders.</span>
            </div>
          )}
        </div>

        {/* Quick Operations & Safety Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <ShieldCheck size={18} color="#10B981" />
              <span>Quick Worker Actions</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}
              onClick={() => onNavigateTab('leave')}
            >
              <span style={{ fontWeight: 600, color: '#172B32' }}>Apply Leave</span>
              <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Submit casual/sick absence</span>
            </button>

            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}
              onClick={() => onNavigateTab('advance')}
            >
              <span style={{ fontWeight: 600, color: '#172B32' }}>Request Advance</span>
              <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Petty salary advance loan</span>
            </button>

            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}
              onClick={() => onNavigateTab('attendance')}
            >
              <span style={{ fontWeight: 600, color: '#172B32' }}>Muster Roll</span>
              <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Review check-in calendar</span>
            </button>

            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderColor: '#FCA5A5', background: '#FEF2F2' }}
              onClick={() => onNavigateTab('safety')}
            >
              <span style={{ fontWeight: 600, color: '#DC2626' }}>Report Hazard</span>
              <span style={{ fontSize: '0.72rem', color: '#991B1B' }}>Unsafe condition or injury</span>
            </button>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#92400E' }}>
              <strong>Safety Mandate:</strong> Full PPE (Hardhat, High-vis Vest, Steel-toe Boots, Double Lanyard Harness on Level 14 edge) is mandatory at all times.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
