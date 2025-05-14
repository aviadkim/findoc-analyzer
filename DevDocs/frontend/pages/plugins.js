import React from 'react';
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading } from '@chakra-ui/react';
import Layout from '../components/Layout';
import PluginManagement from '../components/PluginManagement';

/**
 * Plugin Management page
 */
const PluginsPage = () => {
  return (
    <Layout>
      <Box p={4}>
        <Breadcrumb mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Plugins</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading mb={6}>Plugin Management</Heading>
        
        <PluginManagement />
      </Box>
    </Layout>
  );
};

// Mark this page as requiring authentication and admin role
PluginsPage.auth = {
  required: true,
  role: 'admin'
};

export default PluginsPage;