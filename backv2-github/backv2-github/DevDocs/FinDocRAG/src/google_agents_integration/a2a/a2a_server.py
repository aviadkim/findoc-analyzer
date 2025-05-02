"""
A2A Protocol Server for FinDocRAG.

This server implements the Agent-to-Agent (A2A) protocol for the FinDocRAG system.
"""
import os
import logging
import json
import uuid
import time
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify, Response, send_from_directory
import threading
import google.generativeai as genai

# Import agents
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
from coordinator_agent import handle_request, process_document, answer_query
from securities_extraction_agent_enhanced import EnhancedSecuritiesExtractionAgent
from table_understanding_agent import TableUnderstandingAgent
from verification_agent import VerificationAgent

# Import framework and knowledge
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'framework'))
from sequential_thinking import SequentialThinkingFramework

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'knowledge'))
from financial_knowledge import FinancialDocumentKnowledge

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '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')
genai.configure(api_key=GEMINI_API_KEY)
logger.info("Configured Gemini API with key")

# Initialize agents
securities_extraction_agent = EnhancedSecuritiesExtractionAgent(api_key=GEMINI_API_KEY)
table_understanding_agent = TableUnderstandingAgent(api_key=GEMINI_API_KEY)
verification_agent = VerificationAgent(api_key=GEMINI_API_KEY)
sequential_thinking_framework = SequentialThinkingFramework(api_key=GEMINI_API_KEY)
financial_knowledge = FinancialDocumentKnowledge()

# Initialize Flask app
app = Flask(__name__)

# In-memory storage for tasks
tasks = {}
task_artifacts = {}
task_status_subscribers = {}
push_notification_urls = {}

@app.route('/.well-known/agent.json', methods=['GET'])
def agent_card():
    """Serve the agent card."""
    return send_from_directory(os.path.dirname(__file__), 'agent_card.json')

@app.route('/a2a/tasks/send', methods=['POST'])
def tasks_send():
    """Handle tasks/send requests."""
    data = request.json

    # Validate request
    if not data:
        return jsonify({"error": "No data provided"}), 400

    task_id = data.get('taskId')
    if not task_id:
        task_id = str(uuid.uuid4())

    message = data.get('message')
    if not message:
        return jsonify({"error": "No message provided"}), 400

    # Process the message
    task = process_task(task_id, message)

    return jsonify(task)

