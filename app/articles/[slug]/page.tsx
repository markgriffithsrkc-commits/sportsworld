import { RichTextBody } from '@/components/rich-text-body';
import { SiteFooter, SiteNavigation } from '@/components/site-chrome';
import { getArticleBySlug } from '@/lib/hygraph';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Club Story | Sports World",
  description: "The latest stories from the world of Sports World.",
};

function formatArticleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { article, configured, available } = await getArticleBySlug(slug);

  if (available && !article) notFound();

  if (!article) {
    return (
      <main id="top" className="article-page">
        <SiteNavigation activeSection="stories" />
        <section className="article-unavailable">
          <p className="eyebrow dark-eyebrow">
            <span /> CLUB STORIES
          </p>
          <h1>
            {configured
              ? "Story unavailable."
              : "Connect your Hygraph project."}
          </h1>
          <p>
            {configured
              ? "We couldn’t load this story right now. Please try again shortly."
              : "Add your Hygraph API endpoint to load this story."}
          </p>
          <Link href="/#stories" className="button button-lime">
            Back to stories <span>↗</span>
          </Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main id="top" className="article-page">
      <SiteNavigation activeSection="stories" />

      <article className="article-detail">
        <Link href="/#stories" className="article-back">
          ← Back to stories
        </Link>
        <div className="article-heading">
          <p className="eyebrow dark-eyebrow">
            <span /> CLUB STORIES
          </p>
          <h1>{article.title}</h1>
          <time dateTime={article.articleDate}>
            {formatArticleDate(article.articleDate)}
          </time>
        </div>
        {article.articleImage?.url ? (
          <img
            className="article-cover"
            src={article.articleImage.url}
            alt={article.title}
          />
        ) : (
          <div
            className="article-cover article-cover-placeholder"
            aria-hidden="true">
            SW<span>.</span>
          </div>
        )}
        <RichTextBody content={article.body} />
        <div className="article-endnote">
          <span>SPORTS WORLD</span>
          <Link href="/#stories" className="text-link">
            Discover more stories <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
