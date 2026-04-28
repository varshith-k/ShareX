describe('Public download page smoke test', () => {
  it('opens public download page and renders successful metadata state', () => {
    cy.intercept('GET', '**/metadata/test-token-123', {
      statusCode: 200,
      body: {
        filename: 'resume.pdf',
        size: 2048,
        token: 'test-token-123',
        createdAt: '2026-04-12T10:00:00.000Z',
        expiresAt: '2035-04-20T10:00:00.000Z',
        isExpired: false,
      },
    }).as('getMetadata');

    cy.visit('/download/test-token-123');

    cy.wait('@getMetadata');

    cy.contains('resume.pdf').should('be.visible');
    cy.contains('File details').should('be.visible');
    cy.contains('2.00 KB').should('be.visible');
    cy.contains('Download File').should('be.visible');
  });

  it('renders expired public download error state', () => {
    cy.intercept('GET', '**/metadata/expired-token', {
      statusCode: 410,
      body: {
        error: 'This share link has expired',
      },
    }).as('getExpiredMetadata');

    cy.visit('/download/expired-token');

    cy.wait('@getExpiredMetadata');

    cy.contains('This share link has expired').should('be.visible');
    cy.contains('Try Another Token').should('be.visible');
  });
});