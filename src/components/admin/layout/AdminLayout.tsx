import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layoutContainer}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader />
        <main className={styles.pageBody}>
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
