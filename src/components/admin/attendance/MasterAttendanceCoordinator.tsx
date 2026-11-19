'use client';

import React, { useState } from 'react';
import styles from './AttendanceTracker.module.css';
import supStyles from './SupervisorAttendanceView.module.css';
import AttendanceTracker from './AttendanceTracker';
import SupervisorAttendanceView from './SupervisorAttendanceView';
import { Users, HardHat, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function MasterAttendanceCoordinator() {
  const [activeAttendanceSystem, setActiveAttendanceSystem] = useState<'worker' | 'supervisor'>('worker');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Dual Attendance Mode Switcher */}
      <div className={supStyles.masterNavSwitcher}>
        <button
          className={`${supStyles.masterNavBtn} ${activeAttendanceSystem === 'worker' ? supStyles.masterNavBtnActive : ''}`}
          onClick={() => setActiveAttendanceSystem('worker')}
        >
          <HardHat size={18} />
          <span>Worker Attendance & Daily Muster</span>
          <span className={supStyles.counterBadge}>Labour Force</span>
        </button>

        <button
          className={`${supStyles.masterNavBtn} ${activeAttendanceSystem === 'supervisor' ? supStyles.masterNavBtnActive : ''}`}
          onClick={() => setActiveAttendanceSystem('supervisor')}
        >
          <ShieldCheck size={18} />
          <span>Supervisor Attendance & Shift Audit</span>
          <span className={supStyles.counterBadge}>Field Management</span>
        </button>
      </div>

      {/* Render Selected Partition */}
      {activeAttendanceSystem === 'worker' ? (
        <AttendanceTracker />
      ) : (
        <SupervisorAttendanceView />
      )}
    </div>
  );
}
