import React from 'react';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import FinancialAnalysisPage from './pages/FinancialAnalysisPage';
import UploadPage from './pages/UploadPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import DocumentsNewPage from './pages/documents-new';
import AnalyticsNewPage from './pages/analytics-new';
import FeedbackPage from './pages/feedback';
import DocumentComparisonPage from './pages/document-comparison';

const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <Flex direction="column" minH="100vh">
          <Navigation />
          <Box flex="1" p={4}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/financial" element={<FinancialAnalysisPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/documents-new" element={<DocumentsNewPage />} />
              <Route path="/analytics-new" element={<AnalyticsNewPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/document-comparison" element={<DocumentComparisonPage />} />
            </Routes>
          </Box>
        </Flex>
      </Router>
    </ChakraProvider>
  );
};

export default App;
