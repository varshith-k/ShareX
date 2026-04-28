describe('Upload Page Test', () => {
  it('redirects unauthenticated users from upload page to login', () => {
    cy.visit('/upload', { failOnStatusCode: false });

    cy.url().should('include', '/login');
    cy.contains(/login|email|password|sign in/i).should('exist');
  });
});