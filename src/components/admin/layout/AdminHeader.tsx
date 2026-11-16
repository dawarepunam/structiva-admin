'use client';

import React from 'react';
import styles from './AdminHeader.module.css';
import { Search, Bell, MapPin, Menu } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.menuToggleBtn} 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className={styles.searchContainer}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search projects, workers, machinery..." 
            className={styles.searchInput} 
          />
        </div>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.siteSelector}>
          <MapPin size={15} color="#f59e0b" />
          <span>All Active Sites</span>
        </div>

        <button className={styles.actionButton} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.notificationBadge}></span>
        </button>
      </div>
    </header>
  );
}
