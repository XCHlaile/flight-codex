# Railway Deployment

This project is configured as a single Railway web service:

- Vite builds the frontend into `dist`.
- Express serves `/api`, `/uploads`, and the built frontend.
- JSON data and uploaded images can be persisted with a Railway Volume.

## Recommended Railway Settings

1. Connect this GitHub repository to Railway.
2. Use the default Node/Nixpacks builder.
3. Build command:

```bash
npm run build
```

4. Start command:

```bash
npm start
```

5. Add a Railway Volume mounted at:

```text
/app/data
```

6. Optional environment variables, if you use a different mount path:

```text
DATA_DIR=/app/data
UPLOADS_DIR=/app/data/uploads
```

Railway provides `PORT` automatically. The app reads `process.env.PORT` in `api/server.ts`.

## Initial Data

When the persistent data directory is empty, the server copies seed JSON files from `seed-data/` into the writable data directory. After that, admin changes are written to the mounted data directory.

## Local Production Check

```bash
npm run build
npm start
```

Then open `http://localhost:3001`.
