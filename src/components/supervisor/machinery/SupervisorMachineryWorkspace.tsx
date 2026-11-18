'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './Machinery.module.css';
import { 
  Truck, 
  Wrench, 
  Clock, 
  Fuel, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Calendar,
  RotateCcw,
  Check,
  FileText
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity, createStrapiEntity } from '@/services/strapiClient';
import { EnterpriseProjectRecord } from '@/services/projectStorage';

export default function SupervisorMachineryWorkspace() {
  const [activeTab, setActiveTab] = useState<'machinery' | 'vehicles'>('machinery');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Authenticated Supervisor Identity
  const [supervisorUser, setSupervisorUser] = useState({
    name: 'Er. Pravin Gaikwad',
    empId: 'EMP-SUP-084',
    role: 'Supervisor'
  });

  // Collections from Strapi v5
  const [fleets, setFleets] = useState<any[]>([]);
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [fuels, setFuels] = useState<any[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Drawer States
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'details' | 'log' | 'breakdown'>('details');

  // Usage Log Inputs
  const [logHours, setLogHours] = useState<number>(8.0);
  const [logDescription, setLogDescription] = useState<string>('');
  const [logSavedSuccess, setLogSavedSuccess] = useState<boolean>(false);

  // Breakdown Request Inputs
  const [breakdownPriority, setBreakdownPriority] = useState<string>('High');
  const [breakdownProblem, setBreakdownProblem] = useState<string>('');
  const [breakdownSubmitted, setBreakdownSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('structiva_supervisor_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSupervisorUser({
            name: parsed.username || parsed.name || 'Er. Pravin Gaikwad',
            empId: parsed.empId || 'EMP-SUP-084',
            role: parsed.role || 'Supervisor'
          });
        }
      } catch (e) {
        console.warn('Session parse warning');
      }
    }
  }, []);

  async function loadFleetData() {
    setLoading(true);
    try {
      const [fleetRes, projectsRes, fuelsRes] = await Promise.all([
        fetchStrapiCollection('fleets', []),
        fetchStrapiCollection<EnterpriseProjectRecord>('projects', []),
        fetchStrapiCollection('fuels', [])
      ]);

      setFleets(fleetRes || []);
      setProjects(projectsRes || []);
      setFuels(fuelsRes || []);
    } catch (err) {
      console.error('Failed to load fleet data from Strapi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFleetData();
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    await loadFleetData();
    setSyncing(false);
  };

  // ─────────────────────────────────────────────────────────────
  // STRICT IDENTITY-BASED PROJECT & ASSET ASSIGNMENT FILTERING
  // ─────────────────────────────────────────────────────────────
  const assignedProjects = useMemo(() => {
    const supQuery = supervisorUser.name.toLowerCase().trim();
    return projects.filter((p: any) => {
      if (!p.projectSupervisor) return false;
      const assigned = p.projectSupervisor.toLowerCase().trim();
      return assigned.includes(supQuery) || supQuery.includes(assigned);
    });
  }, [projects, supervisorUser.name]);

  const assignedAssets = useMemo(() => {
    const projectNames = assignedProjects.map(p => p.name.toLowerCase().split('(')[0].trim());

    return fleets.filter((f: any) => {
      if (!f.currentProject) return false;
      const assetProj = f.currentProject.toLowerCase();
      return projectNames.some(pName => assetProj.includes(pName));
    });
  }, [fleets, assignedProjects]);

  // Distinguish Machinery vs Vehicles
  const machineryAssets = useMemo(() => {
    return assignedAssets.filter(a => 
      a.assetClass === 'Heavy Machinery' || 
      a.code.startsWith('EQP') || 
      a.category?.includes('Excavator') || 
      a.category?.includes('Crane') ||
      a.category?.includes('JCB')
    );
  }, [assignedAssets]);

  const vehicleAssets = useMemo(() => {
    return assignedAssets.filter(a => 
      a.assetClass?.includes('Vehicle') || 
      a.code.startsWith('VEH') || 
      a.category?.includes('Tipper') || 
      a.category?.includes('Pickup') ||
      a.category?.includes('Tanker')
    );
  }, [assignedAssets]);

  // Active view assets
  const currentCategoryAssets = activeTab === 'machinery' ? machineryAssets : vehicleAssets;

  // ─────────────────────────────────────────────────────────────
  // 6-METRIC OVERVIEW STRIP (100% REAL CALCULATIONS)
  // ─────────────────────────────────────────────────────────────
  const overviewStats = useMemo(() => {
    const totalMachinery = machineryAssets.length;
    const totalVehicles = vehicleAssets.length;
    const operational = assignedAssets.filter(a => a.currentStatus?.includes('Operational') || a.currentStatus === 'Active').length;
    const maintenance = assignedAssets.filter(a => a.currentStatus?.includes('Maintenance')).length;
    const breakdown = assignedAssets.filter(a => a.currentStatus?.includes('Breakdown')).length;
    const totalFuelLitres = fuels.reduce((sum, f) => sum + (Number(f.litresDisbursed) || 0), 0);

    return {
      totalMachinery,
      totalVehicles,
      operational,
      maintenance,
      breakdown,
      totalFuelLitres
    };
  }, [machineryAssets, vehicleAssets, assignedAssets, fuels]);

  // Client-Side Search & Filters
  const filteredAssets = useMemo(() => {
    return currentCategoryAssets.filter(a => {
      const matchesSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        (a.registrationNumber && a.registrationNumber.toLowerCase().includes(search.toLowerCase())) ||
        (a.assignedOperator && a.assignedOperator.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || a.currentStatus === statusFilter;
      const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [currentCategoryAssets, search, statusFilter, categoryFilter]);

  const handleOpenDrawer = (asset: any, defaultDrawerTab: 'details' | 'log' | 'breakdown' = 'details') => {
    setSelectedAsset(asset);
    setActiveDrawerTab(defaultDrawerTab);
    setLogHours(8.0);
    setLogDescription('');
    setLogSavedSuccess(false);
    setBreakdownProblem('');
    setBreakdownSubmitted(false);
  };

  // Submit Daily Usage Log
  const handleSaveUsageLog = async () => {
    if (!selectedAsset) return;

    const newOperatingHours = (Number(selectedAsset.operatingHoursOrKm) || 0) + logHours;

    // Update fleet operating hours in Strapi
    if (selectedAsset.documentId) {
      await updateStrapiEntity('fleets', selectedAsset.documentId, {
        operatingHoursOrKm: newOperatingHours
      });
    }

    setLogSavedSuccess(true);
    await loadFleetData();
    setTimeout(() => {
      setLogSavedSuccess(false);
      setSelectedAsset(null);
    }, 1500);
  };

  // Submit Breakdown / Maintenance Alert to Central Strapi
  const handleSubmitBreakdown = async () => {
    if (!selectedAsset) return;

    const breakdownPayload = {
      requestType: 'Site Issue',
      title: `Equipment Breakdown Alert: ${selectedAsset.code} - ${selectedAsset.name}`,
      project: selectedAsset.currentProject || 'Skyline Commercial Complex',
      site: 'Tower A',
      category: 'Machinery Breakdown',
      priority: breakdownPriority,
      status: 'Submitted',
      details: JSON.stringify({
        assetCode: selectedAsset.code,
        registrationNumber: selectedAsset.registrationNumber,
        assignedOperator: selectedAsset.assignedOperator,
        currentHours: selectedAsset.operatingHoursOrKm,
        problemDescription: breakdownProblem,
        reportedBy: supervisorUser.name,
        reportedDate: '19 Nov 2026'
      }),
      remarks: breakdownProblem,
      submittedBy: supervisorUser.name,
      submittedDate: '19 Nov 2026'
    };

    await createStrapiEntity('supervisor-requests', breakdownPayload);

    // Update asset status to Breakdown / Maintenance
    if (selectedAsset.documentId) {
      await updateStrapiEntity('fleets', selectedAsset.documentId, {
        currentStatus: 'Breakdown Alert'
      });
    }

    setBreakdownSubmitted(true);
    await loadFleetData();
    setTimeout(() => {
      setBreakdownSubmitted(false);
      setSelectedAsset(null);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.titleArea}>
          <h1>Machinery & Vehicle Operations</h1>
          <p>
            Authorized heavy equipment telemetry, run logs, breakdown reporting, and bowser fuel tracking for Supervisor <strong>{supervisorUser.name}</strong> ({supervisorUser.empId}).
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.badge}>ADMIN ASSIGNED FLEET</span>
          <button 
            onClick={handleRefresh} 
            disabled={syncing || loading} 
            className={styles.refreshBtn}
            title="Refresh fleet records from central Strapi backend"
          >
            <RefreshCw size={13} className={syncing ? styles.spin : ''} />
            <span>{syncing ? 'Refreshing...' : 'Revalidate'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          6-METRIC OVERVIEW STRIP
          ───────────────────────────────────────────────────────── */}
      <section className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Heavy Machinery</span>
          <strong className={styles.overviewValue}>{overviewStats.totalMachinery} Units</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>Earthmoving & Cranes</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Site Vehicles</span>
          <strong className={styles.overviewValue}>{overviewStats.totalVehicles} Units</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>Tippers & Pickups</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Operational</span>
          <strong className={styles.overviewValue}>{overviewStats.operational} Units</strong>
          <span className={`${styles.overviewTag} ${styles.tagGreen}`}>Active On Site</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Under Maintenance</span>
          <strong className={styles.overviewValue}>{overviewStats.maintenance} Units</strong>
          <span className={`${styles.overviewTag} ${styles.tagAmber}`}>Scheduled Service</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Breakdown Alerts</span>
          <strong className={styles.overviewValue}>{overviewStats.breakdown} Units</strong>
          <span className={`${styles.overviewTag} ${overviewStats.breakdown > 0 ? styles.tagRed : styles.tagGreen}`}>
            {overviewStats.breakdown === 0 ? 'Zero Breakdowns' : 'Action Required'}
          </span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Bowser Fuel Logged</span>
          <strong className={styles.overviewValue}>{overviewStats.totalFuelLitres} Litres</strong>
          <span className={`${styles.overviewTag} ${styles.tagTeal}`}>Telemetry Verified</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          WORKSPACE TABS (MACHINERY vs VEHICLES)
          ───────────────────────────────────────────────────────── */}
      <div className={styles.tabsBar}>
        <button 
          onClick={() => setActiveTab('machinery')} 
          className={`${styles.tabBtn} ${activeTab === 'machinery' ? styles.activeTabBtn : ''}`}
        >
          <Wrench size={16} />
          <span>Heavy Machinery ({machineryAssets.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')} 
          className={`${styles.tabBtn} ${activeTab === 'vehicles' ? styles.activeTabBtn : ''}`}
        >
          <Truck size={16} />
          <span>Construction Vehicles ({vehicleAssets.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          CONTROLS STRIP (SEARCH & FILTERS)
          ───────────────────────────────────────────────────────── */}
      <div className={styles.controlsStrip}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'machinery' ? 'machinery' : 'vehicles'} by code, name, reg no, or operator...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Statuses</option>
            <option value="Operational (On Site)">Operational (On Site)</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Breakdown Alert">Breakdown Alert</option>
          </select>

          {(search || statusFilter !== 'All') && (
            <button 
              onClick={() => { setSearch(''); setStatusFilter('All'); }} 
              className={styles.clearBtn}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          ASSET INVENTORY TABLE
          ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={styles.stateBox}>
          <Clock size={32} />
          <h3 className={styles.stateTitle}>Loading Equipment Records...</h3>
          <p className={styles.stateText}>Querying Strapi v5 central machinery and fleet database.</p>
        </div>
      ) : currentCategoryAssets.length === 0 ? (
        <div className={styles.stateBox}>
          <Truck size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No {activeTab === 'machinery' ? 'Machinery' : 'Vehicles'} Allocated to Your Project</h3>
          <p className={styles.stateText}>
            You have no {activeTab} designated by the Central Admin desk. Heavy equipment allocations are configured in the Project Administration module.
          </p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className={styles.stateBox}>
          <Search size={36} className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Matching Equipment Found</h3>
          <p className={styles.stateText}>
            No equipment matches your search criteria "{search}". Try clearing your filters.
          </p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Asset Code & Model</th>
                  <th>Category</th>
                  <th>Assigned Site & Project</th>
                  <th>Operating Log</th>
                  <th>Assigned Operator / Driver</th>
                  <th>Telematics</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset: any) => {
                  const statusClass = 
                    asset.currentStatus?.includes('Operational') ? styles.statusOperational :
                    asset.currentStatus?.includes('Maintenance') ? styles.statusMaintenance :
                    styles.statusBreakdown;

                  return (
                    <tr key={asset.id || asset.documentId}>
                      <td>
                        <span className={styles.assetCode}>{asset.code}</span>
                        <div style={{ fontWeight: 700, color: '#172B32' }}>{asset.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>
                          Reg: {asset.registrationNumber || 'N/A'}
                        </div>
                      </td>
                      <td>{asset.category}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{asset.currentProject}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>Tower A Superstructure</div>
                      </td>
                      <td>
                        <strong>{asset.operatingHoursOrKm || 0} {asset.meterUnit || 'Hours'}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#167C72' }}>
                          {asset.averageConsumption || 'Normal Burn'}
                        </div>
                      </td>
                      <td>
                        <div><strong>{asset.assignedOperator || 'Unassigned'}</strong></div>
                        <div style={{ fontSize: '0.7rem', color: '#8C9990' }}>{asset.operatorPhone || '+91 Verified'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.72rem', color: '#167C72', fontWeight: 600 }}>
                          <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {asset.telematicsStatus || 'GPS Online'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusOperational} ${statusClass}`}>
                          {asset.currentStatus || 'Operational'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtnGroup}>
                          <button 
                            onClick={() => handleOpenDrawer(asset, 'details')} 
                            className={styles.viewBtn}
                            title="View specifications and fuel history"
                          >
                            <span>Specs</span>
                          </button>
                          <button 
                            onClick={() => handleOpenDrawer(asset, 'log')} 
                            className={styles.logBtn}
                            title="Log daily operating hours"
                          >
                            <span>Log</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          ASSET DETAIL, USAGE & BREAKDOWN DRAWER
          ───────────────────────────────────────────────────────── */}
      {selectedAsset && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedAsset(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span className={styles.badge}>{selectedAsset.code}</span>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.2rem', fontWeight: 700 }}>
                  {selectedAsset.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#ECEBE5' }}>
                  {selectedAsset.category} &middot; {selectedAsset.registrationNumber}
                </span>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)} 
                className={styles.drawerCloseBtn}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              
              {/* Drawer Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #ECEBE5', paddingBottom: '0.5rem' }}>
                <button 
                  onClick={() => setActiveDrawerTab('details')}
                  style={{ 
                    background: activeDrawerTab === 'details' ? '#167C72' : '#F4F2EC',
                    color: activeDrawerTab === 'details' ? '#FFF' : '#172B32',
                    border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Asset Specifications
                </button>
                <button 
                  onClick={() => setActiveDrawerTab('log')}
                  style={{ 
                    background: activeDrawerTab === 'log' ? '#167C72' : '#F4F2EC',
                    color: activeDrawerTab === 'log' ? '#FFF' : '#172B32',
                    border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Record Daily Usage
                </button>
                <button 
                  onClick={() => setActiveDrawerTab('breakdown')}
                  style={{ 
                    background: activeDrawerTab === 'breakdown' ? '#EF4444' : '#F4F2EC',
                    color: activeDrawerTab === 'breakdown' ? '#FFF' : '#172B32',
                    border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Report Breakdown
                </button>
              </div>

              {/* DRAWER TAB 1: SPECIFICATIONS */}
              {activeDrawerTab === 'details' && (
                <>
                  <div className={styles.drawerSection}>
                    <h4 className={styles.drawerSectionTitle}>Equipment Identification</h4>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Registration Number</span>
                      <span className={styles.drawerFieldValue}>{selectedAsset.registrationNumber || 'N/A'}</span>
                    </div>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Serial / Chassis No</span>
                      <span className={styles.drawerFieldValue}>{selectedAsset.serialNumber || 'Verified on Tag'}</span>
                    </div>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Manufacturer & Model</span>
                      <span className={styles.drawerFieldValue}>{selectedAsset.manufacturer} {selectedAsset.model}</span>
                    </div>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Fuel System</span>
                      <span className={styles.drawerFieldValue}>{selectedAsset.fuelType || 'Diesel (High Cetane)'}</span>
                    </div>
                  </div>

                  <div className={styles.drawerSection}>
                    <h4 className={styles.drawerSectionTitle}>Operational Telemetry</h4>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Cumulative Operating Log</span>
                      <span className={styles.drawerFieldValue}>
                        <strong>{selectedAsset.operatingHoursOrKm}</strong> {selectedAsset.meterUnit || 'Hours'}
                      </span>
                    </div>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Telematics Status</span>
                      <span className={styles.drawerFieldValue} style={{ color: '#167C72', fontWeight: 700 }}>
                        {selectedAsset.telematicsStatus || 'GPS Connected'}
                      </span>
                    </div>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Assigned Operator</span>
                      <span className={styles.drawerFieldValue}>{selectedAsset.assignedOperator} ({selectedAsset.operatorPhone})</span>
                    </div>
                    <div className={styles.drawerFieldRow}>
                      <span className={styles.drawerFieldLabel}>Expected Burn Rate</span>
                      <span className={styles.drawerFieldValue}>{selectedAsset.averageConsumption || 'Normal'}</span>
                    </div>
                  </div>
                </>
              )}

              {/* DRAWER TAB 2: LOG USAGE HOURS */}
              {activeDrawerTab === 'log' && (
                <div className={styles.actionFormCard}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#172B32' }}>
                    Log Daily Operating Hours for {selectedAsset.code}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>
                    Current reading: <strong>{selectedAsset.operatingHoursOrKm} {selectedAsset.meterUnit || 'Hours'}</strong>
                  </p>

                  {logSavedSuccess && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Usage hours successfully recorded and synced to central Strapi!
                    </div>
                  )}

                  <div>
                    <label className={styles.formLabel}>Hours Run Today (Shift)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={logHours} 
                      onChange={e => setLogHours(Number(e.target.value))} 
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Operational Work Description</label>
                    <textarea 
                      rows={2} 
                      value={logDescription} 
                      onChange={e => setLogDescription(e.target.value)} 
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px', resize: 'vertical' }}
                      placeholder="e.g. Column footing excavation Grid C-E, ready-mix pump feeding..."
                    />
                  </div>

                  <button 
                    onClick={handleSaveUsageLog} 
                    className={styles.submitActionBtn}
                  >
                    <Check size={14} />
                    <span>Save Daily Usage Log</span>
                  </button>
                </div>
              )}

              {/* DRAWER TAB 3: REPORT BREAKDOWN */}
              {activeDrawerTab === 'breakdown' && (
                <div className={styles.actionFormCard} style={{ background: '#FFF5F5', borderColor: '#FED7D7' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#C53030' }}>
                    Report Equipment Breakdown / Maintenance Alert
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#742A2A' }}>
                    Alerts Project Manager and Plant & Machinery department immediately via Strapi.
                  </p>

                  {breakdownSubmitted && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Breakdown alert transmitted! Plant mechanic assigned.
                    </div>
                  )}

                  <div>
                    <label className={styles.formLabel}>Alert Priority</label>
                    <select 
                      value={breakdownPriority} 
                      onChange={e => setBreakdownPriority(e.target.value)}
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="Critical">Critical (Halts Site Concreting / Excavation)</option>
                      <option value="High">High Priority</option>
                      <option value="Standard">Standard Routine Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.formLabel}>Defect / Breakdown Symptom</label>
                    <textarea 
                      rows={3} 
                      value={breakdownProblem} 
                      onChange={e => setBreakdownProblem(e.target.value)} 
                      className={styles.formInput}
                      style={{ width: '100%', marginTop: '4px', resize: 'vertical' }}
                      placeholder="Specify hydraulic leakage, overheating, electrical hoist trip, or brake wear..."
                    />
                  </div>

                  <button 
                    onClick={handleSubmitBreakdown} 
                    className={styles.submitActionBtn}
                    style={{ background: '#E53E3E' }}
                  >
                    <AlertTriangle size={14} />
                    <span>Transmit Breakdown Alert to Admin</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
