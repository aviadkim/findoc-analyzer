// This file provides mock implementations of Chakra UI components
// to allow the app to run without the actual Chakra UI library

import React from 'react';

// Basic components
export const Box = ({ children, ...props }) => <div {...props}>{children}</div>;
export const Flex = ({ children, ...props }) => <div style={{ display: 'flex' }} {...props}>{children}</div>;
export const Container = ({ children, ...props }) => <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }} {...props}>{children}</div>;
export const Stack = ({ children, ...props }) => <div style={{ display: 'flex', flexDirection: 'column' }} {...props}>{children}</div>;
export const HStack = ({ children, ...props }) => <div style={{ display: 'flex', flexDirection: 'row' }} {...props}>{children}</div>;
export const VStack = ({ children, ...props }) => <div style={{ display: 'flex', flexDirection: 'column' }} {...props}>{children}</div>;
export const Grid = ({ children, ...props }) => <div style={{ display: 'grid' }} {...props}>{children}</div>;
export const Divider = ({ orientation = 'horizontal', ...props }) => (
  <hr
    style={{
      borderWidth: orientation === 'horizontal' ? '0 0 1px 0' : '0 1px 0 0',
      borderStyle: 'solid',
      borderColor: '#E2E8F0',
      margin: orientation === 'horizontal' ? '8px 0' : '0 8px',
      height: orientation === 'horizontal' ? 'auto' : '100%',
      ...props.style
    }}
    {...props}
  />
);

// Typography
export const Heading = ({ children, as = 'h2', size = 'md', ...props }) => {
  const Element = as;
  const sizeMap = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  };
  return (
    <Element style={{ fontSize: sizeMap[size], fontWeight: 'bold', ...props.style }} {...props}>
      {children}
    </Element>
  );
};

export const Text = ({ children, ...props }) => <p {...props}>{children}</p>;

// Form components
export const Button = ({ children, colorScheme = 'gray', variant = 'solid', leftIcon, rightIcon, isLoading, loadingText, isDisabled, ...props }) => {
  const colorMap = {
    blue: { bg: '#3182CE', color: 'white', hoverBg: '#2B6CB0' },
    red: { bg: '#E53E3E', color: 'white', hoverBg: '#C53030' },
    green: { bg: '#38A169', color: 'white', hoverBg: '#2F855A' },
    gray: { bg: '#A0AEC0', color: 'white', hoverBg: '#718096' },
  };
  
  const variantStyles = {
    solid: {
      backgroundColor: colorMap[colorScheme]?.bg || '#A0AEC0',
      color: colorMap[colorScheme]?.color || 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colorMap[colorScheme]?.bg || '#A0AEC0',
      border: `1px solid ${colorMap[colorScheme]?.bg || '#A0AEC0'}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colorMap[colorScheme]?.bg || '#A0AEC0',
    },
  };
  
  return (
    <button
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...variantStyles[variant],
        ...props.style,
      }}
      disabled={isDisabled}
      {...props}
    >
      {leftIcon && <span style={{ marginRight: '0.5rem' }}>{leftIcon}</span>}
      {isLoading ? loadingText || 'Loading...' : children}
      {rightIcon && <span style={{ marginLeft: '0.5rem' }}>{rightIcon}</span>}
    </button>
  );
};

export const Input = ({ type = 'text', ...props }) => <input type={type} style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #E2E8F0', width: '100%' }} {...props} />;

export const FormControl = ({ children, ...props }) => <div style={{ marginBottom: '1rem' }} {...props}>{children}</div>;
export const FormLabel = ({ children, ...props }) => <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }} {...props}>{children}</label>;

// Card components
export const Card = ({ children, ...props }) => (
  <div style={{ border: '1px solid #E2E8F0', borderRadius: '0.375rem', overflow: 'hidden', backgroundColor: 'white' }} {...props}>
    {children}
  </div>
);
export const CardHeader = ({ children, ...props }) => <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0' }} {...props}>{children}</div>;
export const CardBody = ({ children, ...props }) => <div style={{ padding: '1rem' }} {...props}>{children}</div>;

// Table components
export const Table = ({ children, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props}>{children}</table>;
export const Thead = ({ children, ...props }) => <thead {...props}>{children}</thead>;
export const Tbody = ({ children, ...props }) => <tbody {...props}>{children}</tbody>;
export const Tr = ({ children, ...props }) => <tr {...props}>{children}</tr>;
export const Th = ({ children, ...props }) => <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }} {...props}>{children}</th>;
export const Td = ({ children, ...props }) => <td style={{ padding: '0.75rem', borderBottom: '1px solid #E2E8F0' }} {...props}>{children}</td>;
export const TableContainer = ({ children, ...props }) => <div style={{ overflowX: 'auto' }} {...props}>{children}</div>;

// Tab components
export const Tabs = ({ children, ...props }) => <div {...props}>{children}</div>;
export const TabList = ({ children, ...props }) => <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }} {...props}>{children}</div>;
export const Tab = ({ children, ...props }) => <button style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer' }} {...props}>{children}</button>;
export const TabPanels = ({ children, ...props }) => <div style={{ padding: '1rem 0' }} {...props}>{children}</div>;
export const TabPanel = ({ children, ...props }) => <div {...props}>{children}</div>;

// Alert components
export const Alert = ({ children, status = 'info', ...props }) => {
  const statusColors = {
    info: '#3182CE',
    success: '#38A169',
    warning: '#DD6B20',
    error: '#E53E3E',
  };
  
  return (
    <div style={{ padding: '1rem', borderRadius: '0.375rem', backgroundColor: `${statusColors[status]}20`, borderLeft: `4px solid ${statusColors[status]}` }} {...props}>
      {children}
    </div>
  );
};
export const AlertIcon = () => <span>ⓘ</span>;
export const AlertTitle = ({ children, ...props }) => <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }} {...props}>{children}</div>;
export const AlertDescription = ({ children, ...props }) => <div {...props}>{children}</div>;

// Spinner
export const Spinner = ({ size = 'md', ...props }) => {
  const sizeMap = {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
  };
  
  return (
    <div
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: '2px solid #E2E8F0',
        borderTopColor: '#3182CE',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        ...props.style,
      }}
      {...props}
    >
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Badge
export const Badge = ({ children, colorScheme = 'gray', ...props }) => {
  const colorMap = {
    blue: { bg: '#EBF8FF', color: '#3182CE' },
    red: { bg: '#FFF5F5', color: '#E53E3E' },
    green: { bg: '#F0FFF4', color: '#38A169' },
    gray: { bg: '#F7FAFC', color: '#718096' },
  };
  
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: colorMap[colorScheme]?.bg || '#F7FAFC',
        color: colorMap[colorScheme]?.color || '#718096',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// Hooks
export const useToast = () => {
  return ({ title, description, status, duration, isClosable }) => {
    console.log(`Toast: ${title} - ${description} (${status})`);
    // In a real implementation, this would show a toast notification
    // For now, we just log to the console
  };
};

export const useDisclosure = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(!isOpen),
  };
};

export const useBreakpointValue = (values) => {
  // Simple implementation that always returns the base value
  return values.base;
};

export const useColorModeValue = (light, dark) => {
  // Always return the light value
  return light;
};

// Export everything as a module
export default {
  Box,
  Flex,
  Container,
  Stack,
  HStack,
  VStack,
  Grid,
  Divider,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Badge,
  useToast,
  useDisclosure,
  useBreakpointValue,
  useColorModeValue,
};
