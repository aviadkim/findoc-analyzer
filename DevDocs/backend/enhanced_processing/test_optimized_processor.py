"""
Test script for optimized document processor.

This script benchmarks the optimized document processor against the standard
implementation to demonstrate performance improvements.
"""

import os
import time
import json
import argparse
import logging
import tempfile
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, List, Any, Optional, Tuple

# Import processors
from financial_document_processor import FinancialDocumentProcessor
from enhanced_processing.optimized_document_processor import OptimizedDocumentProcessor, PerformanceMetrics

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def generate_test_pdf(size_mb: float, output_dir: str) -> str:
    """
    Generate a test PDF of specified size.
    
    Args:
        size_mb: Target size in MB
        output_dir: Output directory
        
    Returns:
        Path to generated PDF
    """
    try:
        import reportlab.pdfgen.canvas
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.lib import colors
        
        # Create output directory if needed
        os.makedirs(output_dir, exist_ok=True)
        
        # Define output path
        output_path = os.path.join(output_dir, f"test_pdf_{size_mb}mb.pdf")
        
        # Create PDF canvas
        canvas = reportlab.pdfgen.canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        # Estimate content needed per page to reach target size
        # Each page with text typically adds about 5KB
        pages_needed = int((size_mb * 1024) / 5)
        
        # Add some financial content to make the extraction more realistic
        financial_terms = [
            "Revenue: $10,245,678", 
            "Total Assets: €4,567,890",
            "Operating Expenses: $5,432,100",
            "Profit Margin: 12.5%",
            "Book Value: $34.78 per share",
            "Price-to-Earnings Ratio: 18.6",
            "Return on Equity: 15.7%",
            "Debt-to-Equity Ratio: 0.45",
            "Current Ratio: 1.8",
            "EBITDA: $1,345,678",
            "Dividend Yield: 3.2%",
            "Market Capitalization: $12.4 billion",
            "Cash Flow: $876,543",
            "Inventory Turnover: 5.4",
            "Gross Margin: 42%"
        ]
        
        # Add some ISINs for detection
        isins = [
            "US0378331005",  # Apple
            "US5949181045",  # Microsoft
            "US67066G1040",  # NVIDIA
            "US0231351067",  # Amazon
            "US88160R1014",  # Tesla
            "US30303M1027",  # Meta/Facebook
            "US02079K1079",  # Alphabet/Google
            "US4581401001",  # Intel
            "US7475251036",  # Qualcomm
            "US9497461015"   # Wells Fargo
        ]
        
        # Generate pages
        for page in range(pages_needed):
            # Add page number
            canvas.setFont("Helvetica", 12)
            canvas.drawString(50, height - 50, f"Page {page + 1}")
            
            # Add financial content
            canvas.setFont("Helvetica-Bold", 14)
            canvas.drawString(50, height - 100, f"Financial Report - Section {page % 10 + 1}")
            
            # Add some random financial terms
            for i, term in enumerate(financial_terms):
                y_pos = height - 150 - (i * 20)
                if y_pos > 50:  # Ensure we don't go off page
                    canvas.setFont("Helvetica", 11)
                    canvas.drawString(70, y_pos, term)
            
            # Add ISINs to some pages
            if page % 5 == 0:
                canvas.setFont("Helvetica-Bold", 12)
                canvas.drawString(50, 200, "Securities:")
                
                for i, isin in enumerate(isins):
                    canvas.setFont("Helvetica", 10)
                    company = ["Apple Inc.", "Microsoft Corp.", "NVIDIA Corp.", "Amazon.com Inc.", 
                              "Tesla Inc.", "Meta Platforms Inc.", "Alphabet Inc.", "Intel Corp.",
                              "Qualcomm Inc.", "Wells Fargo & Co."][i]
                    canvas.drawString(70, 180 - (i * 15), f"{company} (ISIN: {isin})")
            
            # Add a simple table on some pages
            if page % 7 == 0:
                canvas.setFont("Helvetica-Bold", 12)
                canvas.drawString(350, 500, "Portfolio Holdings")
                
                # Draw table headers
                headers = ["Security", "ISIN", "Quantity", "Price", "Value"]
                for i, header in enumerate(headers):
                    canvas.setFont("Helvetica-Bold", 10)
                    canvas.drawString(350 + (i * 80), 480, header)
                
                # Draw table lines
                canvas.line(350, 475, 750, 475)
                
                # Draw table data
                for i in range(5):
                    y_pos = 460 - (i * 20)
                    company = ["Apple Inc.", "Microsoft Corp.", "NVIDIA Corp.", "Amazon.com Inc.", "Tesla Inc."][i]
                    canvas.setFont("Helvetica", 9)
                    canvas.drawString(350, y_pos, company)
                    canvas.drawString(430, y_pos, isins[i])
                    canvas.drawString(510, y_pos, f"{(i+1)*100}")
                    canvas.drawString(590, y_pos, f"${150.50 + i*25:.2f}")
                    canvas.drawString(670, y_pos, f"${(150.50 + i*25) * (i+1)*100:.2f}")
                
                # Draw bottom line
                canvas.line(350, 360, 750, 360)
            
            # Add a page
            canvas.showPage()
        
        # Save the PDF
        canvas.save()
        
        # Verify file size
        actual_size_mb = os.path.getsize(output_path) / (1024 * 1024)
        logger.info(f"Generated test PDF: {output_path} ({actual_size_mb:.2f} MB)")
        
        return output_path
        
    except ImportError:
        logger.error("ReportLab not installed. Cannot generate test PDF.")
        return None

