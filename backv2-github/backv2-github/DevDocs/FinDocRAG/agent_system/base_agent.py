"""
Base Agent Class for Financial Document Processing.

This module provides the base agent class that all specialized agents will inherit from.
It defines the common interface and functionality for all agents in the system.
"""

import os
import logging
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Union

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """
    Base agent class for financial document processing.
    """
    
    def __init__(
        self,
        name: str,
        description: str,
        model: str = "gemini-2.0-pro",
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the base agent.
        
        Args:
            name: Agent name
            description: Agent description
            model: LLM model to use
            debug: Whether to enable debug mode
            output_dir: Directory to save output and debug information
        """
        self.name = name
        self.description = description
        self.model = model
        self.debug = debug
        
        # Create output directory if provided
        if output_dir:
            self.output_dir = output_dir
            os.makedirs(output_dir, exist_ok=True)
        else:
            self.output_dir = os.path.join("output", name)
            os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize state
        self.state = {
            "initialized": True,
            "processing": False,
            "completed": False,
            "error": None
        }
        
        logger.info(f"Agent '{name}' initialized with model '{model}'")
    
    @abstractmethod
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return results.
        
        Args:
            input_data: Input data to process
            
        Returns:
            Processing results
        """
        pass
    
    def save_results(self, results: Dict[str, Any], filename: str = "results.json") -> str:
        """
        Save processing results to file.
        
        Args:
            results: Results to save
            filename: Filename to save results to
            
        Returns:
            Path to saved results file
        """
        # Create output path
        output_path = os.path.join(self.output_dir, filename)
        
        # Save results to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to {output_path}")
        
        return output_path
    
    def load_results(self, filename: str = "results.json") -> Dict[str, Any]:
        """
        Load processing results from file.
        
        Args:
            filename: Filename to load results from
            
        Returns:
            Loaded results
        """
        # Create input path
        input_path = os.path.join(self.output_dir, filename)
        
        # Check if file exists
        if not os.path.exists(input_path):
            logger.warning(f"Results file {input_path} does not exist")
            return {}
        
        # Load results from file
        with open(input_path, 'r', encoding='utf-8') as f:
            results = json.load(f)
        
        logger.info(f"Results loaded from {input_path}")
        
        return results
    
    def get_state(self) -> Dict[str, Any]:
        """
        Get agent state.
        
        Returns:
            Agent state
        """
        return self.state
    
    def set_state(self, state: Dict[str, Any]) -> None:
        """
        Set agent state.
        
        Args:
            state: Agent state
        """
        self.state.update(state)
    
    def reset(self) -> None:
        """
        Reset agent state.
        """
        self.state = {
            "initialized": True,
            "processing": False,
            "completed": False,
            "error": None
        }
        
        logger.info(f"Agent '{self.name}' reset")
    
    def __str__(self) -> str:
        """
        Get string representation of agent.
        
        Returns:
            String representation
        """
        return f"{self.name} ({self.__class__.__name__}): {self.description}"
