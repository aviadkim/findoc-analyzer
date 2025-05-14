/**
 * FinDoc Analyzer - Supabase Setup Script
 * 
 * This script sets up the Supabase database for the FinDoc Analyzer application.
 * It creates the necessary tables and functions for API key management.
 */

const fs = require('fs');
const path = require('path');
const supabase = require('./supabase-client');

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split the schema into individual statements
const statements = schema.split(';').filter(statement => statement.trim() !== '');

// Execute each statement
async function executeStatements() {
  console.log('Setting up Supabase database...');
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    
    if (statement === '') {
      continue;
    }
    
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    } catch (error) {
      console.error(`Error executing statement ${i + 1}:`, error);
    }
  }
  
  console.log('Supabase database setup completed');
}

// Execute the statements
executeStatements().catch(error => {
  console.error('Error setting up Supabase database:', error);
});
