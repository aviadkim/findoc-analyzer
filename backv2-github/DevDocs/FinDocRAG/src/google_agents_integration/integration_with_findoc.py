"""
Integration script for adding Google Agent Technologies to the existing FinDoc Analyzer application.

This script demonstrates how to integrate the Google Agent Technologies with the existing
FinDoc Analyzer application.
"""
import os
import sys
import logging

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the integration modules
from integration import register_routes
from feedback import register_routes as register_feedback_routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def integrate_with_findoc(app):
    """
    Integrate Google Agent Technologies with the existing FinDoc Analyzer application.

    Args:
        app: Flask application
    """
    logger.info("Integrating Google Agent Technologies with FinDoc Analyzer...")

    # Register routes with the Flask app
    register_routes(app)

    # Register feedback routes
    register_feedback_routes(app)

    logger.info("Integration complete. The following endpoints are now available:")
    logger.info("- GET /api/rag/health: Health check endpoint")
    logger.info("- POST /api/rag/document/upload: Upload a document for processing")
    logger.info("- GET /api/rag/document/status/<document_id>: Get document processing status")
    logger.info("- POST /api/rag/document/query: Query a document with natural language")
    logger.info("- GET /api/rag/document/summary/<document_id>: Get document summary")
    logger.info("- GET /api/rag/document/securities/<document_id>: Get document securities")
    logger.info("- GET /api/rag/document/export/<document_id>: Export document data to CSV")
    logger.info("- GET /api/rag/document/download/<filename>: Download an exported file")
    logger.info("- POST /api/rag/feedback/submit: Submit user feedback")
    logger.info("- GET /api/rag/feedback/stats: Get feedback statistics")

    # Add static files
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    if os.path.exists(static_dir):
        logger.info(f"Adding static files from {static_dir}")

        # Copy frontend integration script to the static directory
        frontend_integration_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'integration', 'frontend_integration.js')
        frontend_integration_dst = os.path.join(static_dir, 'js', 'google_agents_integration', 'frontend_integration.js')

        os.makedirs(os.path.dirname(frontend_integration_dst), exist_ok=True)

        with open(frontend_integration_src, 'r') as src_file:
            with open(frontend_integration_dst, 'w') as dst_file:
                dst_file.write(src_file.read())

        logger.info(f"Copied frontend integration script to {frontend_integration_dst}")

    # Add React components
    components = [
        {
            'src': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'integration', 'FinDocRAGComponent.jsx'),
            'dst': os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'components', 'google_agents_integration', 'FinDocRAGComponent.jsx'),
            'import': "import FinDocRAGComponent from './components/google_agents_integration/FinDocRAGComponent';",
            'usage': "<FinDocRAGComponent apiBaseUrl=\"\" />"
        },
        {
            'src': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'feedback', 'FeedbackComponent.jsx'),
            'dst': os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'components', 'google_agents_integration', 'FeedbackComponent.jsx'),
            'import': "import FeedbackComponent from './components/google_agents_integration/FeedbackComponent';",
            'usage': "<FeedbackComponent sessionId=\"your-session-id\" apiBaseUrl=\"\" />"
        },
        {
            'src': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'feedback', 'FeedbackDashboard.jsx'),
            'dst': os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'components', 'google_agents_integration', 'FeedbackDashboard.jsx'),
            'import': "import FeedbackDashboard from './components/google_agents_integration/FeedbackDashboard';",
            'usage': "<FeedbackDashboard apiBaseUrl=\"\" />"
        }
    ]

    for component in components:
        os.makedirs(os.path.dirname(component['dst']), exist_ok=True)

        with open(component['src'], 'r') as src_file:
            with open(component['dst'], 'w') as dst_file:
                dst_file.write(src_file.read())

        logger.info(f"Copied React component to {component['dst']}")

    logger.info("To use the React components, import them in your frontend code:")
    for component in components:
        logger.info(component['import'])
        logger.info(f"And add it to your JSX: {component['usage']}")
        logger.info("")

    logger.info("The FeedbackComponent can be added to query results to collect user feedback.")
    logger.info("The FeedbackDashboard can be added to an admin page to view feedback statistics.")


if __name__ == "__main__":
    # This script is meant to be imported, not run directly
    logger.info("This script is meant to be imported, not run directly.")
    logger.info("To integrate with FinDoc Analyzer, import this module and call integrate_with_findoc(app).")

    # Example usage
    logger.info("\nExample usage:")
    logger.info("from google_agents_integration.integration_with_findoc import integrate_with_findoc")
    logger.info("integrate_with_findoc(app)")
