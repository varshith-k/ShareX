describe('Upload flow smoke test', () => {
  it('shows validation message when upload is clicked without a file', () => {
    cy.visit('/upload');

    cy.contains('Upload').click();

    cy.contains('Please select a file first.').should('be.visible');
  });

  it('uploads a file and shows share link panel', () => {
    cy.intercept('POST', '**/upload', {
      statusCode: 200,
      body: {
        token: 'uploaded-test-token',
        downloadUrl: '/download/uploaded-test-token',
      },
    }).as('uploadFile');

    cy.visit('/upload');

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('hello from cypress'),
        fileName: 'demo.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    cy.contains('Upload').click();

    cy.wait('@uploadFile');

    cy.contains('Upload successful').should('be.visible');
    cy.contains('Share link ready').should('be.visible');
    cy.contains('/download/uploaded-test-token').should('be.visible');
    cy.contains('Copy Link').should('be.visible');
  });
});