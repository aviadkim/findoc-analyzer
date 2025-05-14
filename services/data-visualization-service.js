/**
 * Data Visualization Service
 * Provides comprehensive chart generation and data transformation utilities for financial data
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Import portfolio visualization service for integration
const portfolioVisualizationService = require('./portfolio-visualization-service');

// Advanced Data Visualization class - handles Python-based visualization
class AdvancedDataVisualization {
  /**
   * Initialize the service
   * @param {object} options - Options
   */
  constructor(options = {}) {
    this.options = {
      tempDir: options.tempDir || path.join(process.cwd(), 'temp'),
      resultsDir: options.resultsDir || path.join(process.cwd(), 'results'),
      pythonCommand: options.pythonCommand || 'python',
      useMockData: options.useMockData || process.env.USE_MOCK_DATA === 'true' || false,
      ...options
    };

    // Create directories if they don't exist
    try {
      fs.mkdirSync(this.options.tempDir, { recursive: true });
      fs.mkdirSync(this.options.resultsDir, { recursive: true });
    } catch (error) {
      console.warn('Error creating directories:', error);
    }
  }

  /**
   * Generate a chart
   * @param {object} data - Chart data
   * @param {object} options - Chart options
   * @returns {Promise<object>} - Chart results
   */
  async generateChart(data, options = {}) {
    try {
      console.log('Generating chart...');

      // Default options
      const chartOptions = {
        type: options.type || 'bar',
        title: options.title || 'Chart',
        xLabel: options.xLabel || 'X Axis',
        yLabel: options.yLabel || 'Y Axis',
        width: options.width || 800,
        height: options.height || 600,
        format: options.format || 'png',
        ...options
      };

      // If using mock data, return mock results
      if (this.options.useMockData) {
        return this.getMockChartResults(data, chartOptions);
      }

      // Generate chart using Python
      const chartPath = await this.generateChartWithPython(data, chartOptions);

      return {
        success: true,
        chartPath,
        chartUrl: `/charts/${path.basename(chartPath)}`,
        chartOptions
      };
    } catch (error) {
      console.error('Error generating chart:', error);
      throw error;
    }
  }

  /**
   * Generate a dashboard
   * @param {Array} charts - Array of chart data and options
   * @param {object} options - Dashboard options
   * @returns {Promise<object>} - Dashboard results
   */
  async generateDashboard(charts, options = {}) {
    try {
      console.log('Generating dashboard...');

      // Default options
      const dashboardOptions = {
        title: options.title || 'Dashboard',
        layout: options.layout || 'grid',
        width: options.width || 1200,
        height: options.height || 800,
        format: options.format || 'html',
        ...options
      };

      // If using mock data, return mock results
      if (this.options.useMockData) {
        return this.getMockDashboardResults(charts, dashboardOptions);
      }

      // Generate dashboard using Python
      const dashboardPath = await this.generateDashboardWithPython(charts, dashboardOptions);

      return {
        success: true,
        dashboardPath,
        dashboardUrl: `/dashboards/${path.basename(dashboardPath)}`,
        dashboardOptions
      };
    } catch (error) {
      console.error('Error generating dashboard:', error);
      throw error;
    }
  }

  /**
   * Generate a report
   * @param {object} data - Report data
   * @param {object} options - Report options
   * @returns {Promise<object>} - Report results
   */
  async generateReport(data, options = {}) {
    try {
      console.log('Generating report...');

      // Default options
      const reportOptions = {
        title: options.title || 'Report',
        format: options.format || 'pdf',
        template: options.template || 'default',
        ...options
      };

      // If using mock data, return mock results
      if (this.options.useMockData) {
        return this.getMockReportResults(data, reportOptions);
      }

      // Generate report using Python
      const reportPath = await this.generateReportWithPython(data, reportOptions);

      return {
        success: true,
        reportPath,
        reportUrl: `/reports/${path.basename(reportPath)}`,
        reportOptions
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Generate a chart with Python
   * @param {object} data - Chart data
   * @param {object} options - Chart options
   * @returns {Promise<string>} - Chart file path
   */
  async generateChartWithPython(data, options) {
    try {
      console.log('Generating chart with Python...');

      // Create Python script
      const scriptPath = path.join(this.options.tempDir, 'generate_chart.py');
      const dataPath = path.join(this.options.tempDir, `chart_data_${Date.now()}.json`);
      const chartPath = path.join(this.options.resultsDir, `chart_${Date.now()}.${options.format}`);

      // Save data to file
      fs.writeFileSync(dataPath, JSON.stringify(data));

      // Create Python script
      const scriptContent = `
import json
import sys
import os
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

def generate_chart(data_path, chart_path, options):
    try:
        # Load data
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        # Convert to pandas DataFrame if necessary
        if isinstance(data, list) and all(isinstance(item, dict) for item in data):
            df = pd.DataFrame(data)
        elif isinstance(data, dict) and 'x' in data and 'y' in data:
            df = pd.DataFrame({'x': data['x'], 'y': data['y']})
        else:
            raise ValueError('Invalid data format')
        
        # Create figure based on chart type
        chart_type = options.get('type', 'bar')
        
        if chart_type == 'bar':
            fig = px.bar(df, x='x', y='y', title=options.get('title', 'Bar Chart'))
        elif chart_type == 'line':
            fig = px.line(df, x='x', y='y', title=options.get('title', 'Line Chart'))
        elif chart_type == 'scatter':
            fig = px.scatter(df, x='x', y='y', title=options.get('title', 'Scatter Plot'))
        elif chart_type == 'pie':
            fig = px.pie(df, values='y', names='x', title=options.get('title', 'Pie Chart'))
        elif chart_type == 'area':
            fig = px.area(df, x='x', y='y', title=options.get('title', 'Area Chart'))
        else:
            fig = px.bar(df, x='x', y='y', title=options.get('title', 'Chart'))
        
        # Update layout
        fig.update_layout(
            title=options.get('title', 'Chart'),
            xaxis_title=options.get('xLabel', 'X Axis'),
            yaxis_title=options.get('yLabel', 'Y Axis'),
            width=options.get('width', 800),
            height=options.get('height', 600)
        )
        
        # Save figure
        format = options.get('format', 'png')
        
        if format == 'html':
            fig.write_html(chart_path)
        else:
            fig.write_image(chart_path)
        
        return {
            'success': True,
            'chart_path': chart_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    data_path = sys.argv[1]
    chart_path = sys.argv[2]
    options = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    
    result = generate_chart(data_path, chart_path, options)
    print(json.dumps(result))
`;

      fs.writeFileSync(scriptPath, scriptContent);

      // Run Python script
      const result = await this.runPythonScript(scriptPath, [
        dataPath,
        chartPath,
        JSON.stringify(options)
      ]);

      // Parse result
      try {
        const parsedResult = JSON.parse(result);
        
        if (!parsedResult.success) {
          throw new Error(parsedResult.error || 'Failed to generate chart');
        }
        
        return chartPath;
      } catch (error) {
        console.error('Error parsing chart generation result:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error generating chart with Python:', error);
      throw error;
    }
  }

  /**
   * Generate a dashboard with Python
   * @param {Array} charts - Array of chart data and options
   * @param {object} options - Dashboard options
   * @returns {Promise<string>} - Dashboard file path
   */
  async generateDashboardWithPython(charts, options) {
    try {
      console.log('Generating dashboard with Python...');

      // Create Python script
      const scriptPath = path.join(this.options.tempDir, 'generate_dashboard.py');
      const dataPath = path.join(this.options.tempDir, `dashboard_data_${Date.now()}.json`);
      const dashboardPath = path.join(this.options.resultsDir, `dashboard_${Date.now()}.${options.format}`);

      // Save data to file
      fs.writeFileSync(dataPath, JSON.stringify(charts));

      // Create Python script
      const scriptContent = `
import json
import sys
import os
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

def generate_dashboard(data_path, dashboard_path, options):
    try:
        # Load data
        with open(data_path, 'r') as f:
            charts = json.load(f)
        
        # Create subplots
        num_charts = len(charts)
        rows = options.get('rows', 2)
        cols = options.get('cols', 2)
        
        fig = make_subplots(
            rows=rows,
            cols=cols,
            subplot_titles=[chart.get('options', {}).get('title', f'Chart {i+1}') for i, chart in enumerate(charts)],
            print_grid=False
        )
        
        # Add charts to subplots
        for i, chart_data in enumerate(charts):
            data = chart_data.get('data', {})
            chart_options = chart_data.get('options', {})
            
            # Convert to pandas DataFrame if necessary
            if isinstance(data, list) and all(isinstance(item, dict) for item in data):
                df = pd.DataFrame(data)
            elif isinstance(data, dict) and 'x' in data and 'y' in data:
                df = pd.DataFrame({'x': data['x'], 'y': data['y']})
            else:
                continue
            
            # Create trace based on chart type
            chart_type = chart_options.get('type', 'bar')
            row = (i // cols) + 1
            col = (i % cols) + 1
            
            if chart_type == 'bar':
                fig.add_trace(go.Bar(x=df['x'], y=df['y'], name=chart_options.get('title', f'Chart {i+1}')), row=row, col=col)
            elif chart_type == 'line':
                fig.add_trace(go.Scatter(x=df['x'], y=df['y'], mode='lines', name=chart_options.get('title', f'Chart {i+1}')), row=row, col=col)
            elif chart_type == 'scatter':
                fig.add_trace(go.Scatter(x=df['x'], y=df['y'], mode='markers', name=chart_options.get('title', f'Chart {i+1}')), row=row, col=col)
            elif chart_type == 'area':
                fig.add_trace(go.Scatter(x=df['x'], y=df['y'], mode='lines', fill='tozeroy', name=chart_options.get('title', f'Chart {i+1}')), row=row, col=col)
            else:
                fig.add_trace(go.Bar(x=df['x'], y=df['y'], name=chart_options.get('title', f'Chart {i+1}')), row=row, col=col)
        
        # Update layout
        fig.update_layout(
            title=options.get('title', 'Dashboard'),
            width=options.get('width', 1200),
            height=options.get('height', 800),
            showlegend=True
        )
        
        # Save figure
        format = options.get('format', 'html')
        
        if format == 'html':
            fig.write_html(dashboard_path)
        else:
            fig.write_image(dashboard_path)
        
        return {
            'success': True,
            'dashboard_path': dashboard_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    data_path = sys.argv[1]
    dashboard_path = sys.argv[2]
    options = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    
    result = generate_dashboard(data_path, dashboard_path, options)
    print(json.dumps(result))
`;

      fs.writeFileSync(scriptPath, scriptContent);

      // Run Python script
      const result = await this.runPythonScript(scriptPath, [
        dataPath,
        dashboardPath,
        JSON.stringify(options)
      ]);

      // Parse result
      try {
        const parsedResult = JSON.parse(result);
        
        if (!parsedResult.success) {
          throw new Error(parsedResult.error || 'Failed to generate dashboard');
        }
        
        return dashboardPath;
      } catch (error) {
        console.error('Error parsing dashboard generation result:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error generating dashboard with Python:', error);
      throw error;
    }
  }

  /**
   * Generate a report with Python
   * @param {object} data - Report data
   * @param {object} options - Report options
   * @returns {Promise<string>} - Report file path
   */
  async generateReportWithPython(data, options) {
    try {
      console.log('Generating report with Python...');

      // Create Python script
      const scriptPath = path.join(this.options.tempDir, 'generate_report.py');
      const dataPath = path.join(this.options.tempDir, `report_data_${Date.now()}.json`);
      const reportPath = path.join(this.options.resultsDir, `report_${Date.now()}.${options.format}`);

      // Save data to file
      fs.writeFileSync(dataPath, JSON.stringify(data));

      // Create Python script
      const scriptContent = `
import json
import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import tempfile

def generate_report(data_path, report_path, options):
    try:
        # Load data
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        # Create PDF document
        doc = SimpleDocTemplate(report_path, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Create content
        content = []
        
        # Add title
        title_style = styles['Title']
        content.append(Paragraph(options.get('title', 'Report'), title_style))
        content.append(Spacer(1, 12))
        
        # Add subtitle
        if 'subtitle' in options:
            subtitle_style = styles['Heading2']
            content.append(Paragraph(options['subtitle'], subtitle_style))
            content.append(Spacer(1, 12))
        
        # Add description
        if 'description' in options:
            content.append(Paragraph(options['description'], styles['Normal']))
            content.append(Spacer(1, 12))
        
        # Add sections
        if 'sections' in data:
            for section in data['sections']:
                # Add section title
                section_title = section.get('title', 'Section')
                content.append(Paragraph(section_title, styles['Heading2']))
                content.append(Spacer(1, 6))
                
                # Add section content
                if 'content' in section:
                    content.append(Paragraph(section['content'], styles['Normal']))
                    content.append(Spacer(1, 12))
                
                # Add section table
                if 'table' in section:
                    table_data = section['table']
                    if 'headers' in table_data and 'rows' in table_data:
                        table = [table_data['headers']] + table_data['rows']
                        t = Table(table)
                        t.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                            ('GRID', (0, 0), (-1, -1), 1, colors.black)
                        ]))
                        content.append(t)
                        content.append(Spacer(1, 12))
                
                # Add section chart
                if 'chart' in section:
                    chart_data = section['chart']
                    chart_type = chart_data.get('type', 'bar')
                    
                    # Create temporary image file
                    temp_img = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                    temp_img.close()
                    
                    # Create chart
                    if 'x' in chart_data and 'y' in chart_data:
                        if chart_type == 'bar':
                            fig = px.bar(x=chart_data['x'], y=chart_data['y'], title=chart_data.get('title', 'Chart'))
                        elif chart_type == 'line':
                            fig = px.line(x=chart_data['x'], y=chart_data['y'], title=chart_data.get('title', 'Chart'))
                        elif chart_type == 'scatter':
                            fig = px.scatter(x=chart_data['x'], y=chart_data['y'], title=chart_data.get('title', 'Chart'))
                        elif chart_type == 'pie':
                            fig = px.pie(values=chart_data['y'], names=chart_data['x'], title=chart_data.get('title', 'Chart'))
                        else:
                            fig = px.bar(x=chart_data['x'], y=chart_data['y'], title=chart_data.get('title', 'Chart'))
                        
                        # Save chart as image
                        fig.write_image(temp_img.name)
                        
                        # Add image to content
                        img = Image(temp_img.name, width=400, height=300)
                        content.append(img)
                        content.append(Spacer(1, 12))
                        
                        # Clean up temporary file
                        os.unlink(temp_img.name)
        
        # Build PDF
        doc.build(content)
        
        return {
            'success': True,
            'report_path': report_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    data_path = sys.argv[1]
    report_path = sys.argv[2]
    options = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    
    result = generate_report(data_path, report_path, options)
    print(json.dumps(result))
`;

      fs.writeFileSync(scriptPath, scriptContent);

      // Run Python script
      const result = await this.runPythonScript(scriptPath, [
        dataPath,
        reportPath,
        JSON.stringify(options)
      ]);

      // Parse result
      try {
        const parsedResult = JSON.parse(result);
        
        if (!parsedResult.success) {
          throw new Error(parsedResult.error || 'Failed to generate report');
        }
        
        return reportPath;
      } catch (error) {
        console.error('Error parsing report generation result:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error generating report with Python:', error);
      throw error;
    }
  }

  /**
   * Run a Python script
   * @param {string} scriptPath - Path to the Python script
   * @param {Array} args - Arguments to pass to the script
   * @returns {Promise<string>} - Script output
   */
  async runPythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.options.pythonCommand, [scriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get mock chart results for testing
   * @param {object} data - Chart data
   * @param {object} options - Chart options
   * @returns {object} - Mock chart results
   */
  getMockChartResults(data, options) {
    console.log('Using mock data for chart generation');
    
    const chartPath = path.join(this.options.resultsDir, `mock_chart_${Date.now()}.${options.format}`);
    
    // Create a mock chart file
    fs.writeFileSync(chartPath, 'Mock chart file');
    
    return {
      success: true,
      chartPath,
      chartUrl: `/charts/${path.basename(chartPath)}`,
      chartOptions: options,
      mockData: true
    };
  }

  /**
   * Get mock dashboard results for testing
   * @param {Array} charts - Array of chart data and options
   * @param {object} options - Dashboard options
   * @returns {object} - Mock dashboard results
   */
  getMockDashboardResults(charts, options) {
    console.log('Using mock data for dashboard generation');
    
    const dashboardPath = path.join(this.options.resultsDir, `mock_dashboard_${Date.now()}.${options.format}`);
    
    // Create a mock dashboard file
    fs.writeFileSync(dashboardPath, 'Mock dashboard file');
    
    return {
      success: true,
      dashboardPath,
      dashboardUrl: `/dashboards/${path.basename(dashboardPath)}`,
      dashboardOptions: options,
      mockData: true
    };
  }

  /**
   * Get mock report results for testing
   * @param {object} data - Report data
   * @param {object} options - Report options
   * @returns {object} - Mock report results
   */
  getMockReportResults(data, options) {
    console.log('Using mock data for report generation');
    
    const reportPath = path.join(this.options.resultsDir, `mock_report_${Date.now()}.${options.format}`);
    
    // Create a mock report file
    fs.writeFileSync(reportPath, 'Mock report file');
    
    return {
      success: true,
      reportPath,
      reportUrl: `/reports/${path.basename(reportPath)}`,
      reportOptions: options,
      mockData: true
    };
  }
}

// Color palettes for consistent visualization design
const colorPalettes = {
  primary: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8AB4F8', '#137333', '#A8DAB5'],
  secondary: ['#1A73E8', '#1E8E3E', '#F9AB00', '#D93025', '#669DF6', '#0D652D', '#81C995'],
  neutral: ['#202124', '#3C4043', '#5F6368', '#80868B', '#9AA0A6', '#BDC1C6', '#DADCE0', '#E8EAED'],
  blue: ['#E8F0FE', '#D2E3FC', '#AECBFA', '#8AB4F8', '#4285F4', '#1A73E8', '#1967D2', '#174EA6'],
  green: ['#E6F4EA', '#CEEAD6', '#A8DAB5', '#81C995', '#34A853', '#1E8E3E', '#188038', '#137333'],
  red: ['#FCE8E6', '#FADAD9', '#F6AEA9', '#F28B82', '#EA4335', '#D93025', '#C5221F', '#A50E0E'],
  yellow: ['#FEF7E0', '#FDE293', '#FDD663', '#FDC33F', '#FBBC04', '#F9AB00', '#F29900', '#EA8600']
};

/**
 * Generate a pie chart
 * @param {Array} data - Array of data objects with name, value, and optional color properties
 * @param {Object} options - Chart options
 * @returns {Object} - Pie chart configuration
 */
function generatePieChart(data, options = {}) {
  const {
    title = 'Distribution',
    showLegend = true,
    usePercentages = true,
    colorPalette = colorPalettes.primary,
    donut = false,
    sortData = true
  } = options;

  // Sort data by value if requested
  const chartData = sortData 
    ? [...data].sort((a, b) => b.value - a.value) 
    : [...data];
  
  // Assign colors if not provided
  chartData.forEach((item, index) => {
    if (!item.color) {
      item.color = colorPalette[index % colorPalette.length];
    }
  });

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Format data for chart
  const formattedData = chartData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: ((item.value / total) * 100).toFixed(1) + '%',
    color: item.color,
    // Include formatted values for display
    displayValue: usePercentages 
      ? ((item.value / total) * 100).toFixed(1) + '%' 
      : item.value.toLocaleString()
  }));

  return {
    type: donut ? 'donut' : 'pie',
    title,
    showLegend,
    data: formattedData,
    options: {
      innerRadius: donut ? 0.6 : 0,
      padAngle: 0.02,
      cornerRadius: 4,
      total,
      usePercentages
    }
  };
}

/**
 * Generate a bar chart
 * @param {Array} data - Array of data objects with name, value, and optional color properties
 * @param {Object} options - Chart options
 * @returns {Object} - Bar chart configuration
 */
function generateBarChart(data, options = {}) {
  const {
    title = 'Comparison',
    horizontal = false,
    stacked = false,
    showValues = true,
    colorPalette = colorPalettes.primary,
    sortData = true,
    maxBars = 10
  } = options;

  // Sort and limit data if requested
  let chartData = sortData 
    ? [...data].sort((a, b) => b.value - a.value) 
    : [...data];
  
  // Limit number of bars if necessary
  if (chartData.length > maxBars) {
    const otherData = chartData.slice(maxBars - 1);
    const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);
    
    chartData = chartData.slice(0, maxBars - 1);
    chartData.push({
      name: 'Other',
      value: otherValue,
      color: colorPalettes.neutral[3]
    });
  }
  
  // Assign colors if not provided
  chartData.forEach((item, index) => {
    if (!item.color) {
      item.color = colorPalette[index % colorPalette.length];
    }
  });
  
  return {
    type: 'bar',
    title,
    data: chartData,
    options: {
      horizontal,
      stacked,
      showValues,
      valueFormatter: (value) => value.toLocaleString(),
      axisOptions: {
        x: {
          label: horizontal ? 'Value' : 'Categories',
          showGrid: horizontal
        },
        y: {
          label: horizontal ? 'Categories' : 'Value',
          showGrid: !horizontal
        }
      }
    }
  };
}

/**
 * Generate a line chart
 * @param {Array} data - Array of data points with date and value properties
 * @param {Object} options - Chart options
 * @returns {Object} - Line chart configuration
 */
function generateLineChart(data, options = {}) {
  const {
    title = 'Trend',
    showPoints = true,
    smooth = true,
    fillArea = false,
    colorPalette = colorPalettes.blue,
    yAxisMin = null,
    dateFormat = 'yyyy-MM-dd',
    multiSeries = false,
    series = null,
    showLegend = true
  } = options;

  // For single series data
  if (!multiSeries) {
    // Ensure data is sorted by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      type: 'line',
      title,
      data: sortedData,
      options: {
        showPoints,
        smooth,
        fillArea,
        color: colorPalette[4],
        yAxisMin,
        dateFormat,
        showLegend: false,
        axisOptions: {
          x: {
            label: 'Date',
            type: 'time'
          },
          y: {
            label: 'Value',
            min: yAxisMin
          }
        }
      }
    };
  }
  
  // For multi-series data
  if (!series || !Array.isArray(series)) {
    throw new Error('Series array must be provided for multi-series line chart');
  }
  
  // Format each series
  const formattedSeries = series.map((seriesData, index) => ({
    name: seriesData.name,
    data: [...seriesData.data].sort((a, b) => new Date(a.date) - new Date(b.date)),
    color: seriesData.color || colorPalette[index % colorPalette.length]
  }));
  
  return {
    type: 'line',
    title,
    series: formattedSeries,
    options: {
      showPoints,
      smooth,
      fillArea,
      dateFormat,
      showLegend,
      multiSeries: true,
      yAxisMin,
      axisOptions: {
        x: {
          label: 'Date',
          type: 'time'
        },
        y: {
          label: 'Value',
          min: yAxisMin
        }
      }
    }
  };
}

/**
 * Generate a treemap chart
 * @param {Array} data - Array of data objects with name, value, and optional color properties
 * @param {Object} options - Chart options
 * @returns {Object} - Treemap chart configuration
 */
function generateTreemapChart(data, options = {}) {
  const {
    title = 'Allocation',
    showValues = true,
    colorPalette = colorPalettes.primary,
    valueFormatter = null,
    includeTotals = true
  } = options;

  // Calculate total for percentages
  const total = includeTotals 
    ? data.reduce((sum, item) => sum + item.value, 0) 
    : null;
  
  // Format data for chart
  const formattedData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    percentage: total ? ((item.value / total) * 100).toFixed(1) + '%' : null,
    color: item.color || colorPalette[index % colorPalette.length],
    displayValue: valueFormatter 
      ? valueFormatter(item.value) 
      : (total ? ((item.value / total) * 100).toFixed(1) + '%' : item.value.toLocaleString())
  }));

  return {
    type: 'treemap',
    title,
    data: formattedData,
    options: {
      showValues,
      valueFormatter: valueFormatter || (value => value.toLocaleString()),
      total,
      paddingInner: 1,
      paddingOuter: 4,
      roundCorners: true
    }
  };
}

