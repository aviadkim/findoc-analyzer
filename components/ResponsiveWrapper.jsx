import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * ResponsiveWrapper Component
 * 
 * This component wraps other components to make them responsive across different device sizes.
 * It provides responsive breakpoints, device detection, and applies appropriate styling.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {Object} props.breakpoints - Custom breakpoints (optional)
 * @param {boolean} props.mobileFirst - Whether to use mobile-first approach (optional)
 * @param {string} props.className - Additional CSS classes (optional)
 */
const ResponsiveWrapper = ({ 
  children, 
  breakpoints,
  mobileFirst = true,
  className = '',
  ...props 
}) => {
  // Default breakpoints (can be overridden via props)
  const defaultBreakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  };
  
  // Merge custom breakpoints with defaults
  const mergedBreakpoints = { ...defaultBreakpoints, ...breakpoints };
  
  // State for current breakpoint and device type
  const [currentBreakpoint, setCurrentBreakpoint] = useState(null);
  const [deviceType, setDeviceType] = useState(null);
  
  // Determine current breakpoint based on window width
  const getCurrentBreakpoint = () => {
    const width = window.innerWidth;
    
    if (width < mergedBreakpoints.sm) return 'xs';
    if (width < mergedBreakpoints.md) return 'sm';
    if (width < mergedBreakpoints.lg) return 'md';
    if (width < mergedBreakpoints.xl) return 'lg';
    if (width < mergedBreakpoints.xxl) return 'xl';
    return 'xxl';
  };
  
  // Update device type based on breakpoint
  const updateDeviceType = (breakpoint) => {
    if (breakpoint === 'xs' || breakpoint === 'sm') {
      setDeviceType('mobile');
    } else if (breakpoint === 'md') {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };
  
  // Handle window resize
  const handleResize = () => {
    const breakpoint = getCurrentBreakpoint();
    if (breakpoint !== currentBreakpoint) {
      setCurrentBreakpoint(breakpoint);
      updateDeviceType(breakpoint);
      
      // Dispatch custom event for other components to listen to
      const event = new CustomEvent('breakpointchange', { 
        detail: { 
          breakpoint,
          width: window.innerWidth,
          height: window.innerHeight
        } 
      });
      window.dispatchEvent(event);
    }
  };
  
  // Add viewport meta tag if not present
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewportMeta);
    }
  }, []);
  
  // Set up resize listener and initialize breakpoint
  useEffect(() => {
    // Initial breakpoint detection
    const initialBreakpoint = getCurrentBreakpoint();
    setCurrentBreakpoint(initialBreakpoint);
    updateDeviceType(initialBreakpoint);
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Generate responsive class names
  const responsiveClasses = [
    'responsive-wrapper',
    deviceType ? `device-${deviceType}` : '',
    currentBreakpoint ? `breakpoint-${currentBreakpoint}` : '',
    className
  ].filter(Boolean).join(' ');
  
  // Apply different styles based on device type
  const getResponsiveStyles = () => {
    if (deviceType === 'mobile') {
      return {
        // Mobile-specific styles
        fontSize: { base: '14px', sm: '16px' },
        // Ensure touch-friendly sizes for interactive elements
        '.touch-friendly': {
          minHeight: '44px',
          minWidth: '44px',
        },
        // Make tables scrollable horizontally
        'table': {
          display: 'block',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        },
        // Stack grid items vertically
        '.responsive-grid': {
          gridTemplateColumns: '1fr !important'
        }
      };
    } else if (deviceType === 'tablet') {
      return {
        // Tablet-specific styles
        fontSize: { base: '16px', md: '16px' },
        // Make tables scrollable horizontally
        'table': {
          display: 'block',
          overflowX: 'auto',
        },
        // Two columns for grids on tablet
        '.responsive-grid': {
          gridTemplateColumns: 'repeat(2, 1fr) !important'
        }
      };
    }
    
    // Default/desktop styles
    return {
      fontSize: '16px',
      '.responsive-grid': {
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }
    };
  };
  
  return (
    <Box 
      className={responsiveClasses}
      sx={getResponsiveStyles()}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveWrapper;