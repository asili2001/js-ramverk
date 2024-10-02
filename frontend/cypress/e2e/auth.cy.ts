describe('E2E Test with HTTP-only cookie', () => {
  beforeEach(() => {
    // Use the login command before each test
    cy.login(Cypress.env()['TEST_USER_EMAIL'], Cypress.env()['TEST_USER_PASSWORD']);
  });

  it('Visits the homepage and checks for a specific element', () => {
    // After login, visit the homepage
    cy.visit('http://localhost:5173/documents');
  });
});