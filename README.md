# Sports World

Sports World is a Next.js site with its homepage content managed in Hygraph. The home page loads scheduled fixtures, recent news articles, and teams from the Hygraph Content API.

## Run locally

Use Node.js 20.9 or newer (the project includes an `.nvmrc` for Node 24):

```bash
nvm use
npm install
npm run dev
```

Open http://localhost:3000

## Connect Hygraph

1. In Hygraph, open **Project settings → API access** and copy the Content API endpoint for the environment containing the published content.
2. Create `.env.local` in the project root and set `HYGRAPH_ENDPOINT` to that endpoint. Use `.env.example` as a guide.
3. If the API is not publicly readable, add `HYGRAPH_TOKEN` to `.env.local`. Do not commit tokens.
4. Restart the development server after changing environment variables.

The home page expects the schema from the Sports World checklist: `Fixture` with `SCHEDULED` status, `NewsArticle` exposed as `newsArticles`, and `Team`, plus their linked team crests, fixture teams/venue/competition, and article cover images. Publish entries and referenced assets for them to appear in the Content API. If no endpoint is configured or the API request fails, the page displays a setup or connection message and keeps the rest of the page available.

Hygraph data access lives in `lib/hygraph.ts`; the home page query requests four upcoming fixtures, three newest articles, and four teams.

## Deploy

1. Push this folder to a GitHub repository.
2. In Vercel: Add New > Project > import the repository.
3. Vercel detects Next.js automatically - leave the defaults and click Deploy.

Every push to `main` then deploys to production; other branches get preview URLs.
