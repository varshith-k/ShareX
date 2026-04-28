describe('Upload flow smoke test', () => {
  it('redirects unauthenticated upload access to login page', () => {
    cy.visit('/upload', { failOnStatusCode: false });

    cy.url().should('include', '/login');
    cy.contains(/login|email|password|sign in/i).should('exist');
  });

  it('keeps public download route accessible without login', () => {
    cy.visit('/download/test-token-123', { failOnStatusCode: false });

    cy.url().should('include', '/download/');
    cy.contains(/sharex|download|file|link/i).should('exist');
  });
});