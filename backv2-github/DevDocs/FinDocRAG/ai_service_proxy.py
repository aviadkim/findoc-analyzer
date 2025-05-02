"""
AI service proxy for managing API calls to various AI providers.
"""
import os
import logging
import json
import time
from typing import Dict, List, Any, Optional
import requests
import google.generativeai as genai
from PIL import Image

logger = logging.getLogger(__name__)

class UsageTracker:
    """
    Track API usage for billing purposes.
    """
    
    def __init__(self):
        """Initialize the usage tracker."""
        self.usage = {}
    
    def log_request(self, client_id: str, endpoint: str) -> None:
        """
        Log an API request.
        
        Args:
            client_id: Client ID
            endpoint: API endpoint
        """
        if client_id not in self.usage:
            self.usage[client_id] = {}
        
        if endpoint not in self.usage[client_id]:
            self.usage[client_id][endpoint] = 0
        
        self.usage[client_id][endpoint] += 1
    
    def get_usage(self, client_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get usage statistics.
        
        Args:
            client_id: Optional client ID to filter by
            
        Returns:
            Usage statistics
        """
        if client_id:
            return self.usage.get(client_id, {})
        else:
            return self.usage

class AIServiceProxy:
    """
    Proxy service for managing API calls to various AI providers.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the AI service proxy.
        
        Args:
            config: Configuration options
        """
        self.primary_provider = config.get("primary_provider", "gemini")
        self.api_keys = {
            "gemini": config.get("gemini_api_key"),
            "openai": config.get("openai_api_key"),
            "anthropic": config.get("anthropic_api_key"),
            "openrouter": config.get("openrouter_api_key")
        }
        
        # Initialize usage tracker
        self.usage_tracker = UsageTracker()
        
        # Initialize Gemini if it's the primary provider
        if self.primary_provider == "gemini" and self.api_keys["gemini"]:
            genai.configure(api_key=self.api_keys["gemini"])
    
    def health_check(self) -> Dict[str, bool]:
        """
        Check the health of AI services.
        
        Returns:
            Health status of each provider
        """
        health = {}
        
        # Check Gemini
        if self.api_keys["gemini"]:
            try:
                genai.configure(api_key=self.api_keys["gemini"])
                models = genai.list_models()
                health["gemini"] = len(models) > 0
            except Exception as e:
                logger.error(f"Gemini health check failed: {str(e)}")
                health["gemini"] = False
        else:
            health["gemini"] = False
        
        # Check OpenAI (simple API key validation)
        if self.api_keys["openai"]:
            health["openai"] = len(self.api_keys["openai"]) > 20
        else:
            health["openai"] = False
        
        # Check Anthropic (simple API key validation)
        if self.api_keys["anthropic"]:
            health["anthropic"] = len(self.api_keys["anthropic"]) > 20
        else:
            health["anthropic"] = False
        
        return health
    
    def call_vision_api(self, prompt: str, images: List[str], client_id: Optional[str] = None) -> str:
        """
        Call a vision API with the primary provider.
        
        Args:
            prompt: Text prompt
            images: List of image paths
            client_id: Optional client ID for usage tracking
            
        Returns:
            API response text
        """
        # Track usage
        if client_id:
            self.usage_tracker.log_request(client_id, "vision_api")
        
        # Call appropriate API
        if self.primary_provider == "gemini" and self.api_keys["gemini"]:
            return self._call_gemini_vision(prompt, images)
        elif self.primary_provider == "openai" and self.api_keys["openai"]:
            return self._call_openai_vision(prompt, images)
        elif self.primary_provider == "anthropic" and self.api_keys["anthropic"]:
            return self._call_anthropic_vision(prompt, images)
        elif self.primary_provider == "openrouter" and self.api_keys["openrouter"]:
            return self._call_openrouter_vision(prompt, images)
        else:
            # Try fallbacks
            if self.api_keys["gemini"]:
                return self._call_gemini_vision(prompt, images)
            elif self.api_keys["openai"]:
                return self._call_openai_vision(prompt, images)
            elif self.api_keys["anthropic"]:
                return self._call_anthropic_vision(prompt, images)
            elif self.api_keys["openrouter"]:
                return self._call_openrouter_vision(prompt, images)
            else:
                raise ValueError("No valid API keys available")
    
    def call_text_api(self, prompt: str, client_id: Optional[str] = None) -> str:
        """
        Call a text API with the primary provider.
        
        Args:
            prompt: Text prompt
            client_id: Optional client ID for usage tracking
            
        Returns:
            API response text
        """
        # Track usage
        if client_id:
            self.usage_tracker.log_request(client_id, "text_api")
        
        # Call appropriate API
        if self.primary_provider == "gemini" and self.api_keys["gemini"]:
            return self._call_gemini_text(prompt)
        elif self.primary_provider == "openai" and self.api_keys["openai"]:
            return self._call_openai_text(prompt)
        elif self.primary_provider == "anthropic" and self.api_keys["anthropic"]:
            return self._call_anthropic_text(prompt)
        elif self.primary_provider == "openrouter" and self.api_keys["openrouter"]:
            return self._call_openrouter_text(prompt)
        else:
            # Try fallbacks
            if self.api_keys["gemini"]:
                return self._call_gemini_text(prompt)
            elif self.api_keys["openai"]:
                return self._call_openai_text(prompt)
            elif self.api_keys["anthropic"]:
                return self._call_anthropic_text(prompt)
            elif self.api_keys["openrouter"]:
                return self._call_openrouter_text(prompt)
            else:
                raise ValueError("No valid API keys available")
    
    def summarize_document(self, document_data: Dict[str, Any]) -> str:
        """
        Summarize a document.
        
        Args:
            document_data: Document data
            
        Returns:
            Document summary
        """
        # Extract text to summarize
        full_text = document_data.get("full_text", "")
        
        if not full_text:
            return "No text available to summarize."
        
        # Truncate if too long
        if len(full_text) > 10000:
            full_text = full_text[:10000] + "..."
        
        # Create prompt
        prompt = f"""
        Please provide a concise summary of the following document:
        
        {full_text}
        
        Focus on key financial information, important dates, and main entities mentioned.
        """
        
        # Call text API
        return self.call_text_api(prompt)
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract entities from text.
        
        Args:
            text: Text to extract entities from
            
        Returns:
            Extracted entities
        """
        # Truncate if too long
        if len(text) > 10000:
            text = text[:10000] + "..."
        
        # Create prompt
        prompt = f"""
        Please extract the following entities from this text and return them in JSON format:
        
        1. Organizations: Companies, banks, financial institutions
        2. People: Names of individuals
        3. Dates: All dates mentioned
        4. Amounts: Monetary amounts with currency
        5. Securities: Stock symbols, ISINs, or other security identifiers
        
        Text:
        {text}
        
        Return ONLY a JSON object with these categories as keys and arrays of strings as values.
        """
        
        # Call text API
        response = self.call_text_api(prompt)
        
        # Parse JSON from response
        try:
            # Find JSON in response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                entities = json.loads(json_str)
                
                # Ensure all expected keys exist
                expected_keys = ["organizations", "people", "dates", "amounts", "securities"]
                for key in expected_keys:
                    if key not in entities:
                        entities[key] = []
                
                return entities
        except Exception as e:
            logger.error(f"Error parsing entities JSON: {str(e)}")
        
        # Return empty entities if parsing fails
        return {
            "organizations": [],
            "people": [],
            "dates": [],
            "amounts": [],
            "securities": []
        }
    
    def query(self, document_data: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Query a document with natural language.
        
        Args:
            document_data: Document data
            query: Natural language query
            
        Returns:
            Query results
        """
        # Extract text to query
        full_text = document_data.get("full_text", "")
        
        if not full_text:
            return {"answer": "No document text available to query."}
        
        # Truncate if too long
        if len(full_text) > 10000:
            full_text = full_text[:10000] + "..."
        
        # Create prompt
        prompt = f"""
        I have a document with the following content:
        
        {full_text}
        
        Please answer this question about the document:
        {query}
        
        Provide a detailed answer based only on the information in the document.
        If the answer cannot be determined from the document, say so.
        """
        
        # Call text API
        answer = self.call_text_api(prompt)
        
        return {
            "query": query,
            "answer": answer
        }
    
    def _call_gemini_vision(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call Gemini Vision API.
        
        Args:
            prompt: Text prompt
            image_paths: List of image paths
            
        Returns:
            API response text
        """
        try:
            # Load images
            images = []
            for image_path in image_paths:
                try:
                    img = Image.open(image_path)
                    images.append(img)
                except Exception as e:
                    logger.error(f"Error loading image {image_path}: {str(e)}")
            
            # Use only the first 16 images (Gemini limit)
            images = images[:16]
            
            if not images:
                return "No valid images provided."
            
            # Get Gemini Pro Vision model
            model = genai.GenerativeModel('gemini-pro-vision')
            
            # Generate content
            response = model.generate_content([prompt] + images)
            
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini Vision API: {str(e)}")
            return f"Error calling Gemini Vision API: {str(e)}"
    
    def _call_openai_vision(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call OpenAI Vision API.
        
        Args:
            prompt: Text prompt
            image_paths: List of image paths
            
        Returns:
            API response text
        """
        import base64
        
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_keys['openai']}"
        }
        
        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]
        
        # Add images (up to 5)
        for image_path in image_paths[:5]:
            try:
                with open(image_path, "rb") as image_file:
                    base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                    
                    messages[0]["content"].append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    })
            except Exception as e:
                logger.error(f"Error encoding image {image_path}: {str(e)}")
        
        # Prepare data
        data = {
            "model": "gpt-4-vision-preview",
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                logger.error(f"OpenAI API error: {response.status_code} {response.text}")
                return f"OpenAI API error: {response.status_code}"
        except Exception as e:
            logger.error(f"Error calling OpenAI Vision API: {str(e)}")
            return f"Error calling OpenAI Vision API: {str(e)}"
    
    def _call_anthropic_vision(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call Anthropic Claude Vision API.
        
        Args:
            prompt: Text prompt
            image_paths: List of image paths
            
        Returns:
            API response text
        """
        import base64
        
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_keys['anthropic'],
            "anthropic-version": "2023-06-01"
        }
        
        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]
        
        # Add images
        for image_path in image_paths[:5]:  # Limit to 5 images
            try:
                with open(image_path, "rb") as image_file:
                    base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                    
                    messages[0]["content"].append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": base64_image
                        }
                    })
            except Exception as e:
                logger.error(f"Error encoding image {image_path}: {str(e)}")
        
        # Prepare data
        data = {
            "model": "claude-3-opus-20240229",
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        try:
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]
            else:
                logger.error(f"Anthropic API error: {response.status_code} {response.text}")
                return f"Anthropic API error: {response.status_code}"
        except Exception as e:
            logger.error(f"Error calling Anthropic Vision API: {str(e)}")
            return f"Error calling Anthropic Vision API: {str(e)}"
    
    def _call_openrouter_vision(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call OpenRouter Vision API.
        
        Args:
            prompt: Text prompt
            image_paths: List of image paths
            
        Returns:
            API response text
        """
        import base64
        
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_keys['openrouter']}",
            "HTTP-Referer": "https://findocrag.com",
            "X-Title": "FinDocRAG"
        }
        
        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]
        
        # Add images (up to 5)
        for image_path in image_paths[:5]:
            try:
                with open(image_path, "rb") as image_file:
                    base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                    
                    messages[0]["content"].append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    })
            except Exception as e:
                logger.error(f"Error encoding image {image_path}: {str(e)}")
        
        # Prepare data
        data = {
            "model": "anthropic/claude-3-opus-20240229",
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                logger.error(f"OpenRouter API error: {response.status_code} {response.text}")
                return f"OpenRouter API error: {response.status_code}"
        except Exception as e:
            logger.error(f"Error calling OpenRouter Vision API: {str(e)}")
            return f"Error calling OpenRouter Vision API: {str(e)}"
    
    def _call_gemini_text(self, prompt: str) -> str:
        """
        Call Gemini Text API.
        
        Args:
            prompt: Text prompt
            
        Returns:
            API response text
        """
        try:
            # Get Gemini Pro model
            model = genai.GenerativeModel('gemini-pro')
            
            # Generate content
            response = model.generate_content(prompt)
            
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini Text API: {str(e)}")
            return f"Error calling Gemini Text API: {str(e)}"
    
    def _call_openai_text(self, prompt: str) -> str:
        """
        Call OpenAI Text API.
        
        Args:
            prompt: Text prompt
            
        Returns:
            API response text
        """
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_keys['openai']}"
        }
        
        # Prepare data
        data = {
            "model": "gpt-4-turbo",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                logger.error(f"OpenAI API error: {response.status_code} {response.text}")
                return f"OpenAI API error: {response.status_code}"
        except Exception as e:
            logger.error(f"Error calling OpenAI Text API: {str(e)}")
            return f"Error calling OpenAI Text API: {str(e)}"
    
    def _call_anthropic_text(self, prompt: str) -> str:
        """
        Call Anthropic Claude Text API.
        
        Args:
            prompt: Text prompt
            
        Returns:
            API response text
        """
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_keys['anthropic'],
            "anthropic-version": "2023-06-01"
        }
        
        # Prepare data
        data = {
            "model": "claude-3-opus-20240229",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        try:
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]
            else:
                logger.error(f"Anthropic API error: {response.status_code} {response.text}")
                return f"Anthropic API error: {response.status_code}"
        except Exception as e:
            logger.error(f"Error calling Anthropic Text API: {str(e)}")
            return f"Error calling Anthropic Text API: {str(e)}"
    
    def _call_openrouter_text(self, prompt: str) -> str:
        """
        Call OpenRouter Text API.
        
        Args:
            prompt: Text prompt
            
        Returns:
            API response text
        """
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_keys['openrouter']}",
            "HTTP-Referer": "https://findocrag.com",
            "X-Title": "FinDocRAG"
        }
        
        # Prepare data
        data = {
            "model": "anthropic/claude-3-opus-20240229",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                logger.error(f"OpenRouter API error: {response.status_code} {response.text}")
                return f"OpenRouter API error: {response.status_code}"
        except Exception as e:
            logger.error(f"Error calling OpenRouter Text API: {str(e)}")
            return f"Error calling OpenRouter Text API: {str(e)}"