/**
 * Generate a gauge chart
 * @param {Number} value - Current value
 * @param {Object} options - Chart options
 * @returns {Object} - Gauge chart configuration
 */
function generateGaugeChart(value, options = {}) {
  const {
    title = 'Gauge',
    min = 0,
    max = 100,
    thresholds = [
      { value: 25, color: colorPalettes.red[4] },
      { value: 50, color: colorPalettes.yellow[4] },
      { value: 75, color: colorPalettes.green[4] },
      { value: 100, color: colorPalettes.green[5] }
    ],
    valueFormatter = null,
    valueLabel = 'Value',
    showThresholdLabels = true
  } = options;

  // Find the appropriate color based on the value and thresholds
  let color = thresholds[0].color;
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i].value) {
      color = thresholds[i].color;
      break;
    }
  }

  return {
    type: 'gauge',
    title,
    value,
    options: {
      min,
      max,
      color,
      thresholds,
      valueFormatter: valueFormatter || (value => value.toLocaleString()),
      valueLabel,
      showThresholdLabels
    }
  };
}

/**
 * Generate a radar chart for comparing multiple metrics across categories
 * @param {Array} categories - Array of category names
 * @param {Array} series - Array of data series, each with a name, color, and values array
 * @param {Object} options - Chart options
 * @returns {Object} - Radar chart configuration
 */
