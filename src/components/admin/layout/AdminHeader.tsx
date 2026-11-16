'use client';

import React from 'react';
import styles from './AdminHeader.module.css';
import { Search, Bell, MapPin } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.searchContainer}>
        <Search size={16} color="#64748b" />
        <input 
          type="text" 
          placeholder="Search projects, workers, machinery..." 
          className={styles.searchInput} 
        />
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
