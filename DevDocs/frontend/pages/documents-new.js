import React, { useState, useEffect } from 'react';
import FinDocLayout from '../components/FinDocLayout';
import { 
  FiFileText, FiDownload, FiEye, FiTrash2, FiSearch, 
  FiFilter, FiRefreshCw, FiGrid, FiList, FiTag, FiCalendar 
} from 'react-icons/fi';

// Mock data for demonstration
const mockDocuments = [
  {
    id: '1',
    name: 'Q1 Financial Report 2024',
    type: 'PDF',
    size: '2.4 MB',
    uploadDate: '2024-04-15',
    status: 'Processed',
    tags: ['financial', 'quarterly'],
    thumbnail: '/thumbnails/financial-report.png'
  },
  {
    id: '2',
    name: 'Investment Portfolio Analysis',
    type: 'XLSX',
    size: '1.8 MB',
    uploadDate: '2024-04-10',
    status: 'Processed',
    tags: ['investment', 'analysis'],
    thumbnail: '/thumbnails/portfolio.png'
  },
  {
    id: '3',
    name: 'Tax Documents 2023',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '2024-03-25',
    status: 'Processed',
    tags: ['tax', 'annual'],
    thumbnail: '/thumbnails/tax.png'
  },
  {
    id: '4',
    name: 'Market Research Report',
    type: 'PDF',
    size: '5.1 MB',
    uploadDate: '2024-03-15',
    status: 'Processing',
    tags: ['research', 'market'],
    thumbnail: '/thumbnails/research.png'
  },
  {
    id: '5',
    name: 'Budget Forecast 2024',
    type: 'XLSX',
    size: '1.2 MB',
    uploadDate: '2024-03-10',
    status: 'Processed',
    tags: ['budget', 'forecast'],
    thumbnail: '/thumbnails/budget.png'
  },
  {
    id: '6',
    name: 'Client Meeting Notes',
    type: 'DOCX',
    size: '0.8 MB',
    uploadDate: '2024-03-05',
    status: 'Error',
    tags: ['meeting', 'client'],
    thumbnail: '/thumbnails/notes.png'
  }
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle document actions
  const handleView = (docId) => {
    const doc = documents.find(d => d.id === docId);
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleDownload = (docId) => {
    setIsLoading(true);
    // Simulate download delay
    setTimeout(() => {
      console.log(`Downloading document ${docId}`);
      setIsLoading(false);
    }, 1500);
  };

  const handleDelete = (docId) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== docId));
    }
  };

  // Simulate fetching documents
  const fetchDocuments = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setDocuments(mockDocuments);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <FinDocLayout>
      <div className="documents-page">
        <div className="page-header">
          <h1 className="page-title">My Documents</h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={fetchDocuments} disabled={isLoading}>
              <FiRefreshCw className={isLoading ? 'spinning' : ''} />
              <span>Refresh</span>
            </button>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <div className="filter">
              <label><FiFilter /> Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Processed">Processed</option>
                <option value="Processing">Processing</option>
                <option value="Error">Error</option>
              </select>
            </div>
            <div className="filter">
              <label><FiFileText /> Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="PDF">PDF</option>
                <option value="XLSX">Excel</option>
                <option value="DOCX">Word</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={48} />
            <h3>No documents found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="documents-grid">
            {filteredDocuments.map(doc => (
              <div className="document-card" key={doc.id}>
                <div className="document-thumbnail">
                  <div className="file-icon">
                    <FiFileText size={32} />
                    <span className="file-type">{doc.type}</span>
                  </div>
                </div>
                <div className="document-info">
                  <h3 className="document-name">{doc.name}</h3>
                  <div className="document-meta">
                    <span className="document-size">{doc.size}</span>
                    <span className="document-date">
                      <FiCalendar size={12} />
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="document-tags">
                    {doc.tags.map(tag => (
                      <span className="tag" key={tag}>
                        <FiTag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="document-status">
                    <span className={`status-badge ${doc.status.toLowerCase()}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
                <div className="document-actions">
                  <button className="action-btn view-btn" onClick={() => handleView(doc.id)}>
                    <FiEye />
                    <span>View</span>
                  </button>
                  <button className="action-btn download-btn" onClick={() => handleDownload(doc.id)}>
                    <FiDownload />
                    <span>Download</span>
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(doc.id)}>
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="documents-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(doc => (
                  <tr key={doc.id}>
                    <td className="document-name-cell">
                      <FiFileText />
                      <span>{doc.name}</span>
                    </td>
                    <td>{doc.type}</td>
                    <td>{doc.size}</td>
                    <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-tags">
                        {doc.tags.map(tag => (
                          <span className="tag" key={tag}>
                            <FiTag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn view-btn" onClick={() => handleView(doc.id)}>
                          <FiEye />
                        </button>
                        <button className="action-btn download-btn" onClick={() => handleDownload(doc.id)}>
                          <FiDownload />
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(doc.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Document Modal */}
        {showDocumentModal && selectedDocument && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3>{selectedDocument.name}</h3>
                <button className="modal-close" onClick={() => setShowDocumentModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="document-preview">
                  <div className="preview-placeholder">
                    <FiFileText size={64} />
                    <p>Document Preview</p>
                  </div>
                </div>
                <div className="document-details">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedDocument.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{selectedDocument.size}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Upload Date:</span>
                    <span className="detail-value">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedDocument.status.toLowerCase()}`}>
                      {selectedDocument.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tags:</span>
                    <div className="detail-tags">
                      {selectedDocument.tags.map(tag => (
                        <span className="tag" key={tag}>
                          <FiTag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn secondary" onClick={() => setShowDocumentModal(false)}>Close</button>
                <button className="btn primary" onClick={() => handleDownload(selectedDocument.id)}>
                  <FiDownload />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .documents-page {
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

        .header-actions {
          display: flex;
          gap: 10px;
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

        .view-toggle {
          display: flex;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background-color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background-color: #f7fafc;
        }

        .view-btn.active {
          background-color: #3498db;
          color: white;
        }

        .filter-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .search-box svg {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .filter label {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .filter select {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background-color: white;
          font-size: 0.9rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 0;
        }

        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 0;
          color: #a0aec0;
          text-align: center;
        }

        .empty-state h3 {
          margin: 15px 0 5px;
          font-size: 1.25rem;
          color: #4a5568;
        }

        .empty-state p {
          margin: 0;
          color: #718096;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .document-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: all 0.3s;
          border: 1px solid #e2e8f0;
        }

        .document-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .document-thumbnail {
          height: 120px;
          background-color: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .file-icon {
          position: relative;
          color: #3498db;
        }

        .file-type {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #3498db;
          color: white;
          font-size: 0.6rem;
          padding: 2px 4px;
          border-radius: 2px;
        }

        .document-info {
          padding: 15px;
        }

        .document-name {
          margin: 0 0 10px;
          font-size: 1rem;
          color: #2d3748;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .document-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 0.8rem;
          color: #718096;
        }

        .document-date {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .document-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 10px;
        }

        .tag {
          display: flex;
          align-items: center;
          gap: 3px;
          background-color: #edf2f7;
          color: #4a5568;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .document-status {
          margin-bottom: 10px;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.processed {
          background-color: #c6f6d5;
          color: #2f855a;
        }

        .status-badge.processing {
          background-color: #fefcbf;
          color: #975a16;
        }

        .status-badge.error {
          background-color: #fed7d7;
          color: #c53030;
        }

        .document-actions {
          display: flex;
          border-top: 1px solid #e2e8f0;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          color: #4a5568;
        }

        .action-btn:hover {
          background-color: #f7fafc;
        }

        .action-btn.view-btn:hover {
          color: #3498db;
        }

        .action-btn.download-btn:hover {
          color: #38a169;
        }

        .action-btn.delete-btn:hover {
          color: #e53e3e;
        }

        .documents-table {
          overflow-x: auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background-color: #f7fafc;
          color: #4a5568;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .document-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .table-actions {
          display: flex;
          gap: 5px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #a0aec0;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .document-preview {
          flex: 2;
          min-width: 300px;
        }

        .preview-placeholder {
          height: 400px;
          background-color: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #a0aec0;
        }

        .document-details {
          flex: 1;
          min-width: 200px;
        }

        .detail-item {
          margin-bottom: 15px;
        }

        .detail-label {
          display: block;
          font-size: 0.9rem;
          color: #718096;
          margin-bottom: 5px;
        }

        .detail-value {
          font-size: 1rem;
          color: #2d3748;
        }

        .detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .btn.secondary {
          background-color: white;
          border: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .btn.secondary:hover {
          background-color: #f7fafc;
        }

        .btn.primary {
          background-color: #3498db;
          border: 1px solid #3498db;
          color: white;
        }

        .btn.primary:hover {
          background-color: #2980b9;
        }

        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
          }

          .filters {
            flex-direction: column;
          }

          .modal-body {
            flex-direction: column;
          }

          .document-preview {
            min-width: 100%;
          }

          .document-details {
            min-width: 100%;
          }
        }
      `}</style>
    </FinDocLayout>
  );
}
