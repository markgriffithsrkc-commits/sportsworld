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

## Hygraph draft preview and inline editing

The site supports Hygraph Draft Mode and Click to Edit. Preview requests use the `DRAFT` stage and `HYGRAPH_PREVIEW_TOKEN`; normal visitors explicitly receive `PUBLISHED` content using `HYGRAPH_TOKEN`.

1. Create a **Permanent Auth Token** in Hygraph with its default content stage set to **DRAFT**. Add it locally as `HYGRAPH_PREVIEW_TOKEN`. Keep the published token in `HYGRAPH_TOKEN`.
2. Generate a long random secret and set `HYGRAPH_PREVIEW_SECRET` in `.env.local`. Never put either token or this secret in a `NEXT_PUBLIC_` variable.
3. Restart the Next.js server after editing `.env.local`.
4. In Hygraph Schema, add the **Preview** sidebar widget to each model and use these URL templates (replace the domain and secret):
   - Fixture: `https://your-domain/api/preview?secret=YOUR_SECRET&slug=/`
   - News Article: `https://your-domain/api/preview?secret=YOUR_SECRET&slug=/articles/{slug}`
   - Team: `https://your-domain/api/preview?secret=YOUR_SECRET&slug=/teams/{slug}`
   - Shop Item: `https://your-domain/api/preview?secret=YOUR_SECRET&slug=/products/{slug}`
5. Open a saved entry and choose **Open live preview**. Hover fields marked on the site and choose **Edit** to jump back to the Hygraph field. Changes synchronize in preview; use **Exit preview** to return to published mode.

Preview requests are protected by a server-side secret and the redirect path is restricted to known site routes. The SDK only loads in Draft Mode. For Studio iframe previews, allow the site to be embedded in Hygraph in your hosting/security settings. The home hero and navigation are currently hard-coded rather than Hygraph fields; content model fields shown in the pages can be edited from the preview.

## Deploy

1. Push this folder to a GitHub repository.
2. In Vercel: Add New > Project > import the repository.
3. Vercel detects Next.js automatically - leave the defaults and click Deploy.

Every push to `main` then deploys to production; other branches get preview URLs.
