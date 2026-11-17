'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './ProjectOverview.module.css';
import SafeImage from '@/components/admin/ui/SafeImage';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Users, 
  CalendarCheck, 
  Truck, 
  Fuel, 
  Receipt,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';

// Real Construction Projects matching the Mockup
const portfolioProjects = [
  {
    id: 'jpn-infra',
    name: 'JPN Infra City',
    location: 'Pune, Maharashtra',
    status: 'On Track',
    statusType: 'success',
    progress: 85,
    budget: '₹ 18.5 Cr',
    dates: 'Jan 2025 - Dec 2025',
    image: '/images/commercial_tower.jpg'
  },
  {
    id: 'metro-rail',
    name: 'Metro Rail Project',
    location: 'Nagpur, Maharashtra',
    status: 'In Progress',
    statusType: 'info',
    progress: 62,
    budget: '₹ 12.0 Cr',
    dates: 'Mar 2025 - Nov 2025',
    image: '/images/highway_bridge.jpg'
  },
  {
    id: 'expressway',
    name: 'Expressway Phase II',
    location: 'Mumbai, Maharashtra',
    status: 'Planning',
    statusType: 'warning',
    progress: 34,
    budget: '₹ 8.2 Cr',
    dates: 'Jun 2025 - Dec 2025',
    image: '/images/project1.jpg'
  }
];

// Activity Timeline matching the Mockup
const recentActivities = [
  {
    id: 1,
    title: 'Attendance Marked',
    description: '245 workers marked for Project A',
    time: '2m ago',
    icon: Users,
    color: '#167C72'
  },
  {
    id: 2,
    title: 'Fuel Entry',
    description: '200 Litres for MH-12-AB-1234',
    time: '5m ago',
    icon: Fuel,
    color: '#23845D'
  },
  {
    id: 3,
    title: 'Expense Approved',
    description: '₹ 48,000 for Site Material',
    time: '10m ago',
    icon: Receipt,
    color: '#167C72'
  },
  {
    id: 4,
    title: 'New Project Added',
    description: 'Commercial Complex',
    time: '15m ago',
    icon: Building2,
    color: '#B58B59'
  }
];

