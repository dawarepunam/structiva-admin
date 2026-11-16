import React from 'react';
import ProjectTable from '@/components/admin/projects/ProjectTable';
import styles from '../page.module.css';

export default function ProjectsPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Project Management & Sites</h1>
          <p className={styles.pageSubtitle}>
            Overview of contracts, multi-site budgets, execution progress, and milestones.
          </p>
        </div>
      </div>
      <ProjectTable />
    </div>
  );
}
