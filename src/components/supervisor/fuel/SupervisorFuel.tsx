'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from '../common/SupervisorCommon.module.css';
import { 
  Fuel, 
  Send, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X,
  FileSpreadsheet,
  Truck
} from 'lucide-react';
import { fetchStrapiCollection, createStrapiEntity } from '@/services/strapiClient';
import { getStoredFleet, EnterpriseAssetRecord } from '@/services/fleetStorage';

export default function SupervisorFuelView() {
  const [fuels, setFuels] = useState<any[]>([]);
  const [fleet, setFleet] = useState<EnterpriseAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedAssetCode, setSelectedAssetCode] = useState('EQP-JCB-01');
  const [litres, setLitres] = useState<number>(45);
  const [rate, setRate] = useState<number>(92.5);
  const [bowserPump, setBowserPump] = useState('Site Mobile Diesel Bowser 01');
  const [receiptNo, setReceiptNo] = useState('');
  const [meterReading, setMeterReading] = useState('1425.0 Hours');
  const [runHours, setRunHours] = useState<number>(8);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [fuelList, fleetList] = await Promise.all([
        fetchStrapiCollection('fuels', []),
        fetchStrapiCollection<EnterpriseAssetRecord>('fleets', getStoredFleet())
      ]);
      setFuels(fuelList);
      setFleet(fleetList);
      if (fleetList.length > 0) {
        setSelectedAssetCode(fleetList[0].code);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    setReceiptNo('BWS-PUN-' + Math.floor(1000 + Math.random() * 9000));
  }, []);

  // Selected asset details
  const currentAsset = useMemo(() => {
    return fleet.find(a => a.code === selectedAssetCode) || fleet[0];
  }, [fleet, selectedAssetCode]);

  // Theft & Anomaly Detection logic
  // Business Rule: If burn rate > 8.0 L/hr on backhoe, flag as anti-theft anomaly
  const calculatedCost = useMemo(() => litres * rate, [litres, rate]);
  const burnRate = useMemo(() => {
    if (!runHours || runHours <= 0) return 0;
    return Number((litres / runHours).toFixed(2));
  }, [litres, runHours]);

  const isAnomaly = useMemo(() => {
    return burnRate > 7.5; // Exceeds manufacturer baseline
  }, [burnRate]);

  // Analytics
  const stats = useMemo(() => {
    const totalLitres = fuels.reduce((acc, f) => acc + (Number(f.litresDisbursed) || 0), 0);
    const totalCost = fuels.reduce((acc, f) => acc + (Number(f.totalCost) || 0), 0);
    const anomalies = fuels.filter(f => f.isTheftAnomaly).length;
    return { totalLitres, totalCost, anomalies, entriesCount: fuels.length };
  }, [fuels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const assetName = currentAsset?.name || 'Heavy Equipment';
    const operatorName = currentAsset?.assignedOperator || 'Ganesh More';

    const payload = {
      assetCode: selectedAssetCode,
      assetName,
      date: new Date().toLocaleDateString('en-GB'),
      litresDisbursed: litres,
      ratePerLitre: rate,
      totalCost: calculatedCost,
      meterReading,
      fuelPumpOrBowser: bowserPump,
      receiptInvoiceNo: receiptNo || ('BWS-PUN-' + Math.floor(1000 + Math.random() * 9000)),
      supervisorName: 'Er. Pravin Gaikwad',
      operatorName,
      runHoursLogged: runHours,
      burnRatePerHour: burnRate,
      isTheftAnomaly: isAnomaly,
      theftVarianceLitres: isAnomaly ? Math.round(litres - (runHours * 5.0)) : 0,
      notes: isAnomaly ? `Anomaly Alert: Burn rate ${burnRate} L/hr exceeds 5.0 L/hr norm by ${Math.round(litres - (runHours * 5.0))}L.` : 'Standard operational burn rate verified.'
    };

    const res = await createStrapiEntity('fuels', payload);
    setFuels(prev => [payload, ...prev]);
    setMessage({
      type: 'success',
      text: `Fuel entry of ${litres}L recorded in Strapi for ${assetName}. Total: ₹${calculatedCost.toLocaleString('en-IN')}.`
    });
    setSubmitting(false);
    setReceiptNo('BWS-PUN-' + Math.floor(1000 + Math.random() * 9000));
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExportCSV = () => {
    if (fuels.length === 0) return;
    const headers = ['Date,Asset Code,Asset Name,Litres,Rate/L,Total Cost,Meter,Bowser,Operator,Burn Rate (L/hr),Anomaly'];
    const rows = fuels.map(f => 
      `"${f.date}","${f.assetCode}","${f.assetName}",${f.litresDisbursed},${f.ratePerLitre},${f.totalCost},"${f.meterReading}","${f.fuelPumpOrBowser}","${f.operatorName || ''}",${f.burnRatePerHour || 0},"${f.isTheftAnomaly ? 'YES' : 'NO'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STRUCTIVA_Fuel_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h2>Site Fuel Logistics & Bowser Telemetry</h2>
          <p>Disburse diesel allocations, compute burn rates, and intercept equipment fuel theft.</p>
        </div>
        <button onClick={handleExportCSV} className={styles.btnPrimary} style={{ background: '#203A3B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
          <FileSpreadsheet size={15} />
          <span>Export Fuel Log</span>
        </button>
      </div>

      {/* Analytics KPI Row - 2x2 grid on mobile screens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', width: '100%' }}>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Total Fuel Issued</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#172B32' }}>{stats.totalLitres} L</h3>
          <span style={{ fontSize: '0.68rem', color: '#167C72', fontWeight: 600 }}>{stats.entriesCount} Allocations</span>
        </div>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Fuel Invoiced</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#167C72' }}>₹{stats.totalCost.toLocaleString('en-IN')}</h3>
          <span style={{ fontSize: '0.68rem', color: '#718096' }}>Avg ₹92.5/L</span>
        </div>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Bowser Nodes</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#203A3B' }}>1 Mobile</h3>
          <span style={{ fontSize: '0.68rem', color: '#718096' }}>Cap: 2,000L</span>
        </div>
        <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Anti-Theft Mismatch</span>
          <h3 style={{ margin: '0.1rem 0', fontSize: '1.25rem', fontWeight: 800, color: stats.anomalies > 0 ? '#EF4444' : '#10B981' }}>
            {stats.anomalies} Flags
          </h3>
          <span style={{ fontSize: '0.68rem', color: '#718096' }}>Telemetry Safe</span>
        </div>
      </div>

      {/* Disburse Form */}
      <div className={styles.formCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Disburse Diesel & Audit Burn Rate</h3>
          {isAnomaly && (
            <span style={{ fontSize: '0.75rem', background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> High Burn Rate Alert ({burnRate} L/hr)
            </span>
          )}
        </div>

        {message && (
          <div style={{
            background: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Target Machinery / Vehicle *</label>
            <select 
              className={styles.select} 
              value={selectedAssetCode} 
              onChange={e => setSelectedAssetCode(e.target.value)}
              required
            >
              {fleet.map(asset => (
                <option key={asset.id} value={asset.code}>
                  {asset.name} ({asset.code}) &mdash; Op: {asset.assignedOperator}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantity Disbursed (Litres) *</label>
            <input 
              type="number" 
              className={styles.input} 
              value={litres} 
              onChange={e => setLitres(Number(e.target.value))} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Rate Per Litre (₹) *</label>
            <input 
              type="number" 
              step="0.1" 
              className={styles.input} 
              value={rate} 
              onChange={e => setRate(Number(e.target.value))} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Run Hours Logged (Since Last Refuel)</label>
            <input 
              type="number" 
              step="0.5" 
              className={styles.input} 
              value={runHours} 
              onChange={e => setRunHours(Number(e.target.value))} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Odometer / Hour Meter Reading</label>
            <input 
              type="text" 
              className={styles.input} 
              value={meterReading} 
              onChange={e => setMeterReading(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bowser Pump Node</label>
            <input 
              type="text" 
              className={styles.input} 
              value={bowserPump} 
              onChange={e => setBowserPump(e.target.value)} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pump Receipt Invoice No.</label>
            <input 
              type="text" 
              className={styles.input} 
              value={receiptNo} 
              onChange={e => setReceiptNo(e.target.value)} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Computed Cost & Burn Rate</label>
            <input 
              type="text" 
              className={styles.input} 
              value={`₹${calculatedCost.toLocaleString('en-IN')} (${burnRate} L/hr)`} 
              disabled 
              style={{ fontWeight: 700, color: '#167C72' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
            <button 
              type="submit" 
              disabled={submitting} 
              className={styles.btnPrimary} 
              style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Fuel size={18} />
              <span>{submitting ? 'Transmitting to Strapi...' : 'Record Fuel Entry & Audit Telemetry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Fuel Records Table */}
      <div className={styles.tableWrapper}>
        <div style={{ padding: '0.85rem 1rem', background: '#F4F2EC', borderBottom: '1px solid #ECEBE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.88rem', color: '#172B32' }}>Live Fuel Issuance Records (Strapi Database)</strong>
          <span style={{ fontSize: '0.78rem', color: '#718096' }}>{fuels.length} Entries Recorded</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset Code</th>
              <th>Asset Name</th>
              <th>Litres</th>
              <th>Total (₹)</th>
              <th>Burn Rate</th>
              <th>Operator</th>
              <th>Theft Audit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fuels.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                  {loading ? 'Fetching fuel logs from Strapi...' : 'No fuel disbursement logs recorded.'}
                </td>
              </tr>
            ) : (
              fuels.map((f, idx) => (
                <tr key={f.id || idx}>
                  <td>{f.date}</td>
                  <td style={{ fontWeight: 600 }}>{f.assetCode}</td>
                  <td>{f.assetName}</td>
                  <td>{f.litresDisbursed} L</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(f.totalCost).toLocaleString('en-IN')}</td>
                  <td>{f.burnRatePerHour ? `${f.burnRatePerHour} L/hr` : 'Normal'}</td>
                  <td>{f.operatorName || 'Assigned Driver'}</td>
                  <td>
                    <span className={`${styles.badge} ${f.isTheftAnomaly ? styles.badgeWarning : styles.badgeSuccess}`}>
                      {f.isTheftAnomaly ? 'Mismatch Flag' : 'Verified'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedLog(f)}
                      style={{ background: 'none', border: 'none', color: '#167C72', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Audit Slip
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Slip Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 43, 50, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ECEBE5', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#172B32' }}>Fuel Allocation Receipt & Audit</h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Receipt / Invoice:</strong>
                <span>{selectedLog.receiptInvoiceNo || 'N/A'}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Date:</strong>
                <span>{selectedLog.date}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Equipment:</strong>
                <span>{selectedLog.assetName} ({selectedLog.assetCode})</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Litres Disbursed:</strong>
                <span style={{ fontWeight: 700, color: '#167C72' }}>{selectedLog.litresDisbursed} L @ ₹{selectedLog.ratePerLitre}/L</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Total Cost:</strong>
                <span style={{ fontWeight: 800 }}>₹{Number(selectedLog.totalCost).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Hour Meter:</strong>
                <span>{selectedLog.meterReading || '1420.5 Hours'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ display: 'block', color: '#718096', fontSize: '0.75rem' }}>Telemetry Audit Notes:</strong>
                <span>{selectedLog.notes || 'Normal burn rate within manufacturer tolerance.'}</span>
              </div>
            </div>

            <button onClick={() => setSelectedLog(null)} className={styles.btnPrimary} style={{ width: '100%', marginTop: '1.25rem' }}>
              Close Audit Slip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