function generateRadarChart(categories, series, options = {}) {
  const {
    title = 'Comparison',
    maxValue = null,
    showLegend = true,
    colorPalette = colorPalettes.primary,
    fillOpacity = 0.2,
    showLabels = true
  } = options;

  // Format series with colors if not provided
  const formattedSeries = series.map((seriesData, index) => ({
    name: seriesData.name,
    values: seriesData.values,
    color: seriesData.color || colorPalette[index % colorPalette.length],
    fillOpacity: seriesData.fillOpacity || fillOpacity
  }));

  return {
    type: 'radar',
    title,
    categories,
    series: formattedSeries,
    options: {
      maxValue,
      showLegend,
      showLabels,
      startAngle: 0,
      levels: 5
    }
  };
}

/**
 * Generate portfolio allocation visualization
 * @param {String} portfolioId - Portfolio ID
 * @param {Object} options - Visualization options
 * @returns {Object} - Portfolio allocation visualization
 */
function generatePortfolioAllocation(portfolioId, options = {}) {
  try {
    // Get portfolio data
    const { data } = portfolioVisualizationService.generatePortfolioVisualization(portfolioId, options);
    
    if (!data) {
      throw new Error('Portfolio data not available');
    }
    
    // Generate visualization config
    const assetAllocationChart = generatePieChart(data.assetAllocation, {
      title: 'Asset Allocation',
      donut: options.donutCharts || false
    });
    
    const sectorAllocationChart = generatePieChart(data.sectorAllocation, {
      title: 'Sector Allocation',
      donut: options.donutCharts || false
    });
    
    const geographicDistributionChart = generatePieChart(data.geographicDistribution, {
      title: 'Geographic Distribution',
      donut: options.donutCharts || false
    });
    
    const topHoldingsChart = generateBarChart(data.topHoldings.map(holding => ({
      name: holding.name,
      value: holding.percentage,
      rawValue: holding.value,
      color: colorPalettes.blue[3]
    })), {
      title: 'Top Holdings',
      horizontal: true,
      showValues: true,
      valueFormatter: value => value + '%'
    });
    
    const performanceHistoryChart = generateLineChart(data.performanceHistory, {
      title: 'Performance History',
      showPoints: false,
      fillArea: true,
      yAxisMin: 0
    });
    
    // Combine visualizations
    return {
      portfolioId: data.portfolioId,
      name: data.name,
      charts: {
        assetAllocation: assetAllocationChart,
        sectorAllocation: sectorAllocationChart,
        geographicDistribution: geographicDistributionChart,
        topHoldings: topHoldingsChart,
        performanceHistory: performanceHistoryChart
      },
      summary: {
        totalValue: data.performanceHistory[data.performanceHistory.length - 1].value,
        assetClasses: data.assetAllocation.length,
        totalHoldings: data.topHoldings.length,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error generating portfolio allocation visualization:', error.message);
    return {
      error: 'Failed to generate portfolio allocation visualization',
      message: error.message
    };
  }
}

/**
 * Generate portfolio comparison visualization
 * @param {Array} portfolioIds - Array of portfolio IDs
 * @param {Object} options - Visualization options
 * @returns {Object} - Portfolio comparison visualization
 */
function generatePortfolioComparison(portfolioIds, options = {}) {
  try {
    if (!portfolioIds || !Array.isArray(portfolioIds) || portfolioIds.length < 2) {
      throw new Error('At least two portfolio IDs are required for comparison');
    }
    
    // Get portfolio data for each ID
    const portfolios = portfolioIds.map(id => {
      const { data } = portfolioVisualizationService.generatePortfolioVisualization(id, options);
      return {
        id,
        name: data.name,
        data
      };
    });
    
    // Generate asset allocation comparison
    const assetAllocationSeries = portfolios.map((portfolio, index) => ({
      name: portfolio.name,
      values: portfolio.data.assetAllocation.map(asset => asset.value),
      color: colorPalettes.primary[index % colorPalettes.primary.length]
    }));
    
    const assetAllocationCategories = [...new Set(
      portfolios.flatMap(p => p.data.assetAllocation.map(a => a.name))
    )];
    
    const assetAllocationRadar = generateRadarChart(
      assetAllocationCategories,
      assetAllocationSeries,
      { title: 'Asset Allocation Comparison' }
    );
    
    // Generate performance comparison
    const performanceSeries = portfolios.map((portfolio, index) => ({
      name: portfolio.name,
      data: portfolio.data.performanceHistory,
      color: colorPalettes.primary[index % colorPalettes.primary.length]
    }));
    
    const performanceChart = generateLineChart([], {
      title: 'Performance Comparison',
      multiSeries: true,
      series: performanceSeries,
      showPoints: false
    });
    
    // Generate risk metrics comparison
    const riskMetricsCategories = ['Beta', 'Sharpe Ratio', 'Volatility', 'Max Drawdown'];
    
    const riskMetricsSeries = portfolios.map((portfolio, index) => {
      const metrics = portfolio.data.riskMetrics || {};
      return {
        name: portfolio.name,
        values: [
          parseFloat(metrics.beta || 1),
          parseFloat(metrics.sharpeRatio || 1),
          parseFloat((metrics.volatility || '10%').replace('%', '')),
          parseFloat((metrics.maxDrawdown || '15%').replace('%', ''))
        ],
        color: colorPalettes.primary[index % colorPalettes.primary.length]
      };
    });
    
    const riskMetricsRadar = generateRadarChart(
      riskMetricsCategories,
      riskMetricsSeries,
      { title: 'Risk Metrics Comparison' }
    );
    
    // Combine visualizations
    return {
      portfolioIds,
      portfolioNames: portfolios.map(p => p.name),
      charts: {
        assetAllocation: assetAllocationRadar,
        performance: performanceChart,
        riskMetrics: riskMetricsRadar
      },
      summary: portfolios.map(portfolio => ({
        id: portfolio.id,
        name: portfolio.name,
        totalValue: portfolio.data.performanceHistory[portfolio.data.performanceHistory.length - 1].value,
        topHolding: portfolio.data.topHoldings[0]?.name || 'N/A',
        riskLevel: portfolio.data.riskMetrics?.riskLevel || 'N/A'
      }))
    };
  } catch (error) {
    console.error('Error generating portfolio comparison visualization:', error.message);
    return {
      error: 'Failed to generate portfolio comparison visualization',
      message: error.message
    };
  }
}

/**
 * Generate performance tracking visualization
 * @param {String} portfolioId - Portfolio ID
 * @param {Object} options - Visualization options
 * @returns {Object} - Performance tracking visualization
 */
function generatePerformanceTracking(portfolioId, options = {}) {
  try {
    // Get portfolio data
    const { data } = portfolioVisualizationService.generatePortfolioVisualization(portfolioId, options);
    
    if (!data) {
      throw new Error('Portfolio data not available');
    }
    
    // Calculate performance metrics
    const performanceHistory = data.performanceHistory;
    const startValue = performanceHistory[0].value;
    const currentValue = performanceHistory[performanceHistory.length - 1].value;
    const absoluteReturn = currentValue - startValue;
    const percentageReturn = ((currentValue / startValue) - 1) * 100;
    
    // Generate performance chart
    const performanceChart = generateLineChart(performanceHistory, {
      title: 'Portfolio Value Over Time',
      showPoints: false,
      fillArea: true,
      yAxisMin: 0
    });
    
    // Calculate monthly returns
    const monthlyReturns = [];
    for (let i = 1; i < performanceHistory.length; i++) {
      const prevDate = new Date(performanceHistory[i-1].date);
      const currDate = new Date(performanceHistory[i].date);
      
      if (prevDate.getMonth() !== currDate.getMonth() || prevDate.getFullYear() !== currDate.getFullYear()) {
        const monthReturn = ((performanceHistory[i].value / performanceHistory[i-1].value) - 1) * 100;
        
        monthlyReturns.push({
          date: performanceHistory[i].date,
          value: monthReturn,
          positive: monthReturn >= 0
        });
      }
    }
    
    // Generate monthly returns chart
    const monthlyReturnsChart = generateBarChart(monthlyReturns.map(item => ({
      name: item.date,
      value: item.value,
      color: item.positive ? colorPalettes.green[4] : colorPalettes.red[4]
    })), {
      title: 'Monthly Returns (%)',
      showValues: true,
      valueFormatter: value => value.toFixed(2) + '%'
    });
    
    // Calculate annualized return
    const firstDate = new Date(performanceHistory[0].date);
    const lastDate = new Date(performanceHistory[performanceHistory.length - 1].date);
    const yearDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365);
    const annualizedReturn = (Math.pow((currentValue / startValue), (1 / yearDiff)) - 1) * 100;
    
    // Generate gauge for annualized return
    const returnGauge = generateGaugeChart(annualizedReturn, {
      title: 'Annualized Return',
      min: -10,
      max: 20,
      thresholds: [
        { value: 0, color: colorPalettes.red[4] },
        { value: 5, color: colorPalettes.yellow[4] },
        { value: 10, color: colorPalettes.green[3] },
        { value: 20, color: colorPalettes.green[5] }
      ],
      valueFormatter: value => value.toFixed(2) + '%',
      valueLabel: 'Annual Return'
    });
    
    // Combine visualizations
    return {
      portfolioId: data.portfolioId,
      name: data.name,
      charts: {
        performanceHistory: performanceChart,
        monthlyReturns: monthlyReturnsChart,
        annualizedReturn: returnGauge
      },
      metrics: {
        startValue,
        currentValue,
        absoluteReturn,
        percentageReturn: percentageReturn.toFixed(2) + '%',
        annualizedReturn: annualizedReturn.toFixed(2) + '%',
        startDate: performanceHistory[0].date,
        endDate: performanceHistory[performanceHistory.length - 1].date
      }
    };
  } catch (error) {
    console.error('Error generating performance tracking visualization:', error.message);
    return {
      error: 'Failed to generate performance tracking visualization',
      message: error.message
    };
  }
}

/**
 * Generate sector and asset type allocation charts
 * @param {String} portfolioId - Portfolio ID
 * @param {Object} options - Visualization options
 * @returns {Object} - Sector and asset type allocation visualizations
 */
function generateAllocationCharts(portfolioId, options = {}) {
  try {
    // Get portfolio data
    const { data } = portfolioVisualizationService.generatePortfolioVisualization(portfolioId, options);
    
    if (!data) {
      throw new Error('Portfolio data not available');
    }
    
    // Generate asset allocation chart
    const assetAllocationChart = generatePieChart(data.assetAllocation, {
      title: 'Asset Type Allocation',
      donut: options.donutCharts || false
    });
    
    // Generate sector allocation chart
    const sectorAllocationChart = generatePieChart(data.sectorAllocation, {
      title: 'Sector Allocation',
      donut: options.donutCharts || false
    });
    
    // Generate geographic distribution chart
    const geographicDistributionChart = generatePieChart(data.geographicDistribution, {
      title: 'Geographic Distribution',
      donut: options.donutCharts || false
    });
    
    // Generate treemap for combined visualization
    const allocationTreemap = generateTreemapChart(
      data.sectorAllocation.map((sector, index) => ({
        name: sector.name,
        value: sector.value,
        color: colorPalettes.blue[3 + (index % 5)]
      })),
      {
        title: 'Sector Allocation Treemap',
        valueFormatter: value => value + '%'
      }
    );
    
    // Combine visualizations
    return {
      portfolioId: data.portfolioId,
      name: data.name,
      charts: {
        assetAllocation: assetAllocationChart,
        sectorAllocation: sectorAllocationChart,
        geographicDistribution: geographicDistributionChart,
        allocationTreemap: allocationTreemap
      },
      summary: {
        totalValue: data.performanceHistory[data.performanceHistory.length - 1].value,
        largestAssetClass: data.assetAllocation[0].name,
        largestSector: data.sectorAllocation[0].name,
        largestRegion: data.geographicDistribution[0].name
      }
    };
  } catch (error) {
    console.error('Error generating allocation charts:', error.message);
    return {
      error: 'Failed to generate allocation charts',
      message: error.message
    };
  }
}

/**
 * Format financial data for visualization
 * @param {Number} value - Value to format
 * @param {String} format - Format type (currency, percentage, number)
 * @param {String} locale - Locale for formatting (default: 'en-US')
 * @returns {String} - Formatted value
 */
function formatFinancialData(value, format = 'number', locale = 'en-US') {
  if (value === undefined || value === null) {
    return '--';
  }
  
  try {
    switch (format.toLowerCase()) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
        
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(value / 100);
        
      case 'decimal':
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
        
      default:
        return new Intl.NumberFormat(locale).format(value);
    }
  } catch (error) {
    console.error('Error formatting financial data:', error.message);
    return value.toString();
  }
}

