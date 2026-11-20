'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './Corrections.module.css';
import { 
  UserCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  X, 
  Camera, 
  ShieldCheck, 
  RotateCcw,
  AlertTriangle,
  Building,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { 
  WorkerProfileCorrectionRecord, 
  fetchCorrectionsFromBackend, 
  reviewWorkerProfileCorrection,
  getStoredCorrections
} from '@/services/profileCorrectionStorage';

export default function ProfileCorrectionRequestsView() {
  const [corrections, setCorrections] = useState<WorkerProfileCorrectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Worker' | 'Supervisor'>('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<WorkerProfileCorrectionRecord | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCorrectionsFromBackend();
      setCorrections(data || []);
    } catch {
      setCorrections(getStoredCorrections());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setCorrections(getStoredCorrections());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('correctionsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('correctionsUpdated', handleUpdate);
    };
  }, []);

  // Compute Projects List for filtering
  const projectOptions = useMemo(() => {
    const set = new Set<string>();
    corrections.forEach(c => {
      if (c.project) set.add(c.project);
    });
    return Array.from(set);
  }, [corrections]);

  // Statistics
  const stats = useMemo(() => {
    const total = corrections.length;
    const pending = corrections.filter(c => c.status === 'Pending').length;
    const approved = corrections.filter(c => c.status === 'Approved').length;
    const rejected = corrections.filter(c => c.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [corrections]);

  // Filtered List
  const filteredCorrections = useMemo(() => {
    return corrections.filter(c => {
      const matchSearch = 
        c.workerName.toLowerCase().includes(search.toLowerCase()) ||
        c.workerCode.toLowerCase().includes(search.toLowerCase()) ||
        c.fieldLabel.toLowerCase().includes(search.toLowerCase()) ||
        c.reason.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === 'All' || c.userRole === roleFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchProj = projectFilter === 'All' || c.project === projectFilter;

      return matchSearch && matchRole && matchStatus && matchProj;
    });
  }, [corrections, search, roleFilter, statusFilter, projectFilter]);

  const handleOpenReview = (item: WorkerProfileCorrectionRecord) => {
    setSelectedRequest(item);
    setAdminRemarks(item.adminRemarks || '');
    setActionSuccessMessage(null);
  };

  const handleDecision = async (decision: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;
    if (decision === 'Rejected' && !adminRemarks.trim()) {
      alert('Please provide Admin rejection remarks explaining the reason.');
      return;
    }

    setReviewing(true);
    const success = await reviewWorkerProfileCorrection(
      selectedRequest.id,
      decision,
      adminRemarks,
      'Executive HR Admin'
    );

    setReviewing(false);
    if (success) {
      setActionSuccessMessage(`Request successfully ${decision}!`);
      await loadData();
      setTimeout(() => {
        setActionSuccessMessage(null);
        setSelectedRequest(null);
      }, 1200);
    } else {
      alert('Unable to update request or request was already reviewed.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1>Worker Profile Correction Requests</h1>
          <p>
            Verify, approve or reject tradesperson identity changes, contact details, and profile photo updates.
          </p>
        </div>
        {stats.pending > 0 && (
          <div className={styles.counterBadge}>
            {stats.pending} Requests Pending Review
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Requests</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #D97706' }}>
          <span className={styles.statLabel} style={{ color: '#D97706' }}>Pending Approval</span>
          <span className={styles.statValue} style={{ color: '#D97706' }}>{stats.pending}</span>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #059669' }}>
          <span className={styles.statLabel} style={{ color: '#059669' }}>Approved</span>
          <span className={styles.statValue} style={{ color: '#059669' }}>{stats.approved}</span>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #DC2626' }}>
          <span className={styles.statLabel} style={{ color: '#DC2626' }}>Rejected</span>
          <span className={styles.statValue} style={{ color: '#DC2626' }}>{stats.rejected}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={15} color="#6B7280" />
          <input 
            type="text" 
            placeholder="Search by name, ID, field, role or reason..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value as any)}
            className={styles.selectInput}
            style={{ fontWeight: 600, color: '#167C72' }}
          >
            <option value="All">All Roles (Workers & Supervisors)</option>
            <option value="Worker">Workers Only</option>
            <option value="Supervisor">Supervisors Only</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select 
            value={projectFilter} 
            onChange={e => setProjectFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="All">All Projects</option>
            {projectOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {(search || roleFilter !== 'All' || statusFilter !== 'All' || projectFilter !== 'All') && (
            <button 
              onClick={() => { setSearch(''); setRoleFilter('All'); setStatusFilter('All'); setProjectFilter('All'); }}
              className={styles.btnSecondary}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Applicant / Role</th>
                <th>Project & Site</th>
                <th>Requested Field</th>
                <th>Type</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    Loading correction requests...
                  </td>
                </tr>
              ) : filteredCorrections.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No correction requests found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCorrections.map(item => {
                  const badgeClass = 
                    item.status === 'Approved' ? styles.badgeApproved :
                    item.status === 'Rejected' ? styles.badgeRejected :
                    styles.badgePending;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong>{item.workerName}</strong>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '0.15rem 0.4rem', 
                            borderRadius: '4px', 
                            fontWeight: 700,
                            background: item.userRole === 'Supervisor' ? '#FEF3C7' : '#E0F2FE',
                            color: item.userRole === 'Supervisor' ? '#92400E' : '#0369A1'
                          }}>
                            {item.userRole || 'Worker'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          ID: {item.workerCode}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.project}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          Site: {item.site || 'Main Core'} &middot; Sup: {item.supervisorName || 'Er. Pravin Gaikwad'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#167C72' }}>
                          {item.fieldLabel || item.fieldName}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Reason: {item.reason}
                        </div>
                      </td>
                      <td>
                        {item.isPhotoChange ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#0369A1', fontWeight: 600, fontSize: '0.75rem' }}>
                            <Camera size={13} /> Photo Change
                          </span>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>
                            Data Correction
                          </span>
                        )}
                      </td>
                      <td>{item.submittedDate}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleOpenReview(item)}
                          className={styles.btnAction}
                        >
                          <Eye size={13} /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details & Review Modal */}
      {selectedRequest && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#172B32' }}>
                  Review Profile Correction Request
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Worker: {selectedRequest.workerName} ({selectedRequest.workerCode}) &middot; Submitted: {selectedRequest.submittedDate}
                </span>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {actionSuccessMessage ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#059669' }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4>{actionSuccessMessage}</h4>
                </div>
              ) : (
                <>
                  {/* Photo Comparison if Photo change */}
                  {selectedRequest.isPhotoChange ? (
                    <div className={styles.photoComparison}>
                      <div className={styles.photoFrame}>
                        <span className={styles.diffLabel}>Current Official Photo</span>
                        <img 
                          src={selectedRequest.oldPhotoUrl || '/images/default_avatar.png'} 
                          alt="Current Photo"
                          className={styles.photoImg}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>On Record</span>
                      </div>
                      <div className={styles.photoFrame} style={{ borderColor: '#167C72' }}>
                        <span className={styles.diffLabel} style={{ color: '#167C72' }}>Proposed New Photo</span>
                        <img 
                          src={selectedRequest.newPhotoUrl || '/images/default_avatar.png'} 
                          alt="Proposed Photo"
                          className={styles.photoImg}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#167C72', fontWeight: 600 }}>Awaiting Approval</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.diffContainer}>
                      <div className={styles.diffBox}>
                        <span className={styles.diffLabel}>Current Value on Record</span>
                        <div className={styles.diffValue}>{selectedRequest.oldValue || '—'}</div>
                      </div>
                      <div className={styles.diffBox}>
                        <span className={styles.diffLabel} style={{ color: '#167C72' }}>Proposed Corrected Value</span>
                        <div className={styles.diffValue} style={{ color: '#167C72' }}>{selectedRequest.newValue}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>Worker Justification / Reason:</div>
                    <div style={{ color: '#475569' }}>{selectedRequest.reason}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Admin Remarks & Decision Note
                    </label>
                    <textarea 
                      rows={2}
                      placeholder={selectedRequest.status === 'Pending' ? 'Enter verification notes or rejection reasons...' : 'No further notes.'}
                      value={adminRemarks}
                      onChange={e => setAdminRemarks(e.target.value)}
                      disabled={selectedRequest.status !== 'Pending'}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem' }}
                    />
                  </div>

                  {selectedRequest.status !== 'Pending' && (
                    <div style={{ padding: '0.75rem', background: selectedRequest.status === 'Approved' ? '#ECFDF5' : '#FEF2F2', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <strong>Decision:</strong> {selectedRequest.status} by {selectedRequest.reviewedBy || 'Admin'} on {selectedRequest.reviewedDate || 'N/A'}.
                    </div>
                  )}
                </>
              )}
            </div>

            {!actionSuccessMessage && (
              <div className={styles.modalFooter}>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className={styles.btnSecondary}
                >
                  Close
                </button>
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => handleDecision('Rejected')}
                      disabled={reviewing}
                      className={styles.btnReject}
                    >
                      <XCircle size={14} /> Reject Request
                    </button>
                    <button 
                      onClick={() => handleDecision('Approved')}
                      disabled={reviewing}
                      className={styles.btnApprove}
                    >
                      <CheckCircle2 size={14} /> Approve & Update Profile
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
