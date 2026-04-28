describe('Upload flow smoke test', () => {
  it('opens upload page successfully', () => {
    cy.visit('/upload', {
      failOnStatusCode: false,
    });

    cy.url().should('include', '/upload');
    cy.contains(/upload|share|file/i).should('exist');
  });

  it('shows file input on upload page', () => {
    cy.visit('/upload', {
      failOnStatusCode: false,
    });

    cy.get('input[type="file"]').should('exist');
  });
});