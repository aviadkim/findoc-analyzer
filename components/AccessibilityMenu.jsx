"use client"

import React from 'react';
import { Moon, Sun, Eye, Type, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAccessibility } from './AccessibleThemeProvider';

export const AccessibilityMenu = ({ ariaLabel = "Accessibility options" }) => {
  const { theme, setTheme } = useTheme();
  const {
    highContrast,
    fontSize,
    reduceMotion,
    focusVisible,
    setHighContrast,
    setFontSize,
    setReduceMotion,
    setFocusVisible,
  } = useAccessibility();

  return (
    <div className="accessibility-menu p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm" aria-label={ariaLabel} role="region">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Theme Section */}
        <div className="theme-section space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Display Theme</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                theme === 'light' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={theme === 'light'}
              aria-label="Light theme"
            >
              <Sun className="h-5 w-5 mr-1" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                theme === 'dark' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={theme === 'dark'}
              aria-label="Dark theme"
            >
              <Moon className="h-5 w-5 mr-1" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                theme === 'system' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={theme === 'system'}
              aria-label="System theme"
            >
              <Zap className="h-5 w-5 mr-1" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Contrast Section */}
        <div className="contrast-section space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Contrast</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setHighContrast(false)}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                !highContrast 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={!highContrast}
              aria-label="Normal contrast"
            >
              <span>Normal</span>
            </button>
            <button
              onClick={() => setHighContrast(true)}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                highContrast 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={highContrast}
              aria-label="High contrast"
            >
              <Eye className="h-5 w-5 mr-1" />
              <span>High Contrast</span>
            </button>
          </div>
        </div>

        {/* Font Size Section */}
        <div className="font-size-section space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Text Size</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFontSize('small')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                fontSize === 'small' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={fontSize === 'small'}
              aria-label="Small text"
            >
              <Type className="h-4 w-4 mr-1" />
              <span>Small</span>
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                fontSize === 'medium' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={fontSize === 'medium'}
              aria-label="Medium text"
            >
              <Type className="h-5 w-5 mr-1" />
              <span>Medium</span>
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                fontSize === 'large' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={fontSize === 'large'}
              aria-label="Large text"
            >
              <Type className="h-6 w-6 mr-1" />
              <span>Large</span>
            </button>
            <button
              onClick={() => setFontSize('x-large')}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                fontSize === 'x-large' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={fontSize === 'x-large'}
              aria-label="Extra large text"
            >
              <Type className="h-7 w-7 mr-1" />
              <span>X-Large</span>
            </button>
          </div>
        </div>

        {/* Motion Section */}
        <div className="motion-section space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Motion</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setReduceMotion(false)}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                !reduceMotion 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={!reduceMotion}
              aria-label="Allow animations"
            >
              <span>Allow Animations</span>
            </button>
            <button
              onClick={() => setReduceMotion(true)}
              className={`flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                reduceMotion 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-500 border' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
              aria-pressed={reduceMotion}
              aria-label="Reduce motion"
            >
              <span>Reduce Motion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};