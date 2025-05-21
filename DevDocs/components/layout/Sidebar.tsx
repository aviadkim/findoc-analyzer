'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import TestingIcon from '../icons/TestingIcon';

// Modern icon components with consistent styling
const DashboardIcon = ({ className }: { className?: string }) => (
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
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
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

const AnalysisIcon = ({ className }: { className?: string }) => (
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
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const AgentIcon = ({ className }: { className?: string }) => (
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
    <circle cx="12" cy="5" r="3" />
    <path d="M6.5 12a2 2 0 0 0-2 2c0 1 .5 2 2 2 1.4 0 2-.5 3-2 .5-.8.8-1.7 1-3" />
    <path d="M17.5 12a2 2 0 0 1 2 2c0 1-.5 2-2 2-1.4 0-2-.5-3-2-.5-.8-.8-1.7-1-3" />
    <path d="M10 17a2 2 0 0 0 4 0" />
    <path d="M8 14h8" />
    <path d="M8 19.5V22" />
    <path d="M16 19.5V22" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ComponentsIcon = ({ className }: { className?: string }) => (
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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
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
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ApiKeyIcon = ({ className }: { className?: string }) => (
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
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const IntegrationIcon = ({ className }: { className?: string }) => (
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
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M22 10H2" />
    <path d="M19 17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2" />
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
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

// Group menu items by section for better organization
const menuSections = [
  {
    title: "Main",
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
      { href: '/documents', label: 'Documents', icon: DocumentIcon },
      { href: '/upload', label: 'Upload', icon: UploadIcon },
    ]
  },
  {
    title: "Analysis",
    items: [
      { href: '/document-analysis', label: 'Document Analysis', icon: AnalysisIcon },
      { href: '/agents', label: 'AI Agents', icon: AgentIcon },
      { href: '/integrations', label: 'Data Sources', icon: IntegrationIcon },
    ]
  },
  {
    title: "Reports",
    items: [
      { href: '/charts', label: 'Financial Overview', icon: ChartIcon },
      { href: '/api-keys', label: 'API & Connections', icon: ApiKeyIcon },
    ]
  },
  {
    title: "Settings",
    items: [
      { href: '/settings', label: 'Settings', icon: SettingsIcon },
      { href: '/ui-components', label: 'UI Components', icon: ComponentsIcon },
      { href: '/dev-test-center', label: 'Testing', icon: TestingIcon },
    ]
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r md:flex w-64 lg:w-72 flex-shrink-0 h-screen flex-col transition-all duration-300"
           style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b" 
           style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="inline-block h-8 w-8 rounded-md" 
                style={{ background: 'hsl(var(--primary-600))' }}>
            <span className="flex h-full w-full items-center justify-center text-md font-bold">F</span>
          </span>
          <span className="text-lg tracking-tight">FinDoc</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow px-4 py-6 space-y-6 overflow-y-auto">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section title */}
            <h3 className="px-2 text-xs font-medium tracking-wider uppercase mb-2 opacity-70"
                style={{ color: 'hsl(var(--sidebar-foreground))' }}>
              {section.title}
            </h3>
            
            {/* Section items */}
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    isActive 
                      ? 'text-white bg-primary-600/20' 
                      : 'text-white/70 hover:text-white hover:bg-sidebar-accent'
                  )}
                  style={isActive ? { color: 'hsl(var(--sidebar-primary))' } : {}}
                >
                  <item.icon 
                    className={isActive ? 'text-primary' : 'text-white/50'} 
                    style={isActive ? { color: 'hsl(var(--sidebar-primary))' } : {}}
                  />
                  <span>{item.label}</span>
                  
                  {/* Indicator for active item */}
                  {isActive && (
                    <span className="ml-auto block h-1.5 w-1.5 rounded-full" 
                          style={{ background: 'hsl(var(--sidebar-primary))' }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pro upgrade banner */}
      <div className="mx-4 mb-4 p-4 rounded-md" style={{ background: 'hsl(var(--sidebar-accent))' }}>
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-white">Upgrade to Pro</p>
          <p className="text-xs text-white/70">Access advanced features and reports</p>
          <button className="mt-2 px-3 py-1.5 text-xs font-medium rounded-md text-white w-full"
                  style={{ background: 'hsl(var(--primary-600))' }}>
            Upgrade Now
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t flex items-center" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-3 w-full">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
               style={{ background: 'hsl(var(--primary-600))' }}>
            AB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Aviad B.</p>
            <p className="text-xs text-white/50 truncate">Administrator</p>
          </div>
          <button className="p-1 rounded-md text-white/50 hover:text-white hover:bg-sidebar-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;