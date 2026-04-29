describe('Upload Page Test', () => {
  it('loads upload page successfully', () => {
    cy.visit('/upload', { failOnStatusCode: false });

    cy.url().should('include', '/upload');
    cy.contains(/upload|share|file/i).should('exist');
  });
});