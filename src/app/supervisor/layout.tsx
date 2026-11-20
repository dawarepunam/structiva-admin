'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SupervisorLayoutWrapper from '@/components/supervisor/layout/SupervisorLayout';
import SupervisorEnterpriseManagement from '@/components/supervisor/SupervisorEnterpriseManagement';

export default function SupervisorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/supervisor/login';

  // For public login page, render standalone without authenticated Supervisor shell, sidebar, or enterprise profile state
  if (isLoginPage) {
    return <main>{children}</main>;
  }

  // For all protected supervisor portal routes, render authenticated enterprise layout and sidebar
  return (
    <SupervisorEnterpriseManagement>
      <SupervisorLayoutWrapper>{children}</SupervisorLayoutWrapper>
    </SupervisorEnterpriseManagement>
  );
}
