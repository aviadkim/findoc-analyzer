/**
 * Visualization Controller
 * 
 * This controller handles visualization requests for documents and portfolios.
 */

/**
 * Get analytics dashboard
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getAnalyticsDashboard = async (req, res) => {
  try {
    // Mock data for testing
    const data = {
      counts: {
        documents: 10,
        processed: 8,
        portfolios: 3,
        totalPortfolioValue: 125000
      },
      charts: {
        documentsByType: {
          labels: ['PDF', 'Excel', 'Word', 'Other'],
          datasets: [{
            data: [65, 20, 10, 5],
            backgroundColor: ['#4c6ef5', '#fa5252', '#40c057', '#fab005']
          }]
        },
        processingStatus: {
          labels: ['Processed', 'Pending', 'Failed'],
          datasets: [{
            data: [8, 2, 0],
            backgroundColor: ['#40c057', '#fab005', '#fa5252']
          }]
        }
      },
      recentDocuments: [
        {
          id: '1',
          name: 'Q3 Financial Report',
          type: 'PDF',
          status: 'Processed',
          uploaded_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Investment Portfolio',
          type: 'Excel',
          status: 'Processed',
          uploaded_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          name: 'Annual Report',
          type: 'PDF',
          status: 'Pending',
          uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAnalyticsDashboard
};
