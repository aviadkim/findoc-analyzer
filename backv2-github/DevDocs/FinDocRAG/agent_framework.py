"""
Agent Framework for financial document processing.

This module provides a framework for implementing Google Agent technologies (ADK, A2A)
for financial document processing.
"""

import os
import sys
import json
import logging
import time
import uuid
from typing import List, Dict, Any, Optional, Tuple, Callable

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    logger.warning("python-dotenv package not installed. Environment variables will not be loaded from .env file.")

# Check if we should use mock API for testing
USE_MOCK_API = os.environ.get("USE_MOCK_API", "False").lower() in ["true", "1", "yes"]

# Configure Google Generative AI if not using mock API
if not USE_MOCK_API:
    try:
        import google.generativeai as genai

        # Configure Google Generative AI
        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
        if GOOGLE_API_KEY:
            genai.configure(api_key=GOOGLE_API_KEY)
        else:
            logger.warning("GOOGLE_API_KEY not found in environment variables")
    except ImportError:
        logger.warning("google-generativeai package not installed. Using mock API.")
        USE_MOCK_API = True

class Agent:
    """
    Base class for all agents.
    """

    def __init__(self, name: str, model: str = "gemini-1.5-pro", debug: bool = False):
        """
        Initialize the agent.

        Args:
            name: Agent name
            model: Model to use
            debug: Whether to print debug information
        """
        self.name = name
        self.model = model
        self.debug = debug
        self.conversation_history = []
        self.knowledge_base = {}
        self.agent_id = str(uuid.uuid4())

    def add_to_knowledge_base(self, key: str, value: Any) -> None:
        """
        Add information to the agent's knowledge base.

        Args:
            key: Key to store the information under
            value: Information to store
        """
        self.knowledge_base[key] = value

    def get_from_knowledge_base(self, key: str) -> Any:
        """
        Get information from the agent's knowledge base.

        Args:
            key: Key to retrieve information for

        Returns:
            Information stored under the key, or None if not found
        """
        return self.knowledge_base.get(key)

    def generate_response(self, prompt: str, temperature: float = 0.2) -> str:
        """
        Generate a response using the model.

        Args:
            prompt: Prompt to send to the model
            temperature: Temperature to use for generation

        Returns:
            Generated response
        """
        # Add prompt to conversation history
        self.conversation_history.append({"role": "user", "content": prompt})

        # Check if we should use mock API
        if USE_MOCK_API:
            # Generate mock response based on prompt
            response_text = self._generate_mock_response(prompt)
        else:
            # Check if API key is configured
            if not 'genai' in globals() or not GOOGLE_API_KEY:
                logger.warning("Using mock API because Google API is not configured.")
                response_text = self._generate_mock_response(prompt)
            else:
                try:
                    # Generate response using Google API
                    response = genai.generate_text(
                        model=self.model,
                        prompt=prompt,
                        temperature=temperature
                    )
                    response_text = response.text
                except Exception as e:
                    logger.error(f"Error generating response: {str(e)}")
                    response_text = f"Error generating response: {str(e)}"

        # Add response to conversation history
        self.conversation_history.append({"role": "assistant", "content": response_text})

        return response_text

    def _generate_mock_response(self, prompt: str) -> str:
        """
        Generate a mock response for testing without API keys.

        Args:
            prompt: Prompt to generate a response for

        Returns:
            Mock response
        """
        # Check if prompt is asking for document classification
        if "document classifier" in prompt.lower() and "classify" in prompt.lower():
            return json.dumps({
                "document_type": "portfolio_statement",
                "confidence": 85,
                "features": {
                    "keywords": ["portfolio", "statement", "asset", "allocation", "holdings"],
                    "patterns": ["portfolio statement", "asset allocation"]
                },
                "metadata": {
                    "date": "2023-01-15",
                    "account_number": "123456789"
                }
            }, indent=2)

        # Check if prompt is asking for portfolio summary
        elif "portfolio summary" in prompt.lower() or "extract the following information" in prompt.lower():
            return json.dumps({
                "total_value": 19510599,
                "currency": "USD",
                "asset_allocation": {
                    "Bonds": 59.24,
                    "Equities": 0.14,
                    "Structured products": 40.24,
                    "Liquidity": 0.25,
                    "Other assets": 0.13
                },
                "currency_allocation": {
                    "USD": 100.0
                },
                "top_positions": [
                    {
                        "isin": "XS2396778100",
                        "description": "BARCLAYS BANK PLC 0% 31/12/2025",
                        "value": 2000000,
                        "currency": "USD",
                        "percentage": 10.25
                    }
                ]
            }, indent=2)

        # Check if prompt is asking for securities enhancement
        elif "securities extraction" in prompt.lower() or "enhance this information" in prompt.lower():
            return json.dumps([
                {
                    "isin": "XS2396778100",
                    "description": "BARCLAYS BANK PLC 0% 31/12/2025",
                    "nominal_value": 2000000,
                    "price": 100.0,
                    "acquisition_price": 98.5,
                    "actual_value": 2000000,
                    "currency": "USD",
                    "weight": 10.25,
                    "is_valid_isin": True
                }
            ], indent=2)

        # Check if prompt is asking for table structure analysis
        elif "table structure" in prompt.lower() or "analyze the structure" in prompt.lower():
            return json.dumps({
                "purpose": "portfolio holdings",
                "header_rows": [0, 1],
                "footer_rows": [-1],
                "column_types": {
                    "0": "isin",
                    "1": "description",
                    "2": "quantity",
                    "3": "price",
                    "4": "value",
                    "5": "currency",
                    "6": "weight"
                },
                "notes": "This table contains portfolio holdings with security details."
            }, indent=2)

        # Default response
        else:
            return "I'm a mock AI assistant for testing. Please provide a specific prompt for financial document analysis."

    def process(self, input_data: Any) -> Any:
        """
        Process input data.

        Args:
            input_data: Input data to process

        Returns:
            Processed data
        """
        raise NotImplementedError("Subclasses must implement process method")

