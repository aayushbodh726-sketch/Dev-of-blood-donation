# Dev-of-bloody-Mary

LifeFlow is a blood donation app with a React client and an Express/Prisma API.

## Run locally

1. Start the API in one terminal:

   ```sh
   cd server
   npm install
   ```

   Create `server/.env` with `DATABASE_URL="file:./dev.db"` and a long random
   `JWT_SECRET`, then run `npx prisma db push` and `npm run dev`.

2. Start the client in another terminal:

   ```sh
   cd client
   npm install
   npm run dev
   ```

The client is available at `http://localhost:3000`; Vite forwards `/api` to the
API at `http://localhost:5000`.

## Deploy

GitHub Actions builds `client/` and publishes `client/dist` to GitHub Pages on
every push to `main`. In the repository settings, enable **Pages** with
**GitHub Actions** as the build and deployment source. Set the repository
Actions variable `API_BASE_URL` to the public origin of a separately deployed
API (for example, `https://api.example.com`, without a trailing slash). The API
needs a persistent database and a `JWT_SECRET`; SQLite files on ephemeral
hosting are not suitable for production. GitHub Pages only hosts the client,
so the server must be deployed to an API host for login, donor search, and
requests to work on the published site.
