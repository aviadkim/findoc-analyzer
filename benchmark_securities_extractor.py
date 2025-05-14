#!/usr/bin/env python3
"""
Benchmark script for the securities extractor.
This script runs performance tests and generates visualizations
comparing the original and enhanced securities extractors.
"""

import os
import json
import time
import argparse
from typing import Dict, List, Any, Optional, Tuple
import matplotlib.pyplot as plt
import numpy as np

# Import extractors
from enhanced_securities_extractor import SecurityExtractor

# Try to import original extractor if available
try:
    from services.securities_extractor import extractSecurities as extractSecuritiesOriginal
    HAS_ORIGINAL = True
except ImportError:
    HAS_ORIGINAL = False
    print("Original securities extractor not found. Benchmarking only enhanced version.")

def find_sample_pdfs() -> List[str]:
    """Find sample PDF files to test."""
    pdf_paths = []
    
    # Try to find PDFs in common locations
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_paths.append(os.path.join(root, file))
    
    return pdf_paths

def run_benchmark(pdf_paths: List[str], iterations: int = 3) -> Dict[str, Any]:
    """
    Run benchmarks on both extractors and return results.
    
    Args:
        pdf_paths: List of paths to PDF files
        iterations: Number of iterations for each test
        
    Returns:
        Dictionary with benchmark results
    """
    results = {
        "enhanced": {
            "extraction_times": {},
            "security_counts": {},
            "complete_security_counts": {},
            "total_time": 0
        }
    }
    
    if HAS_ORIGINAL:
        results["original"] = {
            "extraction_times": {},
            "security_counts": {},
            "complete_security_counts": {},
            "total_time": 0
        }
    
    # Initialize enhanced extractor
    enhanced_extractor = SecurityExtractor(debug=False)
    
    # Run benchmarks
    for pdf_path in pdf_paths:
        pdf_name = os.path.basename(pdf_path)
        
        # Enhanced extractor
        enhanced_times = []
        enhanced_security_counts = []
        enhanced_complete_security_counts = []
        
        for _ in range(iterations):
            start_time = time.time()
            result = enhanced_extractor.extract_from_pdf(pdf_path)
            end_time = time.time()
            
            extraction_time = end_time - start_time
            enhanced_times.append(extraction_time)
            
            # Count securities and complete securities
            securities = result.get("securities", [])
            enhanced_security_counts.append(len(securities))
            
            complete_count = sum(1 for s in securities if 
                              s.get("isin") and 
                              s.get("description") and 
                              s.get("value") is not None and 
                              s.get("price") is not None and 
                              s.get("nominal") is not None)
            enhanced_complete_security_counts.append(complete_count)
        
        # Calculate averages
        results["enhanced"]["extraction_times"][pdf_name] = sum(enhanced_times) / iterations
        results["enhanced"]["security_counts"][pdf_name] = sum(enhanced_security_counts) / iterations
        results["enhanced"]["complete_security_counts"][pdf_name] = sum(enhanced_complete_security_counts) / iterations
        results["enhanced"]["total_time"] += sum(enhanced_times)
        
        # Original extractor (if available)
        if HAS_ORIGINAL:
            original_times = []
            original_security_counts = []
            original_complete_security_counts = []
            
            try:
                # Create content object expected by original extractor
                with open(pdf_path, 'rb') as f:
                    content = {
                        'text': f.read().decode('utf-8', errors='ignore'),
                        'filename': pdf_name
                    }
                
                for _ in range(iterations):
                    start_time = time.time()
                    original_securities = extractSecuritiesOriginal(content)
                    end_time = time.time()
                    
                    extraction_time = end_time - start_time
                    original_times.append(extraction_time)
                    
                    # Count securities and complete securities
                    original_security_counts.append(len(original_securities))
                    
                    complete_count = sum(1 for s in original_securities if 
                                      s.get("isin") and 
                                      s.get("name") and 
                                      s.get("value") is not None and 
                                      s.get("price") is not None and 
                                      s.get("quantity") is not None)
                    original_complete_security_counts.append(complete_count)
                
                # Calculate averages
                results["original"]["extraction_times"][pdf_name] = sum(original_times) / iterations
                results["original"]["security_counts"][pdf_name] = sum(original_security_counts) / iterations
                results["original"]["complete_security_counts"][pdf_name] = sum(original_complete_security_counts) / iterations
                results["original"]["total_time"] += sum(original_times)
                
            except Exception as e:
                print(f"Error running original extractor on {pdf_name}: {e}")
                results["original"]["extraction_times"][pdf_name] = None
                results["original"]["security_counts"][pdf_name] = None
                results["original"]["complete_security_counts"][pdf_name] = None
    
    return results

