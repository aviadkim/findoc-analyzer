import React, { useState } from 'react';
import FinDocUI from '../components/FinDocUI';
import SecuritiesViewer from '../components/SecuritiesViewer';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, Heading, Button, Flex } from '@chakra-ui/react';

const FinancialAnalysisPage = () => {
  return (
    <FinDocUI title="Financial Analysis">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Financial Analysis Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Portfolio Overview</h3>
            <p className="text-gray-600">Total Value: <span className="font-bold">19,510,599 USD</span></p>
            <p className="text-gray-600">Securities: <span className="font-bold">41</span></p>
            <p className="text-gray-600">Asset Classes: <span className="font-bold">5</span></p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Asset Allocation</h3>
            <p className="text-gray-600">Bonds: <span className="font-bold">59.24%</span></p>
            <p className="text-gray-600">Structured Products: <span className="font-bold">40.24%</span></p>
            <p className="text-gray-600">Other: <span className="font-bold">0.52%</span></p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Processing Metrics</h3>
            <p className="text-gray-600">ISIN Accuracy: <span className="font-bold">100%</span></p>
            <p className="text-gray-600">Value Accuracy: <span className="font-bold">100%</span></p>
            <p className="text-gray-600">Processing Time: <span className="font-bold">45.2s</span></p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Recent Documents</h3>
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Securities
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">messos.pdf</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">2023-02-28</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">19,510,599 USD</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">41</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Processed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">portfolio_q1_2023.pdf</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">2023-03-31</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">20,145,782 USD</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">43</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Processed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8">
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Top Holdings</Tab>
              <Tab>All Securities</Tab>
              <Tab>Performance Analytics</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Box mb={4}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading as="h3" size="md">Top Holdings</Heading>
                    <Button size="sm" colorScheme="blue" variant="outline">Export</Button>
                  </Flex>
                  <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ISIN
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asset Class
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % of Portfolio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">US912810SP08</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">US Treasury Bond 3.375% 2048</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">2,450,000 USD</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Bonds</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">12.56%</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">CH0012032048</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Roche Holding AG</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">1,875,000 USD</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Equities</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">9.61%</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">XS2051361264</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Structured Note 5Y EUR</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">1,650,000 USD</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Structured products</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">8.46%</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Box>
              </TabPanel>
              
              <TabPanel>
                <SecuritiesViewer />
              </TabPanel>
              
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading as="h3" size="md" mb={4}>Performance Analytics</Heading>
                  <p>Advanced performance analytics will be displayed here.</p>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </FinDocUI>
  );
};

export default FinancialAnalysisPage;
