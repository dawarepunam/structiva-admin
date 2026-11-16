'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with mobile toggle props */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className={styles.mainContent}>
        <AdminHeader onToggleSidebar={toggleSidebar} />
        <main className={styles.pageBody}>
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
