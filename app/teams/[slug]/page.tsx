import { RichTextBody } from '@/components/rich-text-body';
import { SiteFooter, SiteNavigation } from '@/components/site-chrome';
import { Fixture, getTeamBySlug } from '@/lib/hygraph';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Club Profile | Sports World",
  description:
    "Meet the clubs, players and places at the heart of Sports World.",
};

function positionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFixtureKickoff(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const hasScore = fixture.homeScore != null && fixture.awayScore != null;
  const status = fixture.fixtureStatus
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <article className="fixture-card club-fixture-card">
      <div className="fixture-meta">
        <span>{fixture.competition?.name ?? "Club fixture"}</span>
        <span>{formatFixtureKickoff(fixture.kickoff)}</span>
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
        <span className={hasScore ? "club-fixture-score" : "versus"}>
          {hasScore ? `${fixture.homeScore} – ${fixture.awayScore}` : "VS"}
        </span>
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
            : status}
        </span>
        <span className="fixture-season">
          {fixture.competition?.season ?? status}
        </span>
      </div>
    </article>
  );
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { team, configured, available } = await getTeamBySlug(slug);

  if (available && !team) notFound();

  if (!team) {
    return (
      <main id="top" className="article-page">
        <SiteNavigation activeSection="clubs" />
        <section className="article-unavailable">
          <p className="eyebrow dark-eyebrow">
            <span /> OUR CLUBS
          </p>
          <h1>
            {configured ? "Club unavailable." : "Connect your Hygraph project."}
          </h1>
          <p>
            {configured
              ? "We couldn’t load this club profile right now. Please try again shortly."
              : "Add your Hygraph API endpoint to load club profiles."}
          </p>
          <Link href="/#clubs" className="button button-lime">
            Back to clubs <span>↗</span>
          </Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const teamFixtures = Array.from(
    new Map(
      [...team.homeFixtures, ...team.awayFixtures].map((fixture) => [
        fixture.id,
        fixture,
      ]),
    ).values(),
  )
    .sort(
      (first, second) =>
        new Date(first.kickoff).getTime() - new Date(second.kickoff).getTime(),
    )
    .slice(0, 8);

  return (
    <main id="top" className="article-page">
      <SiteNavigation activeSection="clubs" />
      <div className="club-page-content">
        <Link href="/#clubs" className="article-back">
          ← Back to clubs
        </Link>

        <section className="club-profile">
          <div className="club-profile-crest">
            {team.teamLogo?.url ? (
              <img src={team.teamLogo.url} alt={`${team.name} crest`} />
            ) : (
              <span>{team.name.charAt(0)}</span>
            )}
          </div>
          <div className="club-profile-info">
            <p className="eyebrow dark-eyebrow">
              <span /> THE CLUB
            </p>
            <h1>{team.name}</h1>
            <p className="club-profile-location">
              {team.homeVenue?.city ?? "A Sports World club"}
              {team.foundedYear ? ` · Founded ${team.foundedYear}` : ""}
            </p>
            {team.competitions.length > 0 && (
              <div className="club-competitions" aria-label="Competitions">
                {team.competitions.map((competition) => (
                  <span key={`${competition.name}-${competition.season}`}>
                    {competition.name}
                    {competition.season ? ` · ${competition.season}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {team.bio?.raw && <RichTextBody content={team.bio} />}

        {team.homeVenue && (
          <section className="club-venue">
            {team.homeVenue.venueImage?.url && (
              <img
                className="venue-image"
                src={team.homeVenue.venueImage.url}
                alt={`${team.homeVenue.name}, ${team.homeVenue.city}`}
              />
            )}
            <div className="venue-info">
              <p className="eyebrow dark-eyebrow">
                <span /> HOME GROUND
              </p>
              <h2>{team.homeVenue.name}</h2>
              <p>{team.homeVenue.city}</p>
            </div>
            {team.homeVenue.capacity != null && (
              <div className="venue-capacity">
                <strong>
                  {team.homeVenue.capacity.toLocaleString("en-GB")}
                </strong>
                <span>CAPACITY</span>
              </div>
            )}
          </section>
        )}

        <section className="club-fixtures">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark-eyebrow">
                <span /> THE MATCH CALENDAR
              </p>
              <h2>
                Fixtures<span>.</span>
              </h2>
            </div>
            <span className="squad-count">{teamFixtures.length} MATCHES</span>
          </div>
          {teamFixtures.length ? (
            <div className="club-fixtures-grid">
              {teamFixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No fixtures have been announced for this club yet.
            </p>
          )}
        </section>

        <section className="club-squad">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark-eyebrow">
                <span /> THE SQUAD
              </p>
              <h2>
                Players<span>.</span>
              </h2>
            </div>
            <span className="squad-count">{team.players.length} PLAYERS</span>
          </div>
          {team.players.length > 0 ? (
            <div className="squad-grid">
              {team.players.map((player) => (
                <article
                  className="squad-player"
                  key={`${player.shirtNumber}-${player.name}`}>
                  <div className="player-photo">
                    {player.playerPhoto?.url ? (
                      <img src={player.playerPhoto.url} alt={player.name} />
                    ) : (
                      <span>{player.shirtNumber}</span>
                    )}
                  </div>
                  <div className="player-info">
                    <span className="player-number">#{player.shirtNumber}</span>
                    <h3>{player.name}</h3>
                    <p>{positionLabel(player.position)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              The club squad will be announced soon.
            </p>
          )}
        </section>

        <div className="article-endnote">
          <span>SPORTS WORLD · {team.name.toUpperCase()}</span>
          <Link href="/#clubs" className="text-link">
            Explore more clubs <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
