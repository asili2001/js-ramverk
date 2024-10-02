Cypress.Commands.add('login', (email, password) => {
    // Perform the login via API
    cy.request({
        method: 'POST',
        url: 'http://localhost:1337/api/users/login', // Replace with your login API endpoint
        body: {
            email: email,
            password: password,
        },
    }).then((response) => {
        console.log(response);
        
        expect(response.status).to.eq(200); // Ensure the login is successful
    });
});


Cypress.Commands.add('disableCache', () => {
    cy.intercept('GET', '**/*', (req) => {
      req.headers['Cache-Control'] = 'no-cache';
      req.headers['Pragma'] = 'no-cache';
    }).as('disableCache');
  });