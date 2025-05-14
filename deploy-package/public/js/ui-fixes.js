console.log('UI fixes loaded');

(function() {
  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // General UI fixes
    console.log('Applying general UI fixes');
    
    // Fix navigation links
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
      link.style.textDecoration = 'none';
      link.addEventListener('mouseenter', function() {
        this.style.textDecoration = 'underline';
      });
      link.addEventListener('mouseleave', function() {
        this.style.textDecoration = 'none';
      });
    });
    
    // Fix button styles
    const buttons = document.querySelectorAll('button.btn');
    buttons.forEach(button => {
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 0.3s';
    });
    
    // Fix form layouts
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.style.padding = '8px';
        input.style.margin = '5px 0';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #ddd';
        input.style.width = '100%';
      });
    });
  });
})();
