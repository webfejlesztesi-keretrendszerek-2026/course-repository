import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Import test helpers that attach Firebase sign-in functions to `window` when
// Cypress is running. The module is a no-op in normal runtime.
import './test-utils/cypress-auth-helpers';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
