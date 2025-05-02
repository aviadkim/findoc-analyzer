/**
 * Report Controller
 * 
 * This controller handles report generation and management.
 */

/**
 * Get all reports
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getReports = async (req, res) => {
  try {
    // Mock data for testing
    const reports = [
      {
        id: '1',
        name: 'Portfolio Analysis Report',
        type: 'portfolio',
        content: '# Portfolio Analysis\n\nThis is a sample portfolio analysis report.',
        charts: {
          allocation: {
            type: 'pie',
            data: {
              labels: ['Stocks', 'Bonds', 'Cash', 'Real Estate'],
              datasets: [{
                data: [60, 20, 10, 10],
                backgroundColor: ['#4c6ef5', '#fa5252', '#40c057', '#fab005']
              }]
            }
          }
        },
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Document Analysis Report',
        type: 'document',
        content: '# Document Analysis\n\nThis is a sample document analysis report.',
        charts: {},
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getReports
};
