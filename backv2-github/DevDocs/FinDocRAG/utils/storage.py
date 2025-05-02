"""
Storage utilities.
"""
import os
import json
import logging
import uuid
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

def ensure_dirs(dirs: List[str]) -> None:
    """
    Ensure directories exist.
    
    Args:
        dirs: List of directory paths
    """
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)

def save_document_data(document_data: Dict[str, Any], client_id: str) -> str:
    """
    Save document data to storage.
    
    Args:
        document_data: Document data
        client_id: Client ID
        
    Returns:
        Document ID
    """
    # Get document ID
    document_id = document_data.get("document_id", str(uuid.uuid4()))
    
    # Get results folder
    results_folder = os.getenv("RESULTS_FOLDER", "./results")
    
    # Create client folder
    client_folder = os.path.join(results_folder, client_id)
    os.makedirs(client_folder, exist_ok=True)
    
    # Save document data
    document_path = os.path.join(client_folder, f"{document_id}.json")
    
    with open(document_path, "w", encoding="utf-8") as f:
        json.dump(document_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved document data for client {client_id}: {document_path}")
    
    return document_id

def get_document_data(document_id: str, client_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Get document data from storage.
    
    Args:
        document_id: Document ID
        client_id: Optional client ID
        
    Returns:
        Document data or None if not found
    """
    # Get results folder
    results_folder = os.getenv("RESULTS_FOLDER", "./results")
    
    if client_id:
        # Look in client folder
        document_path = os.path.join(results_folder, client_id, f"{document_id}.json")
        
        if os.path.exists(document_path):
            with open(document_path, "r", encoding="utf-8") as f:
                return json.load(f)
    
    # Look in all client folders
    for client_folder in os.listdir(results_folder):
        client_path = os.path.join(results_folder, client_folder)
        
        if os.path.isdir(client_path):
            document_path = os.path.join(client_path, f"{document_id}.json")
            
            if os.path.exists(document_path):
                with open(document_path, "r", encoding="utf-8") as f:
                    return json.load(f)
    
    logger.warning(f"Document {document_id} not found")
    return None
