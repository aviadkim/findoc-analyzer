/**
 * Custom TaskMaster implementation using OpenRouter API
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

// Configuration
const config = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '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',
  model: process.env.MODEL || 'anthropic/claude-3-7-sonnet-20250219',
  maxTokens: parseInt(process.env.MAX_TOKENS || '64000'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.2'),
  tasksFile: './taskmaster.json',
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load tasks from file
function loadTasks() {
  try {
    if (fs.existsSync(config.tasksFile)) {
      const tasksData = fs.readFileSync(config.tasksFile, 'utf8');
      return JSON.parse(tasksData);
    }
  } catch (error) {
    console.error('Error loading tasks:', error.message);
  }
  
  // Return default tasks if file doesn't exist or there's an error
  return {
    project: {
      name: 'FinDoc Analyzer',
      description: 'A SaaS application for financial document processing and analysis',
      version: '1.0.0',
      tasks: []
    }
  };
}

// Save tasks to file
function saveTasks(tasks) {
  try {
    fs.writeFileSync(config.tasksFile, JSON.stringify(tasks, null, 2));
    console.log('Tasks saved successfully.');
  } catch (error) {
    console.error('Error saving tasks:', error.message);
  }
}

// Display tasks
function displayTasks(tasks) {
  console.log(`\n${tasks.project.name} v${tasks.project.version}`);
  console.log(tasks.project.description);
  console.log('\nTasks:');
  
  if (tasks.project.tasks.length === 0) {
    console.log('  No tasks found.');
  } else {
    tasks.project.tasks.forEach(task => {
      const statusEmoji = getStatusEmoji(task.status);
      console.log(`  ${statusEmoji} [${task.id}] ${task.title} (${task.priority})`);
      
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          const subtaskStatusEmoji = getStatusEmoji(subtask.status);
          console.log(`    ${subtaskStatusEmoji} [${subtask.id}] ${subtask.title}`);
        });
      }
    });
  }
}

// Get emoji for status
function getStatusEmoji(status) {
  switch (status.toLowerCase()) {
    case 'todo':
      return '⬜';
    case 'in_progress':
      return '🟡';
    case 'completed':
      return '🟢';
    case 'blocked':
      return '🔴';
    default:
      return '⬜';
  }
}

// Call OpenRouter API to generate task
async function generateTask(prompt) {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: config.model,
      messages: [
        { role: 'system', content: 'You are TaskMaster AI, a task management system for AI-driven development. Your job is to help create, organize, and manage development tasks.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openRouterApiKey}`
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Create a new task
async function createTask(tasks) {
  console.log('\nCreating a new task...');
  
  const title = await askQuestion('Task title: ');
  const description = await askQuestion('Task description: ');
  const priority = await askQuestion('Task priority (low/medium/high): ');
  
  // Generate subtasks using OpenRouter API
  console.log('\nGenerating subtasks...');
  const prompt = `
    I'm working on a project called "${tasks.project.name}": ${tasks.project.description}
    
    I need to create subtasks for the following task:
    Title: ${title}
    Description: ${description}
    Priority: ${priority}
    
    Please generate 3-5 subtasks that would help complete this task. For each subtask, provide:
    1. A clear, concise title
    2. A brief description
    
    Format your response as a JSON array of objects with 'title' and 'description' properties.
  `;
  
  try {
    const generatedContent = await generateTask(prompt);
    let subtasks = [];
    
    // Extract JSON from the response
    const jsonMatch = generatedContent.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
      try {
        subtasks = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Error parsing generated subtasks:', error.message);
        subtasks = [];
      }
    }
    
    // Create the new task
    const newTaskId = tasks.project.tasks.length > 0 
      ? Math.max(...tasks.project.tasks.map(t => t.id)) + 1 
      : 1;
    
    const newTask = {
      id: newTaskId,
      title,
      description,
      status: 'todo',
      priority: priority.toLowerCase(),
      subtasks: subtasks.map((subtask, index) => ({
        id: newTaskId + (index + 1) / 10,
        title: subtask.title,
        description: subtask.description,
        status: 'todo'
      }))
    };
    
    tasks.project.tasks.push(newTask);
    saveTasks(tasks);
    
    console.log('\nTask created successfully!');
    displayTask(newTask);
  } catch (error) {
    console.error('Error creating task:', error.message);
  }
}

// Display a single task
function displayTask(task) {
  console.log(`\n[${task.id}] ${task.title} (${task.priority}) - ${task.status}`);
  console.log(task.description);
  
  if (task.subtasks && task.subtasks.length > 0) {
    console.log('\nSubtasks:');
    task.subtasks.forEach(subtask => {
      const subtaskStatusEmoji = getStatusEmoji(subtask.status);
      console.log(`  ${subtaskStatusEmoji} [${subtask.id}] ${subtask.title} - ${subtask.status}`);
      console.log(`    ${subtask.description}`);
    });
  }
}

// Update task status
function updateTaskStatus(tasks, taskId, newStatus) {
  const task = tasks.project.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    saveTasks(tasks);
    console.log(`\nTask ${taskId} status updated to ${newStatus}.`);
  } else {
    console.log(`\nTask ${taskId} not found.`);
  }
}

// Ask a question and get user input
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  console.log('Welcome to Custom TaskMaster!');
  console.log('Using OpenRouter API with model:', config.model);
  
  const tasks = loadTasks();
  displayTasks(tasks);
  
  let running = true;
  
  while (running) {
    console.log('\nCommands:');
    console.log('  list - List all tasks');
    console.log('  show <id> - Show task details');
    console.log('  create - Create a new task');
    console.log('  update <id> <status> - Update task status');
    console.log('  exit - Exit TaskMaster');
    
    const command = await askQuestion('\nEnter command: ');
    const parts = command.split(' ');
    
    switch (parts[0].toLowerCase()) {
      case 'list':
        displayTasks(tasks);
        break;
      
      case 'show':
        if (parts[1]) {
          const taskId = parseInt(parts[1]);
          const task = tasks.project.tasks.find(t => t.id === taskId);
          if (task) {
            displayTask(task);
          } else {
            console.log(`\nTask ${taskId} not found.`);
          }
        } else {
          console.log('\nPlease provide a task ID.');
        }
        break;
      
      case 'create':
        await createTask(tasks);
        break;
      
      case 'update':
        if (parts[1] && parts[2]) {
          const taskId = parseInt(parts[1]);
          const newStatus = parts[2].toLowerCase();
          updateTaskStatus(tasks, taskId, newStatus);
        } else {
          console.log('\nPlease provide a task ID and status.');
        }
        break;
      
      case 'exit':
        running = false;
        break;
      
      default:
        console.log('\nUnknown command. Please try again.');
        break;
    }
  }
  
  rl.close();
  console.log('\nThank you for using Custom TaskMaster!');
}

// Run the main function
main().catch(error => {
  console.error('Error:', error.message);
  rl.close();
});
