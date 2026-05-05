// Cypress support file for e2e tests
// Minimal setup: ignore uncaught exceptions from third-party libs (e.g., Firebase internals)

// prevent tests from failing on unrelated uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // If the error comes from Firestore internal assertion, ignore it
  try {
    const msg = String(err && (err.message || err))
    if (msg.includes('FIRESTORE') || msg.includes('INTERNAL ASSERTION')) {
      // returning false prevents Cypress from failing the test
      // we log for visibility
      // eslint-disable-next-line no-console
      console.warn('Ignored Firestore internal error in test run:', msg)
      return false
    }
  } catch (e) {
    // ignore
    return false
  }
  // allow other errors to fail the test
  return true
})

// Custom command to sign in using the Firebase SDK inside the browser context.
// Uses cy.session to cache the session and speed up tests.
Cypress.Commands.add('login', () => {
  const email = Cypress.env('TEST_USER_EMAIL') || 'test@webfejl.hu'
  const password = Cypress.env('TEST_USER_PASSWORD') || '12345678'

  cy.session(
    ['firebase-user', email],
    () => {
        // Use the real login form to perform sign-in via the UI. This exercises
        // the same code path users use and is less brittle than hand-stubbing
        // the Firebase internals.
        cy.visit('/login')
        cy.get('[data-cy=email]', { timeout: 10000 }).clear().type(email, { log: false })
        cy.get('[data-cy=password]', { timeout: 10000 }).clear().type(password, { log: false })
        cy.get('[data-cy=login]', { timeout: 10000 }).click()

        // After submitting the form the app should redirect to /recipes and
        // show the authenticated dashboard; assert both.
        cy.url({ timeout: 20000 }).should('include', '/recipes')
        cy.get('[data-cy=auth-ready]', { timeout: 20000 }).should('exist')
        cy.get('[data-cy=dashboard]', { timeout: 20000 }).should('exist')
    },
    {
      validate: () => {
        cy.visit('/')
        cy.get('[data-cy=auth-ready]', { timeout: 10000 }).should('exist')
        cy.get('[data-cy=dashboard]', { timeout: 10000 }).should('exist')
      },
    }
  )
})

