'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import {
  LayoutDashboard,
  User,
  Building,
  CalendarCheck2,
  CheckSquare,
  CalendarDays,
  Banknote,
  Coins,
  Bell,
  ShieldAlert,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  HardHat,
  X
} from 'lucide-react';
import { WorkerProfile } from '../data/workerTypes';

interface WorkerSidebarProps {
  worker: WorkerProfile;
  currentTab: string;
  isOpen: boolean;
  onSelectTab: (tab: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

export default function WorkerSidebar({
  worker,
  currentTab,
  isOpen,
  onSelectTab,
  onClose,
  onLogout
}: WorkerSidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'projects', label: 'My Projects & Sites', icon: Building },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck2 },
    { id: 'tasks', label: 'My Tasks & Work', icon: CheckSquare },
    { id: 'leave', label: 'My Leave', icon: CalendarDays },
    { id: 'salary', label: 'My Salary & Payments', icon: Banknote },
    { id: 'advance', label: 'My Advance', icon: Coins },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'safety', label: 'Safety Center', icon: ShieldAlert },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onClose(); // Auto close drawer on mobile upon selection
  };

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div className={styles.mobileBackdrop} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandBrandGroup}>
            <div className={styles.brandLogo}>
              <HardHat size={22} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>STRUCTIVA</span>
              <span className={styles.brandSubtitle}>Worker Portal</span>
            </div>
          </div>

          <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.workerBadge}>
          <div className={styles.workerAvatar}>
            {worker.avatar ? (
              <img 
                src={worker.avatar} 
                alt={worker.name} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              worker.name.split(' ').map(n => n[0]).join('').substring(0, 2)
            )}
          </div>
          <div className={styles.workerInfo}>
            <div className={styles.workerName}>{worker.name}</div>
            <div className={styles.workerTrade}>{worker.skill || worker.category}</div>
          </div>
        </div>

        <nav className={styles.navSection}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