def run_performance_test(test_files: List[str], output_dir: str = None) -> Dict[str, Any]:
    """
    Run performance tests comparing standard and optimized processors.
    
    Args:
        test_files: List of test file paths
        output_dir: Output directory for results
        
    Returns:
        Dictionary with test results
    """
    if output_dir is None:
        output_dir = tempfile.gettempdir()
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize processors
    standard_processor = FinancialDocumentProcessor()
    optimized_processor = OptimizedDocumentProcessor()
    
    results = {
        "timestamp": time.time(),
        "date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "tests": []
    }
    
    # Test each file
    for file_path in test_files:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            continue
            
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        _, ext = os.path.splitext(file_path)
        file_type = ext.lower().lstrip('.')
        
        logger.info(f"Testing file: {file_path} ({file_size_mb:.2f} MB)")
        
        # Test standard processor
        start_time_standard = time.time()
        try:
            standard_result = standard_processor.process_document(file_path, file_type)
            standard_success = True
        except Exception as e:
            logger.error(f"Standard processor failed: {e}")
            standard_result = {"error": str(e)}
            standard_success = False
        end_time_standard = time.time()
        standard_duration = end_time_standard - start_time_standard
        
        # Test optimized processor
        start_time_optimized = time.time()
        try:
            optimized_result = optimized_processor.process_document(file_path, file_type)
            optimized_success = True
        except Exception as e:
            logger.error(f"Optimized processor failed: {e}")
            optimized_result = {"error": str(e)}
            optimized_success = False
        end_time_optimized = time.time()
        optimized_duration = end_time_optimized - start_time_optimized
        
        # Record results
        test_result = {
            "file_path": file_path,
            "file_type": file_type,
            "file_size_mb": file_size_mb,
            "standard": {
                "duration": standard_duration,
                "success": standard_success,
                "result_size": len(json.dumps(standard_result)) if standard_success else 0
            },
            "optimized": {
                "duration": optimized_duration,
                "success": optimized_success,
                "result_size": len(json.dumps(optimized_result)) if optimized_success else 0,
                "metrics": optimized_result.get("performance_metrics", {}) if optimized_success else {}
            },
            "comparison": {
                "speedup_factor": standard_duration / max(0.001, optimized_duration),
                "percent_improvement": ((standard_duration - optimized_duration) / standard_duration) * 100 if standard_duration > 0 else 0
            }
        }
        
        results["tests"].append(test_result)
        
        logger.info(f"Test results for {os.path.basename(file_path)}:")
        logger.info(f"  Standard: {standard_duration:.2f}s, success: {standard_success}")
        logger.info(f"  Optimized: {optimized_duration:.2f}s, success: {optimized_success}")
        if standard_success and optimized_success:
            logger.info(f"  Speedup: {test_result['comparison']['speedup_factor']:.2f}x")
            logger.info(f"  Improvement: {test_result['comparison']['percent_improvement']:.2f}%")
    
    # Save results
    results_path = os.path.join(output_dir, f"performance_test_results_{int(time.time())}.json")
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Results saved to {results_path}")
    
    # Generate charts
    generate_performance_charts(results, output_dir)
    
    return results

