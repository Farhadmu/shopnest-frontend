# ShopNest local setup

## Frontend
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill the Better Auth/MongoDB values.
3. Make sure the backend is running on `http://localhost:5000`.
4. Run `npm run dev` and open `http://localhost:3000`.

## Backend
1. `npm install`
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and use the same `BETTER_AUTH_SECRET` as the frontend.
4. For AI, add `ANTHROPIC_API_KEY` and/or `GEMINI_API_KEY`.
5. Run `npm run dev` and verify `http://localhost:5000/api/v1/health`.

## AI fallback
Anthropic is preferred. For text-based AI requests, Gemini is automatically used when Anthropic is unavailable or fails. Visual search requires a vision-capable configured provider.
