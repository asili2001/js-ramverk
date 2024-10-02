describe('E2E Test with HTTP-only cookie', () => {
  beforeEach(() => {
    // Use the login command before each test
    cy.login('ahmadasili1928@gmail.com', 'ahmad');
  });

  it('Visits the homepage and checks for a specific element', () => {
    // After login, visit the homepage
    cy.visit('http://localhost:5173/documents');
  });
});