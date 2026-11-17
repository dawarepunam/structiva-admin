'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './AssetDetails.module.css';
import { 
  getAssetById, EnterpriseAssetRecord, updateAsset, AssetMaintenanceRecord, AssetInspectionRecord 
} from '@/services/fleetStorage';
import SafeImage from '@/components/admin/ui/SafeImage';
import { 
  ArrowLeft, Truck, MapPin, ShieldCheck, Calendar, Clock, DollarSign, Award, 
  FileText, Briefcase, CheckCircle2, AlertTriangle, AlertCircle, Wrench, 
  ExternalLink, Download, Plus, ChevronRight, Edit3, Fuel, Radio, Gauge,
  Check, X, HardHat, UserCheck, Smartphone, Activity
} from 'lucide-react';
import Link from 'next/link';

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params?.id as string;

  const [asset, setAsset] = useState<EnterpriseAssetRecord | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'specs' | 'assignment' | 'fuel' | 'maintenance' | 'inspections' | 'documents' | 'operating' | 'costs'
  >('overview');

  // Maintenance & Inspection Modals
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  const [maintForm, setMaintForm] = useState({
    type: 'Preventive Service' as 'Preventive Service' | 'Breakdown Repair' | 'Hydraulic Oil Change',
    meterReading: 1500,
    description: '',
    spareParts: '',
    vendorWorkshop: 'Authorized Dealership Workshop',
    cost: 18500,
    technicianName: 'Er. Pravin Gaikwad'
  });

  const [inspectionForm, setInspectionForm] = useState({
    hydraulicsOk: true,
    brakesOk: true,
    engineOilOk: true,
    tracksOrTyresOk: true,
    lightsAndHornOk: true,
    fireExtinguisherOk: true,
    remarks: 'Pre-shift digital walkaround completed. No fluid drops under transmission.'
  });

  useEffect(() => {
    if (assetId) {
      const data = getAssetById(assetId);
      if (data) {
        setAsset(data);
      }
    }
  }, [assetId]);

  if (!asset) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h3>Retrieving Fleet Asset Dossier...</h3>
          <p>Connecting to Structiva Enterprise Telematics & Asset Registry</p>
          <Link href="/admin/fleet" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Fleet Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handle Maintenance Ticket Submission
  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.description.trim()) return;

    const newRecord: AssetMaintenanceRecord = {
      id: `maint-${Date.now()}`,
      type: maintForm.type,
      date: '17 Nov 2026',
      meterReadingHoursOrKm: Number(maintForm.meterReading),
      description: maintForm.description,
      sparePartsUsed: maintForm.spareParts ? maintForm.spareParts.split(',').map(s => s.trim()) : ['Standard Service Filter Kit'],
      vendorWorkshop: maintForm.vendorWorkshop,
      cost: Number(maintForm.cost) || 12000,
      status: 'Completed',
      technicianName: maintForm.technicianName
    };

    const updatedMaint = [newRecord, ...(asset.maintenanceRecords || [])];
    const updated = updateAsset(asset.id, {
      maintenanceRecords: updatedMaint,
      totalMaintenanceCost: (asset.totalMaintenanceCost || 0) + Number(maintForm.cost),
      serviceDueAtHoursOrKm: asset.operatingHoursOrKm + 250 // Reset next service interval
    });
    setAsset(updated.find(a => a.id === asset.id) || null);
    setShowMaintModal(false);
  };

  // Handle Digital Pre-Start Inspection
  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const allPassed = inspectionForm.hydraulicsOk && inspectionForm.brakesOk && 
                      inspectionForm.engineOilOk && inspectionForm.tracksOrTyresOk && 
                      inspectionForm.lightsAndHornOk && inspectionForm.fireExtinguisherOk;

    const newInspection: AssetInspectionRecord = {
      id: `insp-${Date.now()}`,
      date: '17 Nov 2026',
      inspectorName: 'Er. Pravin Gaikwad (Safety Lead)',
      inspectionType: 'Pre-Start Daily Checklist',
      hydraulicsOk: inspectionForm.hydraulicsOk,
      brakesOk: inspectionForm.brakesOk,
      engineOilOk: inspectionForm.engineOilOk,
      tracksOrTyresOk: inspectionForm.tracksOrTyresOk,
      lightsAndHornOk: inspectionForm.lightsAndHornOk,
      fireExtinguisherOk: inspectionForm.fireExtinguisherOk,
      status: allPassed ? 'Passed' : 'Action Required',
      remarks: inspectionForm.remarks
    };

    const updatedInspections = [newInspection, ...(asset.inspections || [])];
    const updated = updateAsset(asset.id, {
      inspections: updatedInspections,
      currentStatus: allPassed ? 'Operational (On Site)' : 'Under Maintenance'
    });
    setAsset(updated.find(a => a.id === asset.id) || null);
    setShowInspectionModal(false);
  };

  const serviceDueDiff = asset.serviceDueAtHoursOrKm - asset.operatingHoursOrKm;

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb */}
      <div className={styles.topNav}>
        <button onClick={() => router.push('/admin/fleet')} className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Fleet & Machinery</span>
        </button>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{asset.name} ({asset.registrationNumber})</span>
      </div>

      {/* Hero Header Dossier Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroImageWrapper}>
            <SafeImage 
              src={asset.image} 
              alt={asset.name} 
              fallbackType="machine" 
              className={styles.heroImage} 
            />
            <span className={`${styles.statusPill} ${asset.currentStatus.includes('Operational') ? styles.pillGreen : styles.pillRed}`}>
              ● {asset.currentStatus}
            </span>
          </div>

          <div className={styles.heroDetails}>
            <div className={styles.heroTitleRow}>
              <h1 className={styles.assetTitle}>{asset.name}</h1>
              <span className={styles.assetCodeBadge}>{asset.code}</span>
              <span className={styles.regBadge}>{asset.registrationNumber}</span>
              <span className={`${styles.ownershipBadge} ${asset.ownershipType.includes('Company') ? styles.badgeOwned : styles.badgeRented}`}>
                {asset.ownershipType}
              </span>
            </div>

            <p className={styles.heroCategoryText}>
              {asset.assetClass} • {asset.category} • Model: {asset.model} ({asset.manufacturingYear})
            </p>

            <div className={styles.heroMetaList}>
              <div className={styles.metaPill}>
                <Building size={13} className={styles.metaIcon} />
                <span>Project Site: <strong>{asset.currentProject}</strong></span>
              </div>
              <div className={styles.metaPill}>
                <UserCheck size={13} className={styles.metaIcon} />
                <span>Pilot: <strong>{asset.assignedOperator}</strong> ({asset.operatorLicence})</span>
              </div>
              <div className={styles.metaPill}>
                <Radio size={13} className={asset.telematicsStatus === 'GPS Connected' ? styles.iconGreen : styles.iconMuted} />
                <span>Telematics: <strong>{asset.telematicsStatus}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operating Gauge Card */}
        <div className={styles.heroRight}>
          <div className={styles.meterHighlightCard}>
            <span className={styles.meterLabel}>Total Operating Meter</span>
            <div className={styles.meterValueRow}>
              <span className={styles.meterNumber}>{asset.operatingHoursOrKm}</span>
              <span className={styles.meterUnit}>{asset.meterUnit}</span>
            </div>
            <div className={serviceDueDiff <= 100 ? styles.serviceAlertText : styles.serviceOkText}>
              <span>Service Trigger: in {serviceDueDiff} {asset.meterUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9 Profile Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsScroller}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Gauge size={15} />
            <span>1. Overview</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <Truck size={15} />
            <span>2. Specifications</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'assignment' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('assignment')}
          >
            <Building size={15} />
            <span>3. Assignment History</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'fuel' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('fuel')}
          >
            <Fuel size={15} />
            <span>4. Fuel History</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'maintenance' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <Wrench size={15} />
            <span>5. Maintenance & Repairs ({asset.maintenanceRecords?.length || 0})</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'inspections' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('inspections')}
          >
            <ShieldCheck size={15} />
            <span>6. Inspections ({asset.inspections?.length || 0})</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={15} />
            <span>7. Documents ({asset.documents?.length || 0})</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'operating' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('operating')}
          >
            <Activity size={15} />
            <span>8. Operating Logs</span>
          </button>

          <button 
            className={`${styles.tabBtn} ${activeTab === 'costs' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('costs')}
          >
            <DollarSign size={15} />
            <span>9. Cost & Financials</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className={styles.tabContentArea}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className={styles.kpiRow4}>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Total Operating Log</span>
                <strong className={styles.statBoxVal}>{asset.operatingHoursOrKm} {asset.meterUnit}</strong>
                <span className={styles.statBoxSub}>Lifetime calibrated meter</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Next Service In</span>
                <strong className={serviceDueDiff <= 100 ? styles.textDanger : styles.textEmerald}>
                  {serviceDueDiff} {asset.meterUnit}
                </strong>
                <span className={styles.statBoxSub}>Scheduled preventive threshold</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Average Fuel Consumption</span>
                <strong className={styles.statBoxVal}>{asset.averageConsumption}</strong>
                <span className={styles.statBoxSub}>Optimal combustion efficiency</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Total Operating Cost</span>
                <strong className={styles.statBoxVal}>₹ {((asset.totalMaintenanceCost || 0) + (asset.totalFuelCost || 0)).toLocaleString()}</strong>
                <span className={styles.statBoxSub}>Fuel + Maintenance to date</span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className={styles.actionBanner}>
              <div className={styles.actionBannerInfo}>
                <ShieldCheck size={20} className={styles.headerIcon} />
                <div>
                  <strong>Digital Pre-Start Daily Inspection & Work Order</strong>
                  <p>Execute mandatory OSHA/EHS checklist before daily shift deployment.</p>
                </div>
              </div>
              <div className={styles.bannerBtnGroup}>
                <button onClick={() => setShowInspectionModal(true)} className={styles.btnPrimary}>
                  <CheckCircle size={15} />
                  <span>Execute Daily Inspection</span>
                </button>
                <button onClick={() => setShowMaintModal(true)} className={styles.btnSecondary}>
                  <Wrench size={15} />
                  <span>Log Service Ticket</span>
                </button>
              </div>
            </div>

            {/* Current Site Assignment Card */}
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <Building size={18} className={styles.headerIcon} />
                  <h3>Active Project Site Deployment</h3>
                </div>
                <span className={styles.badgeActive}>Active Allocation</span>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Assigned Project</span>
                  <strong className={styles.detailValEmphasized}>{asset.currentProject}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Assigned Pilot / Driver</span>
                  <span className={styles.detailVal}>{asset.assignedOperator}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Operator Licence</span>
                  <span className={styles.detailValMonospace}>{asset.operatorLicence}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Telematics IMEI</span>
                  <span className={styles.detailValMonospace}>{asset.telematicsImei}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Truck size={18} className={styles.headerIcon} />
                <h3>Technical Specifications & Mechanical Blueprint</h3>
              </div>
            </div>

            <div className={styles.detailsGrid4}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Manufacturer</span>
                <span className={styles.detailVal}>{asset.manufacturer}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Commercial Model</span>
                <span className={styles.detailVal}>{asset.model}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Manufacturing Year</span>
                <span className={styles.detailVal}>{asset.manufacturingYear}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>RTO Registration Number</span>
                <span className={styles.detailValMonospace}>{asset.registrationNumber}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Chassis / Serial Number</span>
                <span className={styles.detailValMonospace}>{asset.serialNumber}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Engine Number</span>
                <span className={styles.detailValMonospace}>{asset.engineNumber}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fuel Specification</span>
                <span className={styles.detailVal}>{asset.fuelType}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fuel Tank Capacity</span>
                <span className={styles.detailVal}>{asset.fuelTankCapacityLitres} Litres</span>
              </div>

              <div className={styles.detailItemFull}>
                <span className={styles.detailLabel}>Certified Operating Capacity & Load Rating</span>
                <strong className={styles.detailValEmphasized}>{asset.operatingCapacity}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Assignment History */}
        {activeTab === 'assignment' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Building size={18} className={styles.headerIcon} />
                <h3>Project Deployment & Movement History</h3>
              </div>
            </div>

            <div className={styles.timelineList}>
              {(asset.assignmentHistory || []).map((asg, idx) => (
                <div key={idx} className={styles.timelineCard}>
                  <div className={styles.timelineTop}>
                    <div>
                      <h4 className={styles.tlProjectName}>{asg.projectName}</h4>
                      <span className={styles.tlLocation}>{asg.siteLocation}</span>
                    </div>
                    <span className={asg.status === 'Current' ? styles.badgeActive : styles.badgeMuted}>
                      {asg.status}
                    </span>
                  </div>

                  <div className={styles.timelineMeta}>
                    <span>Deployed: {asg.startDate} {asg.endDate ? `to ${asg.endDate}` : '– Ongoing'}</span>
                    <span>Pilot: <strong>{asg.operatorName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Fuel History */}
        {activeTab === 'fuel' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Fuel size={18} className={styles.headerIcon} />
                <h3>Diesel Disbursement Ledger & Fuel Audit</h3>
              </div>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Litres Filled</th>
                    <th>Rate (₹/L)</th>
                    <th>Total Cost</th>
                    <th>Meter Reading</th>
                    <th>Fuel Station Vendor</th>
                    <th>Receipt Number</th>
                  </tr>
                </thead>
                <tbody>
                  {(asset.fuelLogs || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                        No fuel logs recorded yet for this asset.
                      </td>
                    </tr>
                  ) : (
                    asset.fuelLogs.map(log => (
                      <tr key={log.id}>
                        <td><strong>{log.date}</strong></td>
                        <td>{log.litres} L</td>
                        <td>₹ {log.rate}</td>
                        <td><strong>₹ {log.totalCost}</strong></td>
                        <td>{log.meterReading}</td>
                        <td>{log.pumpName}</td>
                        <td><code>{log.receiptNumber}</code></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Maintenance & Repairs */}
        {activeTab === 'maintenance' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Wrench size={18} className={styles.headerIcon} />
                <h3>Work Orders, Breakdowns & Service Overhauls</h3>
              </div>
              <button onClick={() => setShowMaintModal(true)} className={styles.btnPrimarySmall}>
                <Plus size={14} />
                <span>Log Service Overhaul</span>
              </button>
            </div>

            <div className={styles.maintList}>
              {(asset.maintenanceRecords || []).length === 0 ? (
                <div className={styles.emptyBox}>
                  <Wrench size={32} color="#94a3b8" />
                  <p>No maintenance or repair tickets recorded yet.</p>
                </div>
              ) : (
                asset.maintenanceRecords.map(m => (
                  <div key={m.id} className={styles.maintCard}>
                    <div className={styles.maintTop}>
                      <div>
                        <span className={styles.maintTypeTag}>{m.type}</span>
                        <h4 className={styles.maintTitle}>{m.description}</h4>
                      </div>
                      <span className={styles.badgeCompleted}>
                        <CheckCircle2 size={13} />
                        {m.status}
                      </span>
                    </div>

                    <div className={styles.sparePartsRow}>
                      <span className={styles.spareLabel}>Spares Used:</span>
                      <div className={styles.spareTagList}>
                        {m.sparePartsUsed.map((p, i) => (
                          <span key={i} className={styles.spareTag}>{p}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.maintMetaRow}>
                      <span>Date: {m.date} (at {m.meterReadingHoursOrKm} {asset.meterUnit})</span>
                      <span>Vendor: <strong>{m.vendorWorkshop}</strong></span>
                      <span>Tech: {m.technicianName}</span>
                      <strong className={styles.maintCost}>₹ {m.cost.toLocaleString()}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Inspections */}
        {activeTab === 'inspections' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <ShieldCheck size={18} className={styles.headerIcon} />
                <h3>Pre-Start Daily Safety Walkarounds</h3>
              </div>
              <button onClick={() => setShowInspectionModal(true)} className={styles.btnPrimarySmall}>
                <Plus size={14} />
                <span>Record Daily Inspection</span>
              </button>
            </div>

            <div className={styles.inspectionList}>
              {(asset.inspections || []).length === 0 ? (
                <div className={styles.emptyBox}>
                  <ShieldCheck size={32} color="#94a3b8" />
                  <p>No daily safety inspections recorded yet.</p>
                </div>
              ) : (
                asset.inspections.map(insp => (
                  <div key={insp.id} className={styles.inspCard}>
                    <div className={styles.inspTop}>
                      <div>
                        <span className={styles.inspType}>{insp.inspectionType}</span>
                        <strong className={styles.inspDate}>{insp.date} • Checked by {insp.inspectorName}</strong>
                      </div>
                      <span className={insp.status === 'Passed' ? styles.badgePassed : styles.badgeFailed}>
                        {insp.status === 'Passed' ? '✓ Passed Safety Check' : '⚠️ Action Required'}
                      </span>
                    </div>

                    <div className={styles.checkPillGrid}>
                      <span className={insp.hydraulicsOk ? styles.checkOk : styles.checkBad}>
                        {insp.hydraulicsOk ? '✓ Hydraulics & Cylinders' : '✗ Hydraulics Leaking'}
                      </span>
                      <span className={insp.brakesOk ? styles.checkOk : styles.checkBad}>
                        {insp.brakesOk ? '✓ Brakes & Retarders' : '✗ Brakes Spongy'}
                      </span>
                      <span className={insp.engineOilOk ? styles.checkOk : styles.checkBad}>
                        {insp.engineOilOk ? '✓ Engine Oil Level' : '✗ Low Oil'}
                      </span>
                      <span className={insp.tracksOrTyresOk ? styles.checkOk : styles.checkBad}>
                        {insp.tracksOrTyresOk ? '✓ Tracks / Tyres & Pressure' : '✗ Track Sag / Tyre Wear'}
                      </span>
                      <span className={insp.lightsAndHornOk ? styles.checkOk : styles.checkBad}>
                        {insp.lightsAndHornOk ? '✓ Work Lights & Reverse Horn' : '✗ Horn Inoperative'}
                      </span>
                      <span className={insp.fireExtinguisherOk ? styles.checkOk : styles.checkBad}>
                        {insp.fireExtinguisherOk ? '✓ Fire Extinguisher Charged' : '✗ Extinguisher Missing'}
                      </span>
                    </div>

                    <p className={styles.inspRemarks}>"{insp.remarks}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Documents */}
        {activeTab === 'documents' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <FileText size={18} className={styles.headerIcon} />
                <h3>Statutory Compliance Certificates & RC Vault</h3>
              </div>
            </div>

            <div className={styles.docsList}>
              {(asset.documents || []).length === 0 ? (
                <div className={styles.emptyBox}>
                  <FileText size={32} color="#94a3b8" />
                  <p>No statutory documents uploaded yet for this asset.</p>
                </div>
              ) : (
                asset.documents.map(doc => (
                  <div key={doc.id} className={styles.docRow}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconBox}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className={styles.docName}>{doc.name}</h4>
                        <div className={styles.docMeta}>
                          <span>Category: <strong>{doc.category}</strong></span>
                          <span>•</span>
                          <span>Uploaded: {doc.uploadedAt}</span>
                          {doc.expiryDate && <span>• Expires: {doc.expiryDate}</span>}
                        </div>
                      </div>
                    </div>

                    <div className={styles.docRight}>
                      <span className={`${styles.docStatusBadge} ${doc.status === 'Valid' ? styles.statusValid : styles.statusAlert}`}>
                        {doc.status}
                      </span>
                      <button className={styles.docBtn} title="View Certificate">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Operating Logs */}
        {activeTab === 'operating' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Activity size={18} className={styles.headerIcon} />
                <h3>Daily Machine Telematics & Shift Utilization Log</h3>
              </div>
            </div>

            <div className={styles.operatingGrid}>
              <div className={styles.opBox}>
                <span>Current Calibrated Reading</span>
                <strong>{asset.operatingHoursOrKm} {asset.meterUnit}</strong>
              </div>
              <div className={styles.opBox}>
                <span>Average Daily Shift Duration</span>
                <strong>7.5 Hours / Shift</strong>
              </div>
              <div className={styles.opBox}>
                <span>Idle vs Productive Ratio</span>
                <strong className={styles.textEmerald}>88% Productive</strong>
              </div>
              <div className={styles.opBox}>
                <span>Telematics Sync</span>
                <strong>Live IMEI Connected</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Cost & Financials */}
        {activeTab === 'costs' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <DollarSign size={18} className={styles.headerIcon} />
                <h3>Asset TCO (Total Cost of Ownership) & Financial Ledger</h3>
              </div>
            </div>

            <div className={styles.costGrid}>
              {asset.purchaseCost && (
                <div className={styles.costBox}>
                  <span>Capital Acquisition Cost</span>
                  <strong>₹ {asset.purchaseCost.toLocaleString()}</strong>
                  <span className={styles.subText}>Initial purchase valuation</span>
                </div>
              )}
              {asset.rentalRatePerDay && (
                <div className={styles.costBox}>
                  <span>Hired Daily Rate</span>
                  <strong className={styles.textDanger}>₹ {asset.rentalRatePerDay.toLocaleString()} / Day</strong>
                  <span className={styles.subText}>Vendor: {asset.rentalVendor}</span>
                </div>
              )}
              <div className={styles.costBox}>
                <span>Cumulative Fuel Expense</span>
                <strong>₹ {(asset.totalFuelCost || 0).toLocaleString()}</strong>
                <span className={styles.subText}>Recorded fuel entries</span>
              </div>
              <div className={styles.costBox}>
                <span>Cumulative Maintenance Expense</span>
                <strong>₹ {(asset.totalMaintenanceCost || 0).toLocaleString()}</strong>
                <span className={styles.subText}>Work orders and overhauls</span>
              </div>
              <div className={styles.costBox}>
                <span>Total Recorded Operating Cost</span>
                <strong className={styles.textEmeraldBig}>
                  ₹ {((asset.totalFuelCost || 0) + (asset.totalMaintenanceCost || 0)).toLocaleString()}
                </strong>
                <span className={styles.subText}>Lifetime direct field cost</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service / Maintenance Modal */}
      {showMaintModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowMaintModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Log Equipment Service / Overhaul Work Order</h3>
              <button onClick={() => setShowMaintModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Service Category *</label>
                <select 
                  value={maintForm.type}
                  onChange={e => setMaintForm({ ...maintForm, type: e.target.value as any })}
                >
                  <option value="Preventive Service">Preventive Scheduled Service (Oil/Filters)</option>
                  <option value="Breakdown Repair">Emergency Breakdown Repair</option>
                  <option value="Hydraulic Oil Change">Hydraulic Oil & Pressure Calibration</option>
                </select>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Current Meter Reading ({asset.meterUnit}) *</label>
                  <input 
                    type="number" 
                    value={maintForm.meterReading}
                    onChange={e => setMaintForm({ ...maintForm, meterReading: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Service Invoice Cost (₹) *</label>
                  <input 
                    type="number" 
                    value={maintForm.cost}
                    onChange={e => setMaintForm({ ...maintForm, cost: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Work Performed & Diagnostic Details *</label>
                <textarea 
                  rows={3} 
                  required
                  value={maintForm.description}
                  onChange={e => setMaintForm({ ...maintForm, description: e.target.value })}
                  placeholder="e.g. 250-hour routine filter change, valve lash check, boom greasing..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Spare Parts Consumed (comma separated)</label>
                <input 
                  type="text" 
                  value={maintForm.spareParts}
                  onChange={e => setMaintForm({ ...maintForm, spareParts: e.target.value })}
                  placeholder="15W40 Engine Oil, Diesel Filter Element, O-Ring Seal..."
                />
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Service Vendor / Workshop</label>
                  <input 
                    type="text" 
                    value={maintForm.vendorWorkshop}
                    onChange={e => setMaintForm({ ...maintForm, vendorWorkshop: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Supervising Technician</label>
                  <input 
                    type="text" 
                    value={maintForm.technicianName}
                    onChange={e => setMaintForm({ ...maintForm, technicianName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" onClick={() => setShowMaintModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Maintenance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Pre-Start Digital Inspection Modal */}
      {showInspectionModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowInspectionModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Execute Daily Pre-Start Safety Checklist</h3>
              <button onClick={() => setShowInspectionModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInspection} className={styles.modalForm}>
              <div className={styles.checklistGrid}>
                <label className={styles.checkItem}>
                  <input 
                    type="checkbox" 
                    checked={inspectionForm.hydraulicsOk}
                    onChange={e => setInspectionForm({ ...inspectionForm, hydraulicsOk: e.target.checked })}
                  />
                  <span>Hydraulic Rams, Hoses & Cylinders (Zero Leakage)</span>
                </label>

                <label className={styles.checkItem}>
                  <input 
                    type="checkbox" 
                    checked={inspectionForm.brakesOk}
                    onChange={e => setInspectionForm({ ...inspectionForm, brakesOk: e.target.checked })}
                  />
                  <span>Braking System & Parking Brake Lock</span>
                </label>

                <label className={styles.checkItem}>
                  <input 
                    type="checkbox" 
                    checked={inspectionForm.engineOilOk}
                    onChange={e => setInspectionForm({ ...inspectionForm, engineOilOk: e.target.checked })}
                  />
                  <span>Engine Oil & Coolant Dipstick Level Normal</span>
                </label>

                <label className={styles.checkItem}>
                  <input 
                    type="checkbox" 
                    checked={inspectionForm.tracksOrTyresOk}
                    onChange={e => setInspectionForm({ ...inspectionForm, tracksOrTyresOk: e.target.checked })}
                  />
                  <span>Track Tension / Wheel Tyres & Lug Nuts Tight</span>
                </label>

                <label className={styles.checkItem}>
                  <input 
                    type="checkbox" 
                    checked={inspectionForm.lightsAndHornOk}
                    onChange={e => setInspectionForm({ ...inspectionForm, lightsAndHornOk: e.target.checked })}
                  />
                  <span>Operating Work Lights, Beacon & Reverse Horn</span>
                </label>

                <label className={styles.checkItem}>
                  <input 
                    type="checkbox" 
                    checked={inspectionForm.fireExtinguisherOk}
                    onChange={e => setInspectionForm({ ...inspectionForm, fireExtinguisherOk: e.target.checked })}
                  />
                  <span>Cabin Fire Extinguisher Charged & In-Date</span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label>Inspector Remarks & Signoff</label>
                <textarea 
                  rows={2} 
                  value={inspectionForm.remarks}
                  onChange={e => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" onClick={() => setShowInspectionModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Submit & Authorize Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
