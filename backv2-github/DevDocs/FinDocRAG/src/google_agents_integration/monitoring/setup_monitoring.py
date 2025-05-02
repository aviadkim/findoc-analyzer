"""
Set up monitoring for FinDocRAG on Google Cloud.

This script sets up monitoring for the FinDocRAG application on Google Cloud,
including logging, metrics, and alerts.
"""
import os
import sys
import argparse
import logging
import subprocess
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_logging(project_id, service_name):
    """
    Set up logging for the application.
    
    Args:
        project_id: Google Cloud project ID
        service_name: Service name
    """
    logger.info("Setting up logging...")
    
    # Create log-based metric for errors
    metric_name = f"{service_name}-errors"
    filter_string = f'resource.type="cloud_run_revision" resource.labels.service_name="{service_name}" severity>=ERROR'
    
    # Check if metric already exists
    result = subprocess.run(
        ["gcloud", "logging", "metrics", "list", "--format=json"],
        capture_output=True,
        text=True,
        check=True
    )
    
    metrics = json.loads(result.stdout)
    metric_exists = any(metric["name"].endswith(metric_name) for metric in metrics)
    
    if not metric_exists:
        # Create metric
        subprocess.run(
            [
                "gcloud", "logging", "metrics", "create", metric_name,
                f"--description=Error logs for {service_name}",
                f"--filter={filter_string}"
            ],
            check=True
        )
        logger.info(f"Created log-based metric: {metric_name}")
    else:
        logger.info(f"Log-based metric already exists: {metric_name}")
    
    # Create log sink to BigQuery for advanced analysis
    sink_name = f"{service_name}-logs"
    dataset_name = f"{service_name.replace('-', '_')}_logs"
    
    # Check if sink already exists
    result = subprocess.run(
        ["gcloud", "logging", "sinks", "list", "--format=json"],
        capture_output=True,
        text=True,
        check=True
    )
    
    sinks = json.loads(result.stdout)
    sink_exists = any(sink["name"].endswith(sink_name) for sink in sinks)
    
    if not sink_exists:
        # Create BigQuery dataset if it doesn't exist
        subprocess.run(
            ["bq", "mk", "--dataset", f"{project_id}:{dataset_name}"],
            capture_output=True,
            check=False  # Ignore errors if dataset already exists
        )
        
        # Create sink
        subprocess.run(
            [
                "gcloud", "logging", "sinks", "create", sink_name,
                f"bigquery.googleapis.com/projects/{project_id}/datasets/{dataset_name}",
                f"--log-filter=resource.type=\"cloud_run_revision\" resource.labels.service_name=\"{service_name}\""
            ],
            check=True
        )
        logger.info(f"Created log sink: {sink_name}")
    else:
        logger.info(f"Log sink already exists: {sink_name}")
    
    logger.info("Logging setup complete.")

