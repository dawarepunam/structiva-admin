'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import {
  Banknote,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerSalaryProps {
  worker: WorkerProfile;
}

export default function WorkerSalaryView({ worker }: WorkerSalaryProps) {
  const dailyWage = worker.dailyWage || 950;
  const presentDays = worker.presentDaysThisMonth || 19;
  const overtimeHours = worker.overtimeHoursThisMonth || 14;
  const overtimeRate = worker.overtimeHourlyRate || 140;

  const baseEarnings = presentDays * dailyWage;
  const overtimeEarnings = overtimeHours * overtimeRate;
  const grossPayable = baseEarnings + overtimeEarnings;

  const pfDeduction = 0; // Direct site payroll muster
  const advanceRecovery = 1500;
  const safetyFine = 0;
  const totalDeductions = advanceRecovery + safetyFine;
  const netPayable = grossPayable - totalDeductions;

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            My Wages, Salary & Payslips
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Verified monthly muster earnings, approved overtime, and advance deductions
          </div>
        </div>

        <button className={styles.btnSecondary} onClick={() => window.print()}>
          <Printer size={16} /> Print Monthly Statement
        </button>
      </div>

      {/* Primary Payslip Card */}
      <div className={styles.card} style={{ border: '2px solid #167C72' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#B58B59', fontWeight: 700, letterSpacing: '1px' }}>
              STRUCTIVA INFRASTRUCTURE CORP. • PAYROLL VOUCHER
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', color: '#172B32' }}>
              Payroll Month: October 2026 (Disbursed)
            </h3>
          </div>
          <span className={`${styles.badge} ${styles.badgeSuccess}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            PAID VIA BANK TRANSFER
          </span>
        </div>

        {/* Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
          {/* Earnings */}
          <div style={{ background: '#F8F9FA', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#059669', borderBottom: '1px solid #D1D5DB', paddingBottom: '0.4rem' }}>
              Earnings Breakdown
            </h4>
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Muster Days Worked ({presentDays} days @ ₹{dailyWage}/day):</span>
                <span style={{ fontWeight: 600 }}>₹{baseEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Approved Overtime ({overtimeHours} hrs @ ₹{overtimeRate}/hr):</span>
                <span style={{ fontWeight: 600 }}>₹{overtimeEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: '#172B32' }}>Gross Earnings:</span>
                <span style={{ fontWeight: 700, color: '#172B32' }}>₹{grossPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div style={{ background: '#F8F9FA', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#DC2626', borderBottom: '1px solid #D1D5DB', paddingBottom: '0.4rem' }}>
              Deductions & Recoveries
            </h4>
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Salary Advance Recovery (Instalment 1 of 2):</span>
                <span style={{ fontWeight: 600, color: '#DC2626' }}>-₹{advanceRecovery.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Safety Infractions / Disciplinary:</span>
                <span style={{ fontWeight: 600 }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: '#172B32' }}>Total Deductions:</span>
                <span style={{ fontWeight: 700, color: '#DC2626' }}>-₹{totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Banner */}
        <div style={{ background: 'linear-gradient(135deg, #172B32, #203A3B)', color: '#FFF', padding: '1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#A0B2B6' }}>Total Net Disbursed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399' }}>
              ₹{netPayable.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ECEBE5', marginTop: '0.2rem' }}>
              State Bank of India • A/c {worker.accountNumberMasked || '•••• 4519'} • UTR: SBI-RTGS-992144
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#ECEBE5' }}>Payment Date: 05 Nov 2026</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '0.2rem' }}>
              Certified by HR & Accounts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