export default function ProjectOverview() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'planning'>('all');

  return (
    <div className={styles.container}>
      {/* ========================================================
          ROW 1: ANALYTICS + BUDGET + QUICK ACTIONS (3-COLUMN GRID)
          ======================================================== */}
      <div className={styles.analyticsRow}>
        
        {/* Panel 1: Project Progress Overview */}
        <div className={styles.chartPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrapper}>
              <Layers size={17} className={styles.panelIcon} />
              <h3 className={styles.panelTitle}>Project Progress Overview</h3>
            </div>
            <Link href="/admin/projects" className={styles.viewLink}>
              <span>View Details</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className={styles.progressAnalyticsBody}>
            {/* Circular Overall Gauge */}
            <div className={styles.gaugeSection}>
              <div className={styles.gaugeContainer}>
                <svg viewBox="0 0 36 36" className={styles.gaugeSvg}>
                  <path 
                    className={styles.gaugeCircleBg}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className={styles.gaugeCircleFill}
                    strokeDasharray="78, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className={styles.gaugeTextGroup}>
                  <span className={styles.gaugeBigPercent}>78%</span>
                  <span className={styles.gaugeSublabel}>Overall Progress</span>
                </div>
              </div>

              {/* Progress Legend */}
              <div className={styles.progressLegend}>
                <div className={styles.legendRow}>
                  <span className={styles.legendDotCompleted}></span>
                  <span className={styles.legendName}>Completed</span>
                  <strong className={styles.legendVal}>78%</strong>
                </div>
                <div className={styles.legendRow}>
                  <span className={styles.legendDotInProgress}></span>
                  <span className={styles.legendName}>In Progress</span>
                  <strong className={styles.legendVal}>15%</strong>
                </div>
                <div className={styles.legendRow}>
                  <span className={styles.legendDotPending}></span>
                  <span className={styles.legendName}>Pending</span>
                  <strong className={styles.legendVal}>7%</strong>
                </div>
              </div>
            </div>

            {/* Target vs Achieved Month Bars */}
            <div className={styles.monthBarSection}>
              <div className={styles.barLegends}>
                <div className={styles.barLegendItem}>
                  <span className={styles.legendTargetDot}></span>
                  <span>Target</span>
                </div>
                <div className={styles.barLegendItem}>
                  <span className={styles.legendAchievedDot}></span>
                  <span>Achieved</span>
                </div>
              </div>

              {/* Bar Columns Container */}
              <div className={styles.barsGrid}>
                {[
                  { month: 'Jan', target: 80, val: 75 },
                  { month: 'Feb', target: 85, val: 80 },
                  { month: 'Mar', target: 90, val: 82 },
                  { month: 'Apr', target: 70, val: 60 },
                  { month: 'May', target: 80, val: 70 },
                  { month: 'Jun', target: 95, val: 88 }
                ].map((b, i) => (
                  <div key={i} className={styles.barColumn}>
                    <div className={styles.barTrack}>
                      <div className={styles.targetBarLine} style={{ bottom: `${b.target}%` }} />
                      <div className={styles.achievedBar} style={{ height: `${b.val}%` }} />
                    </div>
                    <span className={styles.barLabel}>{b.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Budget vs Expenditure Dual Trend */}
        <div className={styles.chartPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrapper}>
              <TrendingUp size={17} className={styles.panelIcon} />
              <h3 className={styles.panelTitle}>Budget vs Expenditure</h3>
            </div>
            <Link href="/admin/expenses" className={styles.viewLink}>
              <span>View Report</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className={styles.budgetChartBody}>
            <div className={styles.budgetLegends}>
              <div className={styles.budgetLegendItem}>
                <span className={styles.budgetLineDot}></span>
                <span>Budget</span>
              </div>
              <div className={styles.budgetLegendItem}>
                <span className={styles.actualLineDot}></span>
                <span>Actual</span>
              </div>
            </div>

            {/* Simulated Clean SVG Trend Curves */}
            <div className={styles.svgTrendWrapper}>
              <svg viewBox="0 0 320 140" className={styles.trendSvg}>
                {/* Grid guidelines */}
                <line x1="30" y1="20" x2="310" y2="20" stroke="#E5E5DF" strokeDasharray="3 3" />
                <line x1="30" y1="55" x2="310" y2="55" stroke="#E5E5DF" strokeDasharray="3 3" />
                <line x1="30" y1="90" x2="310" y2="90" stroke="#E5E5DF" strokeDasharray="3 3" />
                <line x1="30" y1="125" x2="310" y2="125" stroke="#E5E5DF" />

                {/* Y-axis Labels */}
                <text x="2" y="24" className={styles.yLabel}>30Cr</text>
                <text x="2" y="59" className={styles.yLabel}>20Cr</text>
                <text x="2" y="94" className={styles.yLabel}>10Cr</text>
                <text x="5" y="128" className={styles.yLabel}>0Cr</text>

                {/* Actual Line (Champagne/Orange tone) */}
                <path 
                  d="M 45 105 L 95 85 L 150 78 L 205 60 L 260 48 L 305 35"
                  fill="none"
                  stroke="#D69B42"
                  strokeWidth="2.5"
                />
                {/* Actual Points */}
                {[[45, 105], [95, 85], [150, 78], [205, 60], [260, 48], [305, 35]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="#D69B42" stroke="#FFFFFF" strokeWidth="1.5" />
                ))}

                {/* Budget Line (Premium Emerald tone) */}
                <path 
                  d="M 45 118 L 95 95 L 150 90 L 205 80 L 260 70 L 305 52"
                  fill="none"
                  stroke="#167C72"
                  strokeWidth="2.5"
                />
                {/* Budget Points */}
                {[[45, 118], [95, 95], [150, 90], [205, 80], [260, 70], [305, 52]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="#167C72" stroke="#FFFFFF" strokeWidth="1.5" />
                ))}
              </svg>

              {/* X Axis Months */}
              <div className={styles.xMonthsRow}>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Quick Actions (Matches Mockup) */}
        <div className={styles.quickActionsPanel}>
          <div className={styles.quickActionsHeader}>
            <span className={styles.flashIcon}>⚡</span>
            <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
          </div>

          <div className={styles.quickActionsList}>
            <Link href="/admin/projects" className={styles.quickBtnPrimary}>
              <Plus size={16} />
              <span>Add Project +</span>
            </Link>

            <Link href="/admin/workforce" className={styles.quickBtn}>
              <Users size={15} />
              <span>Add Worker</span>
            </Link>

            <Link href="/admin/attendance" className={styles.quickBtn}>
              <CalendarCheck size={15} />
              <span>Mark Attendance</span>
            </Link>

            <Link href="/admin/fleet" className={styles.quickBtn}>
              <Truck size={15} />
              <span>Add Vehicle</span>
            </Link>

            <Link href="/admin/fuel" className={styles.quickBtn}>
              <Fuel size={15} />
              <span>Record Fuel</span>
            </Link>

            <Link href="/admin/expenses" className={styles.quickBtn}>
              <Receipt size={15} />
              <span>Add Expense</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================
          ROW 2: OUR PROJECTS (3-CARDS) + RECENT ACTIVITY STREAM
          ======================================================== */}
      <div className={styles.projectsAndActivityRow}>
        
        {/* Left Sub-Grid: Our Projects Portfolio */}
        <div className={styles.portfolioSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrapper}>
              <Building2 size={18} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Our Projects</h3>
            </div>
            <Link href="/admin/projects" className={styles.viewLink}>
              <span>View All Projects</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className={styles.projectsCardsGrid}>
            {portfolioProjects.map((p) => (
              <div key={p.id} className={styles.projectCard}>
                <div className={styles.projectImageWrapper}>
                  <SafeImage 
                    src={p.image} 
                    alt={p.name} 
                    fallbackType="project"
                    className={styles.projectImg}
                  />
                  <span className={`${styles.statusBadge} ${styles[p.statusType]}`}>
                    ● {p.status}
                  </span>
                </div>

                <div className={styles.projectContent}>
                  <h4 className={styles.projectName}>{p.name}</h4>
                  <div className={styles.projectLocation}>
                    <MapPin size={12} />
                    <span>{p.location}</span>
                  </div>

                  {/* Progress Line */}
                  <div className={styles.progressRow}>
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${p.progress}%` }} 
                      />
                    </div>
                    <span className={styles.progressPercent}>{p.progress}%</span>
                  </div>

                  {/* Budget & Date */}
                  <div className={styles.metaRow}>
                    <div className={styles.budgetGroup}>
                      <span className={styles.metaLabel}>Budget</span>
                      <strong className={styles.metaVal}>{p.budget}</strong>
                    </div>

                    <Link href="/admin/projects" className={styles.viewProjectBtn}>
                      <span>View</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sub-Panel: Recent Activity Stream */}
        <div className={styles.activityPanel}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrapper}>
              <Activity size={18} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Recent Activity</h3>
            </div>
            <Link href="/admin/reports" className={styles.viewLink}>
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className={styles.activityList}>
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIconCircle} style={{ background: `${act.color}15`, color: act.color }}>
                    <Icon size={15} />
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitleRow}>
                      <span className={styles.activityTitle}>{act.title}</span>
                      <span className={styles.activityTime}>{act.time}</span>
                    </div>
                    <p className={styles.activityDesc}>{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================
          ROW 3: INDUSTRIAL FOOTER BANNER + 3 MINI OPERATIONS TILES
          ======================================================== */}
      <div className={styles.bottomOperationsRow}>
        
        {/* Banner: Building a Stronger Tomorrow */}
        <div className={styles.brandHeroBanner}>
          <div className={styles.bannerTextGroup}>
            <h4 className={styles.bannerHeadline}>Building a Stronger Tomorrow</h4>
            <p className={styles.bannerTagline}>Innovative Construction. Sustainable Growth.</p>
          </div>
          <Link href="/admin/reports" className={styles.bannerCta}>
            <span>Learn More →</span>
          </Link>
        </div>

        {/* 3 Secondary Metric Tiles */}
        <div className={styles.miniMetricsGroup}>
          
          <div className={styles.miniTile}>
            <div className={styles.miniTop}>
              <span className={styles.miniLabel}>Today's Expenses</span>
              <span className={styles.miniUp}>↑ 5%</span>
            </div>
            <div className={styles.miniVal}>₹ 2.48 L</div>
          </div>

          <div className={styles.miniTile}>
            <div className={styles.miniTop}>
              <span className={styles.miniLabel}>Fuel Consumption</span>
              <span className={styles.miniUp}>↑ 7%</span>
            </div>
            <div className={styles.miniVal}>820 L</div>
          </div>

          <div className={styles.miniTile}>
            <div className={styles.miniTop}>
              <span className={styles.miniLabel}>Vehicle Utilization</span>
              <span className={styles.miniUp}>↑ 4%</span>
            </div>
            <div className={styles.miniVal}>87%</div>
          </div>

        </div>

      </div>

    </div>
  );
}
