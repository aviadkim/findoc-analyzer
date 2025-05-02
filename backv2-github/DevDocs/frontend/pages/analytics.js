import React from 'react';
import FinDocUI from '../components/FinDocUI';

const AnalyticsPage = () => {
  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      
      <div className="analytics-container">
        <div className="analytics-card">
          <h2>Document Analytics</h2>
          <p>View analytics for your processed documents.</p>
          <div className="analytics-placeholder">
            <div className="chart-placeholder">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '40%' }}></div>
              <div className="chart-bar" style={{ height: '70%' }}></div>
              <div className="chart-bar" style={{ height: '50%' }}></div>
            </div>
            <p className="placeholder-text">Document processing statistics</p>
          </div>
        </div>
        
        <div className="analytics-card">
          <h2>Financial Metrics</h2>
          <p>Key financial metrics extracted from your documents.</p>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">$2.4M</div>
              <div className="metric-label">Total Assets</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">$1.1M</div>
              <div className="metric-label">Liabilities</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">$1.3M</div>
              <div className="metric-label">Net Worth</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">12.5%</div>
              <div className="metric-label">ROI</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .page-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .analytics-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 768px) {
          .analytics-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .analytics-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        
        .analytics-card h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        
        .analytics-card p {
          color: #7f8c8d;
          margin-bottom: 15px;
        }
        
        .analytics-placeholder {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        
        .chart-placeholder {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;
          height: 150px;
          margin-bottom: 10px;
        }
        
        .chart-bar {
          width: 18%;
          background-color: #3498db;
          border-radius: 4px 4px 0 0;
        }
        
        .placeholder-text {
          color: #95a5a6;
          font-size: 14px;
          margin: 0;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .metric-item {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 15px;
          text-align: center;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #3498db;
          margin-bottom: 5px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

AnalyticsPage.getLayout = (page) => <FinDocUI>{page}</FinDocUI>;

export default AnalyticsPage;
