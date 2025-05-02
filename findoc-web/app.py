from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def home():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>FinDoc Analyzer</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }
            .success {
                color: #27ae60;
                font-weight: bold;
            }
            .card {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                margin-bottom: 20px;
            }
            .card h2 {
                margin-top: 0;
                color: #3498db;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>FinDoc Analyzer</h1>
            <p class="success">Deployment Successful!</p>
            
            <div class="card">
                <h2>About FinDoc Analyzer</h2>
                <p>FinDoc Analyzer is a SaaS application for financial document processing and analysis. It uses advanced AI techniques to extract and analyze information from financial documents.</p>
            </div>
            
            <div class="card">
                <h2>Features</h2>
                <ul>
                    <li>PDF and Excel document processing</li>
                    <li>Table extraction and analysis</li>
                    <li>Securities information extraction</li>
                    <li>Financial data validation</li>
                    <li>Multi-agent system for enhanced processing</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Next Steps</h2>
                <p>This is a simple test page. The full application will be deployed soon.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return render_template_string(html)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
