"""
Financial Entity Extractor Agent for extracting financial entities from text.
"""
import os
import json
import re
import logging
from typing import Dict, List, Any, Optional, Union
import requests
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FinancialEntityExtractorAgent(BaseAgent):
    """Agent for extracting financial entities from text."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "anthropic/claude-3-opus:beta",
        temperature: float = 0.2,
        max_tokens: int = 4000,
        **kwargs
    ):
        """
        Initialize the financial entity extractor agent.

        Args:
            api_key: OpenRouter API key
            model: Model to use for entity extraction
            temperature: Temperature for model generation
            max_tokens: Maximum tokens for model generation
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Financial Entity Extractor")
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.description = "I extract financial entities from text."

        # Define entity patterns
        self.entity_patterns = {
            'isins': r'\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b',
            'cusips': r'\b[0-9]{3}[0-9A-Z]{5}[0-9]\b',
            'tickers': r'\b[A-Z]{1,5}\b',
            'dates': [
                r'\b\d{4}-\d{2}-\d{2}\b',  # YYYY-MM-DD
                r'\b\d{2}/\d{2}/\d{4}\b',  # MM/DD/YYYY
                r'\b\d{2}\.\d{2}\.\d{4}\b'  # DD.MM.YYYY
            ],
            'amounts': r'\b\$?\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:million|billion|trillion|M|B|T))?\b',
            'percentages': r'\b\d+(?:\.\d+)?%\b'
        }

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to extract financial entities from text.

        Args:
            task: Task dictionary with the following keys:
                - text: Text to extract entities from
                - or
                - document: Document to extract entities from
                - entity_types: List of entity types to extract (optional)
                - use_ai: Whether to use AI for extraction (optional)

        Returns:
            Dictionary with extracted entities
        """
        # Get the text
        if 'text' in task:
            text = task['text']
        elif 'document' in task:
            text = self._extract_text_from_document(task['document'])
        else:
            return {
                'status': 'error',
                'message': 'No text or document provided'
            }

        # Get entity types to extract
        entity_types = task.get('entity_types', None)

        # Get whether to use AI
        use_ai = task.get('use_ai', True) and self.api_key is not None

        # Extract entities
        if use_ai and self.api_key:
            entities = self.extract_entities_with_ai(text, entity_types)
        else:
            entities = self.extract_entities_with_regex(text, entity_types)

        return {
            'status': 'success',
            'entities': entities
        }

    def _extract_text_from_document(self, document: Dict[str, Any]) -> str:
        """
        Extract text from a document.

        Args:
            document: Document to extract text from

        Returns:
            Extracted text
        """
        # Check document type
        doc_type = document.get('type', 'unknown')
        
        if doc_type == 'portfolio':
            return self._extract_text_from_portfolio(document)
        elif doc_type == 'financial_statement':
            return self._extract_text_from_financial_statement(document)
        elif doc_type == 'transaction':
            return self._extract_text_from_transactions(document)
        elif 'text' in document:
            return document['text']
        else:
            # Generic extraction
            return json.dumps(document)

    def _extract_text_from_portfolio(self, document: Dict[str, Any]) -> str:
        """
        Extract text from a portfolio document.

        Args:
            document: Portfolio document

        Returns:
            Extracted text
        """
        text = "Portfolio:\n"
        
        # Add metadata
        if 'metadata' in document:
            for key, value in document['metadata'].items():
                text += f"{key}: {value}\n"
        
        # Add securities
        if 'portfolio' in document and 'securities' in document['portfolio']:
            securities = document['portfolio']['securities']
            text += f"Securities ({len(securities)}):\n"
            
            for security in securities:
                for key, value in security.items():
                    text += f"{key}: {value}\n"
                text += "\n"
        
        return text

    def _extract_text_from_financial_statement(self, document: Dict[str, Any]) -> str:
        """
        Extract text from a financial statement document.

        Args:
            document: Financial statement document

        Returns:
            Extracted text
        """
        text = "Financial Statement:\n"
        
        # Add metadata
        if 'metadata' in document:
            for key, value in document['metadata'].items():
                text += f"{key}: {value}\n"
        
        # Add statements
        if 'statements' in document:
            statements = document['statements']
            for statement_type, statement in statements.items():
                text += f"{statement_type}:\n"
                
                if isinstance(statement, dict):
                    for key, value in statement.items():
                        if isinstance(value, dict):
                            text += f"{key}:\n"
                            for subkey, subvalue in value.items():
                                text += f"{subkey}: {subvalue}\n"
                        else:
                            text += f"{key}: {value}\n"
                else:
                    text += f"{statement}\n"
        
        return text

    def _extract_text_from_transactions(self, document: Dict[str, Any]) -> str:
        """
        Extract text from a transaction document.

        Args:
            document: Transaction document

        Returns:
            Extracted text
        """
        text = "Transactions:\n"
        
        # Add metadata
        if 'metadata' in document:
            for key, value in document['metadata'].items():
                text += f"{key}: {value}\n"
        
        # Add transactions
        if 'transactions' in document:
            transactions = document['transactions']
            for transaction in transactions:
                for key, value in transaction.items():
                    text += f"{key}: {value}\n"
                text += "\n"
        
        return text

    def extract_entities_with_regex(self, text: str, entity_types: Optional[List[str]] = None) -> Dict[str, List[str]]:
        """
        Extract financial entities from text using regex patterns.

        Args:
            text: Text to extract entities from
            entity_types: List of entity types to extract

        Returns:
            Dictionary with extracted entities
        """
        # Initialize entities dictionary
        entities = {}
        
        # Determine which entity types to extract
        if entity_types:
            patterns = {entity_type: self.entity_patterns[entity_type] for entity_type in entity_types if entity_type in self.entity_patterns}
        else:
            patterns = self.entity_patterns
        
        # Extract entities using regex patterns
        for entity_type, pattern in patterns.items():
            if entity_type == 'dates':
                # Handle multiple date patterns
                matches = []
                for date_pattern in pattern:
                    matches.extend(re.findall(date_pattern, text))
                entities[entity_type] = matches
            else:
                entities[entity_type] = re.findall(pattern, text)
        
        # Remove duplicates
        for entity_type in entities:
            entities[entity_type] = list(set(entities[entity_type]))
        
        return entities

    def extract_entities_with_ai(self, text: str, entity_types: Optional[List[str]] = None) -> Dict[str, List[Dict[str, Any]]]:
        """
        Extract financial entities from text using AI.

        Args:
            text: Text to extract entities from
            entity_types: List of entity types to extract

        Returns:
            Dictionary with extracted entities
        """
        # First, extract entities using regex
        regex_entities = self.extract_entities_with_regex(text, entity_types)
        
        # Prepare entity types for the prompt
        if entity_types:
            entity_types_str = ", ".join(entity_types)
        else:
            entity_types_str = "companies, securities, ISINs, CUSIPs, tickers, dates, amounts, percentages, currencies, financial metrics"
        
        # Create prompt
        prompt = f"""You are a financial entity extraction expert. Your task is to extract financial entities from the following text.

Text:
{text}

Please extract the following entity types: {entity_types_str}

For each entity, provide:
1. The entity text as it appears in the document
2. The entity type
3. The normalized value (if applicable)
4. Any additional metadata (if available)

Return your answer in JSON format with the following structure:
{{
    "entities": {{
        "companies": [
            {{ "text": "Apple Inc.", "normalized": "Apple", "ticker": "AAPL", "metadata": {{ "industry": "Technology" }} }},
            ...
        ],
        "securities": [
            {{ "text": "Apple Inc. Common Stock", "normalized": "Apple Common Stock", "isin": "US0378331005", "metadata": {{ "type": "Equity" }} }},
            ...
        ],
        "isins": [
            {{ "text": "US0378331005", "normalized": "US0378331005", "metadata": {{ "security": "Apple Inc." }} }},
            ...
        ],
        ...
    }}
}}

Include only entity types that are present in the text. If an entity type is not found, omit it from the response.
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
                "temperature": self.temperature,
                "response_format": {"type": "json_object"}
            }
            
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
                
                # Parse the JSON response
                try:
                    entities = json.loads(answer)
                    
                    # Merge with regex entities
                    merged_entities = self._merge_entities(entities.get('entities', {}), regex_entities)
                    
                    return merged_entities
                except json.JSONDecodeError:
                    logger.error(f"Error parsing JSON response: {answer}")
                    return regex_entities
            else:
                logger.error(f"Error calling OpenRouter API: {response.status_code} {response.text}")
                return regex_entities
                
        except Exception as e:
            logger.error(f"Error extracting entities with AI: {str(e)}")
            return regex_entities

    def _merge_entities(self, ai_entities: Dict[str, List[Dict[str, Any]]], regex_entities: Dict[str, List[str]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Merge entities extracted by AI and regex.

        Args:
            ai_entities: Entities extracted by AI
            regex_entities: Entities extracted by regex

        Returns:
            Merged entities
        """
        merged = ai_entities.copy()
        
        # Add regex entities that are not in AI entities
        for entity_type, entities in regex_entities.items():
            if entity_type not in merged:
                merged[entity_type] = [{"text": entity, "normalized": entity} for entity in entities]
            else:
                # Check if regex entities are already in AI entities
                ai_entity_texts = [entity.get('text') for entity in merged[entity_type]]
                for entity in entities:
                    if entity not in ai_entity_texts:
                        merged[entity_type].append({"text": entity, "normalized": entity})
        
        return merged

    def classify_entities(self, entities: Dict[str, List[Any]]) -> Dict[str, Any]:
        """
        Classify extracted entities into categories.

        Args:
            entities: Extracted entities

        Returns:
            Classified entities
        """
        classified = {
            'securities': [],
            'dates': [],
            'amounts': [],
            'metrics': []
        }
        
        # Classify securities
        if 'isins' in entities:
            for isin in entities['isins']:
                if isinstance(isin, dict):
                    security = {
                        'type': 'security',
                        'subtype': 'isin',
                        'value': isin.get('text'),
                        'metadata': isin.get('metadata', {})
                    }
                else:
                    security = {
                        'type': 'security',
                        'subtype': 'isin',
                        'value': isin
                    }
                classified['securities'].append(security)
        
        if 'cusips' in entities:
            for cusip in entities['cusips']:
                if isinstance(cusip, dict):
                    security = {
                        'type': 'security',
                        'subtype': 'cusip',
                        'value': cusip.get('text'),
                        'metadata': cusip.get('metadata', {})
                    }
                else:
                    security = {
                        'type': 'security',
                        'subtype': 'cusip',
                        'value': cusip
                    }
                classified['securities'].append(security)
        
        if 'tickers' in entities:
            for ticker in entities['tickers']:
                if isinstance(ticker, dict):
                    security = {
                        'type': 'security',
                        'subtype': 'ticker',
                        'value': ticker.get('text'),
                        'metadata': ticker.get('metadata', {})
                    }
                else:
                    security = {
                        'type': 'security',
                        'subtype': 'ticker',
                        'value': ticker
                    }
                classified['securities'].append(security)
        
        # Classify dates
        if 'dates' in entities:
            for date in entities['dates']:
                if isinstance(date, dict):
                    date_entity = {
                        'type': 'date',
                        'value': date.get('text'),
                        'normalized': date.get('normalized', date.get('text')),
                        'metadata': date.get('metadata', {})
                    }
                else:
                    date_entity = {
                        'type': 'date',
                        'value': date,
                        'normalized': date
                    }
                classified['dates'].append(date_entity)
        
        # Classify amounts
        if 'amounts' in entities:
            for amount in entities['amounts']:
                if isinstance(amount, dict):
                    amount_entity = {
                        'type': 'amount',
                        'value': amount.get('text'),
                        'normalized': amount.get('normalized', amount.get('text')),
                        'metadata': amount.get('metadata', {})
                    }
                else:
                    amount_entity = {
                        'type': 'amount',
                        'value': amount,
                        'normalized': self._normalize_amount(amount)
                    }
                classified['amounts'].append(amount_entity)
        
        # Classify percentages as metrics
        if 'percentages' in entities:
            for percentage in entities['percentages']:
                if isinstance(percentage, dict):
                    metric = {
                        'type': 'metric',
                        'subtype': 'percentage',
                        'value': percentage.get('text'),
                        'normalized': percentage.get('normalized', percentage.get('text')),
                        'metadata': percentage.get('metadata', {})
                    }
                else:
                    metric = {
                        'type': 'metric',
                        'subtype': 'percentage',
                        'value': percentage,
                        'normalized': self._normalize_percentage(percentage)
                    }
                classified['metrics'].append(metric)
        
        return classified

    def _normalize_amount(self, amount: str) -> float:
        """
        Normalize an amount string to a float.

        Args:
            amount: Amount string

        Returns:
            Normalized amount as float
        """
        try:
            # Remove currency symbols and commas
            amount = amount.replace('$', '').replace(',', '')
            
            # Handle million/billion/trillion
            if 'million' in amount or 'M' in amount:
                amount = amount.replace('million', '').replace('M', '').strip()
                return float(amount) * 1000000
            elif 'billion' in amount or 'B' in amount:
                amount = amount.replace('billion', '').replace('B', '').strip()
                return float(amount) * 1000000000
            elif 'trillion' in amount or 'T' in amount:
                amount = amount.replace('trillion', '').replace('T', '').strip()
                return float(amount) * 1000000000000
            else:
                return float(amount)
        except ValueError:
            return 0.0

    def _normalize_percentage(self, percentage: str) -> float:
        """
        Normalize a percentage string to a float.

        Args:
            percentage: Percentage string

        Returns:
            Normalized percentage as float
        """
        try:
            # Remove percentage symbol
            percentage = percentage.replace('%', '')
            
            return float(percentage) / 100.0
        except ValueError:
            return 0.0

    def save_results(self, entities: Dict[str, Any], output_path: str) -> str:
        """
        Save extracted entities to a file.

        Args:
            entities: Extracted entities
            output_path: Output file path

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(entities, f, indent=2)

        return output_path
