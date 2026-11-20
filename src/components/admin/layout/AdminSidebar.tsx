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
  X,
  AlertOctagon,
  MessageSquare,
  UserCheck
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
      { name: 'Issues & Incidents', href: '/admin/issues', icon: AlertOctagon },
    ]
  },
  {
    group: 'Commercial & Tendering',
    items: [
      { name: 'Inquiries & Leads', href: '/admin/enquiries', icon: MessageSquare },
    ]
  },
  {
    group: 'Workforce',
    items: [
      { name: 'Worker Directory', href: '/admin/workforce', icon: Users },
      { name: 'Profile Correction Requests', href: '/admin/workforce/corrections', icon: UserCheck },
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
      { name: 'Material Procurement', href: '/admin/materials', icon: Building2 },
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
      <nav className={styles.nav}>
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.navGroup}>
            <div className={styles.groupTitle}>{group.group}</div>
            <ul className={styles.navList}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <li key={item.href} className={styles.navItem}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                      onClick={onClose}
                    >
                      <span className={styles.navIconWrapper}>
                        <Icon size={18} className={styles.navIcon} />
                      </span>
                      <span className={styles.navLabel}>{item.name}</span>
                      {isActive && <ChevronRight size={14} className={styles.activeIndicator} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick Status Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.systemStatus}>
          <div className={styles.statusDot}></div>
          <div className={styles.statusText}>
            <span className={styles.statusTitle}>All Nodes Operational</span>
            <span className={styles.statusSub}>Strapi v5 Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
