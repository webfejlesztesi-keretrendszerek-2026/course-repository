# DB Uploader

This script uploads JSON files from the Angular app `assets/data` folder into Firestore collections.

Usage

1. Install dependencies:

```bash
cd db-uploader
npm install
```

2. Create a `.firebase-env.json` file in one of these locations (checked in order):
- `angular-app/.firebase-env.json`
- project root `./.firebase-env.json`
- `db-uploader/.firebase-env.json`

Example `.firebase-env.json` options:

Option A — provide a service account file path:

```json
{
  "serviceAccountPath": "secrets/serviceAccountKey.json",
  "projectId": "your-project-id"
}
```

Option B — inline service account object:

```json
{
  "serviceAccount": { /* full service account JSON object */ },
  "projectId": "your-project-id"
}
```

Option C — use application default credentials (gcloud auth application-default login):

```json
{
  "useApplicationDefault": true
}
```

3. Run the uploader:

```bash
cd db-uploader
npm start
```

Behavior

- Each JSON file in `angular-app/src/assets/data/*.json` is uploaded to a Firestore collection named after the file (filename without `.json`).
- If a JSON file is an array, each item will be written as a document. If an item contains an `id`, `_id`, or `uid` field it will be used as the document id.
- If the JSON root is an object whose values are objects, it is treated as an id->document map.
- Writes are batched to avoid exceeding Firestore limits.

Notes

- Ensure your service account has Firestore write permissions.
- Be careful running this against production — it will write data.
