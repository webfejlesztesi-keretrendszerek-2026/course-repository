// Cypress 13+ E2E test (TypeScript)
// Happy path: guest views recipes, logs in, opens first recipe detail

describe('Recipe happy path', () => {
  it('guest can view recipes, login and open a recipe detail', () => {
    // For this happy-path test we want to exercise the real UI + auth flow.
    // Temporarily force real auth so we don't stub Firebase identity endpoints.
    const useRealAuth = true
    if (!useRealAuth) {
      // Intercept Identity Toolkit (Firebase Auth) token exchange and return
      // a response shape the SDK expects (accounts:signInWithPassword)
      cy.intercept('POST', '**/identitytoolkit.googleapis.com/**', (req) => {
        const userEmail = Cypress.env('TEST_USER_EMAIL') || 'test@webfejl.hu'
        req.reply({
          statusCode: 200,
          body: {
            kind: 'identitytoolkit#VerifyPasswordResponse',
            localId: 'fake-local-id',
            email: userEmail,
            displayName: 'Test User',
            idToken: 'fake-id-token',
            registered: true,
            refreshToken: 'fake-refresh-token',
            expiresIn: '3600',
            emailVerified: true,
          },
        })
      }).as('signIn')

      // Intercept Secure Token exchange if used by the SDK
      cy.intercept('POST', '**/securetoken.googleapis.com/**', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            access_token: 'fake-access-token',
            expires_in: '3600',
            token_type: 'Bearer',
            refresh_token: 'fake-refresh-token',
            user_id: 'fake-local-id',
          },
        })
      })

      // The SDK may call the accounts:lookup endpoint after sign-in — stub that too
      cy.intercept('POST', '**/www.googleapis.com/identitytoolkit/**', (req) => {
        const userEmail = Cypress.env('TEST_USER_EMAIL') || 'test@webfejl.hu'
        req.reply({
          statusCode: 200,
          body: {
            users: [
              {
                localId: 'fake-local-id',
                email: userEmail,
                displayName: 'Test User',
                emailVerified: true,
                disabled: false,
                providerUserInfo: [{ providerId: 'password', email: userEmail }],
              },
            ],
          },
        })
      })
    }

    // 1. Open root
    cy.visit('/', { timeout: 60000 })

    // 2. Should redirect to /recipes (guests can view)
    cy.url({ timeout: 20000 }).should('include', '/recipes')

    // 3. Ensure at least one recipe card is visible — look for an <article> or a recipe title
    cy.get('article', { timeout: 20000 }).first().should('exist')

    // 4. Click the "Bejelentkezés" (Login) link
    cy.contains(/bejelentkezés/i, { timeout: 10000 }).click()

    // 5. Should be on /login
    cy.url({ timeout: 20000 }).should('include', '/login')

    // 6. Use the real login form (UI) to sign in — this exercises the
    // same code path as a user and is the preferred happy-path test.
    const email = Cypress.env('TEST_USER_EMAIL') || 'test@webfejl.hu'
    const password = Cypress.env('TEST_USER_PASSWORD') || '12345678'

    cy.get('[data-cy=email]', { timeout: 10000 }).clear().type(email, { log: false })
    cy.get('[data-cy=password]', { timeout: 10000 }).clear().type(password, { log: false })
    cy.get('[data-cy=login]', { timeout: 10000 }).click()

    // After submitting the form the app should redirect to /recipes and
    // indicate authenticated state.
    cy.url({ timeout: 20000 }).should('include', '/recipes')
    cy.get('[data-cy=auth-ready]', { timeout: 20000 }).should('exist')

    // 9. Click the first recipe's "Megtekintés" button to open the detail dialog
    cy.get('article', { timeout: 20000 }).first().within(() => {
      cy.contains(/megtekintés/i).click()
    })

    // 10. Expect recipe detail to open — either a route with /recipes/:id or a modal/detail container
    cy.url({ timeout: 10000 }).then((u) => {
      const str = u.toString()
      // either a dedicated recipe route
      if (str.includes('/recipes/')) {
        expect(str).to.match(/\/recipes\/.+/)
      } else {
        // or modal: assert a detail element exists
        cy.get('.recipe-detail, .modal, [data-cy="recipe-detail"]', { timeout: 10000 }).should('exist')
      }
    })

    // final: ensure the detail contains a title (best-effort)
    cy.contains(/[A-Za-z0-9\u00C0-\u017F]{3,}/, { timeout: 10000 }).should('exist')
  })
})