def visualize_results(results: Dict[str, Any], output_dir: str = "."):
    """
    Create visualizations of benchmark results.
    
    Args:
        results: Benchmark results
        output_dir: Directory to save visualizations
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Plot extraction times
    plt.figure(figsize=(12, 6))
    pdf_names = list(results["enhanced"]["extraction_times"].keys())
    enhanced_times = [results["enhanced"]["extraction_times"][pdf] for pdf in pdf_names]
    
    x = np.arange(len(pdf_names))
    width = 0.35
    
    plt.bar(x, enhanced_times, width, label='Enhanced Extractor')
    
    if HAS_ORIGINAL:
        original_times = []
        for pdf in pdf_names:
            time_value = results["original"]["extraction_times"].get(pdf)
            original_times.append(time_value if time_value is not None else 0)
        
        plt.bar(x + width, original_times, width, label='Original Extractor')
    
    plt.xlabel('PDF Files')
    plt.ylabel('Extraction Time (seconds)')
    plt.title('Extraction Time Comparison')
    plt.xticks(x + width/2, [os.path.basename(pdf)[:15] for pdf in pdf_names], rotation=45)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'extraction_times.png'))
    
    # Plot security counts
    plt.figure(figsize=(12, 6))
    enhanced_counts = [results["enhanced"]["security_counts"][pdf] for pdf in pdf_names]
    enhanced_complete = [results["enhanced"]["complete_security_counts"][pdf] for pdf in pdf_names]
    
    if HAS_ORIGINAL:
        original_counts = []
        original_complete = []
        for pdf in pdf_names:
            count_value = results["original"]["security_counts"].get(pdf)
            original_counts.append(count_value if count_value is not None else 0)
            
            complete_value = results["original"]["complete_security_counts"].get(pdf)
            original_complete.append(complete_value if complete_value is not None else 0)
        
        plt.subplot(1, 2, 1)
        plt.bar(x, enhanced_counts, width, label='Enhanced Extractor')
        plt.bar(x + width, original_counts, width, label='Original Extractor')
        plt.xlabel('PDF Files')
        plt.ylabel('Total Securities Found')
        plt.title('Securities Extraction Comparison')
        plt.xticks(x + width/2, [os.path.basename(pdf)[:15] for pdf in pdf_names], rotation=45)
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.bar(x, enhanced_complete, width, label='Enhanced Extractor')
        plt.bar(x + width, original_complete, width, label='Original Extractor')
        plt.xlabel('PDF Files')
        plt.ylabel('Complete Securities')
        plt.title('Complete Securities Comparison')
        plt.xticks(x + width/2, [os.path.basename(pdf)[:15] for pdf in pdf_names], rotation=45)
        plt.legend()
    else:
        plt.subplot(1, 2, 1)
        plt.bar(x, enhanced_counts, width, label='Enhanced Extractor')
        plt.xlabel('PDF Files')
        plt.ylabel('Total Securities Found')
        plt.title('Securities Extraction')
        plt.xticks(x, [os.path.basename(pdf)[:15] for pdf in pdf_names], rotation=45)
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.bar(x, enhanced_complete, width, label='Enhanced Extractor')
        plt.xlabel('PDF Files')
        plt.ylabel('Complete Securities')
        plt.title('Complete Securities')
        plt.xticks(x, [os.path.basename(pdf)[:15] for pdf in pdf_names], rotation=45)
        plt.legend()
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'security_counts.png'))
    
    # Plot completion rate
    plt.figure(figsize=(12, 6))
    enhanced_completion = [results["enhanced"]["complete_security_counts"][pdf] / results["enhanced"]["security_counts"][pdf] * 100
                         if results["enhanced"]["security_counts"][pdf] > 0 else 0
                         for pdf in pdf_names]
    
    plt.bar(x, enhanced_completion, width, label='Enhanced Extractor')
    
    if HAS_ORIGINAL:
        original_completion = []
        for pdf in pdf_names:
            security_count = results["original"]["security_counts"].get(pdf, 0)
            complete_count = results["original"]["complete_security_counts"].get(pdf, 0)
            
            if security_count > 0:
                original_completion.append(complete_count / security_count * 100)
            else:
                original_completion.append(0)
        
        plt.bar(x + width, original_completion, width, label='Original Extractor')
    
    plt.xlabel('PDF Files')
    plt.ylabel('Completion Rate (%)')
    plt.title('Securities Completion Rate')
    plt.xticks(x + width/2 if HAS_ORIGINAL else x, [os.path.basename(pdf)[:15] for pdf in pdf_names], rotation=45)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'completion_rate.png'))
    
    # Create summary table
    plt.figure(figsize=(12, 6))
    plt.subplot(111, frame_on=False)
    plt.xticks([])
    plt.yticks([])
    
    headers = ['Extractor', 'Avg Securities', 'Avg Complete', 'Completion Rate', 'Total Time (s)']
    
    # Calculate summary statistics
    data = []
    
    # Enhanced extractor
    avg_securities = sum(results["enhanced"]["security_counts"].values()) / len(results["enhanced"]["security_counts"])
    avg_complete = sum(results["enhanced"]["complete_security_counts"].values()) / len(results["enhanced"]["complete_security_counts"])
    completion_rate = avg_complete / avg_securities * 100 if avg_securities > 0 else 0
    total_time = results["enhanced"]["total_time"]
    
    data.append(['Enhanced', f'{avg_securities:.2f}', f'{avg_complete:.2f}', f'{completion_rate:.2f}%', f'{total_time:.2f}'])
    
    # Original extractor (if available)
    if HAS_ORIGINAL:
        original_counts = [v for v in results["original"]["security_counts"].values() if v is not None]
        original_complete = [v for v in results["original"]["complete_security_counts"].values() if v is not None]
        
        if original_counts:
            avg_securities = sum(original_counts) / len(original_counts)
            avg_complete = sum(original_complete) / len(original_complete)
            completion_rate = avg_complete / avg_securities * 100 if avg_securities > 0 else 0
            total_time = results["original"]["total_time"]
            
            data.append(['Original', f'{avg_securities:.2f}', f'{avg_complete:.2f}', f'{completion_rate:.2f}%', f'{total_time:.2f}'])
    
    plt.table(cellText=data, colLabels=headers, loc='center', cellLoc='center')
    plt.title('Extraction Summary')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'summary.png'))
    
    print("Visualizations saved to", output_dir)

def main():
    """Run the benchmark script."""
    parser = argparse.ArgumentParser(description="Benchmark the securities extractors")
    parser.add_argument("--pdf_dir", "-d", help="Directory containing PDF files")
    parser.add_argument("--output_dir", "-o", default="benchmark_results", help="Directory to save results")
    parser.add_argument("--iterations", "-i", type=int, default=3, help="Number of iterations for each test")
    
    args = parser.parse_args()
    
    # Find sample PDFs
    if args.pdf_dir and os.path.isdir(args.pdf_dir):
        pdf_paths = [os.path.join(args.pdf_dir, f) for f in os.listdir(args.pdf_dir) if f.lower().endswith('.pdf')]
    else:
        pdf_paths = find_sample_pdfs()
    
    if not pdf_paths:
        print("No PDF files found. Please specify a directory containing PDFs.")
        return
    
    print(f"Found {len(pdf_paths)} PDF files for benchmarking")
    
    # Run benchmarks
    results = run_benchmark(pdf_paths, args.iterations)
    
    # Save results to file
    os.makedirs(args.output_dir, exist_ok=True)
    with open(os.path.join(args.output_dir, 'benchmark_results.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    # Create visualizations
    try:
        visualize_results(results, args.output_dir)
    except Exception as e:
        print(f"Error creating visualizations: {e}")
        print("Results saved to", os.path.join(args.output_dir, 'benchmark_results.json'))

if __name__ == "__main__":
    main()