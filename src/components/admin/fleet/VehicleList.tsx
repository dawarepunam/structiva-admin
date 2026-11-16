'use client';

import React, { useState } from 'react';
import styles from './VehicleList.module.css';
import { Truck, Search, Plus, MapPin, Gauge, ShieldCheck, X, ArrowRight, UserCheck } from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';
import { Vehicle } from '@/types';

interface EnterpriseMachinery extends Vehicle {
  image: string;
  projectSite: string;
  fuelType: 'Diesel (High Cetane)' | 'Petrol';
  lastServiceDate: string;
  insuranceValidUntil: string;
  telematicsImei: string;
}

const enterpriseFleet: EnterpriseMachinery[] = [
  {
    id: '1',
    name: 'JCB 3DX Super EcoXcellence Backhoe',
    registrationNumber: 'MH 12 AB 4590',
    type: 'JCB / Excavator',
    currentStatus: 'On Site',
    assignedDriver: 'Santosh Shinde (Lic: DL-09-2018)',
    operatingHoursOrKm: 1420,
    projectSite: 'Skyline Commercial Complex, Pune',
    fuelType: 'Diesel (High Cetane)',
    lastServiceDate: '02 Nov 2026',
    insuranceValidUntil: '14 Oct 2027',
    telematicsImei: '864291038472910',
    image: '/images/jcb_real.jpg'
  },
  {
    id: '2',
    name: 'Tata Prima 2830.K Heavy Tipper 16m³',
    registrationNumber: 'MH 14 CD 7821',
    type: 'Dumper',
    currentStatus: 'On Site',
    assignedDriver: 'Akash Jadhav (Lic: DL-12-2020)',
    operatingHoursOrKm: 42150,
    projectSite: 'Eastern Expressway Bridge Sec-4',
    fuelType: 'Diesel (High Cetane)',
    lastServiceDate: '28 Oct 2026',
    insuranceValidUntil: '22 Jan 2027',
    telematicsImei: '869123849182390',
    image: '/images/tipper_real.jpg'
  },
  {
    id: '3',
    name: 'Sany Hydraulic Crawler Crane 75T',
    registrationNumber: 'MH 12 EF 9081',
    type: 'Crane',
    currentStatus: 'On Site',
    assignedDriver: 'Ganesh More (Master Crane Pilot)',
    operatingHoursOrKm: 3120,
    projectSite: 'Metro Line Corridor Piling, Mumbai',
    fuelType: 'Diesel (High Cetane)',
    lastServiceDate: '10 Nov 2026',
    insuranceValidUntil: '05 Dec 2027',
    telematicsImei: '861029384756192',
    image: '/images/crane_real.jpg'
  }
];

export default function VehicleList() {
  const [fleet, setFleet] = useState<EnterpriseMachinery[]>(enterpriseFleet);
  const [search, setSearch] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<EnterpriseMachinery | null>(null);

  const filtered = fleet.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    m.projectSite.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 14px', borderRadius: 8, border: '1px solid #cbd5e1', width: 340 }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search by machine name, reg #, site..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          Heavy Assets Active: <strong>{filtered.length} Telematics Connected</strong>
        </span>
      </div>

      <div className={styles.fleetGrid}>
        {filtered.map(m => (
          <div key={m.id} className={styles.card} onClick={() => setSelectedMachine(m)}>
            <div className={styles.imageWrapper}>
              <SafeImage src={m.image} alt={m.name} fallbackType="machine" className={styles.machineImage} />
              <div className={`${styles.statusTag} ${styles.statusActive}`}>
                <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }}></span>
                <span>{m.currentStatus}</span>
              </div>
              <span className={styles.regOverlay}>{m.registrationNumber}</span>
            </div>

            <div className={styles.cardContent}>
              <div>
                <h3 className={styles.title}>{m.name}</h3>
                <span className={styles.subTitle}>{m.type} • {m.projectSite}</span>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>OPERATING LOG</span>
                  <span className={styles.metricValue}>{m.operatingHoursOrKm} {m.type === 'Dumper' ? 'KM' : 'Hours'}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>DRIVER / OPERATOR</span>
                  <span className={styles.metricValue} style={{ fontSize: '0.8rem' }}>{m.assignedDriver.split('(')[0]}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> Telematics GPS Active
                </span>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Machine Dossier <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Machine Dossier Modal */}
      {selectedMachine && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMachine(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHero}>
              <SafeImage src={selectedMachine.image} alt={selectedMachine.name} fallbackType="machine" className={styles.modalHeroImage} />
              <button className={styles.modalClose} onClick={() => setSelectedMachine(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.8rem' }}>REG: {selectedMachine.registrationNumber}</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{selectedMachine.name}</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Deployed at: <strong>{selectedMachine.projectSite}</strong></span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ENGINE HOURS / KM</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{selectedMachine.operatingHoursOrKm}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>LAST SERVICE</span>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>{selectedMachine.lastServiceDate}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>INSURANCE DUE</span>
                  <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{selectedMachine.insuranceValidUntil}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ color: '#64748b' }}>Assigned Pilot / Driver:</span>
                  <strong>{selectedMachine.assignedDriver}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ color: '#64748b' }}>Fuel Specification:</span>
                  <strong>{selectedMachine.fuelType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ color: '#64748b' }}>GPS Telematics Hardware IMEI:</span>
                  <code style={{ color: '#0f172a', fontWeight: 700 }}>{selectedMachine.telematicsImei}</code>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMachine(null)}
                style={{
                  padding: '11px', background: '#0f172a', color: '#ffffff',
                  border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Close Asset Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
