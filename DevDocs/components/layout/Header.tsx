'use client'; // Make this a client component

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/lib/hooks/useResponsive';
import { cn } from '@/lib/utils';

// Modern Icon components with consistent styling
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-4 w-4", className)}
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
    className={cn("h-5 w-5", className)}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
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
    className={cn("h-5 w-5", className)}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
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
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// Helper function to get title from path with improved formatting
const getTitleFromPath = (path: string): string => {
  if (path === '/') return 'Dashboard';
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  
  // Handle special cases
  const specialCases: Record<string, string> = {
    'dashboard': 'Dashboard',
    'document-analysis': 'Document Analysis',
    'ui-components': 'UI Components',
    'dev-test-center': 'Testing Center',
    'api-keys': 'API Keys'
  };
  
  if (specialCases[segments[0]]) {
    return specialCases[segments[0]];
  }
  
  // Format with proper capitalization
  const title = segments[0].replace(/-/g, ' ');
  return title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Header = () => {
  const pathname = usePathname();
  const pageTitle = getTitleFromPath(pathname);
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile menu items - same as sidebar
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: ChartIcon },
    { href: '/upload', label: 'Upload Documents', icon: UploadIcon },
    { href: '/documents', label: 'My Documents', icon: SearchIcon },
    { href: '/document-analysis', label: 'Document Analysis', icon: SearchIcon },
    { href: '/agents', label: 'AI Agents', icon: SearchIcon },
    { href: '/settings', label: 'Settings', icon: SearchIcon },
    { href: '/api-keys', label: 'API Keys', icon: SearchIcon },
    { href: '/integrations', label: 'Integrations', icon: SearchIcon },
  ];

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      {/* Mobile Menu Button - Only shown on mobile */}
      <div className="block md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-foreground">
              <MenuIcon />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full flex-col">
              {/* Mobile menu logo */}
              <div className="flex h-16 items-center justify-center border-b px-6" style={{ background: 'hsl(var(--sidebar-background))' }}>
                <Link href="/" className="flex items-center gap-2 font-semibold text-white">
                  <span className="inline-block h-9 w-9 rounded-md" style={{ background: 'hsl(var(--primary-600))' }}>
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold">F</span>
                  </span>
                  <span className="text-lg">FinDoc</span>
                </Link>
              </div>
              
              {/* Mobile menu items with consistent icons */}
              <nav className="flex-1 overflow-auto py-4">
                <div className="space-y-1 px-3">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium gap-3 transition-colors",
                          isActive 
                            ? "bg-accent text-accent-foreground" 
                            : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon && <item.icon className={isActive ? "text-primary" : "text-foreground/50"} />}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              {/* Mobile menu user profile card */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white" 
                       style={{ background: 'hsl(var(--primary-600))' }}>
                    AB
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aviad B.</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Page Title with improved styling */}
      <h1 className="text-xl font-semibold text-foreground tracking-tight">
        {pageTitle}
      </h1>

      {/* Breadcrumb (optional) */}
      {pathname !== '/' && pathname !== '/dashboard' && (
        <div className="hidden md:flex text-sm text-muted-foreground">
          <span className="mx-2">/</span>
          <span>{pageTitle}</span>
        </div>
      )}

      {/* Search Bar with improved styling */}
      <div className="relative ml-auto hidden sm:flex flex-1 md:grow-0 max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="w-full rounded-full bg-background pl-9 md:w-[220px] lg:w-[300px] border-border h-9 focus-visible:ring-primary focus-visible:ring-offset-1"
        />
      </div>

      {/* Actions Group with professional styling */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Upload Button with primary style */}
        <Button 
          variant="default" 
          size="sm" 
          className="rounded-md h-9 gap-1.5 px-3 shadow-sm bg-primary text-white hover:bg-primary-700 focus-visible:ring-primary"
        >
          <UploadIcon className="h-4 w-4" />
          <span className="hidden sm:inline-flex">Upload</span>
        </Button>

        {/* Notifications button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full h-9 w-9 text-foreground hover:bg-muted"
        >
          <BellIcon className="h-5 w-5" />
          {/* Notification Indicator */}
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu with subtle styling */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-9 w-9 ml-1 text-foreground hover:bg-muted"
        >
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
               style={{ background: 'hsl(var(--primary-600))' }}>
            AB
          </div>
          <span className="sr-only">User menu</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;