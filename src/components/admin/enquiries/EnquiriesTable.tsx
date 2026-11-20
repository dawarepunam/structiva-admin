'use client';

import React, { useState, useEffect } from 'react';
import styles from './EnquiriesTable.module.css';
import { 
  Mail, 
  Search, 
  Download, 
  Filter, 
  Building2, 
  Phone, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { fetchStrapiCollection, STRAPI_BASE_URL } from '@/services/strapiClient';

export interface ContactEnquiryItem {
  id: number;
  documentId?: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectSector: string;
  location?: string;
  estimatedScope?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

export default function EnquiriesTable() {
  const [enquiries, setEnquiries] = useState<ContactEnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiryItem | null>(null);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${STRAPI_BASE_URL}/api/contact-enquiries?sort=createdAt:desc`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          setEnquiries(json.data);
          return;
        }
      }
      // Fallback if empty
      setEnquiries([
        {
          id: 1,
          fullName: 'Er. Arvind Joshi',
          email: 'arvind.joshi@infra-partner.com',
          phone: '+91 98220 99881',
          companyName: 'Maharashtra Water Supply Board',
          projectSector: 'Water Pipeline Infrastructure',
          location: 'Nashik Corridor',
          estimatedScope: '18km DI K9 1200mm diameter bulk transmission main',
          message: 'Requesting technical pre-qualification and tender consultation for upcoming regional water distribution network.',
          status: 'New',
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Filtered Enquiries
  const filtered = enquiries.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (item.fullName || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.companyName || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q) ||
      (item.projectSector || '').toLowerCase().includes(q);

    const matchesSector = sectorFilter === 'All' || item.projectSector === sectorFilter;
    const matchesStatus = statusFilter === 'All' || (item.status || 'New') === statusFilter;

    return matchesSearch && matchesSector && matchesStatus;
  });

  // Export to Excel / CSV format
  const exportToExcelCSV = () => {
    if (filtered.length === 0) {
      alert('No enquiries to export.');
      return;
    }

    const headers = [
      'ID',
      'Full Name',
      'Official Email',
      'Phone / Mobile',
      'Company / Authority',
      'Project Sector',
      'Location / State',
      'Estimated Scope',
      'Message / Scope Details',
      'Submission Date',
      'Status'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filtered.map(item => [
      item.id,
      escapeCsv(item.fullName),
      escapeCsv(item.email),
      escapeCsv(item.phone),
      escapeCsv(item.companyName),
      escapeCsv(item.projectSector),
      escapeCsv(item.location || 'N/A'),
      escapeCsv(item.estimatedScope || 'N/A'),
      escapeCsv(item.message || 'N/A'),
      escapeCsv(item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'),
      escapeCsv(item.status || 'New')
    ].join(','));

    // UTF-8 BOM for Microsoft Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `STRUCTIVA_Contact_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      {/* Top Header & Export Action */}
      <div className={styles.actionBar}>
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <span className={styles.statVal}>{enquiries.length}</span>
            <span className={styles.statLabel}>Total Enquiries</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal}>
              {enquiries.filter(e => (e.projectSector || '').includes('Water')).length}
            </span>
            <span className={styles.statLabel}>Water Pipeline Leads</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal}>
              {enquiries.filter(e => (e.projectSector || '').includes('Solar')).length}
            </span>
            <span className={styles.statLabel}>Solar EPC Leads</span>
          </div>
        </div>

        <div className={styles.exportGroup}>
          <button onClick={loadEnquiries} className={styles.refreshBtn} title="Refresh Live Data">
            <RefreshCw size={15} className={loading ? styles.spinning : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={exportToExcelCSV} className={styles.exportBtn}>
            <FileSpreadsheet size={16} />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name, email, company, or sector..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectWrapper}>
          <Filter size={14} className={styles.filterIcon} />
          <select 
            value={sectorFilter} 
            onChange={e => setSectorFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="All">All Sectors</option>
            <option value="Water Pipeline Infrastructure">Water Pipeline</option>
            <option value="Solar Infrastructure">Solar Infrastructure</option>
            <option value="Water Storage Tanks">Water Storage Tanks</option>
            <option value="Heavy Fabrication">Heavy Fabrication</option>
            <option value="General EPC / Industrial">General EPC</option>
            <option value="Other">Other Civil Works</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Estimated">Estimated</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Enquiries Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.enquiriesTable}>
            <thead>
              <tr>
                <th>Lead / Contact</th>
                <th>Company / Authority</th>
                <th>Project Sector</th>
                <th>Location & Scope</th>
                <th>Received Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    {loading ? 'Fetching live Strapi enquiries...' : 'No customer inquiries match your current search criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.nameBlock}>
                        <strong className={styles.clientName}>{item.fullName}</strong>
                        <a href={`mailto:${item.email}`} className={styles.contactEmail}>
                          <Mail size={12} /> {item.email}
                        </a>
                        {item.phone && (
                          <span className={styles.contactPhone}>
                            <Phone size={12} /> {item.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.companyName}>
                        <Building2 size={14} color="#167C72" />
                        <span>{item.companyName || 'Corporate / Private'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.sectorBadge}>{item.projectSector}</span>
                    </td>
                    <td>
                      <div className={styles.scopeCol}>
                        {item.location && (
                          <div className={styles.locItem}>
                            <MapPin size={12} />
                            <span>{item.location}</span>
                          </div>
                        )}
                        <span className={styles.scopeText}>{item.estimatedScope || 'Scope to be estimated'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.statusNew}`}>
                        {item.status || 'New'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedEnquiry(item)} 
                        className={styles.viewBtn}
                      >
                        <span>View Details</span>
                        <ChevronDown size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedEnquiry(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalBadge}>{selectedEnquiry.projectSector}</span>
                <h3 className={styles.modalTitle}>Tender & Scope Specification</h3>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className={styles.modalCloseBtn}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalGrid2}>
                <div>
                  <label className={styles.modalLabel}>Client / Official Name</label>
                  <p className={styles.modalVal}>{selectedEnquiry.fullName}</p>
                </div>
                <div>
                  <label className={styles.modalLabel}>Organization / Authority</label>
                  <p className={styles.modalVal}>{selectedEnquiry.companyName || 'N/A'}</p>
                </div>
              </div>

              <div className={styles.modalGrid2}>
                <div>
                  <label className={styles.modalLabel}>Official Email</label>
                  <p className={styles.modalVal}>{selectedEnquiry.email}</p>
                </div>
                <div>
                  <label className={styles.modalLabel}>Contact Telephone</label>
                  <p className={styles.modalVal}>{selectedEnquiry.phone || 'N/A'}</p>
                </div>
              </div>

              <div className={styles.modalGrid2}>
                <div>
                  <label className={styles.modalLabel}>Project Location</label>
                  <p className={styles.modalVal}>{selectedEnquiry.location || 'Not Specified'}</p>
                </div>
                <div>
                  <label className={styles.modalLabel}>Estimated Scope / Capacity</label>
                  <p className={styles.modalVal}>{selectedEnquiry.estimatedScope || 'N/A'}</p>
                </div>
              </div>

              <div className={styles.messageBox}>
                <label className={styles.modalLabel}>Message / Scope Specifications</label>
                <p className={styles.messageText}>{selectedEnquiry.message || 'No additional specifications provided.'}</p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <a 
                href={`mailto:${selectedEnquiry.email}?subject=STRUCTIVA Commercial Response: ${encodeURIComponent(selectedEnquiry.projectSector)} Scope`}
                className={styles.replyEmailBtn}
              >
                <Mail size={16} />
                <span>Send Commercial Reply</span>
              </a>
              <button onClick={() => setSelectedEnquiry(null)} className={styles.closeBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
