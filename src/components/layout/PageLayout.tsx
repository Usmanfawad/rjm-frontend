'use client';

import { ReactNode } from 'react';
import { Navbar, Footer } from './index';

interface PageLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Standard page layout wrapper
 * Eliminates repeated Navbar/Footer pattern across pages
 */
export function PageLayout({
  children,
  showNavbar = true,
  showFooter = true,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