def setup_metrics(project_id, service_name):
    """
    Set up metrics for the application.
    
    Args:
        project_id: Google Cloud project ID
        service_name: Service name
    """
    logger.info("Setting up metrics...")
    
    # Create dashboard
    dashboard_name = f"{service_name}-dashboard"
    dashboard_json = {
        "displayName": f"{service_name} Dashboard",
        "gridLayout": {
            "columns": "2",
            "widgets": [
                {
                    "title": "Request Count",
                    "xyChart": {
                        "dataSets": [
                            {
                                "timeSeriesQuery": {
                                    "timeSeriesFilter": {
                                        "filter": f'metric.type="run.googleapis.com/request_count" resource.type="cloud_run_revision" resource.label.service_name="{service_name}"',
                                        "aggregation": {
                                            "alignmentPeriod": "60s",
                                            "perSeriesAligner": "ALIGN_RATE",
                                            "crossSeriesReducer": "REDUCE_SUM",
                                            "groupByFields": [
                                                "resource.label.service_name"
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "title": "Response Latency",
                    "xyChart": {
                        "dataSets": [
                            {
                                "timeSeriesQuery": {
                                    "timeSeriesFilter": {
                                        "filter": f'metric.type="run.googleapis.com/request_latencies" resource.type="cloud_run_revision" resource.label.service_name="{service_name}"',
                                        "aggregation": {
                                            "alignmentPeriod": "60s",
                                            "perSeriesAligner": "ALIGN_PERCENTILE_99",
                                            "crossSeriesReducer": "REDUCE_MEAN",
                                            "groupByFields": [
                                                "resource.label.service_name"
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "title": "Error Count",
                    "xyChart": {
                        "dataSets": [
                            {
                                "timeSeriesQuery": {
                                    "timeSeriesFilter": {
                                        "filter": f'metric.type="logging.googleapis.com/user/{service_name}-errors" resource.type="cloud_run_revision" resource.label.service_name="{service_name}"',
                                        "aggregation": {
                                            "alignmentPeriod": "60s",
                                            "perSeriesAligner": "ALIGN_RATE",
                                            "crossSeriesReducer": "REDUCE_SUM",
                                            "groupByFields": [
                                                "resource.label.service_name"
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "title": "Instance Count",
                    "xyChart": {
                        "dataSets": [
                            {
                                "timeSeriesQuery": {
                                    "timeSeriesFilter": {
                                        "filter": f'metric.type="run.googleapis.com/container/instance_count" resource.type="cloud_run_revision" resource.label.service_name="{service_name}"',
                                        "aggregation": {
                                            "alignmentPeriod": "60s",
                                            "perSeriesAligner": "ALIGN_MEAN",
                                            "crossSeriesReducer": "REDUCE_SUM",
                                            "groupByFields": [
                                                "resource.label.service_name"
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    
    # Write dashboard JSON to file
    dashboard_file = "dashboard.json"
    with open(dashboard_file, "w") as f:
        json.dump(dashboard_json, f)
    
    # Create dashboard using gcloud
    try:
        subprocess.run(
            [
                "gcloud", "monitoring", "dashboards", "create",
                "--config-from-file", dashboard_file
            ],
            check=True
        )
        logger.info(f"Created dashboard: {dashboard_name}")
    except subprocess.CalledProcessError:
        logger.warning(f"Failed to create dashboard: {dashboard_name}")
    
    # Clean up
    os.remove(dashboard_file)
    
    logger.info("Metrics setup complete.")

def setup_alerts(project_id, service_name, notification_channels=None):
    """
    Set up alerts for the application.
    
    Args:
        project_id: Google Cloud project ID
        service_name: Service name
        notification_channels: List of notification channel IDs
    """
    logger.info("Setting up alerts...")
    
    # Create error rate alert
    alert_name = f"{service_name}-error-rate"
    filter_string = f'metric.type="logging.googleapis.com/user/{service_name}-errors" resource.type="cloud_run_revision" resource.label.service_name="{service_name}"'
    
    # Create alert policy JSON
    alert_policy = {
        "displayName": f"{service_name} Error Rate",
        "conditions": [
            {
                "displayName": "Error Rate > 0.1 per second",
                "conditionThreshold": {
                    "filter": filter_string,
                    "aggregations": [
                        {
                            "alignmentPeriod": "60s",
                            "perSeriesAligner": "ALIGN_RATE"
                        }
                    ],
                    "comparison": "COMPARISON_GT",
                    "thresholdValue": 0.1,
                    "duration": "0s",
                    "trigger": {
                        "count": 1
                    }
                }
            }
        ],
        "alertStrategy": {
            "autoClose": "604800s"
        },
        "combiner": "OR"
    }
    
    # Add notification channels if provided
    if notification_channels:
        alert_policy["notificationChannels"] = notification_channels
    
    # Write alert policy JSON to file
    alert_file = "alert_policy.json"
    with open(alert_file, "w") as f:
        json.dump(alert_policy, f)
    
    # Create alert policy using gcloud
    try:
        subprocess.run(
            [
                "gcloud", "alpha", "monitoring", "policies", "create",
                "--policy-from-file", alert_file
            ],
            check=True
        )
        logger.info(f"Created alert policy: {alert_name}")
    except subprocess.CalledProcessError:
        logger.warning(f"Failed to create alert policy: {alert_name}")
    
    # Clean up
    os.remove(alert_file)
    
    # Create latency alert
    alert_name = f"{service_name}-latency"
    filter_string = f'metric.type="run.googleapis.com/request_latencies" resource.type="cloud_run_revision" resource.label.service_name="{service_name}"'
    
    # Create alert policy JSON
    alert_policy = {
        "displayName": f"{service_name} High Latency",
        "conditions": [
            {
                "displayName": "99th Percentile Latency > 2s",
                "conditionThreshold": {
                    "filter": filter_string,
                    "aggregations": [
                        {
                            "alignmentPeriod": "60s",
                            "perSeriesAligner": "ALIGN_PERCENTILE_99"
                        }
                    ],
                    "comparison": "COMPARISON_GT",
                    "thresholdValue": 2000,  # 2 seconds in ms
                    "duration": "300s",  # 5 minutes
                    "trigger": {
                        "count": 1
                    }
                }
            }
        ],
        "alertStrategy": {
            "autoClose": "604800s"
        },
        "combiner": "OR"
    }
    
    # Add notification channels if provided
    if notification_channels:
        alert_policy["notificationChannels"] = notification_channels
    
    # Write alert policy JSON to file
    alert_file = "alert_policy.json"
    with open(alert_file, "w") as f:
        json.dump(alert_policy, f)
    
    # Create alert policy using gcloud
    try:
        subprocess.run(
            [
                "gcloud", "alpha", "monitoring", "policies", "create",
                "--policy-from-file", alert_file
            ],
            check=True
        )
        logger.info(f"Created alert policy: {alert_name}")
    except subprocess.CalledProcessError:
        logger.warning(f"Failed to create alert policy: {alert_name}")
    
    # Clean up
    os.remove(alert_file)
    
    logger.info("Alerts setup complete.")

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Set up monitoring for FinDocRAG on Google Cloud")
    parser.add_argument("--project-id", required=True, help="Google Cloud project ID")
    parser.add_argument("--service-name", default="findoc-rag", help="Service name")
    parser.add_argument("--notification-channels", nargs="*", help="Notification channel IDs")
    
    args = parser.parse_args()
    
    # Set up monitoring
    setup_logging(args.project_id, args.service_name)
    setup_metrics(args.project_id, args.service_name)
    setup_alerts(args.project_id, args.service_name, args.notification_channels)
    
    logger.info("Monitoring setup complete.")

if __name__ == "__main__":
    main()