/**
 * Generate mock data for testing charts
 * @param {String} chartType - Chart type (pie, bar, line, treemap, gauge, radar)
 * @returns {Object} - Mock data for the specified chart type
 */
function generateMockData(chartType) {
  switch (chartType) {
    case 'pie':
      return generatePieChart([
        { name: 'Stocks', value: 60 },
        { name: 'Bonds', value: 25 },
        { name: 'Cash', value: 10 },
        { name: 'Alternatives', value: 5 }
      ], { title: 'Asset Allocation (Mock)' });
      
    case 'bar':
      return generateBarChart([
        { name: 'Apple', value: 15 },
        { name: 'Microsoft', value: 12 },
        { name: 'Amazon', value: 10 },
        { name: 'Google', value: 8 },
        { name: 'Tesla', value: 5 }
      ], { title: 'Top Holdings (Mock)', horizontal: true });
      
    case 'line':
      const mockData = [];
      const today = new Date();
      for (let i = 0; i < 12; i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - (11 - i));
        mockData.push({
          date: date.toISOString().split('T')[0],
          value: 1000000 * (1 + (i * 0.02)) * (1 + (Math.random() * 0.04 - 0.02))
        });
      }
      return generateLineChart(mockData, { title: 'Performance (Mock)' });
      
    case 'treemap':
      return generateTreemapChart([
        { name: 'Technology', value: 35 },
        { name: 'Financial Services', value: 15 },
        { name: 'Healthcare', value: 12 },
        { name: 'Consumer Cyclical', value: 10 },
        { name: 'Communication Services', value: 8 },
        { name: 'Industrials', value: 7 },
        { name: 'Consumer Defensive', value: 6 },
        { name: 'Utilities', value: 4 },
        { name: 'Other', value: 3 }
      ], { title: 'Sector Allocation (Mock)' });
      
    case 'gauge':
      return generateGaugeChart(72, { title: 'Portfolio Health (Mock)' });
      
    case 'radar':
      return generateRadarChart(
        ['Growth', 'Value', 'Income', 'Quality', 'Momentum'],
        [
          { name: 'Portfolio 1', values: [80, 60, 40, 70, 50] },
          { name: 'Portfolio 2', values: [50, 80, 70, 40, 60] }
        ],
        { title: 'Portfolio Characteristics (Mock)' }
      );
      
    default:
      return { error: 'Unknown chart type', message: `Chart type '${chartType}' is not supported` };
  }
}

// Create and export an instance of the AdvancedDataVisualization class
const advancedVisualization = new AdvancedDataVisualization();

// Export functions
module.exports = {
  // Chart generation functions
  generatePieChart,
  generateBarChart,
  generateLineChart,
  generateTreemapChart,
  generateGaugeChart,
  generateRadarChart,
  
  // Financial visualization functions
  generatePortfolioAllocation,
  generatePortfolioComparison,
  generatePerformanceTracking,
  generateAllocationCharts,
  
  // Advanced visualization instance
  advancedVisualization,
  
  // Utility functions
  formatFinancialData,
  generateMockData,
  
  // Color palettes
  colorPalettes
};