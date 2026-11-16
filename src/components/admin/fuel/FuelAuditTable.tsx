'use client';

import React, { useState } from 'react';
import styles from './FuelAuditTable.module.css';
import SafeImage from '@/components/admin/ui/SafeImage';
import { AlertTriangle, CheckCircle2, X, Receipt, Eye, Calendar, Fuel, Gauge, ArrowRight } from 'lucide-react';

interface PastFuelDisbursement {
  date: string;
  liters: number;
  cost: number;
  meterReading: string;
  pump: string;
  receiptNo: string;
  supervisor: string;
}

interface EnterpriseFuelAuditRecord {
  id: string;
  vehicle: string;
  vehicleImage: string;
  regNumber: string;
  site: string;
  driver: string;
  litersFilled: number;
  engineHoursRun: number;
  expectedLiters: number;
  totalCost: number;
  status: 'Optimal' | 'High Consumption Alert';
  receiptSlipImage: string;
  odometerPhoto: string;
  pumpName: string;
  receiptNumber: string;
  totalMonthlyDieselLiters: number;
  totalMonthlyDieselCost: number;
  averageConsumption: string;
  pastLogs: PastFuelDisbursement[];
}

const mockFuelAudits: EnterpriseFuelAuditRecord[] = [
  { 
    id: '1', 
    vehicle: 'JCB 3DX Super EcoXcellence', 
    vehicleImage: '/images/jcb_real.jpg',
    regNumber: 'MH 12 AB 4590', 
    site: 'Eastern Expressway', 
    driver: 'Santosh Shinde', 
    litersFilled: 60, 
    engineHoursRun: 12.0, 
    expectedLiters: 58, 
    totalCost: 5550, 
    status: 'Optimal',
    receiptSlipImage: '/images/receipt.jpg',
    odometerPhoto: '/images/jcb_real.jpg',
    pumpName: 'Indian Oil Highway Petro Centre #991',
    receiptNumber: 'IOCL-INV-88219',
    totalMonthlyDieselLiters: 1240,
    totalMonthlyDieselCost: 114700,
    averageConsumption: '4.8 Litres / Operating Hour',
    pastLogs: [
      { date: '16 Nov 2026', liters: 60, cost: 5550, meterReading: '1,420 hrs', pump: 'Indian Oil Highway #991', receiptNo: 'IOCL-88219', supervisor: 'Sunil Rao' },
      { date: '14 Nov 2026', liters: 65, cost: 6012, meterReading: '1,408 hrs', pump: 'Indian Oil Highway #991', receiptNo: 'IOCL-87910', supervisor: 'Sunil Rao' },
      { date: '12 Nov 2026', liters: 55, cost: 5087, meterReading: '1,395 hrs', pump: 'Bharat Petroleum Depot', receiptNo: 'BPCL-41092', supervisor: 'Sunil Rao' },
      { date: '10 Nov 2026', liters: 60, cost: 5550, meterReading: '1,382 hrs', pump: 'Indian Oil Highway #991', receiptNo: 'IOCL-87421', supervisor: 'Sunil Rao' },
      { date: '08 Nov 2026', liters: 70, cost: 6475, meterReading: '1,368 hrs', pump: 'HPCL Express Fuel #12', receiptNo: 'HPCL-10294', supervisor: 'Sunil Rao' }
    ]
  },
  { 
    id: '2', 
    vehicle: 'Tata Prima 2830.K Heavy Tipper 16m³', 
    vehicleImage: '/images/tipper_real.jpg',
    regNumber: 'MH 14 CD 7821', 
    site: 'Eastern Expressway', 
    driver: 'Akash Jadhav', 
    litersFilled: 110, 
    engineHoursRun: 140, 
    expectedLiters: 80, 
    totalCost: 10175, 
    status: 'High Consumption Alert',
    receiptSlipImage: '/images/receipt.jpg',
    odometerPhoto: '/images/tipper_real.jpg',
    pumpName: 'Bharat Petroleum Fuel Hub #312',
    receiptNumber: 'BPCL-TAX-40192',
    totalMonthlyDieselLiters: 1980,
    totalMonthlyDieselCost: 183150,
    averageConsumption: '1.28 KM / Litre (Anomaly Detected)',
    pastLogs: [
      { date: '16 Nov 2026', liters: 110, cost: 10175, meterReading: '42,150 KM', pump: 'Bharat Petroleum #312', receiptNo: 'BPCL-40192', supervisor: 'Sunil Rao' },
      { date: '13 Nov 2026', liters: 85, cost: 7862, meterReading: '42,010 KM', pump: 'Bharat Petroleum #312', receiptNo: 'BPCL-39810', supervisor: 'Sunil Rao' },
      { date: '11 Nov 2026', liters: 90, cost: 8325, meterReading: '41,890 KM', pump: 'Indian Oil Depot', receiptNo: 'IOCL-19024', supervisor: 'Sunil Rao' },
    ]
  },
  { 
    id: '3', 
    vehicle: 'Sany Hydraulic Crawler Crane 75T', 
    vehicleImage: '/images/crane_real.jpg',
    regNumber: 'MH 12 EF 9081', 
    site: 'Skyline Site A', 
    driver: 'Ganesh More', 
    litersFilled: 95, 
    engineHoursRun: 15.5, 
    expectedLiters: 92, 
    totalCost: 8787, 
    status: 'Optimal',
    receiptSlipImage: '/images/receipt.jpg',
    odometerPhoto: '/images/crane_real.jpg',
    pumpName: 'HPCL Express Highway Depot',
    receiptNumber: 'HPCL-REC-90312',
    totalMonthlyDieselLiters: 1650,
    totalMonthlyDieselCost: 152625,
    averageConsumption: '6.1 Litres / Operating Hour',
    pastLogs: [
      { date: '16 Nov 2026', liters: 95, cost: 8787, meterReading: '3,120 hrs', pump: 'HPCL Express Depot', receiptNo: 'HPCL-90312', supervisor: 'Pravin Gaikwad' },
      { date: '14 Nov 2026', liters: 90, cost: 8325, meterReading: '3,105 hrs', pump: 'HPCL Express Depot', receiptNo: 'HPCL-89912', supervisor: 'Pravin Gaikwad' },
      { date: '11 Nov 2026', liters: 95, cost: 8787, meterReading: '3,089 hrs', pump: 'Indian Oil #991', receiptNo: 'IOCL-44129', supervisor: 'Pravin Gaikwad' },
    ]
  },
];

