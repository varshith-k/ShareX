describe('Sprint 2 smoke test', () => {
  it('validates the upload form before sending a request', () => {
    cy.visit('/upload');

    cy.contains('button', 'Upload').click();

    cy.contains('Please select a file first.').should('be.visible');
  });
});
