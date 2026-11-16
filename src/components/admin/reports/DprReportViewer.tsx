'use client';

import React, { useState } from 'react';
import styles from './DprReportViewer.module.css';
import { Printer, Download, Calendar, Building, HardHat, Truck, Fuel, CheckCircle, FileText } from 'lucide-react';

export default function DprReportViewer() {
  const [selectedSite, setSelectedSite] = useState('All Sites Portfolio');
  const [reportDate, setReportDate] = useState('2026-11-16');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      {/* KPI Summary Cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Cumulative Workforce Today</span>
          <div className={styles.kpiValue} style={{ color: '#0f172a' }}>142 Workers</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>100% Biometric Audited</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Cumulative Diesel Burn</span>
          <div className={styles.kpiValue} style={{ color: '#059669' }}>265 Litres</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>₹ 24,512 verified procurement</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Site Spend (Today)</span>
          <div className={styles.kpiValue} style={{ color: '#0f172a' }}>₹ 68,450</div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>Wages + Fuel + Maintenance</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>DPR Sign-Off Status</span>
          <div className={styles.kpiValue} style={{ color: '#10b981', fontSize: '1.25rem' }}>Ready for MD</div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>All Site Logs Consolidated</span>
        </div>
      </div>

      {/* Main DPR Generator Panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={20} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Executive Daily Progress Report (DPR)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Official MNC Construction Site Operations Brief
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select 
              value={selectedSite} 
              onChange={e => setSelectedSite(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="All Sites Portfolio">All Sites Portfolio</option>
              <option value="Skyline Commercial Complex, Pune">Skyline Commercial Complex, Pune</option>
              <option value="Eastern Expressway Bridge Sec-4">Eastern Expressway Bridge Sec-4</option>
              <option value="Metro Line Corridor Piling">Metro Line Corridor Piling</option>
            </select>

            <button className={styles.btnPrint} onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Export DPR PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Official DPR Document */}
        <div className={styles.dprSheet}>
          <div className={styles.dprHeader}>
            <div>
              <div className={styles.companyTitle}>STRUCTIVA INFRASTRUCTURE LTD.</div>
              <div className={styles.companySub}>MNC Site Operations & Project Management Division</div>
              <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, marginTop: 4 }}>
                Selected Scope: {selectedSite}
              </div>
            </div>
            <div className={styles.dprMetaBlock}>
              <div>Report Reference: <strong style={{ color: '#f59e0b' }}>DPR-2026-NOV-16</strong></div>
              <div>Report Date: <strong>16 November 2026</strong></div>
              <div>Generated Time: <strong>04:30 PM IST (Shift-1 Close)</strong></div>
              <div>Authorized By: <strong>Super Admin & Project Directors</strong></div>
            </div>
          </div>

          {/* Section 1: Civil & Structural Milestones */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={16} color="#f59e0b" /> 1. Civil Work & Site Execution Progress
            </h4>
            <table className={styles.dprTable}>
              <thead>
                <tr>
                  <th>Site Project</th>
                  <th>Key Work Executed Today</th>
                  <th>Target vs Actual</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Skyline Commercial Tower</strong></td>
                  <td>Level 4 Slab Reinforcement & Column Concreting (M-40 Grade)</td>
                  <td>Target: 140 m³ | Actual: 145 m³</td>
                  <td><strong>68% Completed</strong></td>
                  <td><span style={{ color: '#059669', fontWeight: 700 }}>✓ On Schedule</span></td>
                </tr>
                <tr>
                  <td><strong>Eastern Expressway Flyover</strong></td>
                  <td>Pier-4 Segmental Box Girder Launching & Cable Stressing</td>
                  <td>Target: 2 Spans | Actual: 2 Spans</td>
                  <td><strong>84% Completed</strong></td>
                  <td><span style={{ color: '#059669', fontWeight: 700 }}>✓ Ahead by 3 Days</span></td>
                </tr>
                <tr>
                  <td><strong>Metro Line Corridor Piling</strong></td>
                  <td>Bored Cast-in-Situ Piling (1200mm Dia) & Bentonite Slurry Flush</td>
                  <td>Target: 4 Piles | Actual: 3 Piles</td>
                  <td><strong>42% Completed</strong></td>
                  <td><span style={{ color: '#d97706', fontWeight: 700 }}>⚠ Utility Delay Resolved</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Workforce Muster Roll */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <HardHat size={16} color="#f59e0b" /> 2. Workforce Attendance & Accrued Daily Payroll
            </h4>
            <table className={styles.dprTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Headcount Present</th>
                  <th>Standard Hours</th>
                  <th>Overtime Logged</th>
                  <th>Accrued Daily Wage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Skilled Trade (Masons, Operators, Bar Benders)</strong></td>
                  <td>62 Men</td>
                  <td>496 Man-Hours</td>
                  <td>18.5 Man-Hours</td>
                  <td style={{ fontWeight: 700 }}>₹ 28,450</td>
                </tr>
                <tr>
                  <td><strong>Semi-Skilled (Carpenters, Shuttering Helpers)</strong></td>
                  <td>48 Men</td>
                  <td>384 Man-Hours</td>
                  <td>8.0 Man-Hours</td>
                  <td style={{ fontWeight: 700 }}>₹ 14,200</td>
                </tr>
                <tr>
                  <td><strong>General Unskilled Civil Labour</strong></td>
                  <td>32 Men</td>
                  <td>256 Man-Hours</td>
                  <td>0.0 Man-Hours</td>
                  <td style={{ fontWeight: 700 }}>₹ 8,000</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td>TOTAL DEPLOYED LABOUR FORCE</td>
                  <td>142 Workers</td>
                  <td>1,136 Man-Hours</td>
                  <td>26.5 OT Hours</td>
                  <td style={{ color: '#059669' }}>₹ 50,650</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Heavy Fleet Utilization & Fuel Ledger */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={16} color="#f59e0b" /> 3. Heavy Assets Utilization & Diesel Burn Audit
            </h4>
            <table className={styles.dprTable}>
              <thead>
                <tr>
                  <th>Asset & Registration</th>
                  <th>Operating Metric (Hrs / KM)</th>
                  <th>Fuel Disbursed</th>
                  <th>Efficiency Norm</th>
                  <th>Audit Sign-Off</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>JCB 3DX Super (MH 12 AB 4590)</strong></td>
                  <td>12.0 Hours</td>
                  <td>60 Litres (₹ 5,550)</td>
                  <td>5.0 L / hr (Optimal)</td>
                  <td><span style={{ color: '#059669', fontWeight: 700 }}>Passed OEM Audit</span></td>
                </tr>
                <tr>
                  <td><strong>Tata Prima Tipper 16m³ (MH 14 CD 7821)</strong></td>
                  <td>140 KM</td>
                  <td>110 Litres (₹ 10,175)</td>
                  <td>1.28 KM/L (Heavy Slurry)</td>
                  <td><span style={{ color: '#059669', fontWeight: 700 }}>Supervisor Justified</span></td>
                </tr>
                <tr>
                  <td><strong>Sany 75T Crawler Crane (MH 12 EF 9081)</strong></td>
                  <td>15.5 Hours</td>
                  <td>95 Litres (₹ 8,787)</td>
                  <td>6.1 L / hr (Optimal)</td>
                  <td><span style={{ color: '#059669', fontWeight: 700 }}>Passed OEM Audit</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures & Official Stamps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 24, paddingTop: 20, borderTop: '1px solid #cbd5e1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 40 }}></div>
              <div style={{ borderTop: '1px dashed #475569', paddingTop: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                Er. Pravin Gaikwad
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lead Site Supervisor (Field Stamp)</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 40 }}></div>
              <div style={{ borderTop: '1px dashed #475569', paddingTop: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                Er. Rajesh Kulkarni
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Chief Project Manager (MNC Civil)</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 40 }}></div>
              <div style={{ borderTop: '1px dashed #475569', paddingTop: 6, fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                SUPER ADMIN SIGN-OFF (DIGITAL)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized Corporate Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
