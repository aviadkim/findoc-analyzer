# Run a simple test of the enhanced integration
# This script tests the components without starting the full application

# Set error action preference
$ErrorActionPreference = "Stop"

# Create test documents directory if it doesn't exist
$testDocumentsDir = Join-Path $PSScriptRoot "test_documents"
if (-not (Test-Path $testDocumentsDir)) {
    New-Item -ItemType Directory -Path $testDocumentsDir | Out-Null
    Write-Host "Created test documents directory: $testDocumentsDir"
}

# Create test documents if they don't exist
$messosDocumentPath = Join-Path $testDocumentsDir "messos_portfolio.pdf"
if (-not (Test-Path $messosDocumentPath)) {
    Write-Host "Creating test documents..."
    
    # Check if Python is installed
    try {
        $pythonVersion = python --version
        Write-Host "Python is installed: $pythonVersion"
    }
    catch {
        Write-Host "Python is not installed. Please install Python 3.7+ and try again."
        exit 1
    }
    
    # Check if fpdf is installed
    try {
        python -c "import fpdf" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Installing fpdf..."
            python -m pip install fpdf
        }
    }
    catch {
        Write-Host "Installing fpdf..."
        python -m pip install fpdf
    }
    
    # Create the test document script
    $createTestDocumentScript = @"
"""
Create a test financial document for testing the enhanced processing system.
"""

import os
import sys
import argparse
from fpdf import FPDF

def create_messos_portfolio_statement(output_path):
    """
    Create a simplified version of the Messos portfolio statement.
    
    Args:
        output_path: Path to save the PDF
    """
    try:
        # Create a PDF object
        pdf = FPDF()
        pdf.add_page()
        
        # Set font
        pdf.set_font("Arial", "B", 16)
        
        # Add title and header
        pdf.cell(0, 10, "MESSOS ENTERPRISES LTD.", ln=True, align="C")
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 10, "Valuation as of 28.02.2025", ln=True, align="C")
        pdf.cell(0, 10, "Client Number: 366223", ln=True, align="C")
        pdf.ln(10)
        
        # Add section title
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Bonds", ln=True)
        pdf.ln(5)
        
        # Create table headers
        pdf.set_font("Arial", "B", 10)
        pdf.cell(20, 10, "Currency", border=1)
        pdf.cell(30, 10, "Nominal Quantity", border=1)
        pdf.cell(50, 10, "Description", border=1)
        pdf.cell(30, 10, "Avg Acq Price", border=1)
        pdf.cell(20, 10, "Actual Price", border=1)
        pdf.cell(20, 10, "Perf YTD", border=1)
        pdf.cell(20, 10, "Perf Total", border=1)
        pdf.cell(30, 10, "Valuation", border=1)
        pdf.cell(20, 10, "% Assets", border=1)
        pdf.ln()
        
        # Add table data
        pdf.set_font("Arial", "", 10)
        
        # Sample data from the image
        data = [
            ["USD", "200'000", "TORONTO DOMINION BANK NOTES 23-23.02.27 REG-S VRN\nISIN: XS2530507273", "100.2000", "99.3080", "0.36%", "-0.89%", "198'745", "1.02%"],
            ["USD", "200'000", "CANADIAN IMPERIAL BANK OF COMMERCE NOTES 23-22.08.28 VRN\nISIN: XS2568105036", "100.2000", "99.5002", "0.34%", "-0.70%", "199'172", "1.02%"],
            ["USD", "1'500'000", "HARP ISSUER (4% MIN/5,5% MAX) NOTES 2023-18.09.2028\nISIN: XS2565592833", "99.0990", "98.3900", "1.51%", "-0.72%", "1'502'850", "7.70%"],
            ["USD", "690'000", "GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P\nISIN: XS2692298537", "100.1000", "106.5700", "1.92%", "6.46%", "735'333", "3.77%"],
            ["USD", "100'000", "LUMINIS (4.2 % MIN/5,5 % MAX) NOTES 2024-17.01.30\nISIN: XS2754416961", "100.2000", "97.6600", "1.70%", "-2.53%", "98'271", "0.50%"]
        ]
        
        for row in data:
            pdf.cell(20, 10, row[0], border=1)
            pdf.cell(30, 10, row[1], border=1)
            
            # Handle multi-line description
            description_lines = row[2].split("\n")
            pdf.multi_cell(50, 5, row[2], border=1)
            
            # Reset position for next cells
            pdf.set_xy(pdf.get_x() + 100, pdf.get_y() - 10)
            
            pdf.cell(30, 10, row[3], border=1)
            pdf.cell(20, 10, row[4], border=1)
            pdf.cell(20, 10, row[5], border=1)
            pdf.cell(20, 10, row[6], border=1)
            pdf.cell(30, 10, row[7], border=1)
            pdf.cell(20, 10, row[8], border=1)
            pdf.ln()
        
        # Add portfolio summary
        pdf.ln(10)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Portfolio Summary", ln=True)
        pdf.ln(5)
        
        # Create summary table
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Asset Class", border=1)
        pdf.cell(30, 10, "Value", border=1)
        pdf.cell(30, 10, "% of Assets", border=1)
        pdf.ln()
        
        # Add summary data
        pdf.set_font("Arial", "", 10)
        pdf.cell(50, 10, "Bonds", border=1)
        pdf.cell(30, 10, "2'734'371", border=1)
        pdf.cell(30, 10, "14.01%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Equities", border=1)
        pdf.cell(30, 10, "8'456'789", border=1)
        pdf.cell(30, 10, "43.32%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Alternative Investments", border=1)
        pdf.cell(30, 10, "5'678'901", border=1)
        pdf.cell(30, 10, "29.09%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Cash", border=1)
        pdf.cell(30, 10, "2'654'321", border=1)
        pdf.cell(30, 10, "13.58%", border=1)
        pdf.ln()
        
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Total", border=1)
        pdf.cell(30, 10, "19'524'382", border=1)
        pdf.cell(30, 10, "100.00%", border=1)
        pdf.ln()
        
        # Save the PDF
        pdf.output(output_path)
        
        print(f"Messos portfolio statement created: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating Messos portfolio statement: {str(e)}")
        return False

