import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
// Removing Chakra UI imports to fix errors
// Using simple HTML/CSS instead
import {
  FiMenu,
  FiHome,
  FiUpload,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiSearch,
  FiDollarSign,
  FiCode,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiPieChart,
  FiDatabase,
  FiGlobe,
  FiCloud,
  FiKey,
  FiTool,
  FiCpu,
  FiBriefcase,
  FiBook,
} from 'react-icons/fi';

const ResponsiveNavigation = ({ user = { name: 'Aviad B.', role: 'Administrator' } }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('/');
  const [isMobile, setIsMobile] = useState(true);

  // Check if we're on the client side before accessing window
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setActiveItem(router.pathname);
  }, [router.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome size={18} /> },
    { name: 'Upload Documents', path: '/upload', icon: <FiUpload size={18} /> },
    { name: 'My Documents', path: '/documents', icon: <FiFileText size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <FiBarChart2 size={18} /> },
    { name: 'Portfolio', path: '/portfolio', icon: <FiPieChart size={18} /> },
    { name: 'Agents', path: '/agents', icon: <FiCpu size={18} /> },
    { name: 'FinDocRAG', path: '/findoc-rag', icon: <FiSearch size={18} /> },
    { name: 'Enhanced Processing', path: '/enhanced-processing', icon: <FiBarChart2 size={18} /> },
    {
      name: 'Document Analysis',
      path: null,
      icon: <FiBook size={18} />,
      children: [
        { name: 'Document Understanding', path: '/document-understanding-demo', icon: <FiSearch size={16} /> },
        { name: 'RAG Document Processor', path: '/rag-document-processor', icon: <FiBriefcase size={16} /> },
        { name: 'Simple RAG', path: '/simple-rag', icon: <FiBook size={16} /> },
      ]
    },
    {
      name: 'Tools',
      path: null,
      icon: <FiTool size={18} />,
      children: [
        { name: 'SQL Agent', path: '/test-sql-agent', icon: <FiDatabase size={16} /> },
        { name: 'Web Browser', path: '/test-web-browser', icon: <FiGlobe size={16} /> },
        { name: 'Google Cloud MCP', path: '/mcp-integration', icon: <FiCloud size={16} /> },
      ]
    },
    {
      name: 'Testing',
      path: null,
      icon: <FiCode size={18} />,
      children: [
        { name: 'Financial Testing', path: '/financial-test-center', icon: <FiDollarSign size={16} /> },
        { name: 'Testing', path: '/test-center', icon: <FiSearch size={16} /> },
        { name: 'Dev Testing', path: '/dev-test-center', icon: <FiCode size={16} /> },
      ]
    },
    {
      name: 'Settings',
      path: null,
      icon: <FiSettings size={18} />,
      children: [
        { name: 'General Settings', path: '/settings', icon: <FiSettings size={16} /> },
        { name: 'API Setup', path: '/api-key-setup', icon: <FiKey size={16} /> },
      ]
    },
  ];

  const handleNavigation = (path) => {
    if (path) {
      router.push(path);
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  const renderNavItems = (items, level = 0) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <div key={item.name} className="w-full mb-2">
            <div className="px-4 py-2 text-gray-500 font-medium text-sm">
              <span className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </span>
            </div>
            <div className="pl-4">
              {item.children.map((child) => (
                <Link
                  href={child.path}
                  key={child.name}
                  className={`flex items-center px-4 py-2 text-sm ${activeItem === child.path ? 'text-blue-500 font-bold' : 'text-gray-600'} hover:bg-gray-100 rounded-md`}
                  onClick={() => handleNavigation(child.path)}
                >
                  {child.icon}
                  <span className="ml-2">{child.name}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      }

      return (
        <Link
          href={item.path}
          key={item.name}
          className={`flex items-center px-4 py-2 mb-1 ${activeItem === item.path ? 'bg-blue-50 text-blue-500 font-bold' : 'text-gray-600'} hover:bg-gray-100 rounded-md`}
          onClick={() => handleNavigation(item.path)}
        >
          {item.icon}
          <span className="ml-2">{item.name}</span>
        </Link>
      );
    });
  };

  // Simplified navigation component
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 w-64 h-screen bg-white border-r border-gray-200 hidden lg:block z-10">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="text-xl font-bold text-blue-600">FinDoc Analyzer</div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {renderNavItems(navItems)}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 lg:hidden z-10">
        <button
          className="p-1 rounded-md hover:bg-gray-100"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={24} />
        </button>
        <div className="text-lg font-bold text-blue-600">FinDoc Analyzer</div>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
          {user.name.charAt(0)}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="text-lg font-bold">FinDoc Analyzer</div>
              <button
                className="p-1 rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <FiChevronDown size={20} />
              </button>
            </div>
            <div className="p-4">
              {renderNavItems(navItems)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveNavigation;
