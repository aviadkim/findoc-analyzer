// This is a test file to verify that Context7 MCP is working
// When you use Context7 MCP, you should be able to get up-to-date documentation
// and code examples for libraries like Express, Supabase, and Google Cloud

// Example Express server
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Example Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://your-project-url.supabase.co',
  'your-anon-key'
);

// Example Google Cloud Storage
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'your-bucket-name';
const bucket = storage.bucket(bucketName);

// To use Context7 MCP, add "use context7" to your prompt
// For example:
// "Create a Supabase client with Row Level Security. use context7"