class DocumentClassifierAgent(Agent):
    """
    Agent for classifying financial documents.
    """

    def __init__(self, name: str = "Document Classifier", model: str = "gemini-1.5-pro", debug: bool = False):
        """
        Initialize the document classifier agent.

        Args:
            name: Agent name
            model: Model to use
            debug: Whether to print debug information
        """
        super().__init__(name, model, debug)

    def process(self, document_path: str) -> Dict[str, Any]:
        """
        Classify a document.

        Args:
            document_path: Path to the document

        Returns:
            Dictionary containing document classification
        """
        # Extract text from document
        document_text = self._extract_text(document_path)

        # Create prompt for document classification
        prompt = self._create_classification_prompt(document_text)

        # Generate response
        response = self.generate_response(prompt)

        # Parse response
        classification = self._parse_classification_response(response)

        return classification

    def _extract_text(self, document_path: str) -> str:
        """
        Extract text from a document.

        Args:
            document_path: Path to the document

        Returns:
            Extracted text
        """
        # Import document-specific modules only when needed
        if document_path.lower().endswith(".pdf"):
            import fitz  # PyMuPDF

            try:
                # Open the PDF
                doc = fitz.open(document_path)

                # Extract text from first few pages
                text = ""
                for page_num in range(min(5, len(doc))):
                    page = doc[page_num]
                    text += page.get_text()

                # Close the PDF
                doc.close()

                return text
            except Exception as e:
                logger.error(f"Error extracting text from PDF: {str(e)}")
                return ""
        elif document_path.lower().endswith((".xlsx", ".xls")):
            import pandas as pd

            try:
                # Read Excel file
                df = pd.read_excel(document_path, sheet_name=None)

                # Extract text from each sheet
                text = ""
                for sheet_name, sheet_df in df.items():
                    text += f"Sheet: {sheet_name}\n"
                    text += sheet_df.to_string(index=False) + "\n\n"

                return text
            except Exception as e:
                logger.error(f"Error extracting text from Excel: {str(e)}")
                return ""
        else:
            logger.error(f"Unsupported document format: {document_path}")
            return ""

    def _create_classification_prompt(self, document_text: str) -> str:
        """
        Create a prompt for document classification.

        Args:
            document_text: Text extracted from the document

        Returns:
            Prompt for document classification
        """
        # Truncate document text if too long
        max_text_length = 10000
        if len(document_text) > max_text_length:
            document_text = document_text[:max_text_length] + "..."

        prompt = f"""
        You are a financial document classifier. Your task is to analyze the following document text and classify it into one of the following categories:
        1. Portfolio Statement - Shows holdings, positions, and asset allocation
        2. Transaction Report - Shows buy/sell transactions
        3. Performance Report - Shows investment performance and returns
        4. Account Statement - Shows account activity and balances
        5. Tax Document - Shows tax-related information

        Document Text:
        {document_text}

        Please respond with a JSON object containing the following fields:
        - document_type: The type of document (one of the categories above)
        - confidence: A confidence score between 0 and 100
        - features: Key features that led to this classification
        - metadata: Any metadata extracted from the document (date, account number, etc.)

        JSON Response:
        """

        return prompt

    def _parse_classification_response(self, response: str) -> Dict[str, Any]:
        """
        Parse the classification response.

        Args:
            response: Response from the model

        Returns:
            Parsed classification
        """
        try:
            # Extract JSON from response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1

            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                classification = json.loads(json_str)
                return classification
            else:
                # If no JSON found, try to extract information from text
                classification = {
                    "document_type": "unknown",
                    "confidence": 0,
                    "features": {},
                    "metadata": {}
                }

                # Look for document type
                document_types = ["portfolio statement", "transaction report", "performance report", "account statement", "tax document"]
                for doc_type in document_types:
                    if doc_type in response.lower():
                        classification["document_type"] = doc_type.replace(" ", "_")
                        classification["confidence"] = 50  # Medium confidence
                        break

                return classification
        except Exception as e:
            logger.error(f"Error parsing classification response: {str(e)}")
            return {
                "document_type": "unknown",
                "confidence": 0,
                "features": {},
                "metadata": {"error": str(e)}
            }

