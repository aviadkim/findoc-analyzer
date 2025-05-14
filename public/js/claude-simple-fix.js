// SimpleFixScript.js - Created by Claude on May 8, 2025
console.log("Simple Fix Script loaded");

// This script adds a floating button to all pages
document.addEventListener("DOMContentLoaded", function() {
    // Create the floating button
    const buttonContainer = document.createElement("div");
    buttonContainer.style.position = "fixed";
    buttonContainer.style.bottom = "20px";
    buttonContainer.style.right = "20px";
    buttonContainer.style.zIndex = "9999";
    
    const button = document.createElement("button");
    button.id = "claude-floating-btn";
    button.textContent = "Claude Fix Button";
    button.style.backgroundColor = "#8A2BE2"; // Purple color for Claude
    button.style.color = "white";
    button.style.padding = "12px 24px";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
    
    button.addEventListener("click", function() {
        alert("Claude's Fix Script is working! Button clicked on " + new Date().toLocaleString());
    });
    
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    console.log("Claude's floating button has been added to the page");
});
