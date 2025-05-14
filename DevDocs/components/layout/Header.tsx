'use client'; // Make this a client component

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/lib/hooks/useResponsive';
import { cn } from '@/lib/utils';

// Placeholder Icon components - replace with actual icons later
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-4 w-4 text-slate-400", className)}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-5 w-5 text-slate-600", className)}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-5 w-5", className)}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Helper function to get title from path
const getTitleFromPath = (path: string): string => {
  if (path === '/') return 'Dashboard'; // Assuming root is dashboard for now
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  const title = segments[0].replace(/-/g, ' '); // Replace dashes with spaces
  return title.charAt(0).toUpperCase() + title.slice(1); // Capitalize first letter
};

const Header = () => {
  const pathname = usePathname();
  const pageTitle = getTitleFromPath(pathname); // Get title dynamically
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile menu items - same as sidebar
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload', label: 'Upload Documents' },
    { href: '/documents', label: 'My Documents' },
    { href: '/document-analysis', label: 'Document Analysis' },
    { href: '/agents', label: 'AI Agents' },
    { href: '/ui-components', label: 'UI Components' },
    { href: '/dev-test-center', label: 'Testing' },
    { href: '/settings', label: 'Settings' },
    { href: '/api-keys', label: 'API Keys' },
    { href: '/integrations', label: 'Integrations' },
    { href: '/responsive-demo', label: 'Responsive Demo' },
  ];

  return (
    <header className="flex h-[80px] items-center gap-4 border-b bg-white px-4 md:px-6 sticky top-0 z-30 dark:bg-slate-900 dark:border-slate-800">
      {/* Mobile Menu Button - Only shown on mobile */}
      <div className="block md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full flex-col">
              {/* Mobile menu logo */}
              <div className="flex h-[80px] items-center justify-center border-b px-6 bg-slate-900">
                <Link href="/" className="flex items-center gap-2 font-semibold text-white">
                  <span className="inline-block h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">F</span>
                  <span>FinDoc Analyzer</span>
                </Link>
              </div>
              
              {/* Mobile menu items */}
              <nav className="flex-1 overflow-auto py-4">
                <div className="space-y-1 px-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                          isActive 
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" 
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              {/* Mobile menu user */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                    AB
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aviad B.</p>
                    <p className="text-xs text-slate-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Page Title */}
      <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
        {pageTitle}
      </h1>

      {/* Search Bar - Hide on small mobile */}
      <div className="relative ml-auto hidden sm:flex flex-1 md:grow-0 max-w-sm">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="w-full rounded-full bg-slate-100 pl-8 md:w-[200px] lg:w-[300px] h-10 dark:bg-slate-800 dark:border-slate-700"
        />
      </div>

      {/* Actions Group with responsive spacing */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Upload Button (Placeholder Action) */}
        <Button size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-9 w-9 sm:h-10 sm:w-10">
          <PlusIcon className="h-5 w-5 text-white" />
          <span className="sr-only">Upload Document</span>
        </Button>

        {/* Notifications - Hide on small mobile */}
        <Button variant="outline" size="icon" className="relative hidden sm:flex rounded-full h-9 w-9 sm:h-10 sm:w-10">
          <BellIcon className="h-5 w-5" />
          {/* Notification Indicator */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

        {/* User Menu */}
        <Button variant="outline" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10">
          <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-white">
            AB {/* Placeholder */}
          </div>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;