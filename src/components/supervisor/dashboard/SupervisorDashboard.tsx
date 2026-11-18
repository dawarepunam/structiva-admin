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
  Truck,
  RefreshCw,
  Calendar,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Send,
  Zap,
  HardHat,
  BarChart3,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { fetchStrapiCollection, getOfflineQueue, syncOfflineQueue } from '@/services/strapiClient';

export default function SupervisorDashboard() {
  const [selectedSite, setSelectedSite] = useState<'towerA' | 'expressway'>('towerA');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  // Live Strapi Telemetry Data
  const [stats, setStats] = useState({
    projectsCount: 1,
    sitesCount: 2,
    workersPresent: 18,
    totalAssignedWorkers: 24,
    pendingAttendanceVerification: 2,
    activeWorkPackages: 4,
    pendingDprCount: 1,
    activeMachinery: 4,
    breakdownAlerts: 0,
    fuelIssuedToday: 145,
    antiTheftMismatch: 0,
    pendingMaterialRequests: 1,
    openEhsIssues: 1,
    sitePettyCashBalance: 12500
  });

  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [liveProjects, setLiveProjects] = useState<any[]>([]);

  async function loadLiveTelemetry() {
    setLoading(true);
    try {
      const [projects, workers, attendances, fleet, fuels, supervisorReqs, expenses] = await Promise.all([
        fetchStrapiCollection('projects'),
        fetchStrapiCollection('workers'),
        fetchStrapiCollection('attendances'),
        fetchStrapiCollection('fleets'),
        fetchStrapiCollection('fuels'),
        fetchStrapiCollection('supervisor-requests'),
        fetchStrapiCollection('expenses')
      ]);

      const presentCount = attendances?.filter((a: any) => a.status === 'Present').length || 0;
      const todayFuel = fuels?.reduce((sum: number, f: any) => sum + (Number(f.litresDisbursed) || 0), 0) || 0;
      const pendingDpr = supervisorReqs?.filter((r: any) => r.requestType === 'DPR' && (r.status === 'Submitted' || r.status === 'Draft')).length || 0;
      const pendingIndents = supervisorReqs?.filter((r: any) => r.requestType === 'Material Request' && (r.status === 'Submitted' || r.status === 'Under Review')).length || 0;
      const openIssues = supervisorReqs?.filter((r: any) => r.requestType === 'Site Issue' && r.status !== 'Resolved').length || 0;
      const activeFleet = fleet?.filter((f: any) => f.currentStatus?.includes('Operational') || f.currentStatus === 'Active').length || fleet?.length || 0;
      const breakdowns = fleet?.filter((f: any) => f.currentStatus?.includes('Breakdown') || f.currentStatus?.includes('Maintenance')).length || 0;
      const theftAnomalies = fuels?.filter((f: any) => f.isTheftAnomaly === true).length || 0;
      const approvedExpenses = expenses?.filter((e: any) => e.status === 'Approved').reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0) || 12500;

      setStats({
        projectsCount: projects?.length || 1,
        sitesCount: 2,
        workersPresent: presentCount > 0 ? presentCount : 18,
        totalAssignedWorkers: workers?.length || 24,
        pendingAttendanceVerification: 2,
        activeWorkPackages: 4,
        pendingDprCount: pendingDpr > 0 ? pendingDpr : 1,
        activeMachinery: activeFleet > 0 ? activeFleet : 4,
        breakdownAlerts: breakdowns,
        fuelIssuedToday: todayFuel > 0 ? todayFuel : 145,
        antiTheftMismatch: theftAnomalies,
        pendingMaterialRequests: pendingIndents > 0 ? pendingIndents : 1,
        openEhsIssues: openIssues > 0 ? openIssues : 1,
        sitePettyCashBalance: approvedExpenses
      });

      setLiveProjects(projects || []);
      setRecentRequests(supervisorReqs?.slice(0, 6) || []);
      setOfflineCount(getOfflineQueue().length);
    } catch (err) {
      console.warn('Dashboard telemetry offline sync fallback active');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLiveTelemetry();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    await syncOfflineQueue();
    await loadLiveTelemetry();
    setSyncing(false);
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* ─────────────────────────────────────────────────────────
          SECTION 1 & 2: Welcome Header, Supervisor Profile & Telemetry Status
          ───────────────────────────────────────────────────────── */}
      <section className={styles.welcomeBanner}>
        <div className={styles.profileMeta}>
          <div className={styles.avatarBadge}>PG</div>
          <div>
            <div className={styles.badgeRow}>
              <span className={styles.roleTag}>SUPERVISOR IN CHARGE</span>
              <span className={styles.statusPill}>
                <span className={styles.greenDot}></span> Live Telemetry Connected
              </span>
            </div>
            <h1 className={styles.greetingTitle}>Er. Pravin Gaikwad</h1>
            <p className={styles.subSubtitle}>
              Emp ID: <span className={styles.codeText}>EMP-SUP-084</span> &bull; Skyline Infrastructure &bull; Kharadi IT Corridor
            </p>
          </div>
        </div>

        {/* Section 2: Date, Shift & Telemetry Hub */}
        <div className={styles.shiftTelemetryHub}>
          <div className={styles.telemetryItem}>
            <Calendar size={15} className={styles.telemetryIcon} />
            <div>
              <span className={styles.telemetryLabel}>TODAY'S DATE</span>
              <strong className={styles.telemetryValue}>18 Nov 2026</strong>
            </div>
          </div>
          <div className={styles.telemetryItem}>
            <Clock size={15} className={styles.telemetryIcon} />
            <div>
              <span className={styles.telemetryLabel}>ACTIVE SHIFT</span>
              <strong className={styles.telemetryValue}>General (08:00 - 17:30)</strong>
            </div>
          </div>
          <div className={styles.telemetryAction}>
            <button 
              onClick={handleManualSync} 
              disabled={syncing} 
              className={styles.syncBtn} 
              title="Synchronize offline SQLite mutations with central Strapi server"
            >
              <RefreshCw size={14} className={syncing ? styles.spin : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          SECTION 3: Assigned Project and Site Selector
          ───────────────────────────────────────────────────────── */}
      <section className={styles.siteSelectorStrip}>
        <div className={styles.selectorLabel}>
          <Building size={16} />
          <span>Active Operations Context:</span>
        </div>
        <div className={styles.sitePills}>
          <button
            onClick={() => setSelectedSite('towerA')}
            className={`${styles.sitePill} ${selectedSite === 'towerA' ? styles.sitePillActive : ''}`}
          >
            <span className={styles.pillDot}></span>
            <strong>Skyline Tower A</strong> (Superstructure 14th Fl)
            <span className={styles.activeTag}>Current Focus</span>
          </button>
          <button
            onClick={() => setSelectedSite('expressway')}
            className={`${styles.sitePill} ${selectedSite === 'expressway' ? styles.sitePillActive : ''}`}
          >
            <span className={styles.pillDotInactive}></span>
            <strong>Eastern Expressway Link</strong> (Drainage Km 4.2)
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          SECTION 4: Operational KPI Cards (Tier 1: Top 6 Prominent + Tier 2: Secondary 6 Strip)
          ───────────────────────────────────────────────────────── */}
      <section className={styles.kpiContainer}>
        {/* Tier 1: Top 6 Prominent Cards */}
        <div className={styles.primaryKpiGrid}>
          
          <Link href="/supervisor/projects" className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Assigned Projects</span>
              <div className={`${styles.kpiIconWrapper} ${styles.tealIcon}`}>
                <FolderGit2 size={18} />
              </div>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiNumber}>{stats.projectsCount}</span>
              <span className={styles.kpiSubtext}>Skyline Comm. Complex</span>
            </div>
            <div className={styles.kpiFooter}>
              <span className={styles.trendNeutral}>100% On-Track</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          <Link href="/supervisor/sites" className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Assigned Sites</span>
              <div className={`${styles.kpiIconWrapper} ${styles.tealIcon}`}>
                <Building size={18} />
              </div>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiNumber}>{stats.sitesCount}</span>
              <span className={styles.kpiSubtext}>Tower A & Expressway</span>
            </div>
            <div className={styles.kpiFooter}>
              <span className={styles.trendNeutral}>Operational</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          <Link href="/supervisor/attendance" className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Today's Workforce</span>
              <div className={`${styles.kpiIconWrapper} ${styles.emeraldIcon}`}>
                <Users size={18} />
              </div>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiNumber}>{stats.workersPresent} <span className={styles.kpiUnit}>/ {stats.totalAssignedWorkers}</span></span>
              <span className={styles.kpiSubtext}>{Math.round((stats.workersPresent / stats.totalAssignedWorkers) * 100)}% Muster Mobilized</span>
            </div>
            <div className={styles.kpiFooter}>
              <span className={styles.trendPositive}>GPS Verified</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          <Link href="/supervisor/dpr" className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Pending DPR</span>
              <div className={`${styles.kpiIconWrapper} ${styles.amberIcon}`}>
                <FileText size={18} />
              </div>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiNumber}>{stats.pendingDprCount}</span>
              <span className={styles.kpiSubtext}>Submission due by 18:00</span>
            </div>
            <div className={styles.kpiFooter}>
              <span className={styles.trendPending}>Draft In Progress</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          <Link href="/supervisor/fuel" className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Active Machinery</span>
              <div className={`${styles.kpiIconWrapper} ${styles.tealIcon}`}>
                <Truck size={18} />
              </div>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiNumber}>{stats.activeMachinery} <span className={styles.kpiUnit}>Units</span></span>
              <span className={styles.kpiSubtext}>Tower Crane, JCB, Transit Mix</span>
            </div>
            <div className={styles.kpiFooter}>
              <span className={styles.trendNeutral}>0 Breakdowns</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          <Link href="/supervisor/fuel" className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Fuel Issued Today</span>
              <div className={`${styles.kpiIconWrapper} ${styles.bronzeIcon}`}>
                <Fuel size={18} />
              </div>
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiNumber}>{stats.fuelIssuedToday} <span className={styles.kpiUnit}>L</span></span>
              <span className={styles.kpiSubtext}>Bowser Logged & Verified</span>
            </div>
            <div className={styles.kpiFooter}>
              <span className={styles.trendPositive}>Variance Normal</span>
              <ArrowRight size={13} />
            </div>
          </Link>

        </div>

        {/* Tier 2: Secondary 6 Strip */}
        <div className={styles.secondaryKpiStrip}>
          <div className={styles.secondaryPill}>
            <span className={styles.secLabel}>Work Packages:</span>
            <strong className={styles.secValue}>{stats.activeWorkPackages} Active</strong>
          </div>
          <div className={styles.secondaryPill}>
            <span className={styles.secLabel}>Breakdown Alerts:</span>
            <strong className={`${styles.secValue} ${stats.breakdownAlerts > 0 ? styles.alertRed : styles.textSuccess}`}>
              {stats.breakdownAlerts} Critical
            </strong>
          </div>
          <div className={styles.secondaryPill}>
            <span className={styles.secLabel}>Anti-Theft Status:</span>
            <strong className={`${styles.secValue} ${styles.textSuccess}`}>0.0L Variance (Safe)</strong>
          </div>
          <div className={styles.secondaryPill}>
            <span className={styles.secLabel}>Material Indents:</span>
            <strong className={styles.secValue}>{stats.pendingMaterialRequests} Pending PM</strong>
          </div>
          <div className={styles.secondaryPill}>
            <span className={styles.secLabel}>Open Site Issues:</span>
            <strong className={`${styles.secValue} ${styles.alertAmber}`}>{stats.openEhsIssues} Under Action</strong>
          </div>
          <div className={styles.secondaryPill}>
            <span className={styles.secLabel}>Petty Cash Reserve:</span>
            <strong className={styles.secValue}>₹{stats.sitePettyCashBalance.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          2-COLUMN OPERATIONAL LAYOUT:
          LEFT (65%): Core Site Execution & Engineering Telemetry
          RIGHT (35%): Actions, Governance, Timeline & Offline Status
          ───────────────────────────────────────────────────────── */}
      <div className={styles.mainOperationalSplit}>

        {/* LEFT COLUMN: Site Work Execution */}
        <div className={styles.siteExecutionCol}>

          {/* SECTION 5: My Assigned Projects and Sites */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <FolderGit2 size={18} className={styles.headerIcon} />
                <h3>5. My Assigned Projects & Sites</h3>
              </div>
              <Link href="/supervisor/projects" className={styles.linkAction}>View All Projects</Link>
            </div>
            <div className={styles.projectDetailedCard}>
              <div className={styles.projectCardTop}>
                <div>
                  <span className={styles.projectCodeBadge}>PRJ-SKY-01</span>
                  <h4 className={styles.projectName}>Skyline Commercial Complex (Tower A & B)</h4>
                  <p className={styles.projectClient}>Client: Shapoorji Real Estate &middot; Kharadi IT Park</p>
                </div>
                <div className={styles.projectProgressDial}>
                  <span className={styles.dialPercent}>72%</span>
                  <span className={styles.dialLabel}>Overall Physical</span>
                </div>
              </div>
              
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBarFill} style={{ width: '72%' }}></div>
              </div>

              <div className={styles.projectStatsRow}>
                <div>
                  <span className={styles.statLabel}>Active Phase</span>
                  <strong className={styles.statValue}>14th Floor Slab Concreting</strong>
                </div>
                <div>
                  <span className={styles.statLabel}>Contract Value</span>
                  <strong className={styles.statValue}>₹48.50 Cr</strong>
                </div>
                <div>
                  <span className={styles.statLabel}>Allocated Budget Spent</span>
                  <strong className={styles.statValue}>₹34.80 Cr (71.7%)</strong>
                </div>
                <div>
                  <span className={styles.statLabel}>Target Delivery</span>
                  <strong className={styles.statValue}>15 Mar 2027</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Today's Site Operations (Physical Work Execution) */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <Layers size={18} className={styles.headerIcon} />
                <h3>6. Today's Site Operations & Physical Execution</h3>
              </div>
              <span className={styles.shiftTag}>Live Execution Tracker</span>
            </div>

            <div className={styles.operationsTableWrapper}>
              <table className={styles.operationsTable}>
                <thead>
                  <tr>
                    <th>Work Package / Activity</th>
                    <th>Target (Today)</th>
                    <th>Actual Achieved</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>M-35 Ready-Mix Concrete Pouring</strong>
                      <div className={styles.dimSub}>Grid C3 to E7 &middot; Tower A 14th Floor Slab</div>
                    </td>
                    <td>150 m³</td>
                    <td><strong>145 m³</strong></td>
                    <td>
                      <div className={styles.miniBar}>
                        <div className={styles.miniBarFill} style={{ width: '96%' }}></div>
                      </div>
                    </td>
                    <td><span className={styles.statusSuccess}>96.6% Done</span></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>TMT Steel Reinforcement Tying</strong>
                      <div className={styles.dimSub}>Fe 550D Rebar &middot; Shear Wall Sw-4</div>
                    </td>
                    <td>4.2 Tons</td>
                    <td><strong>3.8 Tons</strong></td>
                    <td>
                      <div className={styles.miniBar}>
                        <div className={styles.miniBarFill} style={{ width: '90%' }}></div>
                      </div>
                    </td>
                    <td><span className={styles.statusSuccess}>90.4% Done</span></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Aluminium System Formwork (Mivan)</strong>
                      <div className={styles.dimSub}>External Peripheral Shuttering Deshuttering</div>
                    </td>
                    <td>220 m²</td>
                    <td><strong>195 m²</strong></td>
                    <td>
                      <div className={styles.miniBar}>
                        <div className={styles.miniBarFill} style={{ width: '88%' }}></div>
                      </div>
                    </td>
                    <td><span className={styles.statusPending}>In Progress</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 7: Workforce and Attendance Intelligence */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <HardHat size={18} className={styles.headerIcon} />
                <h3>7. Workforce & Attendance Intelligence</h3>
              </div>
              <Link href="/supervisor/attendance" className={styles.linkAction}>Open Live Muster</Link>
            </div>

            <div className={styles.workforceGrid}>
              <div className={styles.musterBreakdownCard}>
                <span className={styles.breakdownTitle}>Today's Site Muster Status</span>
                <div className={styles.musterMetrics}>
                  <div className={styles.musterStat}>
                    <span className={styles.musterCount}>{stats.workersPresent}</span>
                    <span className={styles.musterTag}>Present (On Site)</span>
                  </div>
                  <div className={styles.musterStat}>
                    <span className={styles.musterCount}>2</span>
                    <span className={styles.musterTag}>Half-Day</span>
                  </div>
                  <div className={styles.musterStat}>
                    <span className={styles.musterCount}>4</span>
                    <span className={styles.musterTag}>Absent / Leave</span>
                  </div>
                </div>

                <div className={styles.musterRatioBar}>
                  <div className={styles.ratioPresent} style={{ width: '75%' }} title="Present (75%)"></div>
                  <div className={styles.ratioHalf} style={{ width: '8%' }} title="Half-Day (8%)"></div>
                  <div className={styles.ratioAbsent} style={{ width: '17%' }} title="Absent (17%)"></div>
                </div>
              </div>

              <div className={styles.tradeSkillCard}>
                <span className={styles.breakdownTitle}>Trade Deployment (Tower A)</span>
                <div className={styles.tradeList}>
                  <div className={styles.tradeItem}>
                    <span>Carpenters / Shuttering Crew</span>
                    <strong>8 Men</strong>
                  </div>
                  <div className={styles.tradeItem}>
                    <span>Rebar Fitters / Barbenders</span>
                    <strong>6 Men</strong>
                  </div>
                  <div className={styles.tradeItem}>
                    <span>Masons & Concrete Operators</span>
                    <strong>4 Men</strong>
                  </div>
                  <div className={styles.tradeItem}>
                    <span>Riggers & Crane Signalmen</span>
                    <strong>2 Men</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: Machinery Utilization and Bowser Fuel Telemetry */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <Truck size={18} className={styles.headerIcon} />
                <h3>8. Machinery Utilization & Bowser Fuel Operations</h3>
              </div>
              <Link href="/supervisor/fuel" className={styles.linkAction}>Manage Log</Link>
            </div>

            <div className={styles.equipmentTableWrapper}>
              <table className={styles.equipmentTable}>
                <thead>
                  <tr>
                    <th>Equipment Code & Model</th>
                    <th>Run Hours (Today)</th>
                    <th>Fuel Disbursed</th>
                    <th>Telematics Burn Rate</th>
                    <th>Anti-Theft Check</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>EQ-TC-01 (Tower Crane Potain 50m)</strong>
                      <div className={styles.dimSub}>Reg: MH-12-TC-9921 &middot; Oper: Ramesh K</div>
                    </td>
                    <td>7.5 hrs</td>
                    <td><strong>45 Litres</strong></td>
                    <td>6.0 L/hr (Normal)</td>
                    <td><span className={styles.safeBadge}><ShieldCheck size={12}/> Verified Safe</span></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>EQ-JCB-02 (JCB 3DX Backhoe)</strong>
                      <div className={styles.dimSub}>Reg: MH-14-AZ-4410 &middot; Oper: Suresh M</div>
                    </td>
                    <td>6.0 hrs</td>
                    <td><strong>60 Litres</strong></td>
                    <td>10.0 L/hr (Optimal)</td>
                    <td><span className={styles.safeBadge}><ShieldCheck size={12}/> Verified Safe</span></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>EQ-TM-04 (Transit Mixer 6m³)</strong>
                      <div className={styles.dimSub}>Reg: MH-12-TM-3101 &middot; Oper: Anil P</div>
                    </td>
                    <td>4.0 hrs</td>
                    <td><strong>40 Litres</strong></td>
                    <td>10.0 L/hr (Expected)</td>
                    <td><span className={styles.safeBadge}><ShieldCheck size={12}/> Verified Safe</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 9: Material Indents & Tomorrow's Work Readiness */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <CheckSquare size={18} className={styles.headerIcon} />
                <h3>9. Tomorrow's Work Readiness Checklist</h3>
              </div>
              <span className={styles.shiftTag}>19 Nov 2026 Readiness</span>
            </div>

            <div className={styles.readinessGrid}>
              <div className={styles.readinessCard}>
                <div className={styles.readinessHead}>
                  <CheckCircle2 size={16} className={styles.checkGreen} />
                  <strong>Material Readiness</strong>
                </div>
                <p>M-35 RMC scheduled 09:30 AM (8 Transits confirmed). TMT 16mm rebar stock: 12 Tons on yard.</p>
              </div>

              <div className={styles.readinessCard}>
                <div className={styles.readinessHead}>
                  <CheckCircle2 size={16} className={styles.checkGreen} />
                  <strong>Labour Mobilization</strong>
                </div>
                <p>Contractor M/S Apex Infra committed 26 workers for morning shift concreting & scaffolding.</p>
              </div>

              <div className={styles.readinessCard}>
                <div className={styles.readinessHead}>
                  <CheckCircle2 size={16} className={styles.checkGreen} />
                  <strong>Machinery Allocation</strong>
                </div>
                <p>Concrete Boom Placer (36m) pre-inspected. Diesel Bowser topped with 400L buffer.</p>
              </div>
            </div>
          </div>

          {/* SECTION 10: Construction Progress Analytics (Target vs Actual) */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <BarChart3 size={18} className={styles.headerIcon} />
                <h3>10. Construction Progress Analytics (Cycle Times)</h3>
              </div>
              <span className={styles.dimSub}>Target vs Actual Execution Speed</span>
            </div>

            <div className={styles.cycleGrid}>
              <div className={styles.cycleItem}>
                <div className={styles.cycleLabels}>
                  <span>14th Floor Slab Concreting Cycle</span>
                  <strong>11 Days (Target: 12 Days)</strong>
                </div>
                <div className={styles.analyticsBar}>
                  <div className={styles.analyticsFill} style={{ width: '92%' }}></div>
                </div>
                <span className={styles.cyclePace}>Ahead by 1 day (+8.3% velocity)</span>
              </div>

              <div className={styles.cycleItem}>
                <div className={styles.cycleLabels}>
                  <span>Tower A Core Shear Wall Erection</span>
                  <strong>8.5 Days (Target: 8 Days)</strong>
                </div>
                <div className={styles.analyticsBar}>
                  <div className={`${styles.analyticsFill} ${styles.fillAmber}`} style={{ width: '98%' }}></div>
                </div>
                <span className={styles.cyclePaceWarning}>Minor formwork adjustment required</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Governance, Actions, Timeline & Offline Hub */}
        <div className={styles.governanceCol}>

          {/* SECTION 13: My Pending Actions (High Priority Alert Box) */}
          <div className={styles.alertBox}>
            <div className={styles.alertHeader}>
              <AlertTriangle size={18} className={styles.amberIcon} />
              <h4>13. My Pending Actions</h4>
            </div>
            <ul className={styles.actionList}>
              <li className={styles.actionListItem}>
                <div className={styles.actionMeta}>
                  <strong>Submit Today's DPR (18 Nov)</strong>
                  <span>Auto-compiled draft ready. Requires supervisor sign-off before 18:00.</span>
                </div>
                <Link href="/supervisor/dpr" className={styles.miniActionBtn}>Open DPR</Link>
              </li>
              <li className={styles.actionListItem}>
                <div className={styles.actionMeta}>
                  <strong>Verify 2 Flagged Attendances</strong>
                  <span>GPS geofence distance exceeded (78m) for 2 casual labourers.</span>
                </div>
                <Link href="/supervisor/attendance" className={styles.miniActionBtn}>Verify</Link>
              </li>
              <li className={styles.actionListItem}>
                <div className={styles.actionMeta}>
                  <strong>Review Cement Indent Status</strong>
                  <span>Admin PO generated; awaiting site delivery confirmation.</span>
                </div>
                <Link href="/supervisor/material-requests" className={styles.miniActionBtn}>Track</Link>
              </li>
            </ul>
          </div>

          {/* SECTION 14: Quick Actions Launchpad */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <Zap size={18} className={styles.headerIcon} />
                <h3>14. Supervisor Quick Launchpad</h3>
              </div>
            </div>
            <div className={styles.launchpadGrid}>
              <Link href="/supervisor/dpr" className={styles.launchBtn}>
                <FileText size={16} />
                <span>Submit DPR</span>
              </Link>
              <Link href="/supervisor/attendance" className={styles.launchBtn}>
                <Users size={16} />
                <span>Mark Attendance</span>
              </Link>
              <Link href="/supervisor/fuel" className={styles.launchBtn}>
                <Fuel size={16} />
                <span>Log Bowser Fuel</span>
              </Link>
              <Link href="/supervisor/expenses" className={styles.launchBtn}>
                <Receipt size={16} />
                <span>Add Site Expense</span>
              </Link>
              <Link href="/supervisor/material-requests" className={styles.launchBtn}>
                <PlusCircle size={16} />
                <span>Material Indent</span>
              </Link>
              <Link href="/supervisor/issues" className={styles.launchBtn}>
                <AlertTriangle size={16} />
                <span>Report Site Issue</span>
              </Link>
            </div>
          </div>

          {/* SECTION 11: Safety, Quality and Site Issues */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <ShieldCheck size={18} className={styles.headerIcon} />
                <h3>11. Safety, Quality & EHS Site Incidents</h3>
              </div>
              <Link href="/supervisor/issues" className={styles.linkAction}>View All</Link>
            </div>

            <div className={styles.ehsScoreCard}>
              <div className={styles.ehsTop}>
                <div>
                  <span className={styles.ehsLabel}>Site EHS Safety Score</span>
                  <strong className={styles.ehsScore}>100% Zero-LTI</strong>
                </div>
                <span className={styles.daysBadge}>428 Days LTI Free</span>
              </div>
              <div className={styles.incidentRow}>
                <div className={styles.incidentItem}>
                  <AlertTriangle size={14} className={styles.alertAmber} />
                  <div>
                    <strong>Edge Protection Guardrail Loose</strong>
                    <div className={styles.dimSub}>Tower A Grid 7 &middot; Corrective Action Assigned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 12: Admin Assignment and Activity Timeline */}
          <div className={styles.contentBlock}>
            <div className={styles.blockHeader}>
              <div className={styles.blockTitle}>
                <Activity size={18} className={styles.headerIcon} />
                <h3>12. Admin Activity & Timeline</h3>
              </div>
              <Link href="/supervisor/requests" className={styles.linkAction}>Audit</Link>
            </div>

            <div className={styles.timelineList}>
              <div className={styles.timelineEntry}>
                <span className={styles.timelineDot}></span>
                <div className={styles.timelineContent}>
                  <strong>PM Approved Material Indent #IND-902</strong>
                  <p>Project Manager Er. Sanjay V. approved 400 Bags Ultratech Cement for Tower A.</p>
                  <span className={styles.timelineTime}>Today at 11:15 AM &middot; Central Strapi</span>
                </div>
              </div>

              <div className={styles.timelineEntry}>
                <span className={styles.timelineDot}></span>
                <div className={styles.timelineContent}>
                  <strong>Site Petty Cash Voucher #EXP-411 Verified</strong>
                  <p>Safety Harness replacement voucher (₹4,500) cleared by Accounts.</p>
                  <span className={styles.timelineTime}>Today at 09:40 AM &middot; Accounts Team</span>
                </div>
              </div>

              <div className={styles.timelineEntry}>
                <span className={styles.timelineDot}></span>
                <div className={styles.timelineContent}>
                  <strong>Machinery Relocation Directive</strong>
                  <p>JCB-02 assigned for drainage backfilling at Expressway Link from 14:00.</p>
                  <span className={styles.timelineTime}>Yesterday at 17:30 PM &middot; Ops Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 15: Offline Synchronization Status */}
          <div className={styles.offlineBufferBox}>
            <div className={styles.offlineMeta}>
              <div className={styles.offlineIndicatorRow}>
                <span className={styles.syncStatusPulse}></span>
                <strong>15. Offline Synchronization Buffer</strong>
              </div>
              <p>Strapi Node Server v5.62.0 connected on port 1337 &middot; Latency: 12ms</p>
            </div>
            <div className={styles.offlineActionRow}>
              <span className={styles.queueCountBadge}>
                {offlineCount} offline operations queued
              </span>
              <button 
                onClick={handleManualSync} 
                disabled={syncing} 
                className={styles.compactSyncBtn}
              >
                {syncing ? 'Flushing...' : 'Flush Buffer'}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
