/**
 * Chart Generator
 * 
 * This service generates chart data for visualizations.
 */

/**
 * Generate allocation chart data
 * @param {Array} securities - Securities data
 * @returns {Object} Chart data
 */
const generateAllocationChartData = (securities) => {
  try {
    // Mock data for testing
    return {
      type: 'pie',
      data: {
        labels: ['Stocks', 'Bonds', 'Cash', 'Real Estate'],
        datasets: [{
          data: [60, 20, 10, 10],
          backgroundColor: ['#4c6ef5', '#fa5252', '#40c057', '#fab005']
        }]
      }
    };
  } catch (error) {
    console.error('Error generating allocation chart data:', error);
    return null;
  }
};

module.exports = {
  generateAllocationChartData
};