@app.route('/a2a/tasks/sendSubscribe', methods=['POST'])
def tasks_send_subscribe():
    """Handle tasks/sendSubscribe requests."""
    data = request.json

    # Validate request
    if not data:
        return jsonify({"error": "No data provided"}), 400

    task_id = data.get('taskId')
    if not task_id:
        task_id = str(uuid.uuid4())

    message = data.get('message')
    if not message:
        return jsonify({"error": "No message provided"}), 400

    # Set up SSE response
    def generate():
        # Register subscriber
        event_queue = []
        task_status_subscribers[task_id] = event_queue

        # Process the task in a separate thread
        def process_task_thread():
            process_task(task_id, message)

        threading.Thread(target=process_task_thread).start()

        # Send initial task status
        yield f"data: {json.dumps({'type': 'TaskStatusUpdateEvent', 'task': {'id': task_id, 'status': 'submitted'}})}\n\n"

        # Wait for events
        while True:
            if event_queue:
                event = event_queue.pop(0)
                yield f"data: {json.dumps(event)}\n\n"

            # Check if task is completed
            if task_id in tasks and tasks[task_id]['status'] in ['completed', 'failed', 'canceled']:
                break

            time.sleep(0.1)

    response = Response(generate(), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'

    return response

@app.route('/a2a/tasks/get', methods=['GET'])
def tasks_get():
    """Handle tasks/get requests."""
    task_id = request.args.get('taskId')

    if not task_id:
        return jsonify({"error": "No taskId provided"}), 400

    if task_id not in tasks:
        return jsonify({"error": f"Task {task_id} not found"}), 404

    return jsonify(tasks[task_id])

@app.route('/a2a/tasks/list', methods=['GET'])
def tasks_list():
    """Handle tasks/list requests."""
    # Optional filtering
    status = request.args.get('status')

    task_list = []
    for task_id, task in tasks.items():
        if not status or task['status'] == status:
            task_list.append(task)

    return jsonify({"tasks": task_list})

@app.route('/a2a/tasks/cancel', methods=['POST'])
def tasks_cancel():
    """Handle tasks/cancel requests."""
    data = request.json

    # Validate request
    if not data:
        return jsonify({"error": "No data provided"}), 400

    task_id = data.get('taskId')
    if not task_id:
        return jsonify({"error": "No taskId provided"}), 400

    if task_id not in tasks:
        return jsonify({"error": f"Task {task_id} not found"}), 404

    # Cancel the task
    tasks[task_id]['status'] = 'canceled'

    # Notify subscribers
    if task_id in task_status_subscribers:
        event = {'type': 'TaskStatusUpdateEvent', 'task': tasks[task_id]}
        task_status_subscribers[task_id].append(event)

    # Send push notification
    if task_id in push_notification_urls:
        send_push_notification(push_notification_urls[task_id], event)

    return jsonify(tasks[task_id])

@app.route('/a2a/tasks/artifacts/list', methods=['GET'])
def tasks_artifacts_list():
    """Handle tasks/artifacts/list requests."""
    task_id = request.args.get('taskId')

    if not task_id:
        return jsonify({"error": "No taskId provided"}), 400

    if task_id not in task_artifacts:
        return jsonify({"artifacts": []})

    return jsonify({"artifacts": task_artifacts[task_id]})

@app.route('/a2a/tasks/pushNotification/set', methods=['POST'])
def tasks_push_notification_set():
    """Handle tasks/pushNotification/set requests."""
    data = request.json

    # Validate request
    if not data:
        return jsonify({"error": "No data provided"}), 400

    task_id = data.get('taskId')
    if not task_id:
        return jsonify({"error": "No taskId provided"}), 400

    url = data.get('url')
    if not url:
        return jsonify({"error": "No url provided"}), 400

    # Register push notification URL
    push_notification_urls[task_id] = url

    return jsonify({"status": "success"})

def process_task(task_id: str, message: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a task.

    Args:
        task_id: Task ID
        message: Message to process

    Returns:
        Processed task
    """
    # Create task if it doesn't exist
    if task_id not in tasks:
        tasks[task_id] = {
            'id': task_id,
            'status': 'submitted',
            'messages': []
        }

    # Add message to task
    tasks[task_id]['messages'].append(message)
    tasks[task_id]['status'] = 'working'

    # Notify subscribers
    if task_id in task_status_subscribers:
        event = {'type': 'TaskStatusUpdateEvent', 'task': tasks[task_id]}
        task_status_subscribers[task_id].append(event)

    # Send push notification
    if task_id in push_notification_urls:
        send_push_notification(push_notification_urls[task_id], event)

    # Process the message
    try:
        # Extract message parts
        parts = message.get('parts', [])

        # Check if this is a document processing request
        document_path = None
        query = None

        for part in parts:
            if part.get('type') == 'file':
                # This is a document processing request
                document_path = part.get('file', {}).get('uri')
            elif part.get('type') == 'text':
                # This might be a query
                query = part.get('text', '')

        if document_path:
            # Process document using enhanced securities extraction
            logger.info(f"Processing document: {document_path}")

            # Use the enhanced securities extraction agent
            extraction_results = securities_extraction_agent.extract_securities_from_pdf(document_path)

            # Verify extraction results
            verification_results = verification_agent.verify_extraction(extraction_results)

            # Combine results
            response = {
                'document_data': {
                    'document_type': extraction_results.get('document_type', 'unknown'),
                    'financial_data': {
                        'securities': extraction_results.get('securities', []),
                        'portfolio_summary': extraction_results.get('portfolio_summary', {})
                    },
                    'verification': verification_results
                }
            }

            # Create agent response
            securities_count = len(extraction_results.get('securities', []))
            confidence = verification_results.get('confidence', {}).get('overall', 'unknown')

            agent_message = {
                'role': 'agent',
                'parts': [
                    {
                        'type': 'text',
                        'text': f"Document processed successfully using sequential thinking and advanced AI. Found {securities_count} securities with {confidence} confidence."
                    }
                ]
            }

            # Add document data as artifact
            artifact = {
                'id': str(uuid.uuid4()),
                'taskId': task_id,
                'parts': [
                    {
                        'type': 'data',
                        'data': {
                            'content': response['document_data'],
                            'mimeType': 'application/json'
                        }
                    }
                ]
            }

            if task_id not in task_artifacts:
                task_artifacts[task_id] = []

            task_artifacts[task_id].append(artifact)

            # Notify subscribers
            if task_id in task_status_subscribers:
                event = {'type': 'TaskArtifactUpdateEvent', 'artifact': artifact}
                task_status_subscribers[task_id].append(event)

            # Send push notification
            if task_id in push_notification_urls:
                send_push_notification(push_notification_urls[task_id], event)

        elif query:
            # Answer query
            # Check if we have document data
            document_data = None

            if task_id in task_artifacts:
                for artifact in task_artifacts[task_id]:
                    for part in artifact.get('parts', []):
                        if part.get('type') == 'data':
                            document_data = part.get('data', {}).get('content')
                            break
                    if document_data:
                        break

            if not document_data:
                # No document data, ask for a document
                agent_message = {
                    'role': 'agent',
                    'parts': [
                        {
                            'type': 'text',
                            'text': "Please upload a document first before asking questions."
                        }
                    ]
                }

                tasks[task_id]['status'] = 'input-required'
            else:
                # Answer query using sequential thinking
                logger.info(f"Answering query: {query}")

                # Use the sequential thinking framework to answer the query
                prompt = f"""
                I'm going to answer a question about financial data using sequential thinking.

                STEP 1: Understand the question
                - Identify the key information being requested
                - Determine what data is needed to answer the question

                STEP 2: Analyze the available data
                - Examine the securities and portfolio information
                - Identify relevant data points for the question

                STEP 3: Formulate a clear and accurate answer
                - Use the relevant data to answer the question
                - Provide specific details and context
                - Ensure accuracy and completeness

                Here's the financial data:
                {json.dumps(document_data, indent=2)}

                Here's the question:
                {query}

                Please provide a clear and accurate answer to the question.
                """

                response = sequential_thinking_framework.model.generate_content(prompt)
                answer = response.text

                # Create agent response
                agent_message = {
                    'role': 'agent',
                    'parts': [
                        {
                            'type': 'text',
                            'text': answer
                        }
                    ]
                }

                tasks[task_id]['status'] = 'completed'
        else:
            # Unknown request
            agent_message = {
                'role': 'agent',
                'parts': [
                    {
                        'type': 'text',
                        'text': "I'm not sure what you're asking for. Please upload a document or ask a question about a previously uploaded document."
                    }
                ]
            }

            tasks[task_id]['status'] = 'input-required'

        # Add agent message to task
        tasks[task_id]['messages'].append(agent_message)

        # Notify subscribers
        if task_id in task_status_subscribers:
            event = {'type': 'TaskStatusUpdateEvent', 'task': tasks[task_id]}
            task_status_subscribers[task_id].append(event)

        # Send push notification
        if task_id in push_notification_urls:
            send_push_notification(push_notification_urls[task_id], event)

    except Exception as e:
        logger.error(f"Error processing task {task_id}: {str(e)}")

        # Update task status
        tasks[task_id]['status'] = 'failed'

        # Add error message
        agent_message = {
            'role': 'agent',
            'parts': [
                {
                    'type': 'text',
                    'text': f"Error processing request: {str(e)}"
                }
            ]
        }

        tasks[task_id]['messages'].append(agent_message)

        # Notify subscribers
        if task_id in task_status_subscribers:
            event = {'type': 'TaskStatusUpdateEvent', 'task': tasks[task_id]}
            task_status_subscribers[task_id].append(event)

        # Send push notification
        if task_id in push_notification_urls:
            send_push_notification(push_notification_urls[task_id], event)

    return tasks[task_id]

def send_push_notification(url: str, event: Dict[str, Any]) -> None:
    """
    Send a push notification.

    Args:
        url: Webhook URL
        event: Event to send
    """
    try:
        import requests
        requests.post(url, json=event, timeout=5)
    except Exception as e:
        logger.error(f"Error sending push notification to {url}: {str(e)}")

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))

    # Check if Gemini API key is set
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY environment variable not set. Using default OpenRouter key.")

    # Run the app
    app.run(host='0.0.0.0', port=port, debug=True)
