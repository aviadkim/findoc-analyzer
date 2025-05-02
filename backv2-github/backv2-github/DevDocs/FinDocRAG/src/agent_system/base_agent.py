"""
Base Agent for synchronized testing agents.

This module provides a base agent class that all testing agents will inherit from.
It includes common functionality for interacting with the shared knowledge base,
communicating with other agents, and executing tests.
"""
import os
import logging
import json
import time
import threading
from typing import Dict, List, Any, Optional, Callable

# Import the shared knowledge base
from shared_knowledge_base import get_knowledge_base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent:
    """
    Base agent for synchronized testing agents.
    """
    
    def __init__(self, name: str, role: str, api_key: Optional[str] = None):
        """
        Initialize the base agent.
        
        Args:
            name: Agent name
            role: Agent role
            api_key: Optional API key for external services
        """
        self.name = name
        self.role = role
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        
        # Get the shared knowledge base
        self.knowledge_base = get_knowledge_base()
        
        # Initialize agent state
        self.state = "idle"
        self.current_task = None
        self.task_queue = []
        
        # Register agent in the knowledge base
        self._register_agent()
        
        # Lock for thread safety
        self.lock = threading.Lock()
    
    def _register_agent(self):
        """
        Register the agent in the knowledge base.
        """
        self.knowledge_base.update_knowledge("agent_activities", f"{self.name}_info", {
            "name": self.name,
            "role": self.role,
            "state": self.state,
            "registered_at": self.knowledge_base._get_timestamp()
        })
    
    def add_task(self, task: Dict[str, Any]):
        """
        Add a task to the agent's task queue.
        
        Args:
            task: Task to add
        """
        with self.lock:
            self.task_queue.append(task)
            logger.info(f"Agent {self.name} added task: {task.get('name', 'unnamed')}")
    
    def get_next_task(self) -> Optional[Dict[str, Any]]:
        """
        Get the next task from the agent's task queue.
        
        Returns:
            Next task or None if the queue is empty
        """
        with self.lock:
            if not self.task_queue:
                return None
            
            return self.task_queue.pop(0)
    
    def run(self):
        """
        Run the agent.
        """
        logger.info(f"Agent {self.name} started")
        
        while True:
            # Get the next task
            task = self.get_next_task()
            
            if task is None:
                # No tasks, sleep for a bit
                time.sleep(1)
                continue
            
            # Update agent state
            self.state = "working"
            self.current_task = task
            self._update_agent_state()
            
            # Execute the task
            try:
                logger.info(f"Agent {self.name} executing task: {task.get('name', 'unnamed')}")
                
                # Record activity
                self.knowledge_base.add_agent_activity(self.name, {
                    "action": "start_task",
                    "task": task.get('name', 'unnamed')
                })
                
                # Execute the task
                result = self._execute_task(task)
                
                # Record result
                self.knowledge_base.add_test_result(task.get('name', 'unnamed'), {
                    "agent": self.name,
                    "task": task,
                    "result": result,
                    "status": "completed"
                })
                
                logger.info(f"Agent {self.name} completed task: {task.get('name', 'unnamed')}")
            except Exception as e:
                logger.error(f"Agent {self.name} error executing task {task.get('name', 'unnamed')}: {str(e)}")
                
                # Record error
                self.knowledge_base.add_test_result(task.get('name', 'unnamed'), {
                    "agent": self.name,
                    "task": task,
                    "error": str(e),
                    "status": "failed"
                })
            
            # Update agent state
            self.state = "idle"
            self.current_task = None
            self._update_agent_state()
    
    def _execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a task.
        
        Args:
            task: Task to execute
            
        Returns:
            Task result
        """
        # This method should be overridden by subclasses
        raise NotImplementedError("Subclasses must implement _execute_task")
    
    def _update_agent_state(self):
        """
        Update the agent's state in the knowledge base.
        """
        self.knowledge_base.update_knowledge("agent_activities", f"{self.name}_info", {
            "state": self.state,
            "current_task": self.current_task,
            "updated_at": self.knowledge_base._get_timestamp()
        })
    
    def communicate(self, target_agent: str, message: Dict[str, Any]):
        """
        Communicate with another agent.
        
        Args:
            target_agent: Name of the target agent
            message: Message to send
        """
        # Add a message to the knowledge base
        self.knowledge_base.update_knowledge("agent_activities", f"{target_agent}_messages", {
            "from": self.name,
            "message": message,
            "timestamp": self.knowledge_base._get_timestamp()
        })
        
        logger.info(f"Agent {self.name} sent message to {target_agent}")
    
    def get_messages(self) -> List[Dict[str, Any]]:
        """
        Get messages for this agent.
        
        Returns:
            List of messages
        """
        messages = self.knowledge_base.get_knowledge("agent_activities", f"{self.name}_messages")
        
        if messages is None:
            return []
        
        return messages
    
    def run_test(self, test_name: str, test_function: Callable, **kwargs) -> Dict[str, Any]:
        """
        Run a test and record the result.
        
        Args:
            test_name: Name of the test
            test_function: Test function to run
            **kwargs: Additional arguments for the test function
            
        Returns:
            Test result
        """
        logger.info(f"Agent {self.name} running test: {test_name}")
        
        try:
            # Run the test
            start_time = time.time()
            result = test_function(**kwargs)
            end_time = time.time()
            
            # Record the result
            test_result = {
                "name": test_name,
                "agent": self.name,
                "result": result,
                "duration": end_time - start_time,
                "status": "passed"
            }
            
            self.knowledge_base.add_test_result(test_name, test_result)
            
            logger.info(f"Agent {self.name} completed test: {test_name}")
            
            return test_result
        except Exception as e:
            logger.error(f"Agent {self.name} error running test {test_name}: {str(e)}")
            
            # Record the error
            test_result = {
                "name": test_name,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }
            
            self.knowledge_base.add_test_result(test_name, test_result)
            
            return test_result
