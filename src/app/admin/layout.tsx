import AdminLayout from '@/components/admin/layout/AdminLayout';
import AdminEnterpriseManagement from '@/components/admin/AdminEnterpriseManagement';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminEnterpriseManagement>
      <AdminLayout>{children}</AdminLayout>
    </AdminEnterpriseManagement>
  );
}
