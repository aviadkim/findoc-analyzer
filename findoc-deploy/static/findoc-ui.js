document.addEventListener("DOMContentLoaded", function() {
  const root = document.getElementById("root");
  
  // Create the layout
  const layout = document.createElement("div");
  layout.className = "layout";
  layout.style.display = "flex";
  layout.style.minHeight = "100vh";
  
  // Create the header
  const header = document.createElement("header");
  header.style.backgroundColor = "#1a1a2e";
  header.style.color = "white";
  header.style.padding = "20px";
  header.style.textAlign = "center";
  header.style.position = "fixed";
  header.style.width = "100%";
  header.style.zIndex = "100";
  header.style.top = "0";
  
  const title = document.createElement("h1");
  title.textContent = "FinDoc Analyzer";
  header.appendChild(title);
  
  // Create the sidebar
  const sidebar = document.createElement("div");
  sidebar.className = "sidebar";
  sidebar.style.width = "250px";
  sidebar.style.backgroundColor = "#16213e";
  sidebar.style.color = "white";
  sidebar.style.padding = "20px";
  sidebar.style.minHeight = "100vh";
  sidebar.style.marginTop = "70px";
  
  const menuItems = [
    "Dashboard",
    "Document Upload",
    "Document Analysis",
    "Securities Extraction",
    "Financial Reports",
    "Settings"
  ];
  
  menuItems.forEach((item, index) => {
    const menuItem = document.createElement("div");
    menuItem.className = "menu-item";
    menuItem.textContent = item;
    menuItem.style.padding = "10px";
    menuItem.style.marginBottom = "5px";
    menuItem.style.borderRadius = "5px";
    menuItem.style.cursor = "pointer";
    
    if (index === 0) {
      menuItem.style.backgroundColor = "#0f3460";
      menuItem.classList.add("active");
    }
    
    menuItem.addEventListener("click", function() {
      document.querySelectorAll(".menu-item").forEach(i => {
        i.style.backgroundColor = "";
        i.classList.remove("active");
      });
      this.style.backgroundColor = "#0f3460";
      this.classList.add("active");
    });
    
    sidebar.appendChild(menuItem);
  });
  
  // Create the content area
  const content = document.createElement("div");
  content.className = "content";
  content.style.flex = "1";
  content.style.padding = "20px";
  content.style.backgroundColor = "white";
  content.style.marginTop = "70px";
  content.style.marginLeft = "20px";
  content.style.marginRight = "20px";
  content.style.borderRadius = "8px";
  content.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  
  // Add content
  const welcomeTitle = document.createElement("h2");
  welcomeTitle.textContent = "Welcome to FinDoc Analyzer";
  content.appendChild(welcomeTitle);
  
  const welcomeText = document.createElement("p");
  welcomeText.textContent = "This application is deployed on Google App Engine and uses advanced AI for financial document processing.";
  content.appendChild(welcomeText);
  
  // Create upload area
  const uploadArea = document.createElement("div");
  uploadArea.className = "upload-area";
  uploadArea.style.border = "2px dashed #ccc";
  uploadArea.style.padding = "20px";
  uploadArea.style.textAlign = "center";
  uploadArea.style.marginBottom = "20px";
  uploadArea.style.borderRadius = "5px";
  
  const uploadTitle = document.createElement("h3");
  uploadTitle.textContent = "Upload Financial Document";
  uploadArea.appendChild(uploadTitle);
  
  const uploadText = document.createElement("p");
  uploadText.textContent = "Drag and drop your financial document here or click to browse";
  uploadArea.appendChild(uploadText);
  
  const uploadButton = document.createElement("button");
  uploadButton.textContent = "Browse Files";
  uploadButton.style.backgroundColor = "#0f3460";
  uploadButton.style.color = "white";
  uploadButton.style.border = "none";
  uploadButton.style.padding = "10px 20px";
  uploadButton.style.borderRadius = "5px";
  uploadButton.style.cursor = "pointer";
  uploadArea.appendChild(uploadButton);
  
  content.appendChild(uploadArea);
  
  // Create feature grid
  const featureGrid = document.createElement("div");
  featureGrid.className = "feature-grid";
  featureGrid.style.display = "grid";
  featureGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
  featureGrid.style.gap = "20px";
  featureGrid.style.marginTop = "20px";
  
  const features = [
    {
      title: "Advanced Image Processing",
      description: "Extract text and data from scanned documents with high accuracy using state-of-the-art OCR technology."
    },
    {
      title: "Enhanced Table Analysis",
      description: "Automatically detect and extract structured data from complex tables in financial documents."
    },
    {
      title: "Securities Extraction",
      description: "Identify and extract securities information including ISIN codes, quantities, and valuations."
    },
    {
      title: "Financial Document Processing",
      description: "Comprehensive analysis of financial documents with detailed reporting and data visualization."
    }
  ];
  
  features.forEach(feature => {
    const featureCard = document.createElement("div");
    featureCard.className = "feature-card";
    featureCard.style.backgroundColor = "#f9f9f9";
    featureCard.style.borderRadius = "8px";
    featureCard.style.padding = "20px";
    featureCard.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    
    const featureTitle = document.createElement("h3");
    featureTitle.textContent = feature.title;
    featureTitle.style.color = "#0f3460";
    featureTitle.style.marginTop = "0";
    featureCard.appendChild(featureTitle);
    
    const featureDescription = document.createElement("p");
    featureDescription.textContent = feature.description;
    featureCard.appendChild(featureDescription);
    
    featureGrid.appendChild(featureCard);
  });
  
  content.appendChild(featureGrid);
  
  // Add status section
  const statusTitle = document.createElement("h3");
  statusTitle.textContent = "Status";
  content.appendChild(statusTitle);
  
  const statusText = document.createElement("p");
  statusText.textContent = "The application is running on Google App Engine in the europe-west3 region.";
  content.appendChild(statusText);
  
  // Assemble the layout
  layout.appendChild(header);
  layout.appendChild(sidebar);
  layout.appendChild(content);
  
  root.appendChild(layout);
});