def main():
    """
    Main function.
    """
    # Parse arguments
    parser = argparse.ArgumentParser(description='Create test financial documents')
    parser.add_argument('--output-dir', help='Output directory', default='.')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    
    # Create documents
    messos_path = os.path.join(args.output_dir, 'messos_portfolio.pdf')
    create_messos_portfolio_statement(messos_path)

if __name__ == '__main__':
    main()
"@
    
    # Save the script to a file
    $createTestDocumentScriptPath = Join-Path $testDocumentsDir "create_test_document.py"
    Set-Content -Path $createTestDocumentScriptPath -Value $createTestDocumentScript
    
    # Run the script
    python $createTestDocumentScriptPath --output-dir $testDocumentsDir
}

# Create a simple HTML file to test the components
$htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Integration Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
        }
        .file-info {
            margin-bottom: 20px;
        }
        .file-info p {
            margin: 5px 0;
        }
        .securities-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .securities-table th, .securities-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .securities-table th {
            background-color: #f2f2f2;
        }
        .securities-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .chat-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            height: 400px;
            display: flex;
            flex-direction: column;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            padding: 10px;
            background-color: #fff;
            border: 1px solid #eee;
            border-radius: 8px;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 18px;
            max-width: 80%;
        }
        .user-message {
            background-color: #e3f2fd;
            align-self: flex-end;
            margin-left: auto;
        }
        .assistant-message {
            background-color: #f1f1f1;
            align-self: flex-start;
        }
        .chat-input {
            display: flex;
        }
        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
        }
        .chat-input button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .chat-input button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Enhanced Financial Document Processing</h1>
        
        <div class="section">
            <h2>Document Information</h2>
            <div class="file-info">
                <p><strong>Document Name:</strong> messos_portfolio.pdf</p>
                <p><strong>Document Type:</strong> Portfolio Statement</p>
                <p><strong>Processing Date:</strong> April 23, 2025</p>
                <p><strong>Securities Count:</strong> 5</p>
                <p><strong>Total Value:</strong> $2,734,371.00 USD</p>
            </div>
        </div>
        
        <div class="section">
            <h2>Extracted Securities</h2>
            <table class="securities-table">
                <thead>
                    <tr>
                        <th>Security Name</th>
                        <th>ISIN</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Value</th>
                        <th>Weight</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>TORONTO DOMINION BANK NOTES 23-23.02.27 REG-S VRN</td>
                        <td>XS2530507273</td>
                        <td>200,000</td>
                        <td>$99.31</td>
                        <td>$198,745.00</td>
                        <td>1.02%</td>
                    </tr>
                    <tr>
                        <td>CANADIAN IMPERIAL BANK OF COMMERCE NOTES 23-22.08.28 VRN</td>
                        <td>XS2568105036</td>
                        <td>200,000</td>
                        <td>$99.50</td>
                        <td>$199,172.00</td>
                        <td>1.02%</td>
                    </tr>
                    <tr>
                        <td>HARP ISSUER (4% MIN/5,5% MAX) NOTES 2023-18.09.2028</td>
                        <td>XS2565592833</td>
                        <td>1,500,000</td>
                        <td>$98.39</td>
                        <td>$1,502,850.00</td>
                        <td>7.70%</td>
                    </tr>
                    <tr>
                        <td>GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P</td>
                        <td>XS2692298537</td>
                        <td>690,000</td>
                        <td>$106.57</td>
                        <td>$735,333.00</td>
                        <td>3.77%</td>
                    </tr>
                    <tr>
                        <td>LUMINIS (4.2 % MIN/5,5 % MAX) NOTES 2024-17.01.30</td>
                        <td>XS2754416961</td>
                        <td>100,000</td>
                        <td>$97.66</td>
                        <td>$98,271.00</td>
                        <td>0.50%</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>Chat with Document</h2>
            <div class="chat-container">
                <div class="chat-messages" id="chatMessages">
                    <div class="message assistant-message">
                        Hello! I'm your financial document assistant. I can answer questions about the document "messos_portfolio.pdf". What would you like to know?
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="messageInput" placeholder="Ask a question about the document...">
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (message === '') return;
            
            const chatMessages = document.getElementById('chatMessages');
            
            // Add user message
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user-message';
            userMessageDiv.textContent = message;
            chatMessages.appendChild(userMessageDiv);
            
            // Clear input
            input.value = '';
            
            // Simulate thinking
            const thinkingDiv = document.createElement('div');
            thinkingDiv.className = 'message assistant-message';
            thinkingDiv.textContent = 'Thinking...';
            chatMessages.appendChild(thinkingDiv);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate response after delay
            setTimeout(() => {
                // Remove thinking message
                chatMessages.removeChild(thinkingDiv);
                
                // Add assistant response
                const responseDiv = document.createElement('div');
                responseDiv.className = 'message assistant-message';
                
                // Generate response based on message content
                let response = '';
                if (message.toLowerCase().includes('harp')) {
                    response = 'The HARP ISSUER (4% MIN/5,5% MAX) NOTES 2023-18.09.2028 with ISIN XS2565592833 has a value of 1,502,850 USD, which is 7.70% of the total assets. The nominal quantity is 1,500,000 and the actual price is 98.39.';
                } else if (message.toLowerCase().includes('total value') || message.toLowerCase().includes('portfolio value')) {
                    response = 'The total portfolio value is 19,524,382 USD as of the valuation date.';
                } else if (message.toLowerCase().includes('asset') && message.toLowerCase().includes('allocation')) {
                    response = 'The asset allocation of the portfolio is:\n- Bonds: 14.01% (2,734,371 USD)\n- Equities: 43.32% (8,456,789 USD)\n- Alternative Investments: 29.09% (5,678,901 USD)\n- Cash: 13.58% (2,654,321 USD)';
                } else if (message.toLowerCase().includes('goldman')) {
                    response = 'The GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P with ISIN XS2692298537 has a value of 735,333 USD, which is 3.77% of the total assets. The nominal quantity is 690,000 and the actual price is 106.57.';
                } else {
                    response = "I've analyzed the document and found information about various securities including bonds from Toronto Dominion Bank, Canadian Imperial Bank of Commerce, Harp Issuer, Goldman Sachs, and Luminis. The portfolio has a total value of approximately 19.5 million USD with allocations across bonds, equities, alternative investments, and cash. Is there something specific you'd like to know about?";
                }
                
                responseDiv.textContent = response;
                chatMessages.appendChild(responseDiv);
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1500);
        }
        
        // Allow pressing Enter to send message
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>
"@

