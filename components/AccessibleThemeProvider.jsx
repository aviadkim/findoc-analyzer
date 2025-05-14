"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Create context for accessibility features
const AccessibilityContext = createContext({
  highContrast: false,
  fontSize: 'medium',
  reduceMotion: false,
  focusVisible: true,
  setHighContrast: () => {},
  setFontSize: () => {},
  setReduceMotion: () => {},
  setFocusVisible: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibleThemeProvider = ({ 
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = true
}) => {
  // Theme state
  const [mounted, setMounted] = useState(false);
  
  // Accessibility states
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [focusVisible, setFocusVisible] = useState(true);

  // Effect to check user's system preferences
  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(prefersReducedMotion.matches);
    
    // Add listener for changes to reduced motion preference
    const handleMotionChange = (e) => setReduceMotion(e.matches);
    prefersReducedMotion.addEventListener('change', handleMotionChange);
    
    // Set mounted state
    setMounted(true);
    
    return () => {
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Apply accessibility classes to body
  useEffect(() => {
    if (!mounted) return;
    
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply font size
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (fontSize) {
      case 'small':
        document.documentElement.classList.add('text-sm');
        break;
      case 'medium':
        document.documentElement.classList.add('text-base');
        break;
      case 'large':
        document.documentElement.classList.add('text-lg');
        break;
      case 'x-large':
        document.documentElement.classList.add('text-xl');
        break;
      default:
        document.documentElement.classList.add('text-base');
    }
    
    // Apply reduced motion
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply focus visibility
    if (focusVisible) {
      document.documentElement.classList.add('focus-visible');
    } else {
      document.documentElement.classList.remove('focus-visible');
    }
  }, [mounted, highContrast, fontSize, reduceMotion, focusVisible]);

  // Prevent flash of default theme during hydration
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        fontSize,
        reduceMotion,
        focusVisible,
        setHighContrast,
        setFontSize,
        setReduceMotion,
        setFocusVisible,
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem={enableSystem}
        disableTransitionOnChange={disableTransitionOnChange}
      >
        {children}
      </NextThemesProvider>
    </AccessibilityContext.Provider>
  );
};