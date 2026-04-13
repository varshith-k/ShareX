describe('Public download page smoke test', () => {
  it('opens the public download page and renders successful metadata state', () => {
    cy.intercept('GET', '**/file/test-token-123', {
      statusCode: 200,
      body: {
        filename: 'resume.pdf',
        size: 2048,
        token: 'test-token-123',
        createdAt: '2026-04-12T10:00:00.000Z',
        expiresAt: '2026-04-20T10:00:00.000Z',
        isExpired: false,
      },
    }).as('getMetadata');

    cy.visit('/download/test-token-123');

    cy.wait('@getMetadata');

    cy.contains('resume.pdf').should('exist');
    cy.contains('Download File').should('be.visible');
    cy.contains('Size').should('exist');
    cy.contains('2.00 KB').should('exist');
  });

  it('renders expired error state when metadata request fails with expired message', () => {
    cy.intercept('GET', '**/file/test-token-expired', {
      statusCode: 410,
      body: {
        error: 'This share link has expired',
      },
    }).as('getExpiredMetadata');

    cy.visit('/download/test-token-expired');

    cy.wait('@getExpiredMetadata');

    cy.contains('This share link has expired').should('be.visible');
    cy.contains('Expired').should('exist');
    cy.contains('Find Another File').should('be.visible');
  });
});