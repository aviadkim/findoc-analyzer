"""
Test script to run all financial agents on the extracted data.
"""
import os
import sys
import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

# Helper function to convert numpy types to Python types for JSON serialization
def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return convert_numpy_types(obj.tolist())
    else:
        return obj

# Add the parent directory to the path so we can import the backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_securities_data(file_path):
    """Load securities data from CSV file."""
    return pd.read_csv(file_path)

def test_document_preprocessor(api_key=None):
    """Test DocumentPreprocessorAgent."""
    try:
        from DevDocs.backend.agents.document_preprocessor_agent import DocumentPreprocessorAgent

        print("\n=== Testing DocumentPreprocessorAgent ===\n")

        # Create the agent
        agent = DocumentPreprocessorAgent()

        # Create a sample image
        import cv2
        import numpy as np

        # Create a blank image
        image = np.ones((800, 600, 3), dtype=np.uint8) * 255

        # Add some text
        cv2.putText(image, "ISIN: XS2315191069", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(image, "Price: 99.3080", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(image, "Value: 198'745", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        # Process the image
        result = agent.process({"image": image})

        print("DocumentPreprocessorAgent test result:")
        if "preprocessed_image" in result:
            print("- Preprocessed image: Success")
        else:
            print("- Preprocessed image: Failed")

        if "text_regions" in result:
            print(f"- Text regions detected: {len(result['text_regions'])}")
        else:
            print("- Text regions: Failed")

        return result
    except Exception as e:
        print(f"Error testing DocumentPreprocessorAgent: {e}")
        return {"error": str(e)}

def test_isin_extractor(securities_df, api_key=None):
    """Test ISINExtractorAgent."""
    try:
        from DevDocs.backend.agents.isin_extractor_agent_fixed import ISINExtractorAgent

        print("\n=== Testing ISINExtractorAgent ===\n")

        # Create the agent
        agent = ISINExtractorAgent()

        # Create a sample text with ISINs
        isins = securities_df["ISIN"].tolist()
        sample_text = "Portfolio contains the following ISINs:\n"
        for isin in isins:
            sample_text += f"- {isin}\n"

        # Print the full sample text for debugging
        print(f"Full sample text:\n{sample_text}")

        # Process the text
        print(f"Sample text: {sample_text[:100]}...")
        print(f"ISINs in sample: {isins[:3]}...")
        try:
            result = agent.process({"text": sample_text, "validate": True, "with_metadata": True})
            print(f"Result keys: {result.keys()}")
            print(f"Result status: {result.get('status')}")
            print(f"Result count: {result.get('count')}")
            if 'isins' in result:
                print(f"ISINs count: {len(result['isins'])}")
                if len(result['isins']) > 0:
                    print(f"First ISIN: {result['isins'][0]}")
                    print(f"First ISIN keys: {result['isins'][0].keys() if isinstance(result['isins'][0], dict) else 'Not a dict'}")
        except Exception as e:
            print(f"Error in process: {e}")
            import traceback
            traceback.print_exc()
            raise

        print("ISINExtractorAgent test result:")
        if "isins" in result:
            print(f"- ISINs extracted: {len(result['isins'])}")
            print(f"- Validation rate: {len(result['isins']) / len(isins) * 100:.2f}%")
        else:
            print("- ISINs extraction: Failed")

        return result
    except Exception as e:
        print(f"Error testing ISINExtractorAgent: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

def test_financial_table_detector(securities_df, api_key=None):
    """Test FinancialTableDetectorAgent."""
    try:
        from DevDocs.backend.agents.financial_table_detector_agent_fixed import FinancialTableDetectorAgent

        print("\n=== Testing FinancialTableDetectorAgent ===\n")

        if not api_key:
            print("Warning: No API key provided. FinancialTableDetectorAgent may not work properly.")

        # Create the agent
        agent = FinancialTableDetectorAgent(api_key=api_key)

        # Create a sample table image
        import cv2
        import numpy as np

        # Create a blank image
        image = np.ones((800, 1200, 3), dtype=np.uint8) * 255

        # Add table grid
        # Horizontal lines
        for y in range(50, 550, 50):
            cv2.line(image, (50, y), (1150, y), (0, 0, 0), 1)

        # Vertical lines
        for x in range(50, 1151, 220):
            cv2.line(image, (x, 50), (x, 500), (0, 0, 0), 1)

        # Add headers
        cv2.putText(image, "ISIN", (60, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(image, "Description", (280, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(image, "Price", (500, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(image, "Value", (720, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(image, "Weight", (940, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        # Add data (top 5 securities by value)
        # First, ensure the securities_df has the required columns
        if 'Value' in securities_df.columns and 'value' not in securities_df.columns:
            securities_df['value'] = securities_df['Value']
        if 'ISIN' in securities_df.columns and 'isin' not in securities_df.columns:
            securities_df['isin'] = securities_df['ISIN']
        if 'Name' in securities_df.columns and 'description' not in securities_df.columns:
            securities_df['description'] = securities_df['Name']
        if 'Price' in securities_df.columns and 'price' not in securities_df.columns:
            securities_df['price'] = securities_df['Price']

        # Add weight column if it doesn't exist
        if 'weight' not in securities_df.columns:
            total_value = securities_df['value'].sum()
            securities_df['weight'] = (securities_df['value'] / total_value * 100).round(2)

        # Sort and get top 5 securities
        top_securities = securities_df.sort_values(by="value", ascending=False).head(5)
        for i, (_, security) in enumerate(top_securities.iterrows()):
            y = 90 + i * 50
            cv2.putText(image, str(security["isin"]), (60, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

            # Truncate description to fit
            desc = str(security["description"])
            if len(desc) > 20:
                desc = desc[:17] + "..."
            cv2.putText(image, desc, (280, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

            cv2.putText(image, str(security["price"]), (500, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
            cv2.putText(image, str(security["value"]), (720, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
            cv2.putText(image, str(security["weight"]) + "%", (940, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

        # Process the image
        result = agent.process({"image": image, "language": "eng"})

        print("FinancialTableDetectorAgent test result:")
        if "tables" in result:
            print(f"- Tables detected: {len(result['tables'])}")
            if len(result["tables"]) > 0:
                print("- Table detection: Success")
            else:
                print("- Table detection: Failed (no tables detected)")
        else:
            print("- Table detection: Failed")

        return result
    except Exception as e:
        print(f"Error testing FinancialTableDetectorAgent: {e}")
        return {"error": str(e)}

def test_financial_data_analyzer(securities_df, api_key=None):
    """Test FinancialDataAnalyzerAgent."""
    try:
        from DevDocs.backend.agents.financial_data_analyzer_agent_fixed import FinancialDataAnalyzerAgent

        print("\n=== Testing FinancialDataAnalyzerAgent ===\n")

        if not api_key:
            print("Warning: No API key provided. FinancialDataAnalyzerAgent may not work properly.")

        # Create the agent
        agent = FinancialDataAnalyzerAgent(api_key=api_key)

        # First, ensure the securities_df has the required columns
        if 'Value' in securities_df.columns and 'value' not in securities_df.columns:
            securities_df['value'] = securities_df['Value']
        if 'ISIN' in securities_df.columns and 'isin' not in securities_df.columns:
            securities_df['isin'] = securities_df['ISIN']
        if 'Name' in securities_df.columns and 'description' not in securities_df.columns:
            securities_df['description'] = securities_df['Name']
        if 'Price' in securities_df.columns and 'price' not in securities_df.columns:
            securities_df['price'] = securities_df['Price']
        if 'Currency' in securities_df.columns and 'currency' not in securities_df.columns:
            securities_df['currency'] = securities_df['Currency']

        # Add weight column if it doesn't exist
        if 'weight' not in securities_df.columns:
            total_value = securities_df['value'].sum()
            securities_df['weight'] = (securities_df['value'] / total_value * 100).round(2)

        # Add type column if it doesn't exist
        if 'type' not in securities_df.columns:
            # Assign a default type based on ISIN country code
            securities_df['type'] = securities_df['isin'].apply(lambda x: 'Equity' if x.startswith('US') else 'Bond')

        # Create a sample financial document
        document = {
            "metadata": {
                "document_type": "portfolio_statement",
                "document_date": "28.02.2025",
                "client_name": "MESSOS ENTERPRISES LTD.",
                "client_number": "366223",
                "valuation_currency": "USD"
            },
            "financial_data": {
                "portfolio": {
                    "securities": [],
                    "summary": {
                        "total_value": securities_df["value"].sum(),
                        "total_securities": len(securities_df)
                    }
                }
            }
        }

        # Add securities
        for _, security in securities_df.iterrows():
            document["financial_data"]["portfolio"]["securities"].append({
                "type": security["type"],
                "isin": security["isin"],
                "description": security["description"],
                "currency": security.get("currency", "USD"),
                "price": security["price"],
                "value": security["value"],
                "weight": security["weight"]
            })

        # Process the document
        result = agent.process({
            "document": document,
            "analysis_type": "comprehensive"
        })

        print("FinancialDataAnalyzerAgent test result:")
        if "analysis" in result:
            print("- Analysis: Success")
            if "asset_allocation" in result["analysis"]:
                print("- Asset allocation: Success")
            else:
                print("- Asset allocation: Failed")

            if "risk_metrics" in result["analysis"]:
                print("- Risk metrics: Success")
            else:
                print("- Risk metrics: Failed")
        else:
            print("- Analysis: Failed")

        return result
    except Exception as e:
        print(f"Error testing FinancialDataAnalyzerAgent: {e}")
        return {"error": str(e)}

def test_document_merge(securities_df, api_key=None):
    """Test DocumentMergeAgent."""
    try:
        from DevDocs.backend.agents.document_merge_agent_fixed import DocumentMergeAgent

        print("\n=== Testing DocumentMergeAgent ===\n")

        # Create the agent
        agent = DocumentMergeAgent()

        # First, ensure the securities_df has the required columns
        if 'Value' in securities_df.columns and 'value' not in securities_df.columns:
            securities_df['value'] = securities_df['Value']
        if 'ISIN' in securities_df.columns and 'isin' not in securities_df.columns:
            securities_df['isin'] = securities_df['ISIN']
        if 'Name' in securities_df.columns and 'description' not in securities_df.columns:
            securities_df['description'] = securities_df['Name']
        if 'Price' in securities_df.columns and 'price' not in securities_df.columns:
            securities_df['price'] = securities_df['Price']
        if 'Currency' in securities_df.columns and 'currency' not in securities_df.columns:
            securities_df['currency'] = securities_df['Currency']

        # Add weight column if it doesn't exist
        if 'weight' not in securities_df.columns:
            total_value = securities_df['value'].sum()
            securities_df['weight'] = (securities_df['value'] / total_value * 100).round(2)

        # Add type column if it doesn't exist
        if 'type' not in securities_df.columns:
            # Assign a default type based on ISIN country code
            securities_df['type'] = securities_df['isin'].apply(lambda x: 'Equity' if x.startswith('US') else 'Bond')

        # Create sample documents
        documents = []

        # Portfolio statement
        portfolio_doc = {
            "metadata": {
                "document_type": "portfolio_statement",
                "document_date": "28.02.2025",
                "client_name": "MESSOS ENTERPRISES LTD.",
                "client_number": "366223",
                "valuation_currency": "USD"
            },
            "financial_data": {
                "portfolio": {
                    "securities": [],
                    "summary": {
                        "total_value": securities_df["value"].sum(),
                        "total_securities": len(securities_df)
                    }
                }
            }
        }

        # Add securities
        for _, security in securities_df.iterrows():
            portfolio_doc["financial_data"]["portfolio"]["securities"].append({
                "type": security["type"],
                "isin": security["isin"],
                "description": security["description"],
                "currency": security.get("currency", "USD"),
                "price": security["price"],
                "value": security["value"],
                "weight": security["weight"]
            })

        documents.append(portfolio_doc)

        # Asset allocation document
        asset_allocation_doc = {
            "metadata": {
                "document_type": "asset_allocation",
                "document_date": "28.02.2025",
                "client_name": "MESSOS ENTERPRISES LTD.",
                "client_number": "366223",
                "valuation_currency": "USD"
            },
            "financial_data": {
                "asset_allocation": {}
            }
        }

        # Group by type
        asset_types = securities_df.groupby("type")["value"].sum()
        for asset_type, value in asset_types.items():
            asset_allocation_doc["financial_data"]["asset_allocation"][asset_type] = {
                "value": value,
                "weight": (value / securities_df["value"].sum()) * 100
            }

        documents.append(asset_allocation_doc)

        # Merge the documents
        result = agent.merge_documents(documents, merge_strategy='comprehensive')

        print("DocumentMergeAgent test result:")
        if "merge_date" in result:
            print("- Merge date: Success")
        else:
            print("- Merge date: Failed")

        if "document_types" in result:
            print(f"- Document types: Success ({', '.join(result['document_types'])})")
        else:
            print("- Document types: Failed")

        if "merged_data" in result:
            print("- Merged data: Success")
            if "portfolio" in result["merged_data"]:
                print("- Portfolio data: Success")
            else:
                print("- Portfolio data: Failed")

            if "asset_allocation" in result["merged_data"]:
                print("- Asset allocation data: Success")
            else:
                print("- Asset allocation data: Failed")
        else:
            print("- Merged data: Failed")

        # Generate a comprehensive report
        report = agent.generate_comprehensive_report(result)

        print("\nComprehensive report test result:")
        if "report_type" in report:
            print(f"- Report type: Success ({report['report_type']})")
        else:
            print("- Report type: Failed")

        if "data_sources" in report:
            print(f"- Data sources: Success ({', '.join(report['data_sources'])})")
        else:
            print("- Data sources: Failed")

        return {
            "merged_document": result,
            "comprehensive_report": report
        }
    except Exception as e:
        print(f"Error testing DocumentMergeAgent: {e}")
        return {"error": str(e)}

def main():
    """Main function to test all financial agents."""
    import argparse

    parser = argparse.ArgumentParser(description="Test all financial agents")
    parser.add_argument("--securities-file", default="./isin_analysis/securities_table.csv", help="Path to the securities CSV file")
    parser.add_argument("--api-key", help="OpenRouter API key")
    parser.add_argument("--output-dir", default="./agent_test_results", help="Output directory")
    args = parser.parse_args()

    # Get API key from arguments or environment
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Warning: No API key provided. Some agents may not work properly.")

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True, parents=True)

    # Load securities data
    securities_df = load_securities_data(args.securities_file)

    # Test DocumentPreprocessorAgent
    preprocessor_result = test_document_preprocessor(api_key)

    # Save the result
    preprocessor_path = output_dir / "document_preprocessor_result.json"
    with open(preprocessor_path, "w", encoding="utf-8") as f:
        # Clean the result for JSON serialization
        clean_result = {}
        for k, v in preprocessor_result.items():
            if k == "preprocessed_image" or k == "text_regions":
                clean_result[k] = "image data (not serialized)"
            else:
                clean_result[k] = v
        json.dump(clean_result, f, indent=2)

    # Test ISINExtractorAgent
    try:
        isin_result = test_isin_extractor(securities_df, api_key)
        print(f"ISIN result: {isin_result}")
    except Exception as e:
        print(f"Error in test_isin_extractor: {e}")
        isin_result = {"error": str(e)}

    # Save the result
    isin_path = output_dir / "isin_extractor_result.json"
    with open(isin_path, "w", encoding="utf-8") as f:
        json.dump(convert_numpy_types(isin_result), f, indent=2)

    # Test FinancialTableDetectorAgent
    table_result = test_financial_table_detector(securities_df, api_key)

    # Save the result
    table_path = output_dir / "financial_table_detector_result.json"
    with open(table_path, "w", encoding="utf-8") as f:
        # Clean the result for JSON serialization
        clean_result = {}
        for k, v in table_result.items():
            if k == "table_images":
                clean_result[k] = "image data (not serialized)"
            else:
                clean_result[k] = v
        json.dump(convert_numpy_types(clean_result), f, indent=2)

    # Test FinancialDataAnalyzerAgent
    analyzer_result = test_financial_data_analyzer(securities_df, api_key)

    # Save the result
    analyzer_path = output_dir / "financial_data_analyzer_result.json"
    with open(analyzer_path, "w", encoding="utf-8") as f:
        json.dump(convert_numpy_types(analyzer_result), f, indent=2)

    # Test DocumentMergeAgent
    merge_result = test_document_merge(securities_df, api_key)

    # Save the result
    merge_path = output_dir / "document_merge_result.json"
    with open(merge_path, "w", encoding="utf-8") as f:
        json.dump(convert_numpy_types(merge_result), f, indent=2)

    # Create a summary report
    summary = {
        "test_date": datetime.now().isoformat(),
        "api_key_provided": api_key is not None,
        "securities_count": len(securities_df),
        "results": {
            "document_preprocessor": "success" if "preprocessed_image" in preprocessor_result else "failed",
            "isin_extractor": "success" if "isins" in isin_result else "failed",
            "financial_table_detector": "success" if "tables" in table_result else "failed",
            "financial_data_analyzer": "success" if "analysis" in analyzer_result else "failed",
            "document_merge": "success" if isinstance(merge_result, dict) and "merged_document" in merge_result else "failed"
        }
    }

    # Save the summary
    summary_path = output_dir / "test_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(convert_numpy_types(summary), f, indent=2)

    print("\nTest Summary:")
    print(f"Test date: {summary['test_date']}")
    print(f"API key provided: {summary['api_key_provided']}")
    print(f"Securities count: {summary['securities_count']}")
    print("\nResults:")
    for agent, result in summary["results"].items():
        print(f"- {agent}: {result}")

    print(f"\nAll test results saved to {output_dir}")

    return 0

if __name__ == "__main__":
    sys.exit(main())
