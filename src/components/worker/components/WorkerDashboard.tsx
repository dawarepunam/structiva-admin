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

  const isAssigned = !!worker.assignedProject && worker.assignedProject !== 'Unassigned' && worker.assignedProject !== 'None';
  const dailyWage = worker.dailyWage || 950;
  const presentDays = isAssigned ? (worker.presentDaysThisMonth || 0) : 0;
  const overtimeHours = isAssigned ? (worker.overtimeHoursThisMonth || 0) : 0;
  const overtimeRate = worker.overtimeHourlyRate || 140;
  const estimatedEarnings = (presentDays * dailyWage) + (overtimeHours * overtimeRate);

  return (
    <div>
      {/* Top Banner / Today's Shift Status */}
      <div className={styles.card} style={{ 
        background: isAssigned ? 'linear-gradient(135deg, #172B32, #203A3B)' : 'linear-gradient(135deg, #1F2937, #374151)', 
        color: '#FFFFFF' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className={styles.badge} style={{ 
                background: isAssigned ? '#167C72' : '#F59E0B', 
                color: '#FFFFFF',
                fontWeight: 700 
              }}>
                {isAssigned ? "TODAY'S SHIFT ACTIVE" : "AVAILABLE • WAITING FOR SITE ASSIGNMENT"}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#A0B2B6' }}>
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
              {worker.name} • {worker.code}
            </h2>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#ECEBE5', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building size={15} color="#B58B59" /> 
                {isAssigned ? worker.assignedProject : 'No Active Site Assignment'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={15} color={isAssigned ? '#167C72' : '#9CA3AF'} /> 
                {isAssigned ? `Supv: ${worker.supervisorName || 'Site Operations Lead'}` : 'Awaiting Supervisor Allocation'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {isAssigned ? (
              <>
                <div style={{ fontSize: '0.75rem', color: '#A0B2B6' }}>Check-in Verified</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34D399' }}>08:30 AM (GPS OK)</div>
                <div style={{ fontSize: '0.75rem', color: '#E2E0D8' }}>Standard 9-Hr Muster Shift</div>
              </>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: '0.75rem', color: '#FCD34D', fontWeight: 700 }}>Workforce Pool Status</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Available for Mobilization</div>
                <div style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>Supervisor will allocate your site</div>
              </div>
            )}
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
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column' }}>
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

          {isAssigned && currentTask ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#172B32', flex: '1 1 200px' }}>
                    {currentTask.title}
                  </h4>
                  <span className={`${styles.badge} ${currentTask.priority === 'Critical' ? styles.badgeDanger : styles.badgeInfo}`}>
                    {currentTask.priority}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: '1.5', marginBottom: '0.85rem' }}>
                  {currentTask.details || currentTask.remarks || 'No detailed instructions available.'}
                </p>

                <div style={{ background: '#F8F9FA', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div><strong>Location:</strong> {currentTask.exactLocation || currentTask.site || 'Site Grid'}</div>
                  <div><strong>Status:</strong> <span style={{ color: '#167C72', fontWeight: 600 }}>{currentTask.status}</span></div>
                  <div><strong>Assigned By:</strong> {currentTask.assignedSupervisor || 'Site Engineer'}</div>
                  <div><strong>Target:</strong> Today's Pouring Cycle</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                <button 
                  className={styles.btnPrimary} 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onNavigateTab('tasks')}
                >
                  <CheckCircle2 size={16} /> Update Progress & Photos
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <HardHat size={36} color="#94A3B8" style={{ marginBottom: '0.75rem' }} />
              <strong style={{ fontSize: '0.95rem', color: '#1E293B', display: 'block', marginBottom: '0.25rem' }}>
                {isAssigned ? 'No Active Task Queue' : 'No Active Site Assignment'}
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, maxWidth: '280px', lineHeight: '1.4' }}>
                {isAssigned 
                  ? 'All assigned trade operations are up to date. Stand by for supervisor briefing.'
                  : 'You are currently in the Available Pool. Once a site supervisor mobilizes you, your daily site tasks and muster checks will appear here.'}
              </p>
            </div>
          )}
        </div>

        {/* Quick Operations & Safety Card */}
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <ShieldCheck size={18} color="#10B981" />
              <span>Quick Worker Actions</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.75rem' }}>
            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', wordBreak: 'break-word' }}
              onClick={() => onNavigateTab('leave')}
            >
              <span style={{ fontWeight: 600, color: '#172B32' }}>Apply Leave</span>
              <span style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem' }}>Casual or sick absence</span>
            </button>

            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', wordBreak: 'break-word' }}
              onClick={() => onNavigateTab('advance')}
            >
              <span style={{ fontWeight: 600, color: '#172B32' }}>Request Advance</span>
              <span style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem' }}>Petty salary advance loan</span>
            </button>

            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', wordBreak: 'break-word' }}
              onClick={() => onNavigateTab('attendance')}
            >
              <span style={{ fontWeight: 600, color: '#172B32' }}>Muster Roll</span>
              <span style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem' }}>Review check-in calendar</span>
            </button>

            <button 
              className={styles.btnSecondary} 
              style={{ justifyContent: 'flex-start', padding: '0.75rem', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderColor: '#FCA5A5', background: '#FEF2F2', wordBreak: 'break-word' }}
              onClick={() => onNavigateTab('safety')}
            >
              <span style={{ fontWeight: 600, color: '#DC2626' }}>Report Hazard</span>
              <span style={{ fontSize: '0.72rem', color: '#991B1B', marginTop: '0.2rem' }}>Unsafe condition or injury</span>
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.76rem', color: '#92400E', lineHeight: '1.4' }}>
                <strong>Safety Mandate:</strong> Full PPE (Hardhat, High-vis Vest, Steel-toe Boots, Double Lanyard Harness on Level 14 edge) is mandatory at all times.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
