'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import {
  FolderGit2,
  Building,
  Users,
  CheckCircle2,
  ClockCheck,
  Fuel,
  Receipt,
  FileText,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Truck
} from 'lucide-react';
import { fetchStrapiCollection } from '@/services/strapiClient';

export default function SupervisorDashboard() {
  const [stats, setStats] = useState({
    projectsCount: 1,
    sitesCount: 2,
    workersPresent: 2,
    totalAssignedWorkers: 6,
    pendingDprCount: 1,
    activeMachinery: 4,
    todayFuelLitres: 45,
    pendingRequests: 2
  });

  useEffect(() => {
    // Fetch live counts from Strapi backend with resilience
    async function loadLiveTelemetry() {
      try {
        const [projects, workers, attendances, fleet] = await Promise.all([
          fetchStrapiCollection('projects'),
          fetchStrapiCollection('workers'),
          fetchStrapiCollection('attendances'),
          fetchStrapiCollection('fleets')
        ]);

        const presentCount = attendances?.filter((a: any) => a.status === 'Present').length || 2;
        setStats(prev => ({
          ...prev,
          projectsCount: projects?.length || 1,
          totalAssignedWorkers: workers?.length || 6,
          workersPresent: presentCount,
          activeMachinery: fleet?.length || 4
        }));
      } catch (err) {
        console.warn('Dashboard telemetry loading offline fallback');
      }
    }
    loadLiveTelemetry();
  }, []);

  return (
    <div className={styles.dashboardGrid}>
      {/* Welcome & Context Header */}
      <section className={styles.welcomeCard}>
        <div className={styles.welcomeText}>
          <h2>Good Afternoon, Er. Pravin Gaikwad</h2>
          <p>Chief Supervisor &middot; Skyline Commercial Complex &middot; Tower A Superstructure</p>
          <div className={styles.siteTag}>
            <Building size={14} />
            <span>Active Site: Tower A &mdash; Kharadi IT Park, Pune</span>
          </div>
        </div>
        <div className={styles.actionButtons}>
          <Link href="/supervisor/dpr/create" className={styles.primaryBtn}>
            <FileText size={16} />
            <span>Submit DPR Report</span>
          </Link>
          <Link href="/supervisor/attendance" className={styles.secondaryBtn}>
            <ClockCheck size={16} />
            <span>Mark Muster Roll</span>
          </Link>
        </div>
      </section>

      {/* 8 Essential Operational Metrics */}
      <section className={styles.metricsGrid}>
        <Link href="/supervisor/projects" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Assigned Projects</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(22, 124, 114, 0.1)', color: '#167C72' }}>
              <FolderGit2 size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>{stats.projectsCount}</h3>
          <span className={styles.metricSubtext}>Skyline Complex (Active)</span>
        </Link>

        <Link href="/supervisor/attendance" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Today's Muster</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <Users size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>{stats.workersPresent} / {stats.totalAssignedWorkers}</h3>
          <span className={styles.metricSubtext}>Verified Present on Site</span>
        </Link>

        <Link href="/supervisor/tasks" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Active Work Packages</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>3</h3>
          <span className={styles.metricSubtext}>Level 4 Slab Casting</span>
        </Link>

        <Link href="/supervisor/machinery" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Machinery Deployed</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <Truck size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>{stats.activeMachinery}</h3>
          <span className={styles.metricSubtext}>1 Tower Crane, 1 JCB, 2 Tippers</span>
        </Link>

        <Link href="/supervisor/fuel" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Fuel Issued Today</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              <Fuel size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>{stats.todayFuelLitres} L</h3>
          <span className={styles.metricSubtext}>Site Mobile Bowser 01</span>
        </Link>

        <Link href="/supervisor/dpr" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Pending DPR</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <FileText size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>{stats.pendingDprCount}</h3>
          <span className={styles.metricSubtext}>Today&apos;s Shift-1 Log</span>
        </Link>

        <Link href="/supervisor/requests" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Pending Requests</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(181, 139, 89, 0.15)', color: '#B58B59' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>{stats.pendingRequests}</h3>
          <span className={styles.metricSubtext}>1 Indent &middot; 1 Maintenance</span>
        </Link>

        <Link href="/supervisor/expenses" className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Site Petty Cash</span>
            <div className={styles.metricIcon} style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6' }}>
              <Receipt size={18} />
            </div>
          </div>
          <h3 className={styles.metricValue}>₹14,500</h3>
          <span className={styles.metricSubtext}>Approved by Project Manager</span>
        </Link>
      </section>

      {/* Main Content Split: Sites and Quick Form Actions */}
      <div className={styles.contentSplit}>
        {/* Assigned Project Site Progress */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Building size={18} color="#167C72" />
              <span>Assigned Site Operations</span>
            </h3>
            <Link href="/supervisor/sites" className={styles.viewAllLink}>
              View All Sites &rarr;
            </Link>
          </div>

          <div className={styles.siteList}>
            <div className={styles.siteItem}>
              <div className={styles.siteDetails}>
                <h4>Tower A &mdash; Superstructure (Floors 1-6)</h4>
                <p>Skyline Commercial Complex &bull; 42 Workers &bull; Concrete pouring in progress</p>
              </div>
              <span className={styles.badgeSuccess}>Operational 68%</span>
            </div>

            <div className={styles.siteItem}>
              <div className={styles.siteDetails}>
                <h4>Basement 2 &mdash; Retaining Wall & Drainage</h4>
                <p>Skyline Commercial Complex &bull; 14 Workers &bull; Waterproofing membrane inspection</p>
              </div>
              <span className={styles.badgeWarning}>In Review 45%</span>
            </div>
          </div>
        </div>

        {/* Quick Launchpad for Permitted Supervisor Submissions */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <PlusCircle size={18} color="#B58B59" />
              <span>Supervisor Quick Indents</span>
            </h3>
          </div>

          <div className={styles.quickActionsGrid}>
            <Link href="/supervisor/fuel" className={styles.quickActionCard}>
              <Fuel size={20} color="#167C72" />
              <span>Log Fuel</span>
            </Link>
            <Link href="/supervisor/expenses" className={styles.quickActionCard}>
              <Receipt size={20} color="#167C72" />
              <span>Add Expense</span>
            </Link>
            <Link href="/supervisor/material-requests" className={styles.quickActionCard}>
              <PlusCircle size={20} color="#167C72" />
              <span>Request Material</span>
            </Link>
            <Link href="/supervisor/issues" className={styles.quickActionCard}>
              <AlertTriangle size={20} color="#EF4444" />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
