'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CalendarCheck, 
  Truck, 
  Fuel, 
  Receipt, 
  CheckCircle, 
  BarChart3, 
  Settings,
  Bell,
  HardHat,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

const navGroups = [
  {
    group: 'Dashboard',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    group: 'Projects & Sites',
    items: [
      { name: 'Projects', href: '/admin/projects', icon: Building2 },
      { name: 'Site Activities', href: '/admin/activities', icon: HardHat },
    ]
  },
  {
    group: 'Workforce',
    items: [
      { name: 'Worker Directory', href: '/admin/workforce', icon: Users },
      { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    ]
  },
  {
    group: 'Fleet & Fuel',
    items: [
      { name: 'Vehicles', href: '/admin/fleet', icon: Truck },
      { name: 'Fuel Management', href: '/admin/fuel', icon: Fuel },
    ]
  },
  {
    group: 'Finance & Control',
    items: [
      { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
      { name: 'Approvals', href: '/admin/approvals', icon: CheckCircle },
    ]
  },
  {
    group: 'Reports & Analytics',
    items: [
      { name: 'DPR & Reports', href: '/admin/reports', icon: BarChart3 },
    ]
  }
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <div className={styles.brandLeft}>
          <div className={styles.logoBadge}>
            <Building2 size={20} className={styles.logoSvg} />
          </div>
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>STRUCTIVA</span>
            <span className={styles.brandBadge}>Enterprise OS</span>
          </div>
        </div>

        <button 
          className={styles.closeMobileBtn} 
          onClick={onClose}
          aria-label="Close Sidebar Menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Group Items */}
      <div className={styles.navContainer}>
        {navGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.groupHeader}>
              <span className={styles.groupLabel}>{group.group}</span>
            </div>
            
            <div className={styles.groupItems}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href + item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
                  >
                    <Icon size={17} className={styles.navIcon} />
                    <span className={styles.navText}>{item.name}</span>
                    {isActive && <div className={styles.activeGlowPill} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Overall Progress Gauge (Matches MNC Reference Mockup) */}
      <div className={styles.progressGaugeBox}>
        <div className={styles.gaugeHeader}>
          <span className={styles.gaugeTitle}>Overall Progress</span>
        </div>
        <div className={styles.gaugeContent}>
          <div className={styles.circularProgress}>
            <svg viewBox="0 0 36 36" className={styles.circularChart}>
              <path 
                className={styles.circleBg}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                className={styles.circleFill}
                strokeDasharray="78, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={styles.gaugePercent}>78%</span>
          </div>

          <div className={styles.sparkMiniTrend}>
            <div className={styles.trendBars}>
              <span style={{ height: '40%' }}></span>
              <span style={{ height: '65%' }}></span>
              <span style={{ height: '55%' }}></span>
              <span style={{ height: '85%' }}></span>
              <span style={{ height: '100%' }}></span>
            </div>
            <span className={styles.trendLabel}>Target Met</span>
          </div>
        </div>
      </div>

      {/* User Profile Bar */}
      <div className={styles.footerProfile}>
        <div className={styles.avatar}>
          <span>SA</span>
          <span className={styles.onlineDot} />
        </div>
        <div className={styles.profileDetails}>
          <span className={styles.userName}>Admin</span>
          <span className={styles.userRole}>Super Admin • MNC Ops</span>
        </div>
      </div>
    </aside>
  );
}
