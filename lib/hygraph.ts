type Asset = { url: string } | null;

export type RichTextNode = {
  type?: string;
  text?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  children?: RichTextNode[];
};

export type Fixture = {
  id: string;
  kickoff: string;
  fixtureStatus: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; slug: string; teamLogo: Asset } | null;
  awayTeam: { id: string; name: string; slug: string; teamLogo: Asset } | null;
  venue: { id: string; name: string; city: string } | null;
  competition: { id: string; name: string; season: string } | null;
};

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  articleDate: string;
  articleImage: Asset;
  body?: { raw: RichTextNode } | null;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  foundedYear: number | null;
  teamLogo: Asset;
  homeVenue: { id: string; city: string } | null;
};

export type TeamPlayer = {
  id: string;
  name: string;
  shirtNumber: number;
  position: string;
  playerPhoto: Asset;
};

export type TeamCompetition = {
  id: string;
  name: string;
  season: string;
};

export type TeamProfile = Team & {
  homeVenue: {
    id: string;
    name: string;
    city: string;
    capacity: number | null;
    venueImage: Asset;
  } | null;
  bio: { raw: RichTextNode } | null;
  players: TeamPlayer[];
  competitions: TeamCompetition[];
  homeFixtures: Fixture[];
  awayFixtures: Fixture[];
};

export type RemoteProduct = {
  id?: number;
  title: string;
  description: string | null;
  price: number | null;
  rating: number | null;
  thumbnail: string | null;
};

export type ShopItem = {
  id: string;
  name: string;
  slug: string;
  productId: number;
  product: RemoteProduct | null;
};

type HomePageData = {
  fixtures: Fixture[];
  articles: NewsArticle[];
  teams: Team[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

const HOME_PAGE_QUERY = /* GraphQL */ `
  query SportsWorldHome($stage: Stage!) {
    fixtures(stage: $stage, orderBy: kickoff_ASC, first: 4) {
      id
      kickoff
      fixtureStatus
      homeScore
      awayScore
      homeTeam {
        id
        name
        slug
        teamLogo {
          url
        }
      }
      awayTeam {
        id
        name
        slug
        teamLogo {
          url
        }
      }
      venue {
        id
        name
        city
      }
      competition {
        id
        name
        season
      }
    }
    articles(stage: $stage, orderBy: articleDate_DESC, first: 3) {
      id
      title
      slug
      articleDate
      articleImage {
        url
      }
    }
    teams(stage: $stage, first: 4) {
      id
      name
      slug
      foundedYear
      teamLogo {
        url
      }
      homeVenue {
        id
        city
      }
    }
  }
`;

const ARTICLE_BY_SLUG_QUERY = /* GraphQL */ `
  query ArticleBySlug($slug: String!, $stage: Stage!) {
    article(where: { slug: $slug }, stage: $stage) {
      id
      title
      slug
      articleDate
      articleImage {
        url
      }
      body {
        raw
      }
    }
  }
`;

const TEAM_BY_SLUG_QUERY = /* GraphQL */ `
  query TeamBySlug($slug: String!, $stage: Stage!) {
    team(where: { slug: $slug }, stage: $stage) {
      id
      name
      slug
      foundedYear
      teamLogo {
        url
      }
      homeVenue {
        id
        name
        city
        capacity
        venueImage {
          url
        }
      }
      players(orderBy: shirtNumber_ASC) {
        id
        name
        shirtNumber
        position
        playerPhoto {
          url
        }
      }
      competitions {
        id
        name
        season
      }
    }
    fixtures(stage: $stage, orderBy: kickoff_ASC, first: 100) {
      id
      kickoff
      fixtureStatus
      homeScore
      awayScore
      homeTeam {
        id
        name
        slug
        teamLogo {
          url
        }
      }
      awayTeam {
        id
        name
        slug
        teamLogo {
          url
        }
      }
      venue {
        id
        name
        city
      }
      competition {
        id
        name
        season
      }
    }
  }
`;

const SHOP_ITEMS_QUERY = /* GraphQL */ `
  query SportsWorldShop($stage: Stage!) {
    shopItems(stage: $stage, first: 50) {
      id
      name
      slug
      productId
      product
    }
  }
`;

const SHOP_ITEM_BY_SLUG_QUERY = /* GraphQL */ `
  query ShopItemBySlug($slug: String!, $stage: Stage!) {
    shopItem(where: { slug: $slug }, stage: $stage) {
      id
      name
      slug
      productId
      product
    }
  }
`;

async function queryHygraph<T>(
  query: string,
  variables?: Record<string, string>,
  draft = false,
): Promise<T> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) throw new Error("HYGRAPH_ENDPOINT is not configured");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.HYGRAPH_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const responseBody = await response.text();
  if (!response.ok) {
    console.error(
      "Hygraph request failed:",
      response.status,
      response.statusText,
      responseBody,
    );
    throw new Error(`Hygraph request failed (${response.status})`);
  }

  const result = JSON.parse(responseBody) as GraphQLResponse<T>;
  if (result.errors?.length || !result.data) {
    throw new Error(
      result.errors?.map((error) => error.message).join("; ") ||
        "Hygraph returned no data",
    );
  }

  return result.data;
}

