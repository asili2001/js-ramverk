let docId;

describe('Document Tests', () => {
    beforeEach(() => {
        cy.login(Cypress.env()['TEST_USER_EMAIL'], Cypress.env()['TEST_USER_PASSWORD']);
        cy.visit('http://localhost:5173/documents');
    });

    it('Creates a New Document', () => {
        cy.document().then((doc) => {
            console.log(doc.documentElement.outerHTML); // Logs the entire DOM
        });
        cy.disableCache();
        cy.intercept('POST', `${Cypress.env().MAIN_API_URL}/documents`).as('createDocument');

        cy.get('.new-document-btn', { timeout: 20000 }).should("exist").click();

        cy.wait('@createDocument').then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
            expect(interception.response.body.data).to.have.property('id');
            expect(interception.response.body.data).to.have.property('title').to.eq("Untitled");
            expect(interception.response.body.data).to.have.property('content').to.eq(null);
            docId = interception.response.body.data.id;

            // check for the url if got redirected
            cy.url().should('include', `/documents/${docId}`);

            // check for the title input value if got same of default doc title
            cy.get('.title-n-menubar input').should('have.value', 'Untitled');
        });
    });
    it('Opens the Created Document', () => {
        cy.disableCache();
        cy.intercept('GET', `${Cypress.env().MAIN_API_URL}/documents/${docId}`).as('viewDocument');
        cy.get('.document-list .document-card', { timeout: 20000 }).last().should("exist").click();

        cy.wait('@viewDocument').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.log(JSON.stringify(interception.response));
            expect(interception.response.body.data).to.have.property('id');
            // check for the url if got redirected
            cy.url().should('include', `/documents/${docId}`);

            // check for the title input value if got same of default doc title
            cy.get('.title-n-menubar input').should('have.value', 'Untitled');
        });
    });
    it('Update Document Content', () => {
        cy.disableCache();
        cy.visit(`http://localhost:5173/documents/${docId}`);
        cy.intercept('PUT', `${Cypress.env().MAIN_API_URL}/documents/${docId}`).as('updateDocument');
        cy.get('.main-textbox', { timeout: 20000 }).should("exist").type('Hello World');

        cy.wait('@updateDocument').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.log(JSON.stringify(interception.response));
            expect(interception.response.body.data).to.have.property('id');

            // check for the new content
            cy.get('.main-textbox').should('contain', 'Hello World');
        });

    });
    it('Update Document Title', () => {
        cy.disableCache();
        cy.visit(`http://localhost:5173/documents/${docId}`);
        cy.intercept('PUT', `${Cypress.env().MAIN_API_URL}/documents/${docId}`).as('updateDocument');
        cy.get('.main-textbox', { timeout: 20000 }).should("exist").type('Hello World');
        cy.get('.title-n-menubar input')
            .focus() // Focus on the input field
            .type('{selectall}') // Select all text
            .type('test'); // Type the new text

        cy.wait('@updateDocument').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.log(JSON.stringify(interception.response));
            expect(interception.response.body.data).to.have.property('id');

            // check for the new title
            cy.get('.title-n-menubar input').should('have.value', 'test');
        });

        // we go back to the document list to check for the updated title
        cy.visit(`http://localhost:5173/documents`);
        cy.get('.document-list .document-card').last().get('.detailes h3').should('contain', 'test');


    });
});
