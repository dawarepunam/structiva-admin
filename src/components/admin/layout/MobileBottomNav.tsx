'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileBottomNav.module.css';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Receipt, 
  BarChart3 
} from 'lucide-react';

const mobileNavItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: Building2 },
  { name: 'Workforce', href: '/admin/workforce', icon: Users },
  { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
  { name: 'DPR Report', href: '/admin/reports', icon: BarChart3 },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label="Mobile Navigation">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
          >
            <div className={isActive ? styles.activeIconWrapper : ''}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
