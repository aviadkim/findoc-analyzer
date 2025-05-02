import React, { useState, useEffect } from 'react';
import FinDocLayout from '../components/FinDocLayout';
import { 
  FiPieChart, FiBarChart2, FiTrendingUp, FiDollarSign, 
  FiCalendar, FiActivity, FiFileText, FiRefreshCw 
} from 'react-icons/fi';

// Mock data for demonstration
const mockData = {
  portfolioValue: 1250000,
  documentCount: 24,
  processedCount: 18,
  portfolioCount: 5,
  assetAllocation: [
    { name: 'Stocks', value: 45, color: '#3498db' },
    { name: 'Bonds', value: 30, color: '#2ecc71' },
    { name: 'Cash', value: 15, color: '#f1c40f' },
    { name: 'Real Estate', value: 7, color: '#e74c3c' },
    { name: 'Alternative', value: 3, color: '#9b59b6' }
  ],
  monthlyPerformance: [
    { month: 'Jan', value: 2.3 },
    { month: 'Feb', value: 1.8 },
    { month: 'Mar', value: -0.7 },
    { month: 'Apr', value: 3.2 },
    { month: 'May', value: 2.1 },
    { month: 'Jun', value: 1.5 },
    { month: 'Jul', value: -1.2 },
    { month: 'Aug', value: 0.8 },
    { month: 'Sep', value: 2.7 },
    { month: 'Oct', value: 1.9 },
    { month: 'Nov', value: 3.5 },
    { month: 'Dec', value: 2.2 }
  ],
  topHoldings: [
    { name: 'Apple Inc.', symbol: 'AAPL', value: 125000, change: 2.3 },
    { name: 'Microsoft Corp.', symbol: 'MSFT', value: 98000, change: 1.7 },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', value: 87500, change: -0.5 },
    { name: 'Alphabet Inc.', symbol: 'GOOGL', value: 76000, change: 0.8 },
    { name: 'Tesla Inc.', symbol: 'TSLA', value: 65000, change: 3.2 }
  ],
  recentActivity: [
    { type: 'document', name: 'Q1 Financial Report', date: '2024-04-15', status: 'Processed' },
    { type: 'analysis', name: 'Portfolio Rebalancing', date: '2024-04-10', status: 'Completed' },
    { type: 'document', name: 'Investment Statement', date: '2024-04-05', status: 'Processed' },
    { type: 'alert', name: 'Market Volatility Alert', date: '2024-04-01', status: 'Active' },
    { type: 'document', name: 'Tax Documents', date: '2024-03-25', status: 'Processed' }
  ]
};

