#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function findFirebaseEnv() {
  const candidates = [
    path.resolve(__dirname, '..', 'angular-app', '.firebase-env.json'),
    path.resolve(__dirname, '..', '.firebase-env.json'),
    path.resolve(__dirname, '.firebase-env.json'),
    path.resolve(__dirname, '..', 'angular-app', 'src', '.firebase-env.json')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function loadFirebaseConfig() {
  const envPath = findFirebaseEnv();
  if (!envPath) {
    console.error('Could not find .firebase-env.json. Please create one in the project root or in angular-app/.firebase-env.json');
    process.exit(1);
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse', envPath, err.message);
    process.exit(1);
  }
}

function initFirebase(firebaseEnv) {
  if (firebaseEnv.useApplicationDefault) {
    admin.initializeApp({});
    return;
  }

  let credential = null;

  // Case 1: path to service account JSON
  if (firebaseEnv.serviceAccountPath) {
    const saPath = path.isAbsolute(firebaseEnv.serviceAccountPath)
      ? firebaseEnv.serviceAccountPath
      : path.resolve(__dirname, '..', firebaseEnv.serviceAccountPath);
    if (!fs.existsSync(saPath)) {
      console.error('Service account file not found at', saPath);
      process.exit(1);
    }
    const sa = require(saPath);
    credential = admin.credential.cert(sa);
  // Case 2: nested `serviceAccount` object
  } else if (firebaseEnv.serviceAccount) {
    credential = admin.credential.cert(firebaseEnv.serviceAccount);
  // Case 3: top-level service account fields present in the env file
  } else if (firebaseEnv.private_key && firebaseEnv.client_email) {
    credential = admin.credential.cert(firebaseEnv);
  } else {
    console.error('No service account information found in .firebase-env.json. Provide `serviceAccountPath`, `serviceAccount`, top-level service account fields, or set `useApplicationDefault=true`.');
    process.exit(1);
  }

  const appOptions = { credential };
  if (firebaseEnv.projectId || firebaseEnv.project_id) appOptions.projectId = firebaseEnv.projectId || firebaseEnv.project_id;
  if (firebaseEnv.databaseURL) appOptions.databaseURL = firebaseEnv.databaseURL;

  admin.initializeApp(appOptions);
}

async function uploadCollectionFromFile(filePath) {
  const basename = path.basename(filePath, '.json');
  const collectionName = basename;
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse', filePath, err.message);
    return { collection: collectionName, added: 0 };
  }

  const db = admin.firestore();
  const colRef = db.collection(collectionName);

  let added = 0;

  if (Array.isArray(data)) {
    let batch = db.batch();
    let batchCount = 0;
    for (const item of data) {
      const id = item && (item.id || item._id || item.uid) ? String(item.id || item._id || item.uid) : null;
      const docRef = id ? colRef.doc(id) : colRef.doc();
      batch.set(docRef, item);
      batchCount++;
      added++;
      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
    if (batchCount > 0) await batch.commit();
  } else if (data && typeof data === 'object') {
    // object can be id->doc map or single document
    const keys = Object.keys(data);
    // Heuristic: if keys look like ids and values are objects -> treat as map
    const isMap = keys.length > 0 && keys.every(k => typeof data[k] === 'object');
    if (isMap) {
      let batch = db.batch();
      let batchCount = 0;
      for (const [id, doc] of Object.entries(data)) {
        const docRef = colRef.doc(String(id));
        batch.set(docRef, doc);
        batchCount++;
        added++;
        if (batchCount >= 400) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      }
      if (batchCount > 0) await batch.commit();
    } else {
      // single document -> push as one doc with auto id
      await colRef.add(data);
      added = 1;
    }
  }

  return { collection: collectionName, added };
}

async function main() {
  const firebaseEnv = loadFirebaseConfig();
  initFirebase(firebaseEnv);

  const assetsDir = path.resolve(__dirname, '..', 'angular-app', 'src', 'assets', 'data');
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets data directory not found at', assetsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('No JSON files found in', assetsDir);
    return;
  }

  console.log('Found JSON files:', files.join(', '));

  const results = [];
  for (const f of files) {
    const filePath = path.join(assetsDir, f);
    console.log('Uploading', f, '-> collection', path.basename(f, '.json'));
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await uploadCollectionFromFile(filePath);
      results.push(res);
      console.log(`Uploaded ${res.added} documents to ${res.collection}`);
    } catch (err) {
      console.error('Error uploading', f, err.message || err);
    }
  }

  console.log('Done. Summary:');
  for (const r of results) console.log(`- ${r.collection}: ${r.added}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
