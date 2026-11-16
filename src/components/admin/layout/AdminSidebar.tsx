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
  X
} from 'lucide-react';

const navItems = [
  {
    group: 'DASHBOARD',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    group: 'PROJECTS & SITES',
    items: [
      { name: 'Projects', href: '/admin/projects', icon: Building2 },
    ]
  },
  {
    group: 'WORKFORCE',
    items: [
      { name: 'Workers', href: '/admin/workforce', icon: Users },
      { name: 'Daily Attendance', href: '/admin/attendance', icon: CalendarCheck },
    ]
  },
  {
    group: 'FLEET & FUEL',
    items: [
      { name: 'Vehicles & Machinery', href: '/admin/fleet', icon: Truck },
      { name: 'Fuel Management', href: '/admin/fuel', icon: Fuel },
    ]
  },
  {
    group: 'FINANCE & CONTROL',
    items: [
      { name: 'Site Expenses', href: '/admin/expenses', icon: Receipt },
      { name: 'Approvals', href: '/admin/approvals', icon: CheckCircle },
    ]
  },
  {
    group: 'INTELLIGENCE & REPORTS',
    items: [
      { name: 'Reports & DPR', href: '/admin/reports', icon: BarChart3 },
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
      <div className={styles.brand}>
        <div className={styles.brandLeft}>
          <div className={styles.logoIcon}>S</div>
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>STRUCTIVA</span>
            <span className={styles.brandBadge}>ENTERPRISE OS</span>
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

      <div className={styles.navContainer}>
        {navItems.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <span className={styles.groupLabel}>{group.group}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.footerProfile}>
        <div className={styles.avatar}>SA</div>
        <div className={styles.profileDetails}>
          <span className={styles.userName}>Super Admin</span>
          <span className={styles.userRole}>MNC Operations</span>
        </div>
      </div>
    </aside>
  );
}
