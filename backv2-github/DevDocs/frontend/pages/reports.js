import React from 'react';
import FinDocUI from '../components/FinDocUI';

const ReportsPage = () => {
  const reports = [
    {
      id: 1,
      title: 'Q1 Financial Summary',
      date: '2023-03-31',
      type: 'Quarterly Report',
      status: 'Completed'
    },
    {
      id: 2,
      title: 'Portfolio Performance Analysis',
      date: '2023-04-15',
      type: 'Analysis Report',
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Investment Recommendations',
      date: '2023-05-01',
      type: 'Advisory Report',
      status: 'In Progress'
    },
    {
      id: 4,
      title: 'Tax Documentation Summary',
      date: '2023-02-28',
      type: 'Tax Report',
      status: 'Completed'
    },
    {
      id: 5,
      title: 'Q2 Financial Forecast',
      date: '2023-06-15',
      type: 'Forecast Report',
      status: 'Pending'
    }
  ];

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      
      <div className="reports-header">
        <div className="search-container">
          <input type="text" placeholder="Search reports..." className="search-input" />
          <button className="search-button">Search</button>
        </div>
        <button className="new-report-button">Generate New Report</button>
      </div>
      
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.title}</td>
                <td>{report.date}</td>
                <td>{report.type}</td>
                <td>
                  <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                    {report.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button view">View</button>
                    <button className="action-button download">Download</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style jsx>{`
        .page-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        
        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .search-container {
          display: flex;
        }
        
        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px 0 0 4px;
          font-size: 14px;
          min-width: 250px;
        }
        
        .search-button {
          padding: 8px 16px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          font-weight: 500;
        }
        
        .new-report-button {
          padding: 8px 16px;
          background-color: #2ecc71;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .reports-table-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .reports-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .reports-table th,
        .reports-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .reports-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .reports-table tr:last-child td {
          border-bottom: none;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.completed {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-badge.in-progress {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-badge.pending {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .action-button {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .action-button.view {
          background-color: #e9ecef;
          color: #495057;
        }
        
        .action-button.download {
          background-color: #3498db;
          color: white;
        }
      `}</style>
    </div>
  );
};

ReportsPage.getLayout = (page) => <FinDocUI>{page}</FinDocUI>;

export default ReportsPage;