def generate_performance_charts(results: Dict[str, Any], output_dir: str):
    """
    Generate performance comparison charts.
    
    Args:
        results: Test results
        output_dir: Output directory for charts
    """
    try:
        # Extract data
        file_names = [os.path.basename(test["file_path"]) for test in results["tests"]]
        file_sizes = [test["file_size_mb"] for test in results["tests"]]
        standard_times = [test["standard"]["duration"] for test in results["tests"]]
        optimized_times = [test["optimized"]["duration"] for test in results["tests"]]
        improvements = [test["comparison"]["percent_improvement"] for test in results["tests"]]
        
        # Sort data by file size
        sorted_indices = np.argsort(file_sizes)
        file_names = [file_names[i] for i in sorted_indices]
        file_sizes = [file_sizes[i] for i in sorted_indices]
        standard_times = [standard_times[i] for i in sorted_indices]
        optimized_times = [optimized_times[i] for i in sorted_indices]
        improvements = [improvements[i] for i in sorted_indices]
        
        # 1. Processing Time Comparison
        plt.figure(figsize=(12, 7))
        bar_width = 0.35
        x = np.arange(len(file_names))
        
        plt.bar(x - bar_width/2, standard_times, bar_width, label='Standard Processor')
        plt.bar(x + bar_width/2, optimized_times, bar_width, label='Optimized Processor')
        
        plt.xlabel('Files (by size)')
        plt.ylabel('Processing Time (seconds)')
        plt.title('Processing Time Comparison')
        plt.xticks(x, [f"{name}\n({size:.1f} MB)" for name, size in zip(file_names, file_sizes)], rotation=45, ha='right')
        plt.legend()
        plt.tight_layout()
        
        # Save chart
        time_chart_path = os.path.join(output_dir, f"processing_time_comparison_{int(time.time())}.png")
        plt.savefig(time_chart_path)
        plt.close()
        
        # 2. Performance Improvement
        plt.figure(figsize=(12, 7))
        plt.bar(x, improvements, color='green')
        
        plt.xlabel('Files (by size)')
        plt.ylabel('Improvement (%)')
        plt.title('Performance Improvement')
        plt.xticks(x, [f"{name}\n({size:.1f} MB)" for name, size in zip(file_names, file_sizes)], rotation=45, ha='right')
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.tight_layout()
        
        # Save chart
        improvement_chart_path = os.path.join(output_dir, f"performance_improvement_{int(time.time())}.png")
        plt.savefig(improvement_chart_path)
        plt.close()
        
        # 3. Processing Time vs File Size
        plt.figure(figsize=(12, 7))
        plt.scatter(file_sizes, standard_times, label='Standard Processor', marker='o', s=100)
        plt.scatter(file_sizes, optimized_times, label='Optimized Processor', marker='x', s=100)
        
        # Add trend lines
        if len(file_sizes) > 1:
            std_z = np.polyfit(file_sizes, standard_times, 1)
            std_p = np.poly1d(std_z)
            
            opt_z = np.polyfit(file_sizes, optimized_times, 1)
            opt_p = np.poly1d(opt_z)
            
            x_trend = np.linspace(min(file_sizes), max(file_sizes), 100)
            plt.plot(x_trend, std_p(x_trend), '--', color='blue')
            plt.plot(x_trend, opt_p(x_trend), '--', color='orange')
        
        plt.xlabel('File Size (MB)')
        plt.ylabel('Processing Time (seconds)')
        plt.title('Processing Time vs File Size')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.legend()
        plt.tight_layout()
        
        # Save chart
        scaling_chart_path = os.path.join(output_dir, f"scaling_analysis_{int(time.time())}.png")
        plt.savefig(scaling_chart_path)
        plt.close()
        
        logger.info(f"Performance charts saved to {output_dir}")
        
    except ImportError:
        logger.error("Matplotlib not installed. Cannot generate charts.")
    except Exception as e:
        logger.error(f"Error generating charts: {e}")

