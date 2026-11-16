import React from 'react';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import ProjectOverview from '@/components/admin/dashboard/ProjectOverview';
import styles from './page.module.css';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Executive Site Operations</h1>
          <p className={styles.pageSubtitle}>
            Real-time multi-site monitoring, workforce metrics, and expense control.
          </p>
        </div>
        <Link href="/admin/projects" className={styles.btnPrimary}>
          <Plus size={16} />
          <span>New Project</span>
        </Link>
      </div>

      <DashboardStats />
      <ProjectOverview />
    </div>
  );
}
