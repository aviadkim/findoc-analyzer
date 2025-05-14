/**
 * Bloomberg Agent Question Answering Test
 * 
 * This script tests the question answering functionality of the Bloomberg Agent.
 */

const BloombergAgent = require('./bloomberg-agent');
const assert = require('assert');

// Create a Bloomberg agent
const agent = new BloombergAgent({ openrouter: 'mock-api-key' });

// Test function
async function runTest() {
  try {
    console.log('Starting Bloomberg Agent Question Answering test...');
    
    // Initialize the agent
    console.log('Initializing agent...');
    await agent.start();
    console.log('Agent initialized successfully.');
    
    // Test questions
    const questions = [
      // Price questions
      'What is the current price of AAPL?',
      'How much is Microsoft stock trading at?',
      
      // Historical questions
      'How has TSLA performed over the past month?',
      'What is the 6-month trend for Amazon?',
      
      // Comparison questions
      'Compare Apple and Microsoft stock performance',
      'Which is better, GOOGL or META?',
      
      // Analysis questions
      'Analyze NVDA stock',
      'What is the outlook for Netflix?',
      
      // General questions
      'What is the best stock to buy?'
    ];
    
    // Test each question
    for (const question of questions) {
      console.log(`\nTesting question: "${question}"`);
      const result = await agent.answerQuestion(question);
      
      assert(result.success, `Failed to answer question: ${question}`);
      assert(result.question === question, `Question mismatch: expected "${question}", got "${result.question}"`);
      assert(result.answer, `Answer should be provided`);
      assert(result.type, `Question type should be provided`);
      assert(typeof result.processingTime === 'number', `Processing time should be a number`);
      
      console.log(`Question type: ${result.type}`);
      console.log(`Answer: ${result.answer.substring(0, 100)}...`);
      console.log(`Processing time: ${result.processingTime.toFixed(2)}s`);
    }
    
    // Print agent stats
    console.log('\nAgent stats:');
    console.log(`Queries processed: ${agent.stats.queriesProcessed}`);
    console.log(`Stocks analyzed: ${agent.stats.stocksAnalyzed}`);
    console.log(`Questions answered: ${agent.stats.questionsAnswered}`);
    
    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
