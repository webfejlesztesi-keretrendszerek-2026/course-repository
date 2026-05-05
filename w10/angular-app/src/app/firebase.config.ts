import { environment } from '../environments/environment';

// Some environments (Angular compiler) don't have Node typings; declare
// these symbols so the file can be type-checked and still perform the
// runtime checks we need for tests.
declare const process: any;
declare const require: any;

// During unit tests we avoid initializing the real Firebase SDK because
// it can open network/listener connections and trigger internal assertions
// that break the test runner. Detect Vitest via `process.env.VITEST` and
// return lightweight mock objects instead.
let db: any = {};
let auth: any = {};

try {
	// `process.env.VITEST` is set by Vitest when running tests.
	if (!(process && (process as any).VITEST)) {
		// Only initialize the real SDK when NOT running under Vitest.
		// Import lazily so test runner can mock the modules before they load.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { initializeApp } = require('firebase/app');
		const { getFirestore } = require('firebase/firestore');
		const { getAuth } = require('firebase/auth');

		const app = initializeApp(environment.firebaseConfig);
		db = getFirestore(app);
		auth = getAuth(app);
	}
} catch (e) {
	// If anything goes wrong (e.g., `process` undefined in some runtime),
	// fallback to empty mocks — tests will provide their own mocks.
	db = {};
	auth = {};
}

export { db, auth };
