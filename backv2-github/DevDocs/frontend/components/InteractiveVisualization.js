import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Select,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';

// Dynamically import chart components to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const InteractiveVisualization = ({ data, isLoading, error }) => {
  const [chartType, setChartType] = useState('pie');
  const [dataType, setDataType] = useState('assetAllocation');
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    if (data) {
      prepareChartData();
    }
  }, [data, chartType, dataType]);
  
  const prepareChartData = () => {
    if (!data || !data.financial_data) return;
    
    const { financial_data } = data;
    
    switch (dataType) {
      case 'assetAllocation':
        prepareAssetAllocationChart(financial_data.asset_allocation);
        break;
      case 'securities':
        prepareSecuritiesChart(financial_data.securities);
        break;
      case 'performance':
        preparePerformanceChart();
        break;
      default:
        prepareAssetAllocationChart(financial_data.asset_allocation);
    }
  };
  
  const prepareAssetAllocationChart = (assetAllocation) => {
    if (!assetAllocation) return;
    
    const labels = Object.keys(assetAllocation);
    const values = labels.map(key => {
      // Convert percentage strings to numbers
      const value = assetAllocation[key];
      return typeof value === 'string' && value.includes('%') 
        ? parseFloat(value.replace('%', '')) 
        : value;
    });
    
    const options = {
      chart: {
        type: chartType,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
          },
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      labels: labels,
      title: {
        text: 'Asset Allocation',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      tooltip: {
        y: {
          formatter: function(value) {
            return value + '%';
          }
        }
      }
    };
    
    if (chartType === 'bar' || chartType === 'line') {
      setChartOptions({
        ...options,
        xaxis: {
          categories: labels,
        },
        yaxis: {
          title: {
            text: 'Percentage (%)'
          }
        }
      });
      setChartSeries([{
        name: 'Allocation',
        data: values
      }]);
    } else {
      setChartOptions(options);
      setChartSeries(values);
    }
  };
  
  const prepareSecuritiesChart = (securities) => {
    if (!securities || !Array.isArray(securities)) return;
    
    const labels = securities.map(sec => sec.name);
    const values = securities.map(sec => {
      // Convert string values like "$2,345,678" to numbers
      const value = sec.value;
      if (typeof value === 'string' && value.includes('$')) {
        return parseFloat(value.replace(/[$,]/g, ''));
      }
      return value;
    });
    
    const options = {
      chart: {
        type: chartType,
        toolbar: {
          show: true,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      labels: labels,
      title: {
        text: 'Securities by Value',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      tooltip: {
        y: {
          formatter: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    };
    
    if (chartType === 'bar' || chartType === 'line') {
      setChartOptions({
        ...options,
        xaxis: {
          categories: labels,
        },
        yaxis: {
          title: {
            text: 'Value ($)'
          },
          labels: {
            formatter: function(value) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            }
          }
        }
      });
      setChartSeries([{
        name: 'Value',
        data: values
      }]);
    } else {
      setChartOptions(options);
      setChartSeries(values);
    }
  };
  
  const preparePerformanceChart = () => {
    // Simulated performance data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const portfolioPerformance = [2.3, -1.2, 3.5, 1.8, 2.7, -0.5, 4.2, 1.1, -2.3, 3.8, 1.5, 2.9];
    const benchmarkPerformance = [1.8, -0.8, 2.9, 1.2, 2.1, -0.3, 3.5, 0.8, -1.9, 3.2, 1.1, 2.4];
    
    const options = {
      chart: {
        type: 'line',
        toolbar: {
          show: true,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      title: {
        text: 'Portfolio Performance vs Benchmark',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
        }
      },
      xaxis: {
        categories: months,
      },
      yaxis: {
        title: {
          text: 'Return (%)'
        },
        labels: {
          formatter: function(value) {
            return value.toFixed(1) + '%';
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
      },
      colors: ['#008FFB', '#00E396'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 5,
      },
      tooltip: {
        y: {
          formatter: function(value) {
            return value.toFixed(2) + '%';
          }
        }
      }
    };
    
    setChartOptions(options);
    setChartSeries([
      {
        name: 'Portfolio',
        data: portfolioPerformance
      },
      {
        name: 'Benchmark',
        data: benchmarkPerformance
      }
    ]);
  };
  
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading visualization data...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertTitle mr={2}>Error loading visualization!</AlertTitle>
        <AlertDescription>{error.message || 'An error occurred while loading the visualization data.'}</AlertDescription>
      </Alert>
    );
  }
  
  if (!data || !data.financial_data) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertTitle mr={2}>No data available</AlertTitle>
        <AlertDescription>Please process a document to view visualizations.</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Box 
      bg={bgColor} 
      p={5} 
      borderRadius="lg" 
      boxShadow="md" 
      border="1px" 
      borderColor={borderColor}
      mb={5}
    >
      <Heading as="h3" size="md" mb={4}>Interactive Financial Visualizations</Heading>
      
      <Tabs isFitted variant="enclosed" colorScheme="blue" mb={4}>
        <TabList>
          <Tab>Asset Allocation</Tab>
          <Tab>Securities</Tab>
          <Tab>Performance</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Flex direction="column">
              <Flex mb={4} justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Asset Allocation</Text>
                <Select 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)} 
                  width="150px"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="donut">Donut Chart</option>
                  <option value="bar">Bar Chart</option>
                </Select>
              </Flex>
              
              <Box height="400px">
                {chartType === 'pie' || chartType === 'donut' ? (
                  <Chart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type={chartType} 
                    height="100%" 
                  />
                ) : (
                  <Chart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type={chartType} 
                    height="100%" 
                  />
                )}
              </Box>
              
              <Flex mt={4} justifyContent="center">
                <Button 
                  colorScheme="blue" 
                  size="sm" 
                  onClick={() => {
                    setDataType('assetAllocation');
                    setChartType('pie');
                  }}
                  mr={2}
                >
                  Reset View
                </Button>
                <Button 
                  colorScheme="green" 
                  size="sm" 
                  onClick={() => {
                    // Simulate data refresh
                    prepareChartData();
                  }}
                >
                  Refresh Data
                </Button>
              </Flex>
            </Flex>
          </TabPanel>
          
          <TabPanel>
            <Flex direction="column">
              <Flex mb={4} justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Securities by Value</Text>
                <Select 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)} 
                  width="150px"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="donut">Donut Chart</option>
                </Select>
              </Flex>
              
              <Box height="400px">
                {chartType === 'pie' || chartType === 'donut' ? (
                  <Chart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type={chartType} 
                    height="100%" 
                  />
                ) : (
                  <Chart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type={chartType} 
                    height="100%" 
                  />
                )}
              </Box>
              
              <Flex mt={4} justifyContent="center">
                <Button 
                  colorScheme="blue" 
                  size="sm" 
                  onClick={() => {
                    setDataType('securities');
                    setChartType('bar');
                  }}
                  mr={2}
                >
                  Reset View
                </Button>
                <Button 
                  colorScheme="green" 
                  size="sm" 
                  onClick={() => {
                    // Simulate data refresh
                    prepareChartData();
                  }}
                >
                  Refresh Data
                </Button>
              </Flex>
            </Flex>
          </TabPanel>
          
          <TabPanel>
            <Flex direction="column">
              <Flex mb={4} justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Performance Analysis</Text>
                <Select 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)} 
                  width="150px"
                  isDisabled={true}
                >
                  <option value="line">Line Chart</option>
                </Select>
              </Flex>
              
              <Box height="400px">
                <Chart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="line" 
                  height="100%" 
                />
              </Box>
              
              <Flex mt={4} justifyContent="center">
                <Button 
                  colorScheme="blue" 
                  size="sm" 
                  onClick={() => {
                    setDataType('performance');
                    preparePerformanceChart();
                  }}
                  mr={2}
                >
                  Reset View
                </Button>
                <Button 
                  colorScheme="green" 
                  size="sm" 
                  onClick={() => {
                    // Simulate data refresh
                    preparePerformanceChart();
                  }}
                >
                  Refresh Data
                </Button>
              </Flex>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Text fontSize="sm" color="gray.500" mt={4}>
        Click on the chart legends to toggle visibility. Use the toolbar in the top-right corner for additional options.
      </Text>
    </Box>
  );
};

export default InteractiveVisualization;
