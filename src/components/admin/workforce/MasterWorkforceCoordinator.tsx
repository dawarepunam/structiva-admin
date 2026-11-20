'use client';

import React, { useState } from 'react';
import supStyles from './SupervisorDirectoryView.module.css';
import WorkerTable from './WorkerTable';
import SupervisorDirectoryView from './SupervisorDirectoryView';
import ProfileCorrectionRequestsView from './ProfileCorrectionRequestsView';
import { Users, HardHat, ShieldCheck, UserCheck } from 'lucide-react';

export default function MasterWorkforceCoordinator() {
  const [activeTab, setActiveTab] = useState<'workers' | 'supervisors' | 'corrections'>('workers');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Workforce Triple Switcher */}
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

        <button
          className={`${supStyles.masterNavBtn} ${activeTab === 'corrections' ? supStyles.masterNavBtnActive : ''}`}
          onClick={() => setActiveTab('corrections')}
        >
          <UserCheck size={18} />
          <span>Profile Correction Requests</span>
          <span className={supStyles.counterBadge} style={{ background: '#FEF3C7', color: '#92400E' }}>Verification</span>
        </button>
      </div>

      {/* Render Selected View */}
      {activeTab === 'workers' ? (
        <WorkerTable />
      ) : activeTab === 'supervisors' ? (
        <SupervisorDirectoryView />
      ) : (
        <ProfileCorrectionRequestsView />
      )}
    </div>
  );
}
