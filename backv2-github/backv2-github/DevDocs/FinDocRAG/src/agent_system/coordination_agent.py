"""
Coordination Agent for managing other agents.

This agent is responsible for coordinating the activities of other agents,
assigning tasks, and ensuring that agents work together effectively.
"""
import os
import sys
import logging
import json
import time
import threading
from typing import Dict, List, Any, Optional, Callable

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import the base agent
from base_agent import BaseAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CoordinationAgent(BaseAgent):
    """
    Agent for coordinating other agents.
    """
    
    def __init__(self, name: str = "coordinator", api_key: Optional[str] = None):
        """
        Initialize the coordination agent.
        
        Args:
            name: Agent name
            api_key: Optional API key for external services
        """
        super().__init__(name, "coordinator", api_key)
        
        # Initialize agent registry
        self.agent_registry = {}
        
        # Initialize task registry
        self.task_registry = {}
        
        # Initialize workflow registry
        self.workflow_registry = {}
        
        # Register common workflows
        self._register_common_workflows()
    
    def register_agent(self, agent_name: str, agent_type: str, agent_instance: Any):
        """
        Register an agent.
        
        Args:
            agent_name: Agent name
            agent_type: Agent type
            agent_instance: Agent instance
        """
        self.agent_registry[agent_name] = {
            "type": agent_type,
            "instance": agent_instance
        }
        
        logger.info(f"Registered agent: {agent_name} ({agent_type})")
    
    def register_task(self, task_name: str, task_function: Callable, description: str):
        """
        Register a task.
        
        Args:
            task_name: Task name
            task_function: Task function
            description: Task description
        """
        self.task_registry[task_name] = {
            "function": task_function,
            "description": description
        }
        
        logger.info(f"Registered task: {task_name}")
    
    def register_workflow(self, workflow_name: str, workflow_steps: List[Dict[str, Any]], description: str):
        """
        Register a workflow.
        
        Args:
            workflow_name: Workflow name
            workflow_steps: Workflow steps
            description: Workflow description
        """
        self.workflow_registry[workflow_name] = {
            "steps": workflow_steps,
            "description": description
        }
        
        logger.info(f"Registered workflow: {workflow_name}")
    
    def _register_common_workflows(self):
        """
        Register common workflows.
        """
        # Register workflow for testing enhanced securities extraction
        self.register_workflow(
            "test_enhanced_securities_extraction",
            [
                {
                    "agent": "code_tester",
                    "task": {
                        "type": "run_test",
                        "test_name": "test_enhanced_securities_extraction"
                    }
                },
                {
                    "agent": "documentation_agent",
                    "task": {
                        "type": "document_component",
                        "component_name": "document_enhanced_securities_extraction"
                    }
                }
            ],
            "Test and document the enhanced securities extraction"
        )
        
        # Register workflow for testing all components
        self.register_workflow(
            "test_all_components",
            [
                {
                    "agent": "code_tester",
                    "task": {
                        "type": "run_all_tests"
                    }
                },
                {
                    "agent": "documentation_agent",
                    "task": {
                        "type": "document_all_components"
                    }
                },
                {
                    "agent": "documentation_agent",
                    "task": {
                        "type": "generate_documentation",
                        "doc_type": "markdown"
                    }
                }
            ],
            "Test and document all components"
        )
        
        # Register workflow for generating implementation summary
        self.register_workflow(
            "generate_implementation_summary",
            [
                {
                    "agent": "documentation_agent",
                    "task": {
                        "type": "document_component",
                        "component_name": "generate_implementation_summary"
                    }
                }
            ],
            "Generate an implementation summary"
        )
    
    def _execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a task.
        
        Args:
            task: Task to execute
            
        Returns:
            Task result
        """
        task_type = task.get("type")
        
        if task_type == "run_workflow":
            # Run a workflow
            workflow_name = task.get("workflow_name")
            
            if workflow_name not in self.workflow_registry:
                raise ValueError(f"Workflow not found: {workflow_name}")
            
            workflow = self.workflow_registry[workflow_name]
            
            return self._run_workflow(workflow_name, workflow, **task.get("params", {}))
        
        elif task_type == "assign_task":
            # Assign a task to an agent
            agent_name = task.get("agent_name")
            agent_task = task.get("task")
            
            if agent_name not in self.agent_registry:
                raise ValueError(f"Agent not found: {agent_name}")
            
            agent = self.agent_registry[agent_name]["instance"]
            
            # Add the task to the agent's queue
            agent.add_task(agent_task)
            
            return {
                "agent": agent_name,
                "task": agent_task,
                "status": "assigned"
            }
        
        elif task_type == "get_agent_status":
            # Get the status of an agent
            agent_name = task.get("agent_name")
            
            if agent_name not in self.agent_registry:
                raise ValueError(f"Agent not found: {agent_name}")
            
            agent = self.agent_registry[agent_name]["instance"]
            
            return {
                "agent": agent_name,
                "state": agent.state,
                "current_task": agent.current_task
            }
        
        elif task_type == "get_all_agent_status":
            # Get the status of all agents
            statuses = {}
            
            for agent_name, agent_info in self.agent_registry.items():
                agent = agent_info["instance"]
                
                statuses[agent_name] = {
                    "type": agent_info["type"],
                    "state": agent.state,
                    "current_task": agent.current_task
                }
            
            return {
                "agents": statuses
            }
        
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    def _run_workflow(self, workflow_name: str, workflow: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """
        Run a workflow.
        
        Args:
            workflow_name: Workflow name
            workflow: Workflow definition
            **kwargs: Additional arguments
            
        Returns:
            Workflow result
        """
        logger.info(f"Running workflow: {workflow_name}")
        
        # Record activity
        self.knowledge_base.add_agent_activity(self.name, {
            "action": "start_workflow",
            "workflow": workflow_name
        })
        
        # Execute each step in the workflow
        results = {}
        
        for i, step in enumerate(workflow["steps"]):
            step_name = step.get("name", f"step_{i+1}")
            agent_name = step.get("agent")
            agent_task = step.get("task")
            
            logger.info(f"Executing workflow step: {step_name} (agent: {agent_name})")
            
            if agent_name not in self.agent_registry:
                logger.error(f"Agent not found: {agent_name}")
                results[step_name] = {
                    "error": f"Agent not found: {agent_name}",
                    "status": "failed"
                }
                continue
            
            agent = self.agent_registry[agent_name]["instance"]
            
            # Add the task to the agent's queue
            agent.add_task(agent_task)
            
            # Wait for the agent to complete the task
            while agent.state == "working" or agent.current_task is not None:
                time.sleep(0.1)
            
            # Get the task result from the knowledge base
            task_name = agent_task.get("name", f"{agent_name}_{step_name}")
            task_result = self.knowledge_base.get_knowledge("test_results", task_name)
            
            if task_result is None:
                logger.warning(f"No result found for task: {task_name}")
                results[step_name] = {
                    "agent": agent_name,
                    "task": agent_task,
                    "status": "unknown"
                }
            else:
                results[step_name] = task_result
        
        # Record activity
        self.knowledge_base.add_agent_activity(self.name, {
            "action": "complete_workflow",
            "workflow": workflow_name,
            "results": results
        })
        
        return {
            "workflow": workflow_name,
            "steps": results,
            "status": "completed"
        }
    
    def start_agents(self):
        """
        Start all registered agents.
        """
        for agent_name, agent_info in self.agent_registry.items():
            agent = agent_info["instance"]
            
            # Start the agent in a separate thread
            thread = threading.Thread(target=agent.run)
            thread.daemon = True
            thread.start()
            
            logger.info(f"Started agent: {agent_name}")
    
    def run_workflow(self, workflow_name: str, **kwargs) -> Dict[str, Any]:
        """
        Run a workflow.
        
        Args:
            workflow_name: Workflow name
            **kwargs: Additional arguments
            
        Returns:
            Workflow result
        """
        if workflow_name not in self.workflow_registry:
            raise ValueError(f"Workflow not found: {workflow_name}")
        
        workflow = self.workflow_registry[workflow_name]
        
        # Add the task to the agent's queue
        self.add_task({
            "type": "run_workflow",
            "workflow_name": workflow_name,
            "params": kwargs
        })
        
        # Wait for the task to complete
        while self.state == "working" or self.current_task is not None:
            time.sleep(0.1)
        
        # Get the workflow result from the knowledge base
        workflow_result = self.knowledge_base.get_knowledge("test_results", workflow_name)
        
        if workflow_result is None:
            logger.warning(f"No result found for workflow: {workflow_name}")
            return {
                "workflow": workflow_name,
                "status": "unknown"
            }
        
        return workflow_result
