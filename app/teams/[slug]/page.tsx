import { RichTextBody } from '@/components/rich-text-body';
import { SiteFooter, SiteNavigation } from '@/components/site-chrome';
import { Fixture, getTeamBySlug } from '@/lib/hygraph';
import { draftMode } from 'next/headers';
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
        <span
          data-hygraph-entry-id={fixture.id}
          data-hygraph-field-api-id="competition">
          {fixture.competition?.name ?? "Club fixture"}
        </span>
        <time
          data-hygraph-entry-id={fixture.id}
          data-hygraph-field-api-id="kickoff">
          {formatFixtureKickoff(fixture.kickoff)}
        </time>
      </div>
      <div className="fixture-matchup">
        <div
          className="fixture-side"
          data-hygraph-entry-id={fixture.id}
          data-hygraph-field-api-id="homeTeam">
          {fixture.homeTeam?.teamLogo?.url ? (
            <img
              src={fixture.homeTeam.teamLogo.url}
              alt=""
              className="fixture-crest"
              data-hygraph-entry-id={fixture.homeTeam.id}
              data-hygraph-field-api-id="teamLogo"
            />
          ) : (
            <span className="crest-placeholder">
              {fixture.homeTeam?.name?.charAt(0) ?? "?"}
            </span>
          )}
          <span
            data-hygraph-entry-id={fixture.homeTeam?.id}
            data-hygraph-field-api-id="name">
            {fixture.homeTeam?.name ?? "Home team"}
          </span>
        </div>
        <span className={hasScore ? "club-fixture-score" : "versus"}>
          {hasScore ? `${fixture.homeScore} – ${fixture.awayScore}` : "VS"}
        </span>
        <div
          className="fixture-side fixture-side-away"
          data-hygraph-entry-id={fixture.id}
          data-hygraph-field-api-id="awayTeam">
          <span
            data-hygraph-entry-id={fixture.awayTeam?.id}
            data-hygraph-field-api-id="name">
            {fixture.awayTeam?.name ?? "Away team"}
          </span>
          {fixture.awayTeam?.teamLogo?.url ? (
            <img
              src={fixture.awayTeam.teamLogo.url}
              alt=""
              className="fixture-crest"
              data-hygraph-entry-id={fixture.awayTeam.id}
              data-hygraph-field-api-id="teamLogo"
            />
          ) : (
            <span className="crest-placeholder">
              {fixture.awayTeam?.name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>
      </div>
      <div className="fixture-footer">
        <span
          data-hygraph-entry-id={fixture.id}
          data-hygraph-field-api-id="venue">
          {fixture.venue ? (
            <>
              <span
                data-hygraph-entry-id={fixture.venue.id}
                data-hygraph-field-api-id="name">
                {fixture.venue.name}
              </span>
              , {fixture.venue.city}
            </>
          ) : (
            status
          )}
        </span>
        <span
          className="fixture-season"
          data-hygraph-entry-id={fixture.competition?.id}
          data-hygraph-field-api-id="season">
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
  const { isEnabled } = await draftMode();
  const { team, configured, available } = await getTeamBySlug(slug, isEnabled);

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
              <img
                src={team.teamLogo.url}
                alt={`${team.name} crest`}
                data-hygraph-entry-id={team.id}
                data-hygraph-field-api-id="teamLogo"
              />
            ) : (
              <span>{team.name.charAt(0)}</span>
            )}
          </div>
          <div className="club-profile-info">
            <p className="eyebrow dark-eyebrow">
              <span /> THE CLUB
            </p>
            <h1
              data-hygraph-entry-id={team.id}
              data-hygraph-field-api-id="name">
              {team.name}
            </h1>
            <p className="club-profile-location">
              {team.homeVenue?.city ?? "A Sports World club"}
              {team.foundedYear ? (
                <span
                  data-hygraph-entry-id={team.id}
                  data-hygraph-field-api-id="foundedYear">
                  {" "}
                  · Founded {team.foundedYear}
                </span>
              ) : (
                ""
              )}
            </p>
            {team.competitions.length > 0 && (
              <div className="club-competitions" aria-label="Competitions">
                {team.competitions.map((competition) => (
                  <span key={`${competition.name}-${competition.season}`}>
                    <span
                      data-hygraph-entry-id={competition.id}
                      data-hygraph-field-api-id="name">
                      {competition.name}
                    </span>
                    {competition.season ? ` · ${competition.season}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {team.bio?.raw && (
          <RichTextBody content={team.bio} entryId={team.id} fieldApiId="bio" />
        )}

        {team.homeVenue && (
          <section className="club-venue">
            {team.homeVenue.venueImage?.url && (
              <img
                className="venue-image"
                src={team.homeVenue.venueImage.url}
                alt={`${team.homeVenue.name}, ${team.homeVenue.city}`}
                data-hygraph-entry-id={team.homeVenue.id}
                data-hygraph-field-api-id="venueImage"
              />
            )}
            <div className="venue-info">
              <p className="eyebrow dark-eyebrow">
                <span /> HOME GROUND
              </p>
              <h2
                data-hygraph-entry-id={team.homeVenue.id}
                data-hygraph-field-api-id="name">
                {team.homeVenue.name}
              </h2>
              <p
                data-hygraph-entry-id={team.homeVenue.id}
                data-hygraph-field-api-id="city">
                {team.homeVenue.city}
              </p>
            </div>
            {team.homeVenue.capacity != null && (
              <div className="venue-capacity">
                <strong
                  data-hygraph-entry-id={team.homeVenue.id}
                  data-hygraph-field-api-id="capacity">
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
                  <div
                    className="player-photo"
                    data-hygraph-entry-id={player.id}
                    data-hygraph-field-api-id="playerPhoto">
                    {player.playerPhoto?.url ? (
                      <img src={player.playerPhoto.url} alt={player.name} />
                    ) : (
                      <span>{player.shirtNumber}</span>
                    )}
                  </div>
                  <div className="player-info">
                    <span
                      className="player-number"
                      data-hygraph-entry-id={player.id}
                      data-hygraph-field-api-id="shirtNumber">
                      #{player.shirtNumber}
                    </span>
                    <h3
                      data-hygraph-entry-id={player.id}
                      data-hygraph-field-api-id="name">
                      {player.name}
                    </h3>
                    <p
                      data-hygraph-entry-id={player.id}
                      data-hygraph-field-api-id="position">
                      {positionLabel(player.position)}
                    </p>
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