class PortfolioStatementAgent(Agent):
    """
    Agent for processing portfolio statements.
    """

    def __init__(self, name: str = "Portfolio Statement Agent", model: str = "gemini-1.5-pro", debug: bool = False):
        """
        Initialize the portfolio statement agent.

        Args:
            name: Agent name
            model: Model to use
            debug: Whether to print debug information
        """
        super().__init__(name, model, debug)

    def process(self, document_path: str) -> Dict[str, Any]:
        """
        Process a portfolio statement.

        Args:
            document_path: Path to the document

        Returns:
            Dictionary containing extracted information
        """
        # Extract tables from document
        from enhanced_table_extractor import EnhancedTableExtractor
        extractor = EnhancedTableExtractor(debug=self.debug)
        tables_result = extractor.extract_tables(document_path)

        # Extract securities using grid analyzer
        from grid_analyzer import GridAnalyzer
        analyzer = GridAnalyzer(debug=self.debug)
        securities = analyzer.extract_securities(document_path)

        # Extract portfolio summary
        portfolio_summary = self._extract_portfolio_summary(document_path)

        # Combine results
        result = {
            "document_type": "portfolio_statement",
            "tables_count": len(tables_result["tables"]),
            "securities_count": len(securities),
            "securities": securities,
            "portfolio_summary": portfolio_summary
        }

        return result

    def _extract_portfolio_summary(self, document_path: str) -> Dict[str, Any]:
        """
        Extract portfolio summary from a document.

        Args:
            document_path: Path to the document

        Returns:
            Dictionary containing portfolio summary
        """
        # Extract text from document
        document_text = self._extract_text(document_path)

        # Create prompt for portfolio summary extraction
        prompt = self._create_portfolio_summary_prompt(document_text)

        # Generate response
        response = self.generate_response(prompt)

        # Parse response
        summary = self._parse_portfolio_summary_response(response)

        return summary

    def _extract_text(self, document_path: str) -> str:
        """
        Extract text from a document.

        Args:
            document_path: Path to the document

        Returns:
            Extracted text
        """
        # Import document-specific modules only when needed
        if document_path.lower().endswith(".pdf"):
            import fitz  # PyMuPDF

            try:
                # Open the PDF
                doc = fitz.open(document_path)

                # Extract text from first few pages
                text = ""
                for page_num in range(min(5, len(doc))):
                    page = doc[page_num]
                    text += page.get_text()

                # Close the PDF
                doc.close()

                return text
            except Exception as e:
                logger.error(f"Error extracting text from PDF: {str(e)}")
                return ""
        else:
            logger.error(f"Unsupported document format: {document_path}")
            return ""

    def _create_portfolio_summary_prompt(self, document_text: str) -> str:
        """
        Create a prompt for portfolio summary extraction.

        Args:
            document_text: Text extracted from the document

        Returns:
            Prompt for portfolio summary extraction
        """
        # Truncate document text if too long
        max_text_length = 10000
        if len(document_text) > max_text_length:
            document_text = document_text[:max_text_length] + "..."

        prompt = f"""
        You are a financial document analyzer. Your task is to extract the portfolio summary information from the following document text:

        Document Text:
        {document_text}

        Please extract the following information:
        1. Total portfolio value and currency
        2. Asset allocation (percentages for each asset class)
        3. Currency allocation (percentages for each currency)
        4. Top positions (if available)

        Please respond with a JSON object containing the following fields:
        - total_value: The total portfolio value
        - currency: The currency of the portfolio
        - asset_allocation: Object mapping asset classes to percentages
        - currency_allocation: Object mapping currencies to percentages
        - top_positions: Array of top positions (each with ISIN, description, value, currency, percentage)

        JSON Response:
        """

        return prompt

    def _parse_portfolio_summary_response(self, response: str) -> Dict[str, Any]:
        """
        Parse the portfolio summary response.

        Args:
            response: Response from the model

        Returns:
            Parsed portfolio summary
        """
        try:
            # Extract JSON from response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1

            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                summary = json.loads(json_str)
                return summary
            else:
                # If no JSON found, return empty summary
                return {
                    "total_value": None,
                    "currency": None,
                    "asset_allocation": {},
                    "currency_allocation": {},
                    "top_positions": []
                }
        except Exception as e:
            logger.error(f"Error parsing portfolio summary response: {str(e)}")
            return {
                "total_value": None,
                "currency": None,
                "asset_allocation": {},
                "currency_allocation": {},
                "top_positions": [],
                "error": str(e)
            }

class A2AServer:
    """
    Agent-to-Agent (A2A) server for coordinating multiple agents.
    """

    def __init__(self, debug: bool = False):
        """
        Initialize the A2A server.

        Args:
            debug: Whether to print debug information
        """
        self.debug = debug
        self.agents = {}
        self.conversations = {}
        self.tasks = {}

    def register_agent(self, agent: Agent) -> None:
        """
        Register an agent with the server.

        Args:
            agent: Agent to register
        """
        self.agents[agent.agent_id] = agent
        if self.debug:
            logger.info(f"Registered agent: {agent.name} ({agent.agent_id})")

    def create_conversation(self, agent_ids: List[str]) -> str:
        """
        Create a new conversation between agents.

        Args:
            agent_ids: List of agent IDs to include in the conversation

        Returns:
            Conversation ID
        """
        # Validate agent IDs
        for agent_id in agent_ids:
            if agent_id not in self.agents:
                raise ValueError(f"Agent not found: {agent_id}")

        # Create conversation
        conversation_id = str(uuid.uuid4())
        self.conversations[conversation_id] = {
            "agent_ids": agent_ids,
            "messages": [],
            "created_at": time.time()
        }

        if self.debug:
            logger.info(f"Created conversation: {conversation_id} with agents: {agent_ids}")

        return conversation_id

    def send_message(self, conversation_id: str, sender_id: str, content: str) -> None:
        """
        Send a message in a conversation.

        Args:
            conversation_id: Conversation ID
            sender_id: ID of the sending agent
            content: Message content
        """
        # Validate conversation ID
        if conversation_id not in self.conversations:
            raise ValueError(f"Conversation not found: {conversation_id}")

        # Validate sender ID
        if sender_id not in self.conversations[conversation_id]["agent_ids"]:
            raise ValueError(f"Agent not in conversation: {sender_id}")

        # Add message to conversation
        message = {
            "sender_id": sender_id,
            "content": content,
            "timestamp": time.time()
        }
        self.conversations[conversation_id]["messages"].append(message)

        if self.debug:
            logger.info(f"Message sent in conversation {conversation_id} by {sender_id}: {content[:50]}...")

    def get_messages(self, conversation_id: str, since_timestamp: Optional[float] = None) -> List[Dict[str, Any]]:
        """
        Get messages from a conversation.

        Args:
            conversation_id: Conversation ID
            since_timestamp: Only return messages after this timestamp

        Returns:
            List of messages
        """
        # Validate conversation ID
        if conversation_id not in self.conversations:
            raise ValueError(f"Conversation not found: {conversation_id}")

        # Get messages
        messages = self.conversations[conversation_id]["messages"]

        # Filter by timestamp if provided
        if since_timestamp is not None:
            messages = [msg for msg in messages if msg["timestamp"] > since_timestamp]

        return messages

    def create_task(self, agent_id: str, task_type: str, task_data: Dict[str, Any]) -> str:
        """
        Create a new task for an agent.

        Args:
            agent_id: ID of the agent to assign the task to
            task_type: Type of task
            task_data: Task data

        Returns:
            Task ID
        """
        # Validate agent ID
        if agent_id not in self.agents:
            raise ValueError(f"Agent not found: {agent_id}")

        # Create task
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = {
            "agent_id": agent_id,
            "task_type": task_type,
            "task_data": task_data,
            "status": "pending",
            "result": None,
            "created_at": time.time(),
            "updated_at": time.time()
        }

        if self.debug:
            logger.info(f"Created task: {task_id} for agent: {agent_id}, type: {task_type}")

        return task_id

    def get_task(self, task_id: str) -> Dict[str, Any]:
        """
        Get a task.

        Args:
            task_id: Task ID

        Returns:
            Task data
        """
        # Validate task ID
        if task_id not in self.tasks:
            raise ValueError(f"Task not found: {task_id}")

        return self.tasks[task_id]

    def update_task_status(self, task_id: str, status: str, result: Optional[Any] = None) -> None:
        """
        Update the status of a task.

        Args:
            task_id: Task ID
            status: New status
            result: Task result (if completed)
        """
        # Validate task ID
        if task_id not in self.tasks:
            raise ValueError(f"Task not found: {task_id}")

        # Update task
        self.tasks[task_id]["status"] = status
        self.tasks[task_id]["updated_at"] = time.time()

        if result is not None:
            self.tasks[task_id]["result"] = result

        if self.debug:
            logger.info(f"Updated task: {task_id}, status: {status}")

    def execute_task(self, task_id: str) -> Any:
        """
        Execute a task.

        Args:
            task_id: Task ID

        Returns:
            Task result
        """
        # Validate task ID
        if task_id not in self.tasks:
            raise ValueError(f"Task not found: {task_id}")

        # Get task
        task = self.tasks[task_id]

        # Get agent
        agent = self.agents[task["agent_id"]]

        try:
            # Update task status
            self.update_task_status(task_id, "running")

            # Execute task
            if task["task_type"] == "process_document":
                result = agent.process(task["task_data"]["document_path"])
            else:
                raise ValueError(f"Unknown task type: {task['task_type']}")

            # Update task status
            self.update_task_status(task_id, "completed", result)

            return result
        except Exception as e:
            # Update task status
            self.update_task_status(task_id, "failed", {"error": str(e)})
            logger.error(f"Error executing task: {str(e)}")
            raise

def main():
    """
    Main function for testing the agent framework.
    """
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the agent framework.')
    parser.add_argument('document_path', help='Path to the document to process')
    parser.add_argument('--debug', action='store_true', help='Print debug information')

    args = parser.parse_args()

    # Create A2A server
    server = A2AServer(debug=args.debug)

    # Create agents
    document_classifier = DocumentClassifierAgent(debug=args.debug)
    portfolio_agent = PortfolioStatementAgent(debug=args.debug)

    # Register agents
    server.register_agent(document_classifier)
    server.register_agent(portfolio_agent)

    # Create task for document classification
    classification_task_id = server.create_task(
        document_classifier.agent_id,
        "process_document",
        {"document_path": args.document_path}
    )

    # Execute classification task
    classification_result = server.execute_task(classification_task_id)
    print(f"Document Classification: {classification_result['document_type']} (confidence: {classification_result['confidence']})")

    # Create task for document processing based on classification
    if classification_result["document_type"] == "portfolio_statement":
        processing_task_id = server.create_task(
            portfolio_agent.agent_id,
            "process_document",
            {"document_path": args.document_path}
        )

        # Execute processing task
        processing_result = server.execute_task(processing_task_id)
        print(f"Extracted {processing_result['securities_count']} securities")
        print(f"Portfolio Summary: {json.dumps(processing_result['portfolio_summary'], indent=2)}")
    else:
        print(f"Document type not supported for processing: {classification_result['document_type']}")

if __name__ == "__main__":
    main()