export async function getHomePageData(draft = false): Promise<{
  data: HomePageData;
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  const emptyData: HomePageData = { fixtures: [], articles: [], teams: [] };

  if (!endpoint) {
    return { data: emptyData, configured: false, available: false };
  }

  try {
    const stage = draft ? "DRAFT" : "PUBLISHED";
    const data = await queryHygraph<HomePageData>(
      HOME_PAGE_QUERY,
      { stage },
      draft,
    );
    return {
      data: {
        fixtures: data.fixtures ?? [],
        articles: data.articles ?? [],
        teams: data.teams ?? [],
      },
      configured: true,
      available: true,
    };
  } catch (error) {
    console.error("Unable to load Sports World content from Hygraph:", error);
    return { data: emptyData, configured: true, available: false };
  }
}

export async function getArticleBySlug(slug: string, draft = false): Promise<{
  article: NewsArticle | null;
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { article: null, configured: false, available: false };

  try {
    const data = await queryHygraph<{ article: NewsArticle | null }>(
      ARTICLE_BY_SLUG_QUERY,
      { slug, stage: draft ? "DRAFT" : "PUBLISHED" },
      draft,
    );
    return { article: data.article, configured: true, available: true };
  } catch (error) {
    console.error(`Unable to load article "${slug}" from Hygraph:`, error);
    return { article: null, configured: true, available: false };
  }
}

export async function getTeamBySlug(slug: string, draft = false): Promise<{
  team: TeamProfile | null;
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { team: null, configured: false, available: false };

  try {
    const data = await queryHygraph<{
      team: Omit<TeamProfile, "homeFixtures" | "awayFixtures"> | null;
      fixtures: Fixture[];
    }>(
      TEAM_BY_SLUG_QUERY,
      { slug, stage: draft ? "DRAFT" : "PUBLISHED" },
      draft,
    );
    const team = data.team
      ? {
          ...data.team,
          homeFixtures: (data.fixtures ?? []).filter(
            (fixture) => fixture.homeTeam?.slug === slug,
          ),
          awayFixtures: (data.fixtures ?? []).filter(
            (fixture) => fixture.awayTeam?.slug === slug,
          ),
        }
      : null;
    return { team, configured: true, available: true };
  } catch (error) {
    console.error(`Unable to load team "${slug}" from Hygraph:`, error);
    return { team: null, configured: true, available: false };
  }
}

export async function getShopItems(draft = false): Promise<{
  items: ShopItem[];
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { items: [], configured: false, available: false };

  try {
    const data = await queryHygraph<{ shopItems: ShopItem[] }>(
      SHOP_ITEMS_QUERY,
      { stage: draft ? "DRAFT" : "PUBLISHED" },
      draft,
    );
    return { items: data.shopItems ?? [], configured: true, available: true };
  } catch (error) {
    console.error(
      "Unable to load Sports World shop items from Hygraph:",
      error,
    );
    return { items: [], configured: true, available: false };
  }
}

export async function getShopItemBySlug(slug: string, draft = false): Promise<{
  item: ShopItem | null;
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { item: null, configured: false, available: false };

  try {
    const data = await queryHygraph<{ shopItem: ShopItem | null }>(
      SHOP_ITEM_BY_SLUG_QUERY,
      { slug, stage: draft ? "DRAFT" : "PUBLISHED" },
      draft,
    );
    return { item: data.shopItem, configured: true, available: true };
  } catch (error) {
    console.error(`Unable to load shop item "${slug}" from Hygraph:`, error);
    return { item: null, configured: true, available: false };
  }
}
