"""
Authentication utilities.
"""
import os
import logging
import uuid
from flask import Request

logger = logging.getLogger(__name__)

def get_client_id_from_request(request: Request) -> str:
    """
    Get client ID from request.
    
    Args:
        request: Flask request object
        
    Returns:
        Client ID
    """
    # Check for API key in header
    api_key = request.headers.get("X-API-Key")
    
    if api_key:
        # In a real implementation, you would validate the API key
        # and return the associated client ID
        # For now, we'll just use the API key as the client ID
        return api_key
    
    # Check for client ID in query parameters
    client_id = request.args.get("client_id")
    
    if client_id:
        return client_id
    
    # Generate a temporary client ID
    temp_client_id = f"temp_{uuid.uuid4()}"
    logger.warning(f"No client ID provided, using temporary ID: {temp_client_id}")
    
    return temp_client_id
