"""
LLM Agent Class for Financial Document Processing.

This module provides the LLM agent class that uses the Gemini model for processing.
It extends the base agent class with LLM-specific functionality.
"""

import os
import logging
import json
import time
from typing import Dict, Any, List, Optional, Union, Callable

from .base_agent import BaseAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LlmAgent(BaseAgent):
    """
    LLM agent class for financial document processing.
    """
    
    def __init__(
        self,
        name: str,
        description: str,
        model: str = "gemini-2.0-pro",
        temperature: float = 0.2,
        max_output_tokens: int = 8192,
        top_p: float = 0.95,
        top_k: int = 64,
        debug: bool = False,
        output_dir: Optional[str] = None,
        system_instruction: Optional[str] = None
    ):
        """
        Initialize the LLM agent.
        
        Args:
            name: Agent name
            description: Agent description
            model: LLM model to use
            temperature: Sampling temperature
            max_output_tokens: Maximum number of tokens to generate
            top_p: Top-p sampling parameter
            top_k: Top-k sampling parameter
            debug: Whether to enable debug mode
            output_dir: Directory to save output and debug information
            system_instruction: System instruction for the model
        """
        super().__init__(name, description, model, debug, output_dir)
        
        self.temperature = temperature
        self.max_output_tokens = max_output_tokens
        self.top_p = top_p
        self.top_k = top_k
        self.system_instruction = system_instruction or f"You are {name}, {description}"
        
        # Initialize model
        try:
            # Import here to avoid dependency issues
            import google.generativeai as genai
            
            # Check if API key is set
            api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("OPENROUTER_API_KEY")
            if not api_key:
                logger.warning("No API key found for Gemini. Using mock responses.")
                self.model_instance = None
                self.use_mock = True
            else:
                # Configure genai
                genai.configure(api_key=api_key)
                
                # Create model instance
                self.model_instance = genai.GenerativeModel(
                    model_name=model,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": max_output_tokens,
                        "top_p": top_p,
                        "top_k": top_k
                    },
                    system_instruction=self.system_instruction
                )
                self.use_mock = False
                
                logger.info(f"LLM model '{model}' initialized")
        except ImportError:
            logger.warning("google.generativeai not found. Using mock responses.")
            self.model_instance = None
            self.use_mock = True
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data using the LLM model.
        
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
            # Extract prompt from input data
            prompt = input_data.get("prompt", "")
            if not prompt:
                # Try to create a prompt from the input data
                prompt = self._create_prompt(input_data)
            
            # Log prompt if in debug mode
            if self.debug:
                logger.debug(f"Prompt: {prompt}")
                self.save_results({"prompt": prompt}, "prompt.json")
            
            # Process with LLM
            if self.use_mock:
                # Use mock response
                response = self._mock_response(prompt, input_data)
                time.sleep(1)  # Simulate processing time
            else:
                # Use actual LLM
                response = self._process_with_llm(prompt)
            
            # Parse response
            results = self._parse_response(response, input_data)
            
            # Update state
            self.set_state({
                "processing": False,
                "completed": True
            })
            
            # Save results if in debug mode
            if self.debug:
                self.save_results(results)
            
            return results
        except Exception as e:
            # Update state
            self.set_state({
                "processing": False,
                "completed": False,
                "error": str(e)
            })
            
            logger.error(f"Error processing input data: {str(e)}")
            
            return {
                "error": str(e),
                "input_data": input_data
            }
    
    def _create_prompt(self, input_data: Dict[str, Any]) -> str:
        """
        Create a prompt from input data.
        
        Args:
            input_data: Input data
            
        Returns:
            Prompt string
        """
        # Default implementation - override in subclasses for specific prompt formats
        return json.dumps(input_data, indent=2)
    
    def _process_with_llm(self, prompt: str) -> str:
        """
        Process prompt with LLM.
        
        Args:
            prompt: Prompt to process
            
        Returns:
            LLM response
        """
        try:
            # Generate content
            response = self.model_instance.generate_content(prompt)
            
            # Extract text
            return response.text
        except Exception as e:
            logger.error(f"Error processing with LLM: {str(e)}")
            raise
    
    def _parse_response(self, response: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse LLM response.
        
        Args:
            response: LLM response
            input_data: Original input data
            
        Returns:
            Parsed response
        """
        # Default implementation - override in subclasses for specific response parsing
        try:
            # Try to parse as JSON
            return json.loads(response)
        except:
            # Return as text
            return {
                "text": response,
                "input_data": input_data
            }
    
    def _mock_response(self, prompt: str, input_data: Dict[str, Any]) -> str:
        """
        Generate a mock response for testing.
        
        Args:
            prompt: Prompt
            input_data: Input data
            
        Returns:
            Mock response
        """
        # Default mock response - override in subclasses for specific mock responses
        return json.dumps({
            "agent": self.name,
            "response": f"This is a mock response from {self.name}",
            "input_summary": f"Received input with {len(input_data)} keys"
        }, indent=2)
