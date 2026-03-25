describe('FE2-19: Download Page Smoke Test', () => {
  // This test simulates a user visiting a specific download link
  it('should successfully load the download page and display the file token', () => {
    // 1. Visit the local development server at the download route
    // Note: Make sure your 'npm start' is running in another terminal!
    cy.visit('http://localhost:3000/download/cypress-smoke-test-123');

    // 2. Verify the main page heading is visible to the user
    cy.contains('File Ready for Download').should('be.visible');

    // 3. Verify that the dynamic token from the URL is rendered in the UI
    cy.contains('cypress-smoke-test-123').should('be.visible');

    // 4. Verify the download button is present
    cy.get('button').contains('Download Now').should('be.visible');
  });

  it('should navigate back to home if the back link is clicked on error', () => {
    // Visit an invalid route to trigger the error state we built in FE2-18
    cy.visit('http://localhost:3000/download/invalid-token');
    
    // Click the "Back to Home" link
    cy.contains('Back to Home').click();

    // Verify the URL is now the root path
    cy.url().should('eq', 'http://localhost:3000/');
  });
});