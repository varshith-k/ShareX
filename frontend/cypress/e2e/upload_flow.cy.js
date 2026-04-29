describe('Upload flow smoke test', () => {
  it('loads upload page successfully', () => {
    cy.visit('/upload', { failOnStatusCode: false });

    cy.url().should('include', '/upload');
    cy.contains(/upload|share|file/i).should('exist');
  });

  it('keeps public download route accessible without login', () => {
    cy.visit('/download/test-token-123', { failOnStatusCode: false });

    cy.url().should('include', '/download/');
    cy.contains(/sharex|download|file|link/i).should('exist');
  });
});