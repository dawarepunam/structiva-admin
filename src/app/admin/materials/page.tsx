import React from 'react';
import AdminMaterialManagement from '@/components/admin/materials/AdminMaterialManagement';

export const metadata = {
  title: 'Material Management & Procurement | Admin Panel | STRUCTIVA Enterprise OS',
  description: 'Manage material requisitions, purchase orders, vendor logistics, and goods receipt verification.'
};

export default function AdminMaterialPage() {
  return <AdminMaterialManagement />;
}
