describe('Upload Route Availability', () => {
  it('opens the upload page successfully', () => {
    cy.visit('/upload', { failOnStatusCode: false });

    cy.url().should('include', '/upload');
    cy.contains(/upload|share|file/i).should('exist');
  });
});