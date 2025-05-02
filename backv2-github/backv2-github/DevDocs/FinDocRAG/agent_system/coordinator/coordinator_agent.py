"""
Coordinator Agent for Financial Document Processing.

This module provides the coordinator agent that orchestrates the multi-agent system
for financial document processing.
"""

import os
import logging
import json
from typing import Dict, Any, List, Optional, Union

from ..llm_agent import LlmAgent
from ..base_agent import BaseAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CoordinatorAgent(LlmAgent):
    """
    Coordinator agent for financial document processing.
    """
    
    def __init__(
        self,
        name: str = "coordinator",
        description: str = "I coordinate the document processing workflow.",
        model: str = "gemini-2.0-pro",
        debug: bool = False,
        output_dir: Optional[str] = None,
        sub_agents: Optional[List[BaseAgent]] = None
    ):
        """
        Initialize the coordinator agent.
        
        Args:
            name: Agent name
            description: Agent description
            model: LLM model to use
            debug: Whether to enable debug mode
            output_dir: Directory to save output and debug information
            sub_agents: List of sub-agents to coordinate
        """
        super().__init__(
            name=name,
            description=description,
            model=model,
            debug=debug,
            output_dir=output_dir,
            system_instruction="""
            You are the Coordinator Agent for financial document processing.
            Your role is to orchestrate the workflow between specialized agents:
            1. Document Analyzer Agent: Analyzes document structure and extracts raw data
            2. Financial Reasoner Agent: Validates financial data for consistency and accuracy
            3. Securities Extractor Agent: Extracts and normalizes securities information
            4. Table Understanding Agent: Analyzes complex table structures
            
            You will receive input data, determine which agents to invoke, and in what order.
            You will then collect and consolidate their results into a final output.
            
            Always check for inconsistencies in the data and resolve them by consulting
            the appropriate specialized agent.
            """
        )
        
        # Initialize sub-agents
        self.sub_agents = sub_agents or []
        self.sub_agent_map = {agent.name: agent for agent in self.sub_agents}
        
        logger.info(f"Coordinator agent initialized with {len(self.sub_agents)} sub-agents")
    
    def add_sub_agent(self, agent: BaseAgent) -> None:
        """
        Add a sub-agent to the coordinator.
        
        Args:
            agent: Sub-agent to add
        """
        self.sub_agents.append(agent)
        self.sub_agent_map[agent.name] = agent
        
        logger.info(f"Added sub-agent '{agent.name}' to coordinator")
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data by coordinating sub-agents.
        
        Args:
            input_data: Input data to process
            
        Returns:
            Processing results
        """
        # Update state
        self.set_state({
            "processing": True,
            "completed": False,
            "error": None
        })
        
        try:
            # Log input data if in debug mode
            if self.debug:
                logger.debug(f"Input data: {json.dumps(input_data, indent=2)}")
                self.save_results(input_data, "input_data.json")
            
            # Determine processing workflow
            workflow = self._determine_workflow(input_data)
            
            # Execute workflow
            results = self._execute_workflow(workflow, input_data)
            
            # Validate results
            validated_results = self._validate_results(results)
            
            # Update state
            self.set_state({
                "processing": False,
                "completed": True
            })
            
            # Save results if in debug mode
            if self.debug:
                self.save_results(validated_results)
            
            return validated_results
        except Exception as e:
            # Update state
            self.set_state({
                "processing": False,
                "completed": False,
                "error": str(e)
            })
            
            logger.error(f"Error coordinating processing: {str(e)}")
            
            return {
                "error": str(e),
                "input_data": input_data
            }
    
    def _determine_workflow(self, input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Determine the processing workflow based on input data.
        
        Args:
            input_data: Input data
            
        Returns:
            List of workflow steps
        """
        # Default workflow
        default_workflow = [
            {"agent": "document_analyzer", "action": "analyze"},
            {"agent": "table_understanding", "action": "analyze"},
            {"agent": "securities_extractor", "action": "extract"},
            {"agent": "financial_reasoner", "action": "validate"}
        ]
        
        # Check if we have all required agents
        available_agents = set(self.sub_agent_map.keys())
        required_agents = set(step["agent"] for step in default_workflow)
        
        if not required_agents.issubset(available_agents):
            missing_agents = required_agents - available_agents
            logger.warning(f"Missing required agents: {missing_agents}")
            
            # Filter workflow to only include available agents
            workflow = [step for step in default_workflow if step["agent"] in available_agents]
        else:
            workflow = default_workflow
        
        # Log workflow if in debug mode
        if self.debug:
            logger.debug(f"Workflow: {json.dumps(workflow, indent=2)}")
            self.save_results({"workflow": workflow}, "workflow.json")
        
        return workflow
    
    def _execute_workflow(self, workflow: List[Dict[str, Any]], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the processing workflow.
        
        Args:
            workflow: Processing workflow
            input_data: Input data
            
        Returns:
            Processing results
        """
        results = {
            "input_data": input_data,
            "workflow": workflow,
            "agent_results": {}
        }
        
        # Execute each step in the workflow
        for step in workflow:
            agent_name = step["agent"]
            action = step["action"]
            
            # Check if agent exists
            if agent_name not in self.sub_agent_map:
                logger.warning(f"Agent '{agent_name}' not found, skipping step")
                continue
            
            # Get agent
            agent = self.sub_agent_map[agent_name]
            
            # Prepare input for agent
            agent_input = {
                "action": action,
                "input_data": input_data,
                "previous_results": results["agent_results"]
            }
            
            # Process with agent
            logger.info(f"Processing with agent '{agent_name}'")
            agent_result = agent.process(agent_input)
            
            # Add agent result to results
            results["agent_results"][agent_name] = agent_result
        
        return results
    
    def _validate_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate processing results.
        
        Args:
            results: Processing results
            
        Returns:
            Validated results
        """
        # Check if we have a financial reasoner agent
        if "financial_reasoner" in self.sub_agent_map and "financial_reasoner" in results["agent_results"]:
            # Financial reasoner has already validated the results
            validated_results = results
        else:
            # Perform basic validation
            validated_results = self._basic_validation(results)
        
        # Extract securities
        securities = self._extract_securities(validated_results)
        
        # Add securities to results
        validated_results["securities"] = securities
        
        return validated_results
    
    def _basic_validation(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform basic validation of results.
        
        Args:
            results: Processing results
            
        Returns:
            Validated results
        """
        # Check for errors in agent results
        for agent_name, agent_result in results["agent_results"].items():
            if "error" in agent_result:
                logger.warning(f"Error in agent '{agent_name}' result: {agent_result['error']}")
        
        return results
    
    def _extract_securities(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract securities from results.
        
        Args:
            results: Processing results
            
        Returns:
            List of securities
        """
        securities = []
        
        # Check if we have a securities extractor agent
        if "securities_extractor" in results["agent_results"]:
            # Extract securities from securities extractor result
            extractor_result = results["agent_results"]["securities_extractor"]
            if "securities" in extractor_result:
                securities = extractor_result["securities"]
        
        return securities