export default function FuelAuditTable() {
  const [selectedMachine, setSelectedMachine] = useState<EnterpriseFuelAuditRecord | null>(null);
  const [viewReceipt, setViewReceipt] = useState<EnterpriseFuelAuditRecord | null>(null);
  const [audits, setAudits] = useState(mockFuelAudits);

  const resolveAnomaly = (id: string) => {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, status: 'Optimal' } : a));
    setSelectedMachine(null);
  };

  return (
    <div className={styles.container}>
      {/* High-Level Fuel Telematics KPIs */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Today's Fuel Disbursed</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>265 Liters</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Pump Invoices: ₹ 24,512</span>
        </div>

        <div className={`${styles.kpiCard} ${styles.alertCard}`}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Anti-Theft Mismatch Alerts</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
            {audits.filter(a => a.status !== 'Optimal').length} Discrepancies
          </div>
          <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Tata Tipper +30L above GPS norm</span>
        </div>

        <div className={styles.kpiCard}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Monthly Fleet Fuel Burn</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>4,870 Litres</div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Total Expense: ₹ 4,50,475</span>
        </div>
      </div>

      {/* Main Visual Fuel Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
            Live Machinery Fuel Allocation & Burn Analysis
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Click machine to inspect historical fuel logbook</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vehicle Asset (Click to Inspect)</th>
              <th>Deployed Site & Driver</th>
              <th>Today's Fuel Disbursed</th>
              <th>Operating Metrics</th>
              <th>Pump Receipt & Meter</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(f => (
              <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedMachine(f)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <SafeImage 
                      src={f.vehicleImage} 
                      alt={f.vehicle} 
                      fallbackType="machine"
                      style={{ width: 52, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                    />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{f.vehicle}</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>{f.regNumber}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{f.site}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Driver: {f.driver}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{f.litersFilled} Litres</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>₹ {f.totalCost.toLocaleString('en-IN')}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{f.engineHoursRun} {f.vehicle.includes('Tipper') ? 'KM' : 'Hours'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Target: ~{f.expectedLiters} L</div>
                </td>
                <td>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewReceipt(f); }}
                    style={{
                      background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px',
                      borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700
                    }}
                  >
                    <Eye size={13} color="#f59e0b" /> View Slips
                  </button>
                </td>
                <td>
                  {f.status === 'Optimal' ? (
                    <span className={styles.badgeOptimal}>
                      <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 2 }} />
                      Optimal Burn
                    </span>
                  ) : (
                    <span className={styles.badgeAnomaly}>
                      <AlertTriangle size={12} />
                      Mismatch (+30L)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historical Fuel Ledger Modal */}
      {selectedMachine && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setSelectedMachine(null)}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 720,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background: '#0f172a', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <SafeImage src={selectedMachine.vehicleImage} alt={selectedMachine.vehicle} fallbackType="machine" style={{ width: 60, height: 50, borderRadius: 8, objectFit: 'cover', border: '2px solid #f59e0b' }} />
                <div>
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>REG: {selectedMachine.regNumber}</span>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0' }}>{selectedMachine.vehicle}</h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Driver: {selectedMachine.driver} • {selectedMachine.site}</span>
                </div>
              </div>
              <button onClick={() => setSelectedMachine(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Analytics Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>MONTHLY DIESEL</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{selectedMachine.totalMonthlyDieselLiters} Litres</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>TOTAL DIESEL COST</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>₹ {selectedMachine.totalMonthlyDieselCost.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>AVERAGE BURN RATE</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{selectedMachine.averageConsumption}</div>
                </div>
              </div>

              {/* Past Fuel Disbursements Table */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="#f59e0b" /> Complete Historical Fuel Logbook (Previous Refuels)
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Date</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Liters</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Amount (₹)</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Meter Reading</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Petrol Pump & Invoice</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Logged By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMachine.pastLogs.map((log, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{log.date}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{log.liters} L</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#059669' }}>₹ {log.cost.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{log.meterReading}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{log.pump} ({log.receiptNo})</td>
                          <td style={{ padding: '8px 12px', fontWeight: 500 }}>{log.supervisor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Resolution if Anomaly */}
              {selectedMachine.status !== 'Optimal' && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#be123c', fontSize: '0.85rem' }}>Excess Fuel Discrepancy Flagged (+30 Litres)</strong>
                    <p style={{ fontSize: '0.75rem', color: '#881337', margin: 0 }}>Driver Akash Jadhav has not justified the excess consumption.</p>
                  </div>
                  <button 
                    onClick={() => resolveAnomaly(selectedMachine.id)}
                    style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Deduct from Driver Wage & Clear
                  </button>
                </div>
              )}

              <button 
                onClick={() => setSelectedMachine(null)}
                style={{
                  padding: '10px', background: '#0f172a', color: '#ffffff',
                  border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                Close Machine Fuel Logbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dual Slip & Odometer Modal */}
      {viewReceipt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setViewReceipt(null)}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 580,
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Dual Verification: Pump Invoice & Meter Proof</h3>
              <button onClick={() => setViewReceipt(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>1. PETROL PUMP INVOICE SLIP</span>
                  <div style={{ height: 200, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={viewReceipt.receiptSlipImage} alt="Pump Slip" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>2. TRUCK / JCB METER PROOF</span>
                  <div style={{ height: 200, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={viewReceipt.odometerPhoto} alt="Odometer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.82rem' }}>
                <strong>Fuel Station:</strong> {viewReceipt.pumpName}<br />
                <strong>Invoice Number:</strong> {viewReceipt.receiptNumber} • <strong>Liters:</strong> {viewReceipt.litersFilled} L (₹ {viewReceipt.totalCost})<br />
                <strong>Driver / Operator:</strong> {viewReceipt.driver}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
