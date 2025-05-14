"use client"

import React from 'react';

export const SkipToContent = ({ mainContentId = 'main-content', label = 'Skip to main content' }) => {
  return (
    <a 
      href={`#${mainContentId}`} 
      className="skip-link"
      aria-label={label}
    >
      {label}
    </a>
  );
};

// Example usage in layout:
// 
// <body>
//   <SkipToContent />
//   <header>...</header>
//   <main id="main-content">
//     {children}
//   </main>
//   <footer>...</footer>
// </body>