'use client';

import React from 'react';
import styles from './AdminHeader.module.css';
import { Search, Bell, ChevronDown, Menu, Building, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

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

        {/* Global Executive Search (⌘K / Ctrl+K) */}
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search projects, workers, or reports..." 
            className={styles.searchInput} 
          />
          <kbd className={styles.shortcutKbd}>⌘ K</kbd>
        </div>
      </div>

      <div className={styles.headerRight}>
        {/* Project Selector Dropdown */}
        <div className={styles.projectDropdown}>
          <Building size={15} className={styles.dropdownIcon} />
          <span className={styles.dropdownLabel}>All Projects</span>
          <ChevronDown size={14} className={styles.dropdownArrow} />
        </div>

        {/* Notification Bell with Badge */}
        <button className={styles.bellButton} aria-label="Notifications (3 unread)">
          <Bell size={18} />
          <span className={styles.notificationCount}>3</span>
        </button>

        {/* Admin Profile Chip */}
        <div className={styles.profileChip}>
          <div className={styles.profileAvatar}>
            <span>AD</span>
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Admin</span>
            <span className={styles.profileRole}>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