export default function AnalyticsPage() {
  const [data, setData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate data fetching
  const fetchData = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Render pie chart for asset allocation
  const renderPieChart = () => {
    const total = data.assetAllocation.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    return (
      <div className="pie-chart">
        <svg viewBox="0 0 100 100">
          {data.assetAllocation.map((item, index) => {
            const angle = (item.value / total) * 360;
            const endAngle = startAngle + angle;
            
            // Calculate path for pie slice
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            
            // Create path
            const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
            
            // Update start angle for next slice
            const result = (
              <path
                key={index}
                d={path}
                fill={item.color}
                stroke="#fff"
                strokeWidth="0.5"
              />
            );
            
            startAngle += angle;
            return result;
          })}
        </svg>
        <div className="pie-legend">
          {data.assetAllocation.map((item, index) => (
            <div className="legend-item" key={index}>
              <div className="legend-color" style={{ backgroundColor: item.color }}></div>
              <div className="legend-label">{item.name}</div>
              <div className="legend-value">{item.value}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render bar chart for monthly performance
  const renderBarChart = () => {
    const maxValue = Math.max(...data.monthlyPerformance.map(item => Math.abs(item.value)));
    
    return (
      <div className="bar-chart">
        <div className="chart-container">
          {data.monthlyPerformance.map((item, index) => (
            <div className="bar-container" key={index}>
              <div 
                className={`bar ${item.value >= 0 ? 'positive' : 'negative'}`}
                style={{ 
                  height: `${(Math.abs(item.value) / maxValue) * 100}%`,
                  bottom: item.value >= 0 ? '50%' : 'auto',
                  top: item.value < 0 ? '50%' : 'auto'
                }}
              ></div>
              <div className="bar-label">{item.month}</div>
            </div>
          ))}
        </div>
        <div className="chart-axis">
          <div className="axis-label">+{maxValue.toFixed(1)}%</div>
          <div className="axis-center">0%</div>
          <div className="axis-label">-{maxValue.toFixed(1)}%</div>
        </div>
      </div>
    );
  };

  return (
    <FinDocLayout>
      <div className="analytics-page">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <button className="refresh-btn" onClick={fetchData} disabled={isLoading}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-content">
              <div className="stat-value">{data.documentCount}</div>
              <div className="stat-label">Documents</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiActivity />
            </div>
            <div className="stat-content">
              <div className="stat-value">{data.processedCount}</div>
              <div className="stat-label">Processed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiPieChart />
            </div>
            <div className="stat-content">
              <div className="stat-value">{data.portfolioCount}</div>
              <div className="stat-label">Portfolios</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-value">${(data.portfolioValue / 1000000).toFixed(1)}M</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
          <button 
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2 className="card-title">Asset Allocation</h2>
                {renderPieChart()}
              </div>
              <div className="analytics-card">
                <h2 className="card-title">Monthly Performance</h2>
                {renderBarChart()}
              </div>
              <div className="analytics-card">
                <h2 className="card-title">Top Holdings</h2>
                <div className="holdings-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Value</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topHoldings.map((holding, index) => (
                        <tr key={index}>
                          <td>{holding.name}</td>
                          <td>{holding.symbol}</td>
                          <td>${holding.value.toLocaleString()}</td>
                          <td className={holding.change >= 0 ? 'positive' : 'negative'}>
                            {holding.change >= 0 ? '+' : ''}{holding.change}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="analytics-card">
                <h2 className="card-title">Recent Activity</h2>
                <div className="activity-list">
                  {data.recentActivity.map((activity, index) => (
                    <div className="activity-item" key={index}>
                      <div className="activity-icon">
                        {activity.type === 'document' && <FiFileText />}
                        {activity.type === 'analysis' && <FiBarChart2 />}
                        {activity.type === 'alert' && <FiActivity />}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.name}</div>
                        <div className="activity-meta">
                          <span className="activity-date">
                            <FiCalendar size={12} />
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                          <span className={`activity-status ${activity.status.toLowerCase()}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="tab-content">
            <div className="analytics-card full-width">
              <h2 className="card-title">Portfolio Details</h2>
              <p className="placeholder-text">Detailed portfolio analysis will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="tab-content">
            <div className="analytics-card full-width">
              <h2 className="card-title">Performance Analysis</h2>
              <p className="placeholder-text">Detailed performance metrics will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="tab-content">
            <div className="analytics-card full-width">
              <h2 className="card-title">Activity Log</h2>
              <p className="placeholder-text">Complete activity history will be displayed here.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .analytics-page {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .page-title {
          font-size: 1.75rem;
          color: #2d3748;
          margin: 0;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background-color: #f7fafc;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 20px;
          display: flex;
          align-items: center;
          border: 1px solid #e2e8f0;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background-color: #ebf8ff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3498db;
          font-size: 1.5rem;
          margin-right: 15px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #718096;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .tab-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 0.9rem;
          color: #718096;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #3498db;
        }

        .tab-btn.active {
          color: #3498db;
          border-bottom-color: #3498db;
          font-weight: 500;
        }

        .tab-content {
          margin-bottom: 20px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .analytics-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .card-title {
          font-size: 1.1rem;
          color: #2d3748;
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pie-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pie-chart svg {
          width: 200px;
          height: 200px;
          margin-bottom: 20px;
        }

        .pie-legend {
          width: 100%;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-right: 8px;
        }

        .legend-label {
          flex: 1;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .legend-value {
          font-weight: 500;
          color: #2d3748;
        }

        .bar-chart {
          height: 250px;
          display: flex;
        }

        .chart-container {
          flex: 1;
          display: flex;
          align-items: flex-end;
          height: 200px;
          position: relative;
        }

        .chart-container:after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background-color: #e2e8f0;
        }

        .bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          position: relative;
        }

        .bar {
          width: 60%;
          position: absolute;
          border-radius: 2px;
        }

        .bar.positive {
          background-color: #48bb78;
        }

        .bar.negative {
          background-color: #f56565;
        }

        .bar-label {
          position: absolute;
          bottom: -25px;
          font-size: 0.8rem;
          color: #718096;
        }

        .chart-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0 5px;
          height: 200px;
          font-size: 0.8rem;
          color: #718096;
        }

        .axis-center {
          position: relative;
          top: 50%;
          transform: translateY(-50%);
        }

        .holdings-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          font-weight: 500;
          color: #4a5568;
          font-size: 0.9rem;
        }

        td {
          color: #2d3748;
        }

        .positive {
          color: #48bb78;
        }

        .negative {
          color: #f56565;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 4px;
          background-color: #f7fafc;
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: #ebf8ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3498db;
          margin-right: 12px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 5px;
        }

        .activity-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .activity-date {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #718096;
        }

        .activity-status {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .activity-status.processed {
          background-color: #c6f6d5;
          color: #2f855a;
        }

        .activity-status.completed {
          background-color: #c6f6d5;
          color: #2f855a;
        }

        .activity-status.active {
          background-color: #bee3f8;
          color: #2b6cb0;
        }

        .placeholder-text {
          color: #a0aec0;
          text-align: center;
          padding: 40px 0;
        }

        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .tabs {
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 5px;
          }
        }
      `}</style>
    </FinDocLayout>
  );
}
