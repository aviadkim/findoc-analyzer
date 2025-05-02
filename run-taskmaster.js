/**
 * Run TaskMaster AI in standalone mode
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if the taskmaster.json file exists
const tasksFilePath = path.join(__dirname, 'taskmaster.json');
if (!fs.existsSync(tasksFilePath)) {
  console.log('TaskMaster tasks file not found. Creating a sample file...');
  
  // Create a sample tasks file
  const sampleTasks = {
    "project": {
      "name": "FinDoc Analyzer",
      "description": "A SaaS application for financial document processing and analysis",
      "version": "1.0.0",
      "tasks": [
        {
          "id": 1,
          "title": "Implement Google Authentication",
          "description": "Implement Google Authentication for the FinDoc Analyzer application",
          "status": "todo",
          "priority": "high",
          "subtasks": [
            {
              "id": 1.1,
              "title": "Set up Google OAuth credentials",
              "description": "Create OAuth credentials in Google Cloud Console",
              "status": "todo"
            },
            {
              "id": 1.2,
              "title": "Implement backend authentication endpoints",
              "description": "Create backend endpoints for Google authentication",
              "status": "todo"
            },
            {
              "id": 1.3,
              "title": "Create frontend login components",
              "description": "Create frontend components for Google login",
              "status": "todo"
            },
            {
              "id": 1.4,
              "title": "Test authentication flow",
              "description": "Test the complete authentication flow",
              "status": "todo"
            }
          ]
        },
        {
          "id": 2,
          "title": "Implement Tiered PDF Processing",
          "description": "Implement tiered PDF processing based on document complexity",
          "status": "in_progress",
          "priority": "high",
          "subtasks": [
            {
              "id": 2.1,
              "title": "Create document complexity analyzer",
              "description": "Create a service to analyze document complexity",
              "status": "completed"
            },
            {
              "id": 2.2,
              "title": "Implement browser-based processing",
              "description": "Implement browser-based processing for simple documents",
              "status": "in_progress"
            },
            {
              "id": 2.3,
              "title": "Implement server-based processing",
              "description": "Implement server-based processing for medium complexity documents",
              "status": "todo"
            },
            {
              "id": 2.4,
              "title": "Implement cloud-based processing",
              "description": "Implement cloud-based processing for complex documents",
              "status": "todo"
            }
          ]
        },
        {
          "id": 3,
          "title": "Implement Mock Data for Testing",
          "description": "Implement mock data for testing until the system is fully implemented",
          "status": "completed",
          "priority": "medium",
          "subtasks": [
            {
              "id": 3.1,
              "title": "Create mock data service",
              "description": "Create a service to provide mock data for testing",
              "status": "completed"
            },
            {
              "id": 3.2,
              "title": "Create test HTML page",
              "description": "Create a test HTML page for testing PDF processing",
              "status": "completed"
            },
            {
              "id": 3.3,
              "title": "Test with sample PDFs",
              "description": "Test the mock implementation with sample PDFs",
              "status": "completed"
            }
          ]
        }
      ]
    }
  };
  
  fs.writeFileSync(tasksFilePath, JSON.stringify(sampleTasks, null, 2));
  console.log('Sample tasks file created.');
}

// Run TaskMaster AI
console.log('Running TaskMaster AI in standalone mode...');
try {
  execSync('npm run taskmaster', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running TaskMaster AI:', error.message);
}
