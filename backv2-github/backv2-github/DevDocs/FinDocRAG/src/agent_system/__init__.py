"""
Agent System for synchronized testing and documentation.

This package provides a system of synchronized agents that can test code,
maintain documentation, and collaborate without conflicts.
"""

from .shared_knowledge_base import SharedKnowledgeBase, get_knowledge_base
from .base_agent import BaseAgent
from .code_testing_agent import CodeTestingAgent
from .documentation_agent import DocumentationAgent
from .coordination_agent import CoordinationAgent

__all__ = [
    'SharedKnowledgeBase',
    'get_knowledge_base',
    'BaseAgent',
    'CodeTestingAgent',
    'DocumentationAgent',
    'CoordinationAgent'
]
