import React from 'react';
import AdminIssuesManagement from '@/components/admin/issues/AdminIssuesManagement';

export const metadata = {
  title: 'Issues & Maintenance Control | Admin Panel | STRUCTIVA Enterprise OS',
  description: 'Monitor site safety hazards, equipment breakdowns, assign technicians, and approve resolutions.'
};

export default function AdminIssuesPage() {
  return <AdminIssuesManagement />;
}
