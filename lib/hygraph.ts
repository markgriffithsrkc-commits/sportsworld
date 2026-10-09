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
  homeTeam: { name: string; slug: string; teamLogo: Asset } | null;
  awayTeam: { name: string; slug: string; teamLogo: Asset } | null;
  venue: { name: string; city: string } | null;
  competition: { name: string; season: string } | null;
};

export type NewsArticle = {
  title: string;
  slug: string;
  articleDate: string;
  articleImage: Asset;
  body?: { raw: RichTextNode } | null;
};

export type Team = {
  name: string;
  slug: string;
  foundedYear: number | null;
  teamLogo: Asset;
  homeVenue: { city: string } | null;
};

export type TeamPlayer = {
  name: string;
  shirtNumber: number;
  position: string;
  playerPhoto: Asset;
};

export type TeamCompetition = {
  name: string;
  season: string;
};

export type TeamProfile = Team & {
  homeVenue: {
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
  query SportsWorldHome {
    fixtures(orderBy: kickoff_ASC, first: 4) {
      id
      kickoff
      fixtureStatus
      homeScore
      awayScore
      homeTeam {
        name
        slug
        teamLogo {
          url
        }
      }
      awayTeam {
        name
        slug
        teamLogo {
          url
        }
      }
      venue {
        name
        city
      }
      competition {
        name
        season
      }
    }
    articles(orderBy: articleDate_DESC, first: 3) {
      title
      slug
      articleDate
      articleImage {
        url
      }
    }
    teams(first: 4) {
      name
      slug
      foundedYear
      teamLogo {
        url
      }
      homeVenue {
        city
      }
    }
  }
`;

const ARTICLE_BY_SLUG_QUERY = /* GraphQL */ `
  query ArticleBySlug($slug: String!) {
    article(where: { slug: $slug }) {
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
  query TeamBySlug($slug: String!) {
    team(where: { slug: $slug }) {
      name
      slug
      foundedYear
      teamLogo {
        url
      }
      homeVenue {
        name
        city
        capacity
        venueImage {
          url
        }
      }
      players(orderBy: shirtNumber_ASC) {
        name
        shirtNumber
        position
        playerPhoto {
          url
        }
      }
      competitions {
        name
        season
      }
    }
    fixtures(orderBy: kickoff_ASC, first: 100) {
      id
      kickoff
      fixtureStatus
      homeScore
      awayScore
      homeTeam {
        name
        slug
        teamLogo {
          url
        }
      }
      awayTeam {
        name
        slug
        teamLogo {
          url
        }
      }
      venue {
        name
        city
      }
      competition {
        name
        season
      }
    }
  }
`;

const SHOP_ITEMS_QUERY = /* GraphQL */ `
  query SportsWorldShop {
    shopItems(first: 50) {
      name
      slug
      productId
      product
    }
  }
`;

const SHOP_ITEM_BY_SLUG_QUERY = /* GraphQL */ `
  query ShopItemBySlug($slug: String!) {
    shopItem(where: { slug: $slug }) {
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

export async function getHomePageData(): Promise<{
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
    const data = await queryHygraph<HomePageData>(HOME_PAGE_QUERY);
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

export async function getArticleBySlug(slug: string): Promise<{
  article: NewsArticle | null;
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { article: null, configured: false, available: false };

  try {
    const data = await queryHygraph<{ article: NewsArticle | null }>(
      ARTICLE_BY_SLUG_QUERY,
      { slug },
    );
    return { article: data.article, configured: true, available: true };
  } catch (error) {
    console.error(`Unable to load article "${slug}" from Hygraph:`, error);
    return { article: null, configured: true, available: false };
  }
}

export async function getTeamBySlug(slug: string): Promise<{
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
    }>(TEAM_BY_SLUG_QUERY, { slug });
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

export async function getShopItems(): Promise<{
  items: ShopItem[];
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { items: [], configured: false, available: false };

  try {
    const data = await queryHygraph<{ shopItems: ShopItem[] }>(
      SHOP_ITEMS_QUERY,
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

export async function getShopItemBySlug(slug: string): Promise<{
  item: ShopItem | null;
  configured: boolean;
  available: boolean;
}> {
  const endpoint = process.env.HYGRAPH_ENDPOINT?.trim();
  if (!endpoint) return { item: null, configured: false, available: false };

  try {
    const data = await queryHygraph<{ shopItem: ShopItem | null }>(
      SHOP_ITEM_BY_SLUG_QUERY,
      { slug },
    );
    return { item: data.shopItem, configured: true, available: true };
  } catch (error) {
    console.error(`Unable to load shop item "${slug}" from Hygraph:`, error);
    return { item: null, configured: true, available: false };
  }
}
