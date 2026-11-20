'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import { 
  Building2, 
  Bell, 
  Menu
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerHeaderProps {
  worker: WorkerProfile;
  activeModuleTitle: string;
  onNotificationsClick: () => void;
  onToggleSidebar: () => void;
  unreadCount?: number;
}

export default function WorkerHeader({ 
  worker, 
  activeModuleTitle, 
  onNotificationsClick, 
  onToggleSidebar,
  unreadCount = 2 
}: WorkerHeaderProps) {
  return (
    <header className={styles.topHeader}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.menuToggleBtn} 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className={styles.headerTitleWrapper}>
          <h1 className={styles.headerTitle}>{activeModuleTitle}</h1>
          <div className={styles.headerSubtitle}>
            Welcome back, {worker.name} ({worker.code})
          </div>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.projectChip}>
          <Building2 size={16} color="#167C72" />
          <span>{worker.assignedProject}</span>
        </div>

        <button 
          className={styles.headerIconBtn} 
          onClick={onNotificationsClick}
          title="Notifications & Alerts"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className={styles.notifBadge} />}
        </button>
      </div>
    </header>
  );
}