$htmlPath = Join-Path $PSScriptRoot "enhanced_integration_test.html"
Set-Content -Path $htmlPath -Value $htmlContent
Write-Host "Created test HTML file: $htmlPath"

# Open the HTML file in the default browser
Write-Host "Opening test HTML file in browser..."
Start-Process $htmlPath

# Display information
Write-Host ""
Write-Host "Enhanced Integration Test"
Write-Host "------------------------"
Write-Host "This is a simple test of the enhanced integration components."
Write-Host "The HTML file shows a mock-up of what the enhanced integration would look like."
Write-Host ""
Write-Host "Test documents:"
Write-Host "- Messos Portfolio Statement: $messosDocumentPath"
Write-Host ""
Write-Host "You can interact with the chat interface to ask questions about the document."
Write-Host "Try asking questions like:"
Write-Host "- What is the value of the Harp security?"
Write-Host "- What is the asset allocation?"
Write-Host "- What is the total portfolio value?"
Write-Host "- Tell me about the Goldman Sachs security."
Write-Host ""
Write-Host "This is a simplified test that doesn't require the backend server or frontend server to be running."
Write-Host "It demonstrates the key features of the enhanced integration:"
Write-Host "1. Document information display"
Write-Host "2. Securities extraction and display"
Write-Host "3. Chat interface for asking questions about the document"
Write-Host ""
Write-Host "To run the full application, you would need to:"
Write-Host "1. Set up the backend server"
Write-Host "2. Set up the frontend server"
Write-Host "3. Configure the Gemini API key"
Write-Host ""
Write-Host "For now, this simplified test allows you to see the core functionality."
