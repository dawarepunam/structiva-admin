'use client';

import React from 'react';
import styles from '../WorkerPortal.module.css';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarCheck2,
  Banknote,
  Menu
} from 'lucide-react';

interface WorkerBottomNavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onMoreClick: () => void;
}

export default function WorkerBottomNavigation({
  currentTab,
  onSelectTab,
  onMoreClick
}: WorkerBottomNavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'salary', label: 'Salary', icon: Banknote },
  ];

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}

      <button className={styles.bottomNavItem} onClick={onMoreClick}>
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
}
