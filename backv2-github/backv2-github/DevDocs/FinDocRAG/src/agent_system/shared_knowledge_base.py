"""
Shared Knowledge Base for synchronized testing agents.

This module provides a shared knowledge base that agents can use to store and retrieve
information about the project, test results, and their collaborative work.
"""
import os
import json
import logging
import threading
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SharedKnowledgeBase:
    """
    Shared knowledge base for synchronized testing agents.
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize the shared knowledge base.
        
        Args:
            storage_path: Path to store the knowledge base
        """
        self.storage_path = storage_path or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'knowledge_base')
        
        # Create storage directory if it doesn't exist
        os.makedirs(self.storage_path, exist_ok=True)
        
        # Initialize knowledge base
        self.knowledge = {
            "project_structure": {},
            "test_results": {},
            "agent_activities": {},
            "code_understanding": {},
            "implementation_status": {}
        }
        
        # Load existing knowledge if available
        self.load_knowledge()
        
        # Lock for thread safety
        self.lock = threading.Lock()
    
    def load_knowledge(self):
        """
        Load knowledge from storage.
        """
        knowledge_path = os.path.join(self.storage_path, 'knowledge_base.json')
        
        if os.path.exists(knowledge_path):
            try:
                with open(knowledge_path, 'r', encoding='utf-8') as f:
                    self.knowledge = json.load(f)
                logger.info(f"Loaded knowledge base from {knowledge_path}")
            except Exception as e:
                logger.error(f"Error loading knowledge base: {str(e)}")
    
    def save_knowledge(self):
        """
        Save knowledge to storage.
        """
        knowledge_path = os.path.join(self.storage_path, 'knowledge_base.json')
        
        try:
            with open(knowledge_path, 'w', encoding='utf-8') as f:
                json.dump(self.knowledge, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved knowledge base to {knowledge_path}")
        except Exception as e:
            logger.error(f"Error saving knowledge base: {str(e)}")
    
    def get_knowledge(self, category: str, key: Optional[str] = None) -> Any:
        """
        Get knowledge from the knowledge base.
        
        Args:
            category: Knowledge category
            key: Optional key within the category
            
        Returns:
            Knowledge value
        """
        with self.lock:
            if category not in self.knowledge:
                return None
            
            if key is None:
                return self.knowledge[category]
            
            return self.knowledge[category].get(key)
    
    def set_knowledge(self, category: str, key: str, value: Any):
        """
        Set knowledge in the knowledge base.
        
        Args:
            category: Knowledge category
            key: Key within the category
            value: Knowledge value
        """
        with self.lock:
            if category not in self.knowledge:
                self.knowledge[category] = {}
            
            self.knowledge[category][key] = value
            self.save_knowledge()
    
    def update_knowledge(self, category: str, key: str, value: Any):
        """
        Update knowledge in the knowledge base.
        
        Args:
            category: Knowledge category
            key: Key within the category
            value: Knowledge value to update
        """
        with self.lock:
            if category not in self.knowledge:
                self.knowledge[category] = {}
            
            if key not in self.knowledge[category]:
                self.knowledge[category][key] = value
            elif isinstance(self.knowledge[category][key], dict) and isinstance(value, dict):
                # Merge dictionaries
                self.knowledge[category][key].update(value)
            elif isinstance(self.knowledge[category][key], list) and isinstance(value, list):
                # Extend lists
                self.knowledge[category][key].extend(value)
            else:
                # Replace value
                self.knowledge[category][key] = value
            
            self.save_knowledge()
    
    def add_test_result(self, test_name: str, result: Dict[str, Any]):
        """
        Add a test result to the knowledge base.
        
        Args:
            test_name: Name of the test
            result: Test result
        """
        with self.lock:
            if "test_results" not in self.knowledge:
                self.knowledge["test_results"] = {}
            
            self.knowledge["test_results"][test_name] = {
                "result": result,
                "timestamp": self._get_timestamp()
            }
            
            self.save_knowledge()
    
    def add_agent_activity(self, agent_name: str, activity: Dict[str, Any]):
        """
        Add an agent activity to the knowledge base.
        
        Args:
            agent_name: Name of the agent
            activity: Agent activity
        """
        with self.lock:
            if "agent_activities" not in self.knowledge:
                self.knowledge["agent_activities"] = {}
            
            if agent_name not in self.knowledge["agent_activities"]:
                self.knowledge["agent_activities"][agent_name] = []
            
            self.knowledge["agent_activities"][agent_name].append({
                "activity": activity,
                "timestamp": self._get_timestamp()
            })
            
            self.save_knowledge()
    
    def update_implementation_status(self, component: str, status: Dict[str, Any]):
        """
        Update the implementation status of a component.
        
        Args:
            component: Component name
            status: Implementation status
        """
        with self.lock:
            if "implementation_status" not in self.knowledge:
                self.knowledge["implementation_status"] = {}
            
            self.knowledge["implementation_status"][component] = {
                "status": status,
                "timestamp": self._get_timestamp()
            }
            
            self.save_knowledge()
    
    def _get_timestamp(self) -> str:
        """
        Get the current timestamp.
        
        Returns:
            Current timestamp as a string
        """
        import datetime
        return datetime.datetime.now().isoformat()

# Singleton instance
_knowledge_base = None

def get_knowledge_base() -> SharedKnowledgeBase:
    """
    Get the shared knowledge base instance.
    
    Returns:
        Shared knowledge base instance
    """
    global _knowledge_base
    
    if _knowledge_base is None:
        _knowledge_base = SharedKnowledgeBase()
    
    return _knowledge_base
