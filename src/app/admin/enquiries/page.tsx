import React from 'react';
import EnquiriesTable from '@/components/admin/enquiries/EnquiriesTable';
import styles from '../page.module.css';

export const metadata = {
  title: 'Customer Inquiries & Tender Leads | STRUCTIVA Admin',
  description: 'Manage commercial inquiries, sector bids, estimating leads, and export to Excel.'
};

export default function AdminEnquiriesPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Commercial Inquiries & Tender Leads</h1>
          <p className={styles.pageSubtitle}>
            Real-time inquiries received from the corporate website contact desk, technical scopes, and Excel spreadsheet export.
          </p>
        </div>
      </div>
      <EnquiriesTable />
    </div>
  );
}
