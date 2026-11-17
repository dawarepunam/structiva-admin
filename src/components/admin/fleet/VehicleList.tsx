'use client';

import React, { useState, useEffect } from 'react';
import styles from './VehicleList.module.css';
import { 
  Truck, Search, Plus, MapPin, Gauge, ShieldCheck, X, ArrowRight, UserCheck, 
  Wrench, AlertTriangle, CheckCircle, Clock, DollarSign, LayoutGrid, List,
  Filter, Building, Radio, Fuel, AlertCircle, ChevronRight, Sparkles, HardHat
} from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';
import { 
  EnterpriseAssetRecord, getStoredFleet, saveFleet, defaultEnterpriseFleet 
} from '@/services/fleetStorage';
import { getStoredProjects, EnterpriseProjectRecord } from '@/services/projectStorage';
import { getStoredWorkers, EnterpriseWorkerRecord } from '@/services/workerStorage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VehicleList() {
  const router = useRouter();
  const [fleet, setFleet] = useState<EnterpriseAssetRecord[]>([]);
  const [projects, setProjects] = useState<EnterpriseProjectRecord[]>([]);
  const [workers, setWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<'All' | 'Heavy Machinery' | 'Commercial Vehicle'>('All');
  const [ownershipFilter, setOwnershipFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Mutual Exclusive Card Filter State
  const [activeKpiCard, setActiveKpiCard] = useState<'All' | 'Heavy' | 'Vehicle' | 'Operating' | 'Maintenance' | 'Rented'>('All');

  const handleKpiCardClick = (cardType: 'All' | 'Heavy' | 'Vehicle' | 'Operating' | 'Maintenance' | 'Rented') => {
    setActiveKpiCard(cardType);
    if (cardType === 'All') {
      setClassFilter('All');
      setStatusFilter('All');
      setOwnershipFilter('All');
    } else if (cardType === 'Heavy') {
      setClassFilter('Heavy Machinery');
      setStatusFilter('All');
      setOwnershipFilter('All');
    } else if (cardType === 'Vehicle') {
      setClassFilter('Commercial Vehicle');
      setStatusFilter('All');
      setOwnershipFilter('All');
    } else if (cardType === 'Operating') {
      setClassFilter('All');
      setStatusFilter('Operational (On Site)');
      setOwnershipFilter('All');
    } else if (cardType === 'Maintenance') {
      setClassFilter('All');
      setStatusFilter('Under Maintenance');
      setOwnershipFilter('All');
    } else if (cardType === 'Rented') {
      setClassFilter('All');
      setStatusFilter('All');
      setOwnershipFilter('Rented / Hired');
    }
  };
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    serialNumber: '',
    assetClass: 'Heavy Machinery' as 'Heavy Machinery' | 'Commercial Vehicle',
    category: 'Excavator / Backhoe' as any,
    manufacturer: 'JCB India',
    model: '3DX EcoXcellence',
    manufacturingYear: 2023,
    ownershipType: 'Company Owned' as 'Company Owned' | 'Rented / Hired',
    rentalVendor: '',
    rentalRatePerDay: 7500,
    currentProject: 'Skyline Commercial Complex',
    assignedOperator: 'Santosh Shinde',
    meterUnit: 'Hours' as 'Hours' | 'Kilometres',
    operatingHoursOrKm: 1200,
    fuelTankCapacityLitres: 150,
    averageConsumption: '5.0 L / hr',
    image: '/images/jcb_real.jpg'
  });

  // Load from local storage
  useEffect(() => {
    setFleet(getStoredFleet());
    setProjects(getStoredProjects());
    setWorkers(getStoredWorkers());

    const handleStorage = () => {
      setFleet(getStoredFleet());
      setProjects(getStoredProjects());
      setWorkers(getStoredWorkers());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('fleetUpdated', handleStorage);
    window.addEventListener('projectsUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('fleetUpdated', handleStorage);
      window.removeEventListener('projectsUpdated', handleStorage);
    };
  }, []);

  // Compute 12 KPI Summary Metrics
  const totalAssets = fleet.length;
  const commercialVehicles = fleet.filter(a => a.assetClass === 'Commercial Vehicle').length;
  const heavyMachinery = fleet.filter(a => a.assetClass === 'Heavy Machinery').length;
  const operationalCount = fleet.filter(a => a.currentStatus === 'Operational (On Site)').length;
  const underMaintenanceCount = fleet.filter(a => a.currentStatus === 'Under Maintenance').length;
  const breakdownCount = fleet.filter(a => a.currentStatus === 'Breakdown Alert').length;
  const rentedCount = fleet.filter(a => a.ownershipType === 'Rented / Hired').length;
  const telematicsLiveCount = fleet.filter(a => a.telematicsStatus === 'GPS Connected').length;
  const serviceDueCount = fleet.filter(a => (a.serviceDueAtHoursOrKm - a.operatingHoursOrKm) <= 100).length;
  const totalMaintCost = fleet.reduce((acc, curr) => acc + (curr.totalMaintenanceCost || 0), 0);
  const totalFuelCost = fleet.reduce((acc, curr) => acc + (curr.totalFuelCost || 0), 0);
  const totalOperatingCost = totalMaintCost + totalFuelCost;

  // Filter Logic
  let filtered = fleet.filter(a => {
    const matchSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.currentProject.toLowerCase().includes(search.toLowerCase()) ||
      a.assignedOperator.toLowerCase().includes(search.toLowerCase());

    const matchClass = classFilter === 'All' || a.assetClass === classFilter;
    const matchOwnership = ownershipFilter === 'All' || a.ownershipType === ownershipFilter;
    const matchStatus = statusFilter === 'All' || a.currentStatus === statusFilter;
    const matchProject = projectFilter === 'All' || a.currentProject === projectFilter;

    return matchSearch && matchClass && matchOwnership && matchStatus && matchProject;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newId = (Date.now()).toString();
    const classSlug = formData.assetClass === 'Heavy Machinery' ? 'MAC' : 'VEH';
    const newCode = `AST-${classSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newAsset: EnterpriseAssetRecord = {
      id: newId,
      name: formData.name,
      code: newCode,
      registrationNumber: formData.registrationNumber || `MH 12 PR ${Math.floor(1000 + Math.random() * 9000)}`,
      serialNumber: formData.serialNumber || `SN-${Date.now()}`,
      assetClass: formData.assetClass,
      category: formData.category,
      manufacturer: formData.manufacturer,
      model: formData.model,
      manufacturingYear: Number(formData.manufacturingYear) || 2023,
      ownershipType: formData.ownershipType,
      rentalVendor: formData.ownershipType === 'Rented / Hired' ? formData.rentalVendor : undefined,
      rentalRatePerDay: formData.ownershipType === 'Rented / Hired' ? Number(formData.rentalRatePerDay) : undefined,
      currentStatus: 'Operational (On Site)',
      currentProject: formData.currentProject,
      assignedOperator: formData.assignedOperator,
      operatorPhone: '+91 98220 00000',
      operatorLicence: 'DL-VERIFIED-HMV',
      meterUnit: formData.meterUnit,
      operatingHoursOrKm: Number(formData.operatingHoursOrKm) || 100,
      serviceDueAtHoursOrKm: Number(formData.operatingHoursOrKm) + 250,
      telematicsStatus: 'GPS Connected',
      telematicsImei: `86${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      fuelType: 'Diesel (High Cetane)',
      fuelTankCapacityLitres: Number(formData.fuelTankCapacityLitres) || 200,
      averageConsumption: formData.averageConsumption || '6.0 L / hr',
      engineNumber: `ENG-${Math.floor(10000 + Math.random() * 90000)}`,
      operatingCapacity: 'Standard Heavy Rating',
      image: formData.image || (formData.assetClass === 'Heavy Machinery' ? '/images/jcb_real.jpg' : '/images/tipper_real.jpg'),
      totalMaintenanceCost: 0,
      totalFuelCost: 0,
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'RTO Commercial Permit & RC',
          category: 'Registration Certificate (RC)',
          uploadedAt: '17 Nov 2026',
          status: 'Valid',
          url: '#'
        }
      ],
      maintenanceRecords: [],
      inspections: [],
      assignmentHistory: [
        {
          id: `asg-${Date.now()}`,
          projectName: formData.currentProject,
          siteLocation: 'Maharashtra Site Yard',
          startDate: '17 Nov 2026',
          operatorName: formData.assignedOperator,
          status: 'Current'
        }
      ],
      fuelLogs: []
    };

    const updated = [newAsset, ...fleet];
    setFleet(updated);
    saveFleet(updated);
    setShowAddModal(false);
  };

  return (
    <div className={styles.container}>
      {/* 12 Fleet KPI Metric Cards Grid */}
      <div className={styles.kpiGrid}>
        <div 
          className={`${styles.kpiCard} ${activeKpiCard === 'All' ? styles.kpiActive : ''}`}
          onClick={() => handleKpiCardClick('All')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Fleet Assets</span>
            <div className={`${styles.kpiIconBox} ${styles.iconTeal}`}>
              <Truck size={17} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{totalAssets}</span>
            <span className={styles.kpiBadge}>Master Register</span>
          </div>
          <span className={styles.kpiSub}>All heavy & commercial assets</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeKpiCard === 'Heavy' ? styles.kpiActive : ''}`}
          onClick={() => handleKpiCardClick('Heavy')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Heavy Machinery</span>
            <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
              <HardHat size={17} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{heavyMachinery}</span>
            <span className={styles.kpiBadgeEmerald}>Cranes / Excavators</span>
          </div>
          <span className={styles.kpiSub}>Earthmoving & lifting equipment</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeKpiCard === 'Vehicle' ? styles.kpiActive : ''}`}
          onClick={() => handleKpiCardClick('Vehicle')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Commercial Vehicles</span>
            <div className={`${styles.kpiIconBox} ${styles.iconBronze}`}>
              <Truck size={17} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{commercialVehicles}</span>
            <span className={styles.kpiBadgeBronze}>Tippers / Tankers</span>
          </div>
          <span className={styles.kpiSub}>Logistics & site hauling</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeKpiCard === 'Operating' ? styles.kpiActive : ''}`}
          onClick={() => handleKpiCardClick('Operating')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Operating On Site</span>
            <div className={`${styles.kpiIconBox} ${styles.iconEmerald}`}>
              <CheckCircle size={17} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{operationalCount}</span>
            <span className={styles.kpiBadgeEmerald}>In Production</span>
          </div>
          <span className={styles.kpiSub}>Active project deployments</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeKpiCard === 'Maintenance' ? styles.kpiActive : ''}`}
          onClick={() => handleKpiCardClick('Maintenance')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Under Maintenance</span>
            <div className={`${styles.kpiIconBox} ${styles.iconDanger}`}>
              <Wrench size={17} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{underMaintenanceCount}</span>
            <span className={styles.kpiBadgeDanger}>Workshop Overhaul</span>
          </div>
          <span className={styles.kpiSub}>Service bays & scheduled checks</span>
        </div>

        <div 
          className={`${styles.kpiCard} ${activeKpiCard === 'Rented' ? styles.kpiActive : ''}`}
          onClick={() => handleKpiCardClick('Rented')}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Hired / Rented Assets</span>
            <div className={`${styles.kpiIconBox} ${styles.iconMuted}`}>
              <Clock size={17} />
            </div>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{rentedCount}</span>
            <span className={styles.kpiBadgeMuted}>Vendor Contract</span>
          </div>
          <span className={styles.kpiSub}>Active rental leases</span>
        </div>
      </div>

      {/* Control & Search Toolbar */}
      <div className={styles.topBar}>
        <div className={styles.searchAndFilters}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by asset name, reg number, model, site, or pilot..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className={styles.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className={styles.filterGroup}>
            <div className={styles.filterItem}>
              <Filter size={14} className={styles.filterIcon} />
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value as any)}>
                <option value="All">All Asset Classes</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Commercial Vehicle">Commercial Vehicles</option>
              </select>
            </div>

            <div className={styles.filterItem}>
              <select value={ownershipFilter} onChange={(e) => setOwnershipFilter(e.target.value)}>
                <option value="All">All Ownership</option>
                <option value="Company Owned">Company Owned</option>
                <option value="Rented / Hired">Rented / Hired</option>
              </select>
            </div>

            <div className={styles.filterItem}>
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="All">All Project Sites</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Toggle & Add Button */}
        <div className={styles.actionButtons}>
          <div className={styles.viewToggleGroup}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button onClick={() => setShowAddModal(true)} className={styles.btnAddAsset}>
            <Plus size={16} />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Main Content: Grid View OR Table View */}
      {viewMode === 'grid' ? (
        <div className={styles.fleetGrid}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Truck size={44} className={styles.emptyIcon} />
              <h3>No fleet or heavy machinery records found</h3>
              <p>Try adjusting your search criteria or filter tags.</p>
              <button 
                onClick={() => { setSearch(''); setClassFilter('All'); setOwnershipFilter('All'); setStatusFilter('All'); setProjectFilter('All'); }} 
                className={styles.resetBtn}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filtered.map(asset => (
              <div 
                key={asset.id} 
                className={styles.card}
                onClick={() => router.push(`/admin/fleet/${asset.id}`)}
                role="button"
                tabIndex={0}
              >
                {/* Image Cover with Status Overlays */}
                <div className={styles.imageWrapper}>
                  <SafeImage 
                    src={asset.image} 
                    alt={asset.name} 
                    fallbackType="machine" 
                    className={styles.machineImage} 
                  />
                  <div className={`${styles.statusTag} ${asset.currentStatus.includes('Operational') ? styles.statusOperational : styles.statusMaint}`}>
                    <span className={styles.statusIndicatorDot} />
                    <span>{asset.currentStatus}</span>
                  </div>
                  <span className={styles.regOverlay}>{asset.registrationNumber}</span>
                  <span className={styles.classOverlay}>{asset.assetClass}</span>
                </div>

                {/* Card Content Body */}
                <div className={styles.cardContent}>
                  <div className={styles.titleArea}>
                    <div className={styles.codeRow}>
                      <span className={styles.assetCode}>{asset.code}</span>
                      <span className={`${styles.ownershipBadge} ${asset.ownershipType.includes('Company') ? styles.badgeOwned : styles.badgeRented}`}>
                        {asset.ownershipType}
                      </span>
                    </div>
                    <h3 className={styles.title}>{asset.name}</h3>
                    <div className={styles.siteRow}>
                      <MapPin size={13} className={styles.siteIcon} />
                      <span className={styles.siteName}>{asset.currentProject}</span>
                    </div>
                  </div>

                  {/* Operating Metric Boxes */}
                  <div className={styles.metricsGrid}>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>OPERATING LOG</span>
                      <strong className={styles.metricValue}>
                        {asset.operatingHoursOrKm} {asset.meterUnit}
                      </strong>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>PILOT / OPERATOR</span>
                      <strong className={styles.metricValueSmall}>
                        {asset.assignedOperator.split(' ')[0]} {asset.assignedOperator.split(' ')[1] || ''}
                      </strong>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>NEXT SERVICE</span>
                      <strong className={styles.metricValueService}>
                        {asset.serviceDueAtHoursOrKm - asset.operatingHoursOrKm} {asset.meterUnit}
                      </strong>
                    </div>
                  </div>

                  {/* Card Footer with Link */}
                  <div className={styles.cardFooter}>
                    <div className={styles.telematicsStatusRow}>
                      <Radio size={13} className={asset.telematicsStatus === 'GPS Connected' ? styles.iconGreen : styles.iconMuted} />
                      <span>{asset.telematicsStatus}</span>
                    </div>

                    <div className={styles.viewDossierLink}>
                      <span>9-Tab Dossier</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View Mode with Desktop Full Table & Android Responsive Card Fallback */
        <>
          <div className={`${styles.tablePanel} ${styles.desktopOnlyTable}`}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Asset Name & Code</th>
                  <th>Reg # & Class</th>
                  <th>Project Deployment</th>
                  <th>Pilot / Operator</th>
                  <th>Operating Hours / KM</th>
                  <th>Service Due In</th>
                  <th>Ownership</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(asset => (
                  <tr 
                    key={asset.id} 
                    onClick={() => router.push(`/admin/fleet/${asset.id}`)}
                    className={styles.tableRowClickable}
                  >
                    <td>
                      <div className={styles.tableAssetInfo}>
                        <SafeImage src={asset.image} alt={asset.name} fallbackType="machine" className={styles.tableThumb} />
                        <div>
                          <strong className={styles.tableAssetName}>{asset.name}</strong>
                          <span className={styles.tableAssetCode}>{asset.code} • {asset.manufacturer}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableRegInfo}>
                        <strong>{asset.registrationNumber}</strong>
                        <span className={styles.tableSub}>{asset.category}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.tableProjectTag}>{asset.currentProject}</span>
                    </td>
                    <td>
                      <div className={styles.tableOperatorInfo}>
                        <span>{asset.assignedOperator}</span>
                        <span className={styles.tableSub}>{asset.operatorLicence}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{asset.operatingHoursOrKm} {asset.meterUnit}</strong>
                    </td>
                    <td>
                      <span className={(asset.serviceDueAtHoursOrKm - asset.operatingHoursOrKm) <= 100 ? styles.textServiceAlert : styles.textServiceOk}>
                        {asset.serviceDueAtHoursOrKm - asset.operatingHoursOrKm} {asset.meterUnit}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.ownershipBadge} ${asset.ownershipType.includes('Company') ? styles.badgeOwned : styles.badgeRented}`}>
                        {asset.ownershipType}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadgeSmall} ${asset.currentStatus.includes('Operational') ? styles.statusOperational : styles.statusMaint}`}>
                        ● {asset.currentStatus.split(' ')[0]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/fleet/${asset.id}`} className={styles.tableActionLink} onClick={e => e.stopPropagation()}>
                        Dossier
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Android Mobile Table Mode -> Compact List Cards */}
          <div className={styles.mobileFleetList}>
            {filtered.map(asset => (
              <div 
                key={asset.id}
                className={styles.mobileFleetCard}
                onClick={() => router.push(`/admin/fleet/${asset.id}`)}
              >
                <div className={styles.mobileFleetHeader}>
                  <div className={styles.mobileFleetIdentity}>
                    <SafeImage src={asset.image} alt={asset.name} fallbackType="machine" className={styles.mobileFleetThumb} />
                    <div>
                      <strong className={styles.mobileFleetName}>{asset.name}</strong>
                      <span className={styles.mobileFleetReg}>{asset.registrationNumber} • {asset.code}</span>
                    </div>
                  </div>
                  <span className={`${styles.statusBadgeSmall} ${asset.currentStatus.includes('Operational') ? styles.statusOperational : styles.statusMaint}`}>
                    ● {asset.currentStatus.split(' ')[0]}
                  </span>
                </div>
                <div className={styles.mobileFleetMeta}>
                  <span>Site: <strong>{asset.currentProject}</strong></span>
                  <span>Pilot: <strong>{asset.assignedOperator}</strong></span>
                </div>
                <div className={styles.mobileFleetFooter}>
                  <span>Meter: <strong>{asset.operatingHoursOrKm} {asset.meterUnit}</strong></span>
                  <Link href={`/admin/fleet/${asset.id}`} className={styles.tableActionLink} onClick={e => e.stopPropagation()}>
                    Dossier <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Asset Registration Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <div className={styles.modalHeaderIcon}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3>Register New Fleet / Heavy Machinery Asset</h3>
                  <p>Enterprise asset commissioning, telematics & project assignment</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className={styles.modalForm}>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Asset Model / Commercial Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sany SY215C Hydraulic Excavator 21.5T"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Asset Classification *</label>
                  <select 
                    value={formData.assetClass}
                    onChange={e => setFormData({ ...formData, assetClass: e.target.value as any })}
                  >
                    <option value="Heavy Machinery">Heavy Machinery (Crane, JCB, Excavator, Roller)</option>
                    <option value="Commercial Vehicle">Commercial Vehicle (Tipper, Dumper, Tanker, Truck)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow3}>
                <div className={styles.formGroup}>
                  <label>RTO Registration Number *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.registrationNumber}
                    onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="MH 12 AB 4590"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Chassis / Serial Number</label>
                  <input 
                    type="text" 
                    value={formData.serialNumber}
                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="SN-99210-2023"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Manufacturing Year</label>
                  <input 
                    type="number" 
                    value={formData.manufacturingYear}
                    onChange={e => setFormData({ ...formData, manufacturingYear: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Ownership Model *</label>
                  <select 
                    value={formData.ownershipType}
                    onChange={e => setFormData({ ...formData, ownershipType: e.target.value as any })}
                  >
                    <option value="Company Owned">Company Owned (Direct Asset)</option>
                    <option value="Rented / Hired">Rented / Hired (External Lease Contract)</option>
                  </select>
                </div>
                {formData.ownershipType === 'Rented / Hired' && (
                  <div className={styles.formGroup}>
                    <label>Rental Vendor & Daily Rate (₹ / Day)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Sanghvi Movers Ltd" 
                        value={formData.rentalVendor}
                        onChange={e => setFormData({ ...formData, rentalVendor: e.target.value })}
                      />
                      <input 
                        type="number" 
                        placeholder="8500" 
                        style={{ width: 120 }}
                        value={formData.rentalRatePerDay}
                        onChange={e => setFormData({ ...formData, rentalRatePerDay: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Assign to Project Site *</label>
                  <select 
                    value={formData.currentProject}
                    onChange={e => setFormData({ ...formData, currentProject: e.target.value })}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Designated Pilot / Operator</label>
                  <select 
                    value={formData.assignedOperator}
                    onChange={e => setFormData({ ...formData, assignedOperator: e.target.value })}
                  >
                    {workers.map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.skill})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow3}>
                <div className={styles.formGroup}>
                  <label>Meter Unit</label>
                  <select 
                    value={formData.meterUnit}
                    onChange={e => setFormData({ ...formData, meterUnit: e.target.value as any })}
                  >
                    <option value="Hours">Engine Operating Hours</option>
                    <option value="Kilometres">Odometer Kilometres</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Current Meter Reading</label>
                  <input 
                    type="number" 
                    value={formData.operatingHoursOrKm}
                    onChange={e => setFormData({ ...formData, operatingHoursOrKm: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Fuel Tank Capacity (L)</label>
                  <input 
                    type="number" 
                    value={formData.fuelTankCapacityLitres}
                    onChange={e => setFormData({ ...formData, fuelTankCapacityLitres: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Commission & Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
