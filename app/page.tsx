import { Fixture, getHomePageData, NewsArticle, Team } from '@/lib/hygraph';
import Link from 'next/link';

export const dynamic = "force-dynamic";

function formatKickoff(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const kickoff = formatKickoff(fixture.kickoff);

  return (
    <article className="fixture-card">
      <div className="fixture-meta">
        <span>{fixture.competition?.name ?? "Club fixture"}</span>
        <span>
          {kickoff.date} · {kickoff.time}
        </span>
      </div>
      <div className="fixture-matchup">
        <div className="fixture-side">
          {fixture.homeTeam?.teamLogo?.url ? (
            <img
              src={fixture.homeTeam.teamLogo.url}
              alt=""
              className="fixture-crest"
            />
          ) : (
            <span className="crest-placeholder">
              {fixture.homeTeam?.name?.charAt(0) ?? "?"}
            </span>
          )}
          <span>{fixture.homeTeam?.name ?? "Home team"}</span>
        </div>
        <span className="versus">VS</span>
        <div className="fixture-side fixture-side-away">
          <span>{fixture.awayTeam?.name ?? "Away team"}</span>
          {fixture.awayTeam?.teamLogo?.url ? (
            <img
              src={fixture.awayTeam.teamLogo.url}
              alt=""
              className="fixture-crest"
            />
          ) : (
            <span className="crest-placeholder">
              {fixture.awayTeam?.name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>
      </div>
      <div className="fixture-footer">
        <span>
          {fixture.venue
            ? `${fixture.venue.name}, ${fixture.venue.city}`
            : "Venue to be confirmed"}
        </span>
        <span className="fixture-season">
          {fixture.competition?.season ?? ""}
        </span>
      </div>
    </article>
  );
}

function ArticleCard({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  return (
    <article className={`story-card story-card-${index + 1}`}>
      <div className="story-art">
        {article.articleImage?.url ? (
          <img src={article.articleImage.url} alt="" />
        ) : (
          <span className="story-art-mark">
            SW<span>.</span>
          </span>
        )}
        <span className="story-tag">Club stories</span>
      </div>
      <div className="story-copy">
        <time dateTime={article.articleDate}>
          {new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(article.articleDate))}
        </time>
        <h3>{article.title}</h3>
        <Link
          href={`/articles/${encodeURIComponent(article.slug)}`}
          className="text-link">
          Read story <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  return (
    <article className={`team-card team-card-${index + 1}`}>
      <span className="team-number">0{index + 1}</span>
      {team.teamLogo?.url ? (
        <img
          src={team.teamLogo.url}
          alt={`${team.name} crest`}
          className="team-crest"
        />
      ) : (
        <span className="team-crest team-crest-placeholder">
          {team.name.charAt(0)}
        </span>
      )}
      <h3>{team.name}</h3>
      <p>
        {team.homeVenue?.city ??
          (team.foundedYear ? `Est. ${team.foundedYear}` : "Club team")}
      </p>
      <Link
        href={`/teams/${encodeURIComponent(team.slug)}`}
        aria-label={`Explore ${team.name}`}
        className="team-arrow">
        ↗
      </Link>
    </article>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export default async function Home() {
  const { data, configured, available } = await getHomePageData();

  return (
    <main>
      <div className="announcement">
        <span className="live-dot" /> THE GAME, CLOSER THAN EVER{" "}
        <span className="announcement-arrow">↗</span>
      </div>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Sports World home">
          SPORTS<span>WORLD</span>
          <b>.</b>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="active" href="#home">
            Home
          </a>
          <a href="#fixtures">Fixtures</a>
          <a href="#stories">Stories</a>
          <a href="#clubs">Clubs</a>
          <a href="/products">Shop</a>
        </nav>
        <a href="#fixtures" className="header-cta">
          The matchday <span>↗</span>
        </a>
        <a href="/products" className="mobile-menu" aria-label="Shop products">
          Shop ↗
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">
            <span /> MORE THAN A GAME
          </p>
          <h1>
            For the love
            <br />
            of <em>the game.</em>
          </h1>
          <p className="hero-description">
            The stories, the rivalries, the moments that bring us together. This
            is your world of sport.
          </p>
          <a href="#fixtures" className="button button-lime">
            Explore the world <span>↘</span>
          </a>
        </div>
        <div className="hero-bottomline">
          <span>01 — THE BEAUTIFUL GAME</span>
          <span>BUILT FOR THE FANS&nbsp; ✳</span>
        </div>
        <div className="hero-index">
          01<span> / 04</span>
        </div>
      </section>

      {!configured && (
        <div className="connection-note" role="status">
          <strong>Connect your Hygraph project</strong>
          <span>
            Add HYGRAPH_ENDPOINT to .env.local to load live fixtures, stories
            and teams.
          </span>
        </div>
      )}
      {configured && !available && (
        <div className="connection-note" role="status">
          <strong>Content is taking a breather</strong>
          <span>
            We couldn’t reach Hygraph right now. Please check the endpoint and
            try again.
          </span>
        </div>
      )}

      <section className="section fixtures-section" id="fixtures">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark-eyebrow">
              <span /> MARK YOUR CALENDAR
            </p>
            <h2>
              Next up<span>.</span>
            </h2>
          </div>
          <a className="text-link" href="#fixtures">
            All fixtures <span aria-hidden="true">↗</span>
          </a>
        </div>
        {data.fixtures.length ? (
          <div className="fixtures-grid">
            {data.fixtures.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        ) : (
          <EmptyState>
            {configured
              ? "No upcoming fixtures published just yet."
              : "Upcoming fixtures will appear here when Hygraph is connected."}
          </EmptyState>
        )}
      </section>

      <section className="section stories-section" id="stories">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark-eyebrow">
              <span /> FROM AROUND THE CLUBS
            </p>
            <h2>
              The latest<span>.</span>
            </h2>
          </div>
          <a className="text-link" href="#stories">
            All stories <span aria-hidden="true">↗</span>
          </a>
        </div>
        {data.articles.length ? (
          <div className="stories-grid">
            {data.articles.map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState>
            {configured
              ? "No stories published just yet."
              : "The latest club stories will show up here."}
          </EmptyState>
        )}
      </section>

      <section className="clubs-section" id="clubs">
        <div className="section clubs-heading">
          <div>
            <p className="eyebrow">
              <span /> OUR CLUBS
            </p>
            <h2>
              One world.
              <br />
              <em>Many colours.</em>
            </h2>
          </div>
          <p className="clubs-intro">
            Every badge tells a story. Meet the teams, the towns and the people
            at the heart of it all.
          </p>
          <a className="button button-outline" href="#clubs">
            Meet the clubs <span>↗</span>
          </a>
        </div>
        <div className="teams-grid">
          {data.teams.length ? (
            data.teams.map((team, index) => (
              <TeamCard key={team.slug} team={team} index={index} />
            ))
          ) : (
            <div className="teams-empty">
              {configured
                ? "Teams are getting ready to take the field."
                : "Your teams will appear here once Hygraph is connected."}
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <a className="wordmark" href="#home">
          SPORTS<span>WORLD</span>
          <b>.</b>
        </a>
        <span>Made for the love of the game.</span>
        <a href="#home" className="back-top">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
}
