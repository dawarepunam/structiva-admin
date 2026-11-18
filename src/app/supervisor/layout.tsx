import React from 'react';
import SupervisorLayoutWrapper from '@/components/supervisor/layout/SupervisorLayout';

export const metadata = {
  title: 'Supervisor Portal | STRUCTIVA Enterprise OS',
  description: 'Chief Field Supervisor Command and Site Operations Center',
};

export default function SupervisorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupervisorLayoutWrapper>{children}</SupervisorLayoutWrapper>;
}
