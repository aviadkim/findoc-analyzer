const http = require('http');

// Check if the application is running
const checkApp = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    
    res.on('end', () => {
      console.log('Application is running!');
      process.exit(0); // Exit with success
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    console.log('Application is not running. Please start the application first.');
    process.exit(1); // Exit with error
  });

  req.end();
};

checkApp();
