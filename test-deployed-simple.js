const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL of the deployed application
const baseUrl = 'https://backv2-app-brfi73d4ra-zf.a.run.app';

async function testDeployedApp() {
  try {
    console.log('Testing deployed app at', baseUrl);
    
    // Fetch the homepage
    console.log('\nFetching homepage...');
    const homepageResponse = await axios.get(baseUrl);
    console.log('Homepage status:', homepageResponse.status);
    
    // Save the homepage HTML
    fs.writeFileSync('homepage.html', homepageResponse.data);
    console.log('Homepage HTML saved to homepage.html');
    
    // Fetch the documents page
    console.log('\nFetching documents page...');
    const documentsResponse = await axios.get(`${baseUrl}/documents-new`);
    console.log('Documents page status:', documentsResponse.status);
    
    // Save the documents page HTML
    fs.writeFileSync('documents-page.html', documentsResponse.data);
    console.log('Documents page HTML saved to documents-page.html');
    
    // Check if there are document cards in the HTML
    const documentCardMatch = documentsResponse.data.match(/class="document-card"/g);
    const documentCardCount = documentCardMatch ? documentCardMatch.length : 0;
    console.log(`Found ${documentCardCount} document cards on the documents page`);
    
    // Try to extract document IDs
    const documentIdMatches = documentsResponse.data.match(/data-id="([^"]+)"/g);
    const documentIds = documentIdMatches 
      ? documentIdMatches.map(match => match.replace('data-id="', '').replace('"', ''))
      : [];
    
    console.log(`Found ${documentIds.length} document IDs:`, documentIds);
    
    // If we found document IDs, try to fetch the first document detail page
    if (documentIds.length > 0) {
      const firstDocumentId = documentIds[0].replace('data-id="', '').replace('"', '');
      console.log(`\nFetching document detail page for ID: ${firstDocumentId}...`);
      
      try {
        const detailResponse = await axios.get(`${baseUrl}/documents-new/${firstDocumentId}`);
        console.log('Document detail page status:', detailResponse.status);
        
        // Save the document detail page HTML
        fs.writeFileSync('document-detail-page.html', detailResponse.data);
        console.log('Document detail page HTML saved to document-detail-page.html');
        
        // Check if there's a process button
        const processButtonMatch = detailResponse.data.match(/id="process-document-btn"/g);
        const hasProcessButton = !!processButtonMatch;
        console.log(`Process button found: ${hasProcessButton}`);
        
        // Check if there's a reprocess button
        const reprocessButtonMatch = detailResponse.data.match(/id="reprocess-document-btn"/g);
        const hasReprocessButton = !!reprocessButtonMatch;
        console.log(`Reprocess button found: ${hasReprocessButton}`);
        
        // Check if there are action buttons
        const actionButtonsMatch = detailResponse.data.match(/class="action-buttons"/g);
        const hasActionButtons = !!actionButtonsMatch;
        console.log(`Action buttons found: ${hasActionButtons}`);
        
        if (hasActionButtons) {
          // Try to extract the action buttons HTML
          const actionButtonsHtml = detailResponse.data.match(/<div class="action-buttons">([\s\S]*?)<\/div>/);
          if (actionButtonsHtml && actionButtonsHtml[1]) {
            console.log('Action buttons HTML:', actionButtonsHtml[1]);
          }
        }
      } catch (error) {
        console.error('Error fetching document detail page:', error.message);
      }
    }
    
    // Fetch the API health endpoint
    console.log('\nFetching API health endpoint...');
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/health`);
      console.log('API health status:', healthResponse.status);
      console.log('API health response:', healthResponse.data);
    } catch (error) {
      console.error('Error fetching API health endpoint:', error.message);
    }
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Error testing deployed app:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDeployedApp();
