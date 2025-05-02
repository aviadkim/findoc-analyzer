"""
Script to run the agent system and test the enhanced securities extraction.

This script initializes the agent system, registers agents, and runs workflows
to test and document the enhanced securities extraction.
"""
import os
import sys
import logging
import json
import argparse
import time
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the agent_system directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'agent_system'))

# Import agents
from coordination_agent import CoordinationAgent
from code_testing_agent import CodeTestingAgent
from documentation_agent import DocumentationAgent

def run_agent_system(api_key: Optional[str] = None, workflow: Optional[str] = None):
    """
    Run the agent system.
    
    Args:
        api_key: Optional API key for Gemini
        workflow: Optional workflow to run
    """
    logger.info("Initializing agent system...")
    
    # Create agents
    coordinator = CoordinationAgent(api_key=api_key)
    code_tester = CodeTestingAgent(api_key=api_key)
    documentation_agent = DocumentationAgent(api_key=api_key)
    
    # Register agents with the coordinator
    coordinator.register_agent("code_tester", "testing", code_tester)
    coordinator.register_agent("documentation_agent", "documentation", documentation_agent)
    
    # Start agents
    logger.info("Starting agents...")
    coordinator.start_agents()
    
    # Wait for agents to initialize
    time.sleep(1)
    
    # Run workflow
    if workflow:
        logger.info(f"Running workflow: {workflow}")
        result = coordinator.run_workflow(workflow)
        
        logger.info(f"Workflow result: {json.dumps(result, indent=2)}")
    else:
        # Run the default workflow
        logger.info("Running default workflow: test_enhanced_securities_extraction")
        result = coordinator.run_workflow("test_enhanced_securities_extraction")
        
        logger.info(f"Workflow result: {json.dumps(result, indent=2)}")
    
    # Generate implementation summary
    logger.info("Generating implementation summary...")
    summary_result = coordinator.run_workflow("generate_implementation_summary")
    
    logger.info(f"Implementation summary: {json.dumps(summary_result, indent=2)}")
    
    # Wait for all tasks to complete
    logger.info("Waiting for all tasks to complete...")
    time.sleep(5)
    
    logger.info("Agent system completed")

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the agent system.')
    parser.add_argument('--api-key', type=str, help='Gemini API key')
    parser.add_argument('--workflow', type=str, help='Workflow to run')
    
    args = parser.parse_args()
    
    # Get the API key
    api_key = args.api_key or os.environ.get('GEMINI_API_KEY')
    
    if not api_key:
        logger.warning("No API key provided. Using default OpenRouter key.")
        api_key = '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'
    
    # Run the agent system
    run_agent_system(api_key, args.workflow)

if __name__ == "__main__":
    main()
