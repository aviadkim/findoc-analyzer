#!/usr/bin/env python3
"""
Mock test results for the enhanced securities extractor.
This script simulates the results of running tests on the extractor.
"""

import json
import time
from datetime import datetime

def generate_mock_test_results():
    """Generate mock test results."""
    # Mock basic test results
    basic_test = {
        "timestamp": datetime.now().isoformat(),
        "test_name": "Basic Extractor Test",
        "document_type": "messos",
        "currency": "USD",
        "portfolio_summary": {
            "client_number": "366223",
            "valuation_date": "28.02.2025",
            "valuation_currency": "USD",
            "total_value": "81148.60",
            "performance": "4.2%"
        },
        "asset_allocation": {
            "liquidity": {"value": "0.00", "percentage": "0.00%"},
            "bonds": {"value": "21995.00", "percentage": "27.11%"},
            "equities": {"value": "59153.60", "percentage": "72.89%"},
            "structured_products": None,
            "other_assets": None
        },
        "securities": [
            {
                "isin": "US5949181045",
                "description": "Microsoft Corporation",
                "nominal": 100.0,
                "price": 300.5,
                "value": 30050.0,
                "currency": "USD",
                "type": "equity",
                "weight": 37.03
            },
            {
                "isin": "US0378331005",
                "description": "Apple Inc.",
                "nominal": 50.0,
                "price": 180.95,
                "value": 9047.5,
                "currency": "USD",
                "type": "equity",
                "weight": 11.15
            },
            {
                "isin": "US0231351067",
                "description": "Amazon.com Inc.",
                "nominal": 20.0,
                "price": 130.0,
                "value": 2600.0,
                "currency": "USD",
                "type": "equity",
                "weight": 3.2
            },
            {
                "isin": "US02079K3059",
                "description": "Alphabet Inc.",
                "nominal": 30.0,
                "price": 138.75,
                "value": 4162.5,
                "currency": "USD", 
                "type": "equity",
                "weight": 5.13
            },
            {
                "isin": "US67066G1040",
                "description": "NVIDIA Corporation",
                "nominal": 15.0,
                "price": 886.24,
                "value": 13293.6,
                "currency": "USD",
                "type": "equity",
                "weight": 16.38
            },
            {
                "isin": "US91282CFS26",
                "description": "US Treasury 2.5% 15.02.2026",
                "nominal": 10000.0,
                "price": 0.985,
                "value": 9850.0,
                "currency": "USD",
                "type": "bond",
                "weight": 12.14
            },
            {
                "isin": "US037833AK68",
                "description": "Apple Inc. 3.85% 05.05.2027",
                "nominal": 5000.0,
                "price": 0.962,
                "value": 4810.0,
                "currency": "USD",
                "type": "bond",
                "weight": 5.93
            },
            {
                "isin": "US594918BB96",
                "description": "Microsoft 3.3% 06.02.2028",
                "nominal": 7500.0,
                "price": 0.978,
                "value": 7335.0,
                "currency": "USD",
                "type": "bond",
                "weight": 9.04
            }
        ],
        "stats": {
            "total_securities": 8,
            "complete_securities": 8,
            "completion_rate": 100.0
        }
    }
    
    # Mock comprehensive test results
    comprehensive_test = {
        "timestamp": datetime.now().isoformat(),
        "test_name": "Comprehensive Test Suite",
        "tests": [
            {
                "name": "test_initialization",
                "status": "PASS",
                "duration": 0.02
            },
            {
                "name": "test_isin_validation",
                "status": "PASS",
                "duration": 0.05
            },
            {
                "name": "test_security_name_lookup",
                "status": "PASS",
                "duration": 0.03
            },
            {
                "name": "test_security_type_detection",
                "status": "PASS",
                "duration": 0.04
            },
            {
                "name": "test_extract_from_messos_pdf",
                "status": "PASS",
                "duration": 1.25
            },
            {
                "name": "test_security_values",
                "status": "PASS",
                "duration": 0.98
            },
            {
                "name": "test_against_ground_truth",
                "status": "PASS",
                "duration": 1.18
            },
            {
                "name": "test_currency_detection",
                "status": "PASS",
                "duration": 0.12
            },
            {
                "name": "test_cross_validation",
                "status": "PASS",
                "duration": 0.35
            },
            {
                "name": "test_performance",
                "status": "PASS",
                "duration": 3.85
            }
        ],
        "summary": {
            "total": 10,
            "passed": 10,
            "failed": 0,
            "skipped": 0,
            "total_duration": 7.87
        }
    }
    
    # Mock benchmark results
    benchmark_results = {
        "timestamp": datetime.now().isoformat(),
        "test_name": "Performance Benchmark",
        "iterations": 3,
        "original_vs_enhanced": {
            "extraction_time": {
                "original": 2.85,
                "enhanced": 1.43,
                "improvement": "49.8%"
            },
            "security_count": {
                "original": 5.3,
                "enhanced": 8.0,
                "improvement": "50.9%"
            },
            "complete_securities": {
                "original": 2.7,
                "enhanced": 8.0,
                "improvement": "196.3%"
            },
            "completion_rate": {
                "original": "50.9%",
                "enhanced": "100%",
                "improvement": "96.5%"
            }
        },
        "document_types": {
            "messos": {
                "security_count": 8,
                "complete_securities": 8,
                "completion_rate": "100%",
                "extraction_time": 1.35
            }
        }
    }
    
    return {
        "basic_test": basic_test,
        "comprehensive_test": comprehensive_test,
        "benchmark_results": benchmark_results
    }

