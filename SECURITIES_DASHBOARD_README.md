# Securities Extraction Monitoring Dashboard

This dashboard provides real-time monitoring and analytics for the Enhanced Securities Extractor. It tracks extraction performance, success/failure rates, resource usage, and other important metrics to help administrators monitor the system's health and identify issues.

## Features

- **Extraction Metrics**: Track the success rate, processing time, and extraction quality of securities extraction jobs.
- **Error Analysis**: Monitor and analyze extraction errors to identify common issues and areas for improvement.
- **Resource Usage**: Track memory and CPU usage to optimize system performance.
- **Cache Performance**: Monitor cache hit/miss rates to optimize caching strategies.
- **Queue Status**: View the current document processing queue to identify bottlenecks.
- **Tenant-Specific Metrics**: Analyze performance for individual tenants in multi-tenant deployments.
- **Filtering Capabilities**: Filter metrics by time period, document type, tenant, and more.
- **Alerting**: Get notified of critical issues that require attention.

## Installation

The Securities Extraction Monitoring Dashboard is integrated with the Enhanced Securities Extractor and shares its dependencies. No additional installation is required.

## Usage

### Starting the Dashboard Server

To start the monitoring dashboard server, run:

```bash
python run_securities_dashboard.py
```

By default, the server will listen on all interfaces (0.0.0.0) on port 5000. You can customize these options:

```bash
python run_securities_dashboard.py --host 127.0.0.1 --port 8080 --debug
```

Available options:

- `--host`: Host to bind the server to (default: 0.0.0.0)
- `--port`: Port to bind the server to (default: 5000)
- `--debug`: Run in debug mode (default: off)

### Accessing the Dashboard

Once the server is running, access the dashboard by navigating to `http://localhost:5000` (or the custom host/port you specified) in your web browser.

## Dashboard Sections

The dashboard is organized into the following sections:

### Overview

Provides a high-level summary of the extraction system's performance, including:
- Key metrics (total extractions, success rate, processing time)
- Recent alerts and critical issues
- Extraction success rate and processing time trends
- Document type distribution
- Common error types

### Performance

Detailed performance metrics for securities extraction, including:
- Success rate and processing time trends over configurable time periods
- Securities completion rate by document type
- Performance comparison across different document types

### Errors

Analysis of extraction errors, including:
- Error distribution by type
- Detailed error logs with timestamps, document IDs, and error messages

### Documents

List of recent extraction jobs with detailed information about each document processed.

### Resources

Resource usage statistics, including:
- Memory and CPU usage trends
- Resource usage summary statistics

### Tenants

Performance metrics by tenant, useful for multi-tenant deployments.

### Cache

Cache performance metrics, including:
- Hit/miss rates over time
- Cache size trends
- Cache statistics by tenant

### Queue

Document processing queue status, useful for monitoring system load and backlogs.

## Integration with Enhanced Securities Extractor

The dashboard automatically collects metrics from the Enhanced Securities Extractor. The extractor has been instrumented with the `@track_extraction_performance` decorator to record performance metrics for each extraction job.

To add monitoring to additional methods, simply add the decorator:

```python
from securities_extraction_monitor import track_extraction_performance

@track_extraction_performance
def your_method():
    # Your code here
```

## Alerts

The dashboard provides alerts for critical issues, including:
- Low success rates
- High processing times
- Resource usage spikes
- Low cache hit rates

## Filtering

Most sections support filtering by:
- Time period
- Document type
- Tenant
- Status (success/error)

## License

This dashboard is part of the Enhanced Securities Extractor project and shares its license.