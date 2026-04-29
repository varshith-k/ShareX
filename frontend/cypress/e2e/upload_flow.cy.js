describe('Core Frontend Route Flow', () => {
  it('opens the upload route successfully', () => {
    cy.visit('/upload', { failOnStatusCode: false });

    cy.url().should('include', '/upload');
    cy.contains(/upload|share|file/i).should('exist');
  });

  it('keeps public download routes accessible', () => {
    cy.visit('/download/test-token-123', { failOnStatusCode: false });

    cy.url().should('include', '/download/');
    cy.contains(/sharex|download|file|link/i).should('exist');
  });
});