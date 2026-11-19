'use client';

import React, { useState } from 'react';
import supStyles from './SupervisorDirectoryView.module.css';
import WorkerTable from './WorkerTable';
import SupervisorDirectoryView from './SupervisorDirectoryView';
import { Users, HardHat, ShieldCheck } from 'lucide-react';

export default function MasterWorkforceCoordinator() {
  const [activeTab, setActiveTab] = useState<'workers' | 'supervisors'>('workers');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Workforce Dual Switcher */}
      <div className={supStyles.masterNavSwitcher}>
        <button
          className={`${supStyles.masterNavBtn} ${activeTab === 'workers' ? supStyles.masterNavBtnActive : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          <HardHat size={18} />
          <span>Worker & Labour Directory</span>
          <span className={supStyles.counterBadge}>Trade Labour</span>
        </button>

        <button
          className={`${supStyles.masterNavBtn} ${activeTab === 'supervisors' ? supStyles.masterNavBtnActive : ''}`}
          onClick={() => setActiveTab('supervisors')}
        >
          <ShieldCheck size={18} />
          <span>Field Supervisors Management</span>
          <span className={supStyles.counterBadge}>Field Management</span>
        </button>
      </div>

      {/* Render Selected View */}
      {activeTab === 'workers' ? (
        <WorkerTable />
      ) : (
        <SupervisorDirectoryView />
      )}
    </div>
  );
}