def test_distributed_processing(num_files: int = 5, output_dir: str = None):
    """
    Test distributed processing capabilities with multiple files.
    
    Args:
        num_files: Number of test files to process
        output_dir: Output directory for results
    """
    if output_dir is None:
        output_dir = tempfile.gettempdir()
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate test files
    test_files = []
    for i in range(num_files):
        size_mb = 2 + (i * 2)  # Create files from 2MB to 10MB
        file_path = generate_test_pdf(size_mb, output_dir)
        if file_path:
            test_files.append(file_path)
    
    if not test_files:
        logger.error("No test files were generated")
        return
    
    # Initialize optimized processor
    processor = OptimizedDocumentProcessor()
    
    # Test batch processing
    logger.info(f"Testing batch processing with {len(test_files)} files")
    file_types = ["pdf"] * len(test_files)
    
    start_time = time.time()
    task_ids = processor.process_batch(test_files, file_types)
    
    # Wait for all tasks to complete
    results = processor.wait_for_batch(task_ids)
    end_time = time.time()
    
    total_duration = end_time - start_time
    logger.info(f"Batch processing completed in {total_duration:.2f} seconds")
    
    # Calculate statistics
    successful_tasks = 0
    failed_tasks = 0
    processing_times = []
    
    for task_id, task_result in results.items():
        if task_result["status"] == "completed":
            successful_tasks += 1
            if task_result["result"] and "performance_metrics" in task_result["result"]:
                if "total_duration" in task_result["result"]["performance_metrics"]:
                    processing_times.append(task_result["result"]["performance_metrics"]["total_duration"])
        else:
            failed_tasks += 1
    
    avg_processing_time = sum(processing_times) / max(1, len(processing_times))
    parallel_efficiency = sum(processing_times) / max(0.001, total_duration)
    
    # Log results
    logger.info(f"Batch processing results:")
    logger.info(f"  Total time: {total_duration:.2f}s")
    logger.info(f"  Successful tasks: {successful_tasks}/{len(task_ids)}")
    logger.info(f"  Failed tasks: {failed_tasks}/{len(task_ids)}")
    logger.info(f"  Average task time: {avg_processing_time:.2f}s")
    logger.info(f"  Parallel efficiency: {parallel_efficiency:.2f}x")
    
    # Save results
    results_path = os.path.join(output_dir, f"batch_processing_results_{int(time.time())}.json")
    
    batch_results = {
        "timestamp": time.time(),
        "date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_duration": total_duration,
        "successful_tasks": successful_tasks,
        "failed_tasks": failed_tasks,
        "average_task_time": avg_processing_time,
        "parallel_efficiency": parallel_efficiency,
        "task_results": {task_id: {
            "status": task_info["status"],
            "processing_time": task_info["result"]["performance_metrics"]["total_duration"] if task_info["status"] == "completed" and task_info["result"] and "performance_metrics" in task_info["result"] else None,
            "error": task_info["error"] if task_info["status"] == "failed" else None
        } for task_id, task_info in results.items()}
    }
    
    with open(results_path, 'w') as f:
        json.dump(batch_results, f, indent=2)
    
    logger.info(f"Batch results saved to {results_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test optimized document processor")
    parser.add_argument("--generate", help="Generate test PDFs of specified sizes in MB (comma-separated)", type=str)
    parser.add_argument("--test", help="Run tests on specified files (comma-separated)", type=str)
    parser.add_argument("--batch", help="Test batch processing with specified number of files", type=int)
    parser.add_argument("--output", help="Output directory for results", type=str, default=None)
    
    args = parser.parse_args()
    
    if args.output:
        output_dir = args.output
    else:
        output_dir = os.path.join(tempfile.gettempdir(), f"processor_tests_{int(time.time())}")
        os.makedirs(output_dir, exist_ok=True)
        
    logger.info(f"Output directory: {output_dir}")
    
    if args.generate:
        sizes = [float(size) for size in args.generate.split(',')]
        generated_files = []
        
        for size in sizes:
            file_path = generate_test_pdf(size, output_dir)
            if file_path:
                generated_files.append(file_path)
                
        if generated_files:
            logger.info(f"Generated {len(generated_files)} test files in {output_dir}")
            
            # If no test files specified, use the generated ones
            if not args.test:
                args.test = ','.join(generated_files)
    
    if args.test:
        test_files = args.test.split(',')
        run_performance_test(test_files, output_dir)
    
    if args.batch:
        test_distributed_processing(args.batch, output_dir)
        
    if not any([args.generate, args.test, args.batch]):
        logger.info("No actions specified. Use --generate, --test, or --batch arguments.")
        logger.info("Example: python test_optimized_processor.py --generate 5,10,20 --output /path/to/output")