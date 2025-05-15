import React, { useEffect } from 'react';
import Head from 'next/head';
import FinDocLayout from '../components/FinDocLayout';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useRouter } from 'next/router';
import { trackPageView } from '../lib/analytics';

/**
 * Analytics Dashboard Page
 * 
 * This page displays the analytics dashboard for the FinDoc Analyzer application.
 * 
 * @component
 */
const AnalyticsDashboardPage = () => {
  const router = useRouter();
  
  // Track page view
  useEffect(() => {
    trackPageView('/analytics-dashboard', 'Analytics Dashboard');
  }, []);
  
  return (
    <>
      <Head>
        <title>Analytics Dashboard | FinDoc Analyzer</title>
        <meta name="description" content="View analytics data for the FinDoc Analyzer application" />
      </Head>
      
      <FinDocLayout>
        <div className="analytics-dashboard-page">
          <AnalyticsDashboard tenantId="current-tenant-id" />
        </div>
        
        <style jsx>{`
          .analytics-dashboard-page {
            padding: 20px;
          }
        `}</style>
      </FinDocLayout>
    </>
  );
};

export default AnalyticsDashboardPage;
