import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Analytics Dashboard Component
 * 
 * Displays analytics data for the FinDoc Analyzer application.
 * 
 * @component
 */
const AnalyticsDashboard = ({ tenantId }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    pageViews: [],
    featureUsage: [],
    documentProcessing: [],
    errors: [],
    feedback: []
  });
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate date range
        const endDate = new Date();
        let startDate;
        
        switch (timeRange) {
          case '24h':
            startDate = subDays(endDate, 1);
            break;
          case '7d':
            startDate = subDays(endDate, 7);
            break;
          case '30d':
            startDate = subDays(endDate, 30);
            break;
          case '90d':
            startDate = subDays(endDate, 90);
            break;
          default:
            startDate = subDays(endDate, 7);
        }
        
        // Format dates for API
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();
        
        // Fetch analytics data from API
        const response = await axios.get('/api/analytics/dashboard', {
          params: {
            tenant_id: tenantId,
            start_date: startDateStr,
            end_date: endDateStr
          }
        });
        
        setAnalyticsData(response.data);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        
        // Use mock data for development
        setAnalyticsData(generateMockData(timeRange));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange, tenantId]);
  
  // Generate labels for time series charts
  const generateTimeLabels = () => {
    const endDate = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = subDays(endDate, 1);
        return Array.from({ length: 24 }, (_, i) => {
          const date = new Date(endDate);
          date.setHours(date.getHours() - 23 + i);
          return format(date, 'HH:mm');
        });
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }
    
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map(date => format(date, 'MMM dd'));
  };
  
  // Prepare data for page views chart
  const pageViewsData = {
    labels: generateTimeLabels(),
    datasets: [
      {
        label: 'Page Views',
        data: analyticsData.pageViews.map(item => item.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Prepare data for feature usage chart
  const featureUsageData = {
    labels: analyticsData.featureUsage.map(item => item.feature_name),
    datasets: [
      {
        label: 'Feature Usage',
        data: analyticsData.featureUsage.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for document processing chart
  const documentProcessingData = {
    labels: analyticsData.documentProcessing.map(item => item.document_type),
    datasets: [
      {
        label: 'Documents Processed',
        data: analyticsData.documentProcessing.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for feedback chart
  const feedbackData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Feedback Ratings',
        data: [1, 2, 3, 4, 5].map(rating => {
          const feedbackItem = analyticsData.feedback.find(item => item.rating === rating);
          return feedbackItem ? feedbackItem.count : 0;
        }),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Analytics Dashboard</h2>
        <div className="time-range-selector">
          <button 
            className={`time-range-btn ${timeRange === '24h' ? 'active' : ''}`}
            onClick={() => setTimeRange('24h')}
          >
            24 Hours
          </button>
          <button 
            className={`time-range-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={`time-range-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={`time-range-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-row">
            <div className="dashboard-card">
              <h3 className="card-title">Page Views</h3>
              <div className="chart-container">
                <Line data={pageViewsData} options={chartOptions} height={300} />
              </div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-card half-width">
              <h3 className="card-title">Feature Usage</h3>
              <div className="chart-container">
                <Bar data={featureUsageData} options={chartOptions} height={300} />
              </div>
            </div>
            
            <div className="dashboard-card half-width">
              <h3 className="card-title">Document Processing</h3>
              <div className="chart-container">
                <Bar data={documentProcessingData} options={chartOptions} height={300} />
              </div>
            </div>
          </div>
          
          <div className="dashboard-row">
            <div className="dashboard-card half-width">
              <h3 className="card-title">Feedback Ratings</h3>
              <div className="chart-container">
                <Pie data={feedbackData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }} height={300} />
              </div>
            </div>
            
            <div className="dashboard-card half-width">
              <h3 className="card-title">Recent Feedback</h3>
              <div className="feedback-list">
                {analyticsData.feedback.length > 0 ? (
                  <ul>
                    {analyticsData.feedback.slice(0, 5).map((item, index) => (
                      <li key={index} className="feedback-item">
                        <div className="feedback-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < item.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <div className="feedback-content">
                          <p className="feedback-text">{item.comments}</p>
                          <p className="feedback-meta">
                            {item.feedback_type} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No feedback data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .analytics-dashboard {
          padding: 20px;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .dashboard-title {
          font-size: 1.5rem;
          color: #2d3748;
          margin: 0;
        }
        
        .time-range-selector {
          display: flex;
          gap: 10px;
        }
        
        .time-range-btn {
          padding: 8px 12px;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .time-range-btn:hover {
          background-color: #f7fafc;
        }
        
        .time-range-btn.active {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }
        
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .dashboard-row {
          display: flex;
          gap: 20px;
          width: 100%;
        }
        
        .dashboard-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 20px;
          border: 1px solid #e2e8f0;
          width: 100%;
        }
        
        .half-width {
          width: 50%;
        }
        
        .card-title {
          font-size: 1.125rem;
          color: #2d3748;
          margin: 0 0 15px 0;
        }
        
        .chart-container {
          height: 300px;
          position: relative;
        }
        
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          border-top-color: #3498db;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          background-color: #fed7d7;
          color: #c53030;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .feedback-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .feedback-item {
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .feedback-item:last-child {
          border-bottom: none;
        }
        
        .feedback-rating {
          margin-bottom: 5px;
        }
        
        .star {
          color: #e2e8f0;
          font-size: 1.125rem;
        }
        
        .star.filled {
          color: #f6ad55;
        }
        
        .feedback-text {
          margin: 0 0 5px 0;
          font-size: 0.875rem;
        }
        
        .feedback-meta {
          margin: 0;
          font-size: 0.75rem;
          color: #718096;
        }
        
        .no-data {
          color: #718096;
          text-align: center;
          padding: 20px;
        }
        
        @media (max-width: 768px) {
          .dashboard-row {
            flex-direction: column;
          }
          
          .half-width {
            width: 100%;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .time-range-selector {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 5px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Generate mock data for development
 * @param {string} timeRange - Time range for the data
 * @returns {Object} Mock analytics data
 */
const generateMockData = (timeRange) => {
  const endDate = new Date();
  let startDate;
  let dataPoints;
  
  switch (timeRange) {
    case '24h':
      startDate = subDays(endDate, 1);
      dataPoints = 24;
      break;
    case '7d':
      startDate = subDays(endDate, 7);
      dataPoints = 7;
      break;
    case '30d':
      startDate = subDays(endDate, 30);
      dataPoints = 30;
      break;
    case '90d':
      startDate = subDays(endDate, 90);
      dataPoints = 90;
      break;
    default:
      startDate = subDays(endDate, 7);
      dataPoints = 7;
  }
  
  // Generate page views data
  const pageViews = Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString(),
      count: Math.floor(Math.random() * 100) + 50
    };
  });
  
  // Generate feature usage data
  const featureUsage = [
    { feature_name: 'Document Upload', count: Math.floor(Math.random() * 50) + 20 },
    { feature_name: 'Document Processing', count: Math.floor(Math.random() * 40) + 15 },
    { feature_name: 'Document Chat', count: Math.floor(Math.random() * 30) + 10 },
    { feature_name: 'Analytics', count: Math.floor(Math.random() * 20) + 5 },
    { feature_name: 'Export', count: Math.floor(Math.random() * 15) + 5 }
  ];
  
  // Generate document processing data
  const documentProcessing = [
    { document_type: 'PDF', count: Math.floor(Math.random() * 40) + 30 },
    { document_type: 'Excel', count: Math.floor(Math.random() * 30) + 20 },
    { document_type: 'CSV', count: Math.floor(Math.random() * 20) + 10 },
    { document_type: 'Word', count: Math.floor(Math.random() * 10) + 5 }
  ];
  
  // Generate errors data
  const errors = [
    { error_type: 'API Error', count: Math.floor(Math.random() * 10) + 1 },
    { error_type: 'Processing Error', count: Math.floor(Math.random() * 8) + 1 },
    { error_type: 'Authentication Error', count: Math.floor(Math.random() * 5) + 1 },
    { error_type: 'Network Error', count: Math.floor(Math.random() * 7) + 1 }
  ];
  
  // Generate feedback data
  const feedback = [
    { 
      rating: 5, 
      count: Math.floor(Math.random() * 15) + 10,
      feedback_type: 'General',
      comments: 'Great application! Very useful for financial document analysis.',
      created_at: new Date().toISOString()
    },
    { 
      rating: 4, 
      count: Math.floor(Math.random() * 10) + 8,
      feedback_type: 'Feature Request',
      comments: 'Would be nice to have more export options.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    { 
      rating: 3, 
      count: Math.floor(Math.random() * 8) + 5,
      feedback_type: 'Bug Report',
      comments: 'Sometimes the document processing takes too long.',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    { 
      rating: 2, 
      count: Math.floor(Math.random() * 5) + 3,
      feedback_type: 'UI/UX',
      comments: 'The interface could be more intuitive.',
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    { 
      rating: 1, 
      count: Math.floor(Math.random() * 3) + 1,
      feedback_type: 'Performance',
      comments: 'Application crashes when processing large files.',
      created_at: new Date(Date.now() - 345600000).toISOString()
    }
  ];
  
  return {
    pageViews,
    featureUsage,
    documentProcessing,
    errors,
    feedback
  };
};

export default AnalyticsDashboard;