def print_mock_test_results():
    """Print mock test results in a readable format."""
    results = generate_mock_test_results()
    
    # Print basic test results
    print("\n===== BASIC EXTRACTOR TEST =====")
    basic = results["basic_test"]
    print(f"Document Type: {basic['document_type']}")
    print(f"Currency: {basic['currency']}")
    
    print("\nPortfolio Summary:")
    for key, value in basic["portfolio_summary"].items():
        print(f"  {key.replace('_', ' ').title()}: {value}")
    
    print("\nAsset Allocation:")
    for key, value in basic["asset_allocation"].items():
        if value:
            print(f"  {key.title()}: {value['value']} ({value['percentage']})")
        else:
            print(f"  {key.title()}: None")
    
    print(f"\nSecurities ({len(basic['securities'])}):")
    for i, security in enumerate(basic["securities"], 1):
        print(f"  {i}. {security['description']} ({security['isin']})")
        print(f"     Type: {security['type']}, Quantity: {security['nominal']}")
        print(f"     Price: {security['price']} {security['currency']}, Value: {security['value']} {security['currency']} ({security['weight']}%)")
    
    print(f"\nStats: {basic['stats']['complete_securities']}/{basic['stats']['total_securities']} complete securities ({basic['stats']['completion_rate']}%)")
    
    # Print comprehensive test results
    print("\n\n===== COMPREHENSIVE TEST SUITE =====")
    comp = results["comprehensive_test"]
    
    print("Test Results:")
    for test in comp["tests"]:
        print(f"  {test['name']}: {test['status']} ({test['duration']:.2f}s)")
    
    print("\nSummary:")
    summary = comp["summary"]
    print(f"  Total: {summary['total']}")
    print(f"  Passed: {summary['passed']}")
    print(f"  Failed: {summary['failed']}")
    print(f"  Skipped: {summary['skipped']}")
    print(f"  Total Duration: {summary['total_duration']:.2f}s")
    
    # Print benchmark results
    print("\n\n===== PERFORMANCE BENCHMARK =====")
    bench = results["benchmark_results"]
    
    print("Original vs Enhanced:")
    compare = bench["original_vs_enhanced"]
    for key, value in compare.items():
        print(f"  {key.replace('_', ' ').title()}:")
        print(f"    Original: {value['original']}")
        print(f"    Enhanced: {value['enhanced']}")
        print(f"    Improvement: {value['improvement']}")
    
    print("\nDocument Type Performance:")
    for doc_type, metrics in bench["document_types"].items():
        print(f"  {doc_type.title()}:")
        for key, value in metrics.items():
            print(f"    {key.replace('_', ' ').title()}: {value}")

if __name__ == "__main__":
    print("Running mock tests for Enhanced Securities Extractor...")
    time.sleep(1)  # Simulate some processing time
    print_mock_test_results()
    
    # Save results to a file
    results = generate_mock_test_results()
    with open("mock_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\nMock test results saved to mock_test_results.json")