"""
Documentation Agent for maintaining project documentation.

This agent is responsible for maintaining documentation about the project,
including code documentation, test documentation, and implementation status.
"""
import os
import sys
import logging
import json
import inspect
import importlib
from typing import Dict, List, Any, Optional, Callable

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import the base agent
from base_agent import BaseAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentationAgent(BaseAgent):
    """
    Agent for maintaining project documentation.
    """
    
    def __init__(self, name: str = "documentation_agent", api_key: Optional[str] = None):
        """
        Initialize the documentation agent.
        
        Args:
            name: Agent name
            api_key: Optional API key for external services
        """
        super().__init__(name, "documentation", api_key)
        
        # Initialize documentation registry
        self.documentation_registry = {}
        
        # Register common documentation tasks
        self._register_common_tasks()
    
    def _register_common_tasks(self):
        """
        Register common documentation tasks.
        """
        # Register task for documenting enhanced securities extraction
        self.register_task(
            "document_enhanced_securities_extraction",
            self._document_enhanced_securities_extraction,
            "Document the enhanced securities extraction with sequential thinking"
        )
        
        # Register task for documenting table understanding
        self.register_task(
            "document_table_understanding",
            self._document_table_understanding,
            "Document the table understanding agent"
        )
        
        # Register task for documenting verification system
        self.register_task(
            "document_verification_system",
            self._document_verification_system,
            "Document the verification system"
        )
        
        # Register task for generating implementation summary
        self.register_task(
            "generate_implementation_summary",
            self._generate_implementation_summary,
            "Generate an implementation summary"
        )
    
    def register_task(self, task_name: str, task_function: Callable, description: str):
        """
        Register a documentation task.
        
        Args:
            task_name: Name of the task
            task_function: Task function
            description: Task description
        """
        self.documentation_registry[task_name] = {
            "function": task_function,
            "description": description
        }
        
        logger.info(f"Registered documentation task: {task_name}")
    
    def _execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a task.
        
        Args:
            task: Task to execute
            
        Returns:
            Task result
        """
        task_type = task.get("type")
        
        if task_type == "document_component":
            # Document a specific component
            component_name = task.get("component_name")
            
            if component_name in self.documentation_registry:
                # Use registered task
                task_info = self.documentation_registry[component_name]
                task_function = task_info["function"]
                
                # Run the task
                return task_function(**task.get("params", {}))
            else:
                # Generic documentation
                return self._document_component(component_name, **task.get("params", {}))
        
        elif task_type == "document_all_components":
            # Document all components
            results = {}
            
            for task_name, task_info in self.documentation_registry.items():
                task_function = task_info["function"]
                
                # Run the task
                results[task_name] = task_function(**task.get("params", {}))
            
            return {
                "all_components": results,
                "summary": {
                    "total": len(results),
                    "completed": sum(1 for r in results.values() if r.get("status") == "completed")
                }
            }
        
        elif task_type == "generate_documentation":
            # Generate documentation
            doc_type = task.get("doc_type", "markdown")
            components = task.get("components", [])
            
            if not components:
                # Document all components
                components = list(self.documentation_registry.keys())
            
            # Generate documentation for each component
            component_docs = {}
            
            for component in components:
                if component in self.documentation_registry:
                    # Use registered task
                    task_info = self.documentation_registry[component]
                    task_function = task_info["function"]
                    
                    # Run the task
                    component_docs[component] = task_function(**task.get("params", {}))
                else:
                    # Generic documentation
                    component_docs[component] = self._document_component(component, **task.get("params", {}))
            
            # Generate combined documentation
            if doc_type == "markdown":
                return self._generate_markdown_documentation(component_docs)
            elif doc_type == "html":
                return self._generate_html_documentation(component_docs)
            else:
                return {
                    "error": f"Unknown documentation type: {doc_type}",
                    "status": "failed"
                }
        
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    def _document_component(self, component_name: str, **kwargs) -> Dict[str, Any]:
        """
        Document a component.
        
        Args:
            component_name: Name of the component
            **kwargs: Additional arguments
            
        Returns:
            Documentation result
        """
        try:
            # Try to import the component
            module_path = component_name.replace("-", "_").replace("/", ".")
            
            try:
                module = importlib.import_module(module_path)
            except ImportError:
                # Try alternative paths
                alternative_paths = [
                    f"src.{module_path}",
                    f"google_agents_integration.agents.{module_path}",
                    f"framework.{module_path}",
                    f"knowledge.{module_path}"
                ]
                
                for path in alternative_paths:
                    try:
                        module = importlib.import_module(path)
                        break
                    except ImportError:
                        continue
                else:
                    return {
                        "error": f"Could not import component: {component_name}",
                        "status": "failed"
                    }
            
            # Extract documentation
            doc = module.__doc__ or ""
            
            # Extract classes and functions
            classes = []
            functions = []
            
            for name, obj in inspect.getmembers(module):
                if inspect.isclass(obj) and obj.__module__ == module.__name__:
                    # Class
                    class_doc = obj.__doc__ or ""
                    
                    # Extract methods
                    methods = []
                    
                    for method_name, method in inspect.getmembers(obj):
                        if inspect.isfunction(method) and not method_name.startswith("_"):
                            method_doc = method.__doc__ or ""
                            
                            methods.append({
                                "name": method_name,
                                "doc": method_doc,
                                "signature": str(inspect.signature(method))
                            })
                    
                    classes.append({
                        "name": name,
                        "doc": class_doc,
                        "methods": methods
                    })
                
                elif inspect.isfunction(obj) and obj.__module__ == module.__name__ and not name.startswith("_"):
                    # Function
                    func_doc = obj.__doc__ or ""
                    
                    functions.append({
                        "name": name,
                        "doc": func_doc,
                        "signature": str(inspect.signature(obj))
                    })
            
            return {
                "component": component_name,
                "doc": doc,
                "classes": classes,
                "functions": functions,
                "status": "completed"
            }
        
        except Exception as e:
            logger.error(f"Error documenting component {component_name}: {str(e)}")
            return {
                "component": component_name,
                "error": str(e),
                "status": "failed"
            }
    
    def _document_enhanced_securities_extraction(self, **kwargs) -> Dict[str, Any]:
        """
        Document the enhanced securities extraction with sequential thinking.
        
        Args:
            **kwargs: Additional arguments
            
        Returns:
            Documentation result
        """
        # Document the component
        component_doc = self._document_component("securities_extraction_agent_enhanced", **kwargs)
        
        # Add additional information
        component_doc["summary"] = """
        The Enhanced Securities Extraction Agent uses sequential thinking and Gemini Pro to extract
        securities information from financial documents with high accuracy. It follows a step-by-step
        approach to analyze document structure, understand tables, and extract securities information.
        
        Key features:
        - Sequential thinking framework for step-by-step analysis
        - Integration with Gemini Pro for advanced AI capabilities
        - Table understanding for accurate extraction from complex tables
        - Validation and enhancement of extracted securities
        - Support for different document types and formats
        """
        
        # Add implementation status
        component_doc["implementation_status"] = {
            "status": "completed",
            "version": "1.0",
            "last_updated": self.knowledge_base._get_timestamp()
        }
        
        # Update knowledge base
        self.knowledge_base.update_implementation_status("enhanced_securities_extraction", {
            "status": "completed",
            "version": "1.0",
            "documentation": "available"
        })
        
        return component_doc
    
    def _document_table_understanding(self, **kwargs) -> Dict[str, Any]:
        """
        Document the table understanding agent.
        
        Args:
            **kwargs: Additional arguments
            
        Returns:
            Documentation result
        """
        # Document the component
        component_doc = self._document_component("table_understanding_agent", **kwargs)
        
        # Add additional information
        component_doc["summary"] = """
        The Table Understanding Agent is responsible for understanding table structures in financial
        documents and extracting meaningful information from them. It uses sequential thinking to
        analyze table structure, identify columns and rows, and map them to financial concepts.
        
        Key features:
        - Table identification in documents
        - Column and row structure analysis
        - Mapping columns to financial concepts
        - Support for different table types and formats
        """
        
        # Add implementation status
        component_doc["implementation_status"] = {
            "status": "completed",
            "version": "1.0",
            "last_updated": self.knowledge_base._get_timestamp()
        }
        
        # Update knowledge base
        self.knowledge_base.update_implementation_status("table_understanding", {
            "status": "completed",
            "version": "1.0",
            "documentation": "available"
        })
        
        return component_doc
    
    def _document_verification_system(self, **kwargs) -> Dict[str, Any]:
        """
        Document the verification system.
        
        Args:
            **kwargs: Additional arguments
            
        Returns:
            Documentation result
        """
        # Document the component
        component_doc = self._document_component("verification_agent", **kwargs)
        
        # Add additional information
        component_doc["summary"] = """
        The Verification Agent is responsible for verifying the accuracy of extracted financial data
        and providing confidence scores and suggestions for improvements. It validates securities,
        portfolio totals, and overall confidence to ensure accurate extraction.
        
        Key features:
        - Securities validation
        - Portfolio total verification
        - Confidence scoring
        - Suggestions for improving extraction accuracy
        """
        
        # Add implementation status
        component_doc["implementation_status"] = {
            "status": "completed",
            "version": "1.0",
            "last_updated": self.knowledge_base._get_timestamp()
        }
        
        # Update knowledge base
        self.knowledge_base.update_implementation_status("verification_system", {
            "status": "completed",
            "version": "1.0",
            "documentation": "available"
        })
        
        return component_doc
    
    def _generate_implementation_summary(self, **kwargs) -> Dict[str, Any]:
        """
        Generate an implementation summary.
        
        Args:
            **kwargs: Additional arguments
            
        Returns:
            Implementation summary
        """
        # Get implementation status from knowledge base
        implementation_status = self.knowledge_base.get_knowledge("implementation_status")
        
        if not implementation_status:
            return {
                "error": "No implementation status available",
                "status": "failed"
            }
        
        # Generate summary
        summary = {
            "components": [],
            "overall_status": "completed",
            "timestamp": self.knowledge_base._get_timestamp()
        }
        
        for component, status in implementation_status.items():
            component_status = status.get("status", "unknown")
            
            summary["components"].append({
                "name": component,
                "status": component_status,
                "version": status.get("version", "unknown"),
                "documentation": status.get("documentation", "unavailable")
            })
            
            if component_status != "completed":
                summary["overall_status"] = "in_progress"
        
        return summary
    
    def _generate_markdown_documentation(self, component_docs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate markdown documentation.
        
        Args:
            component_docs: Component documentation
            
        Returns:
            Markdown documentation
        """
        markdown = "# FinDocRAG Documentation\n\n"
        
        # Add table of contents
        markdown += "## Table of Contents\n\n"
        
        for component, doc in component_docs.items():
            if doc.get("status") == "completed":
                markdown += f"- [{component}](#{component.lower().replace('_', '-')})\n"
        
        markdown += "\n"
        
        # Add component documentation
        for component, doc in component_docs.items():
            if doc.get("status") != "completed":
                continue
            
            markdown += f"## {component}\n\n"
            
            # Add summary
            if "summary" in doc:
                markdown += f"{doc['summary']}\n\n"
            
            # Add module documentation
            if "doc" in doc:
                markdown += f"{doc['doc']}\n\n"
            
            # Add classes
            for cls in doc.get("classes", []):
                markdown += f"### {cls['name']}\n\n"
                markdown += f"{cls['doc']}\n\n"
                
                # Add methods
                for method in cls.get("methods", []):
                    markdown += f"#### {method['name']}{method['signature']}\n\n"
                    markdown += f"{method['doc']}\n\n"
            
            # Add functions
            for func in doc.get("functions", []):
                markdown += f"### {func['name']}{func['signature']}\n\n"
                markdown += f"{func['doc']}\n\n"
            
            markdown += "\n"
        
        # Save markdown to file
        docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'docs')
        os.makedirs(docs_dir, exist_ok=True)
        
        markdown_path = os.path.join(docs_dir, 'documentation.md')
        
        with open(markdown_path, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        return {
            "markdown": markdown,
            "path": markdown_path,
            "status": "completed"
        }
    
    def _generate_html_documentation(self, component_docs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate HTML documentation.
        
        Args:
            component_docs: Component documentation
            
        Returns:
            HTML documentation
        """
        html = """<!DOCTYPE html>
<html>
<head>
    <title>FinDocRAG Documentation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #2980b9;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        h3 {
            color: #3498db;
        }
        h4 {
            color: #2c3e50;
        }
        pre {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 10px;
            overflow: auto;
        }
        .toc {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 10px;
            margin-bottom: 20px;
        }
        .toc ul {
            list-style-type: none;
            padding-left: 20px;
        }
        .component {
            margin-bottom: 30px;
        }
        .method, .function {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>FinDocRAG Documentation</h1>
    
    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
"""
        
        # Add table of contents
        for component, doc in component_docs.items():
            if doc.get("status") == "completed":
                html += f'            <li><a href="#{component.lower().replace("_", "-")}">{component}</a></li>\n'
        
        html += """        </ul>
    </div>
    
"""
        
        # Add component documentation
        for component, doc in component_docs.items():
            if doc.get("status") != "completed":
                continue
            
            html += f'    <div class="component" id="{component.lower().replace("_", "-")}">\n'
            html += f'        <h2>{component}</h2>\n'
            
            # Add summary
            if "summary" in doc:
                html += f'        <p>{doc["summary"].replace("\n", "<br>")}</p>\n'
            
            # Add module documentation
            if "doc" in doc:
                html += f'        <p>{doc["doc"].replace("\n", "<br>")}</p>\n'
            
            # Add classes
            for cls in doc.get("classes", []):
                html += f'        <h3>{cls["name"]}</h3>\n'
                html += f'        <p>{cls["doc"].replace("\n", "<br>")}</p>\n'
                
                # Add methods
                for method in cls.get("methods", []):
                    html += f'        <div class="method">\n'
                    html += f'            <h4>{method["name"]}{method["signature"]}</h4>\n'
                    html += f'            <p>{method["doc"].replace("\n", "<br>")}</p>\n'
                    html += f'        </div>\n'
            
            # Add functions
            for func in doc.get("functions", []):
                html += f'        <div class="function">\n'
                html += f'            <h3>{func["name"]}{func["signature"]}</h3>\n'
                html += f'            <p>{func["doc"].replace("\n", "<br>")}</p>\n'
                html += f'        </div>\n'
            
            html += f'    </div>\n\n'
        
        html += """</body>
</html>
"""
        
        # Save HTML to file
        docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'docs')
        os.makedirs(docs_dir, exist_ok=True)
        
        html_path = os.path.join(docs_dir, 'documentation.html')
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        return {
            "html": html,
            "path": html_path,
            "status": "completed"
        }
