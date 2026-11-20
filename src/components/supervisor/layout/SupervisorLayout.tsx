'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Layout.module.css';
import { useSupervisorEnterprise } from '../SupervisorEnterpriseManagement';
import {
  LayoutDashboard,
  FolderGit2,
  Building,
  Users,
  ClockCheck,
  CheckSquare,
  FileText,
  Truck,
  Fuel,
  ReceiptText,
  PackageOpen,
  AlertOctagon,
  Inbox,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  HardHat
} from 'lucide-react';

interface SupervisorLayoutProps {
  children: React.ReactNode;
}

export default function SupervisorLayoutWrapper({ children }: SupervisorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { supervisorProfile } = useSupervisorEnterprise();
  
  // Guard against unauthenticated access to protected supervisor routes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // State for Mobile Drawer and Desktop Fullscreen (Sidebar Collapse)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('structiva_supervisor_session');
      const token = localStorage.getItem('structiva_strapi_jwt');

      if (!session || !token) {
        setIsAuthenticated(false);
        const encodedReturn = encodeURIComponent(pathname);
        router.replace(`/supervisor/login?returnUrl=${encodedReturn}`);
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [pathname, router]);

  // Exact sidebar navigation items
  const navItems = [
    { label: 'Dashboard', href: '/supervisor/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', href: '/supervisor/projects', icon: FolderGit2 },
    { label: 'My Sites', href: '/supervisor/sites', icon: Building },
    { label: 'Workforce', href: '/supervisor/workforce', icon: Users },
    { label: 'Attendance', href: '/supervisor/attendance', icon: ClockCheck },
    { label: 'Activities & Tasks', href: '/supervisor/activities', icon: CheckSquare },
    { label: 'Daily Progress Reports', href: '/supervisor/dpr', icon: FileText },
    { label: 'Machinery & Vehicles', href: '/supervisor/machinery', icon: Truck },
    { label: 'Fuel Management', href: '/supervisor/fuel', icon: Fuel },
    { label: 'Site Expenses', href: '/supervisor/expenses', icon: ReceiptText },
    { label: 'Material Requests', href: '/supervisor/material-requests', icon: PackageOpen },
    { label: 'Issues & Maintenance', href: '/supervisor/issues', icon: AlertOctagon },
    { label: 'Approvals & Requests', href: '/supervisor/requests', icon: Inbox },
    { label: 'Notifications', href: '/supervisor/notifications', icon: Bell },
    { label: 'My Profile', href: '/supervisor/profile', icon: UserCircle },
    { label: 'Settings', href: '/supervisor/settings', icon: Settings }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out from the Supervisor Portal?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('structiva_supervisor_session');
        localStorage.removeItem('structiva_strapi_jwt');
      }
      router.replace('/supervisor/login');
    }
  };

  // Toggle sidebar collapse / fullscreen mode
  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Get initials for profile badge
  const initials = supervisorProfile?.name
    ? supervisorProfile.name
        .split(' ')
        .map(n => n[0])
        .filter((_, i, arr) => i === 0 || i === arr.length - 1)
        .join('')
        .toUpperCase()
    : 'SP';

  const currentNav = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  const pageTitle = currentNav ? currentNav.label : 'Supervisor Portal';

  // If unauthenticated or checking auth status, render minimal loading spinner
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F2EC' }}>
        <div style={{ textAlign: 'center', color: '#172B32' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #167C72', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Verifying Supervisor Security Clearance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.supervisorContainer}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        ${styles.sidebar} 
        ${mobileMenuOpen ? styles.sidebarOpen : ''} 
        ${sidebarCollapsed ? styles.sidebarCollapsed : ''}
      `}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>S</div>
            <div>
              <div className={styles.brandTitle}>STRUCTIVA</div>
              <span className={styles.brandBadge}>Supervisor</span>
            </div>
          </div>
          <button 
            className={styles.menuToggle} 
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: mobileMenuOpen ? 'block' : 'none', color: '#FFF' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navSection}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/supervisor/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`
        ${styles.mainWrapper} 
        ${sidebarCollapsed ? styles.mainWrapperFull : ''}
      `}>
        {/* FROZEN & PERMANENTLY FIXED TOP HEADER */}
        <header className={`${styles.topNav} ${sidebarCollapsed ? styles.topNavFull : ''}`}>
          <div className={styles.navLeft}>
            {/* 3-Dot / Panel Toggle Button */}
            <button 
              className={styles.menuToggle} 
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Open Sidebar" : "Hide Sidebar (Full Screen)"}
              aria-label="Toggle Sidebar"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.navRight}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} />
              <span>Strapi Node Active</span>
            </div>

            <Link href="/supervisor/profile" className={styles.supervisorBadge}>
              <div className={styles.avatar}>{initials}</div>
              <div>
                <span className={styles.supervisorName}>{supervisorProfile.name}</span>
                <span className={styles.supervisorRole}>{supervisorProfile.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className={styles.pageBody}>
          {children}
        </main>

        {/* ENTERPRISE STRUCTIVA FOOTER */}
        <footer className={styles.supervisorFooter}>
          <div className={styles.footerLeft}>
            <HardHat size={16} color="#167C72" />
            <span>&copy; {new Date().getFullYear()} STRUCTIVA ENTERPRISE OS &bull; Field Operations & Telemetry</span>
          </div>
          <div className={styles.footerRight}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#167C72" /> Encrypted Field Node
            </span>
            <Link href="/supervisor/settings" className={styles.footerLink}>System Status</Link>
            <Link href="/supervisor/profile" className={styles.footerLink}>Help & Audit</Link>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Tab Navigation for iOS & Android Phones */}
      <nav className={styles.bottomTabBar}>
        <Link 
          href="/supervisor/dashboard" 
          className={`${styles.bottomTabItem} ${pathname === '/supervisor/dashboard' ? styles.bottomTabActive : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </Link>
        <Link 
          href="/supervisor/attendance" 
          className={`${styles.bottomTabItem} ${pathname.startsWith('/supervisor/attendance') ? styles.bottomTabActive : ''}`}
        >
          <ClockCheck size={20} />
          <span>Muster</span>
        </Link>
        <Link 
          href="/supervisor/dpr" 
          className={`${styles.bottomTabItem} ${pathname.startsWith('/supervisor/dpr') ? styles.bottomTabActive : ''}`}
        >
          <FileText size={20} />
          <span>DPR</span>
        </Link>
        <Link 
          href="/supervisor/fuel" 
          className={`${styles.bottomTabItem} ${pathname.startsWith('/supervisor/fuel') ? styles.bottomTabActive : ''}`}
        >
          <Fuel size={20} />
          <span>Fuel</span>
        </Link>
        <Link 
          href="/supervisor/requests" 
          className={`${styles.bottomTabItem} ${pathname.startsWith('/supervisor/requests') ? styles.bottomTabActive : ''}`}
        >
          <Inbox size={20} />
          <span>Requests</span>
        </Link>
      </nav>
    </div>
  );
}
