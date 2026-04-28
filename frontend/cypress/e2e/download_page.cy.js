describe('Public download page smoke test', () => {
  it('opens public download route successfully', () => {
    cy.visit('/download/test-token-123', {
      failOnStatusCode: false,
    });

    cy.url().should('include', '/download/');
    cy.contains(/sharex|download|file|link/i).should('exist');
  });

  it('handles invalid token route gracefully', () => {
    cy.visit('/download/invalid-token', {
      failOnStatusCode: false,
    });

    cy.url().should('include', '/download/');
    cy.contains(/invalid|expired|revoked|file|link|not found/i).should('exist');
  });
});