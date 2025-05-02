"""
Query Engine Agent for answering questions about financial documents.
"""
import os
import json
import logging
import re
from typing import Dict, List, Any, Optional, Union
import requests
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class QueryEngineAgent(BaseAgent):
    """Agent for answering questions about financial documents."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "anthropic/claude-3-opus:beta",
        temperature: float = 0.2,
        max_tokens: int = 4000,
        **kwargs
    ):
        """
        Initialize the query engine agent.

        Args:
            api_key: OpenRouter API key
            model: Model to use for answering questions
            temperature: Temperature for model generation
            max_tokens: Maximum tokens for model generation
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Query Engine Agent")
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.description = "I answer questions about financial documents using AI."

        # Check if API key is available
        if not self.api_key:
            logger.warning("No API key provided. QueryEngineAgent will not be able to answer questions.")

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to answer a question about financial documents.

        Args:
            task: Task dictionary with the following keys:
                - question: Question to answer
                - documents: List of document data
                - context: Additional context (optional)
                - format: Output format (optional)

        Returns:
            Dictionary with the answer
        """
        # Check if API key is available
        if not self.api_key:
            return {
                'status': 'error',
                'message': 'No API key provided'
            }

        # Get the question
        if 'question' not in task:
            return {
                'status': 'error',
                'message': 'No question provided'
            }

        question = task['question']

        # Get the documents
        if 'documents' not in task:
            return {
                'status': 'error',
                'message': 'No documents provided'
            }

        documents = task['documents']

        # Get additional context
        context = task.get('context', '')

        # Get output format
        output_format = task.get('format', 'text')

        # Answer the question
        answer = self.answer_question(question, documents, context, output_format)

        return {
            'status': 'success',
            'question': question,
            'answer': answer,
            'format': output_format
        }

    def answer_question(self, question: str, documents: List[Dict[str, Any]], context: str = '', output_format: str = 'text') -> str:
        """
        Answer a question about financial documents.

        Args:
            question: Question to answer
            documents: List of document data
            context: Additional context
            output_format: Output format

        Returns:
            Answer to the question
        """
        # Prepare document context
        document_context = self._prepare_document_context(documents)

        # Create prompt
        prompt = self._create_prompt(question, document_context, context, output_format)

        # Call the API
        response = self._call_api(prompt, output_format)

        return response

    def _prepare_document_context(self, documents: List[Dict[str, Any]]) -> str:
        """
        Prepare document context for the prompt.

        Args:
            documents: List of document data

        Returns:
            Document context as a string
        """
        context = "Document Context:\n\n"

        for i, doc in enumerate(documents):
            context += f"Document {i+1}:\n"
            
            # Add document type
            doc_type = doc.get('type', 'unknown')
            context += f"Type: {doc_type}\n"
            
            # Add metadata
            if 'metadata' in doc:
                context += "Metadata:\n"
                for key, value in doc['metadata'].items():
                    context += f"  {key}: {value}\n"
            
            # Add document content based on type
            if doc_type == 'portfolio':
                context += self._format_portfolio(doc)
            elif doc_type == 'financial_statement':
                context += self._format_financial_statement(doc)
            elif doc_type == 'transaction':
                context += self._format_transactions(doc)
            else:
                # Generic formatting
                context += json.dumps(doc, indent=2)
            
            context += "\n\n"

        return context

    def _format_portfolio(self, doc: Dict[str, Any]) -> str:
        """
        Format portfolio document for the prompt.

        Args:
            doc: Portfolio document

        Returns:
            Formatted portfolio document
        """
        text = "Portfolio:\n"
        
        # Add summary
        if 'portfolio' in doc and 'summary' in doc['portfolio']:
            summary = doc['portfolio']['summary']
            text += "Summary:\n"
            for key, value in summary.items():
                text += f"  {key}: {value}\n"
        
        # Add securities
        if 'portfolio' in doc and 'securities' in doc['portfolio']:
            securities = doc['portfolio']['securities']
            text += f"Securities ({len(securities)}):\n"
            
            for i, security in enumerate(securities):
                text += f"  Security {i+1}:\n"
                for key, value in security.items():
                    text += f"    {key}: {value}\n"
        
        return text

    def _format_financial_statement(self, doc: Dict[str, Any]) -> str:
        """
        Format financial statement document for the prompt.

        Args:
            doc: Financial statement document

        Returns:
            Formatted financial statement document
        """
        text = "Financial Statement:\n"
        
        # Add statements
        if 'statements' in doc:
            statements = doc['statements']
            for statement_type, statement in statements.items():
                text += f"{statement_type}:\n"
                
                if isinstance(statement, dict):
                    for key, value in statement.items():
                        if isinstance(value, dict):
                            text += f"  {key}:\n"
                            for subkey, subvalue in value.items():
                                text += f"    {subkey}: {subvalue}\n"
                        else:
                            text += f"  {key}: {value}\n"
                else:
                    text += f"  {statement}\n"
        
        return text

    def _format_transactions(self, doc: Dict[str, Any]) -> str:
        """
        Format transaction document for the prompt.

        Args:
            doc: Transaction document

        Returns:
            Formatted transaction document
        """
        text = "Transactions:\n"
        
        # Add transactions
        if 'transactions' in doc:
            transactions = doc['transactions']
            text += f"Number of transactions: {len(transactions)}\n"
            
            for i, transaction in enumerate(transactions):
                text += f"Transaction {i+1}:\n"
                for key, value in transaction.items():
                    text += f"  {key}: {value}\n"
        
        return text

    def _create_prompt(self, question: str, document_context: str, additional_context: str = '', output_format: str = 'text') -> str:
        """
        Create a prompt for the API.

        Args:
            question: Question to answer
            document_context: Document context
            additional_context: Additional context
            output_format: Output format

        Returns:
            Prompt for the API
        """
        prompt = f"""You are a financial document analysis assistant. Your task is to answer questions about financial documents accurately and concisely.

{document_context}

"""

        if additional_context:
            prompt += f"Additional Context:\n{additional_context}\n\n"

        prompt += f"Question: {question}\n\n"

        if output_format == 'json':
            prompt += """Please provide your answer in JSON format with the following structure:
{
    "answer": "Your detailed answer here",
    "confidence": "high/medium/low",
    "sources": ["Document 1", "Document 2", ...],
    "additional_info": "Any additional information or caveats"
}
"""
        else:
            prompt += "Please provide a clear and concise answer based on the document context provided."

        return prompt

    def _call_api(self, prompt: str, output_format: str = 'text') -> str:
        """
        Call the OpenRouter API to answer the question.

        Args:
            prompt: Prompt for the API
            output_format: Output format

        Returns:
            Answer from the API
        """
        try:
            # Prepare the request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": self.max_tokens,
                "temperature": self.temperature
            }
            
            # Add response format for JSON output
            if output_format == 'json':
                data["response_format"] = {"type": "json_object"}
            
            # Call the API
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data
            )
            
            # Check if the request was successful
            if response.status_code == 200:
                result = response.json()
                answer = result["choices"][0]["message"]["content"]
                return answer
            else:
                logger.error(f"Error calling OpenRouter API: {response.status_code} {response.text}")
                return f"Error: Failed to get an answer. Status code: {response.status_code}"
                
        except Exception as e:
            logger.error(f"Error calling OpenRouter API: {str(e)}")
            return f"Error: {str(e)}"

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract financial entities from text.

        Args:
            text: Text to extract entities from

        Returns:
            Dictionary with extracted entities
        """
        entities = {
            'companies': [],
            'securities': [],
            'isins': [],
            'dates': [],
            'amounts': []
        }
        
        # Extract ISINs
        isin_pattern = r'\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b'
        entities['isins'] = re.findall(isin_pattern, text)
        
        # Extract dates
        date_patterns = [
            r'\b\d{4}-\d{2}-\d{2}\b',  # YYYY-MM-DD
            r'\b\d{2}/\d{2}/\d{4}\b',  # MM/DD/YYYY
            r'\b\d{2}\.\d{2}\.\d{4}\b'  # DD.MM.YYYY
        ]
        
        for pattern in date_patterns:
            entities['dates'].extend(re.findall(pattern, text))
        
        # Extract amounts
        amount_pattern = r'\b\$?\d+(?:,\d+)*(?:\.\d+)?\b'
        entities['amounts'] = re.findall(amount_pattern, text)
        
        return entities

    def save_results(self, result: Dict[str, Any], output_path: str) -> str:
        """
        Save query result to a file.

        Args:
            result: Query result
            output_path: Output file path

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)

        return output_path
