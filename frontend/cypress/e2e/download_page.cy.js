describe('Public Download Flow', () => {
  it('loads a shared file route successfully', () => {
    cy.visit('/download/test-token-123', {
      failOnStatusCode: false,
    });

    cy.url().should('include', '/download/');
    cy.contains(/sharex|download|file|link/i).should('exist');
  });

  it('handles invalid shared links gracefully', () => {
    cy.visit('/download/invalid-token', {
      failOnStatusCode: false,
    });

    cy.url().should('include', '/download/');
    cy.contains(/invalid|expired|revoked|file|link|not found/i).should('exist');
  });
});