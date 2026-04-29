describe('Authenticated upload smoke test', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/me', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          name: 'Cypress Demo',
          email: 'cypress@example.com',
        },
      },
    }).as('getMe');

    cy.intercept('POST', '**/upload', {
      statusCode: 200,
      body: {
        message: 'File uploaded successfully',
        token: 'cypress-token',
        downloadUrl: '/download/cypress-token',
      },
    }).as('uploadFile');

    window.localStorage.setItem('sharex.auth.token', 'cypress-token');
  });

  it('loads the protected upload page and shows the generated share link', () => {
    cy.visit('/upload');
    cy.wait('@getMe');

    cy.contains('Upload to ShareX').should('be.visible');

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('hello world'),
      fileName: 'test.txt',
      mimeType: 'text/plain',
    });

    cy.contains('button', 'Upload').click();
    cy.wait('@uploadFile');

    cy.contains('Upload successful').should('be.visible');
    cy.contains('cypress-token').should('be.visible');
  });
});
