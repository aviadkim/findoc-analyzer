"use client"

import React, { useState } from 'react';
import { Moon, Sun, Accessibility, Settings, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAccessibility } from './AccessibleThemeProvider';
import { AccessibilityMenu } from './AccessibilityMenu';

export const AccessibilityToggle = () => {
  const { theme, setTheme } = useTheme();
  const { highContrast } = useAccessibility();
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Toggle accessibility menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Accessibility options button */}
        <button
          onClick={toggleMenu}
          className={`p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
            menuOpen || highContrast 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          } transition-colors`}
          aria-expanded={menuOpen}
          aria-label="Accessibility options"
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Accessibility className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Accessibility menu dropdown */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-96 z-50 origin-top-right">
          <div className="rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="p-1">
              <AccessibilityMenu />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};