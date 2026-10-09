import { SiteFooter, SiteNavigation } from '@/components/site-chrome';
import { getShopItemBySlug } from '@/lib/hygraph';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product | Sports World Shop",
  description: "Product details from the Sports World shop.",
};

function formatPrice(price: number | null | undefined) {
  if (price == null) return "Price unavailable";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item, configured, available } = await getShopItemBySlug(slug);

  if (available && !item) notFound();

  if (!item) {
    return (
      <main id="top" className="article-page">
        <SiteNavigation activeSection="shop" />
        <section className="article-unavailable">
          <p className="eyebrow dark-eyebrow">
            <span /> SPORTS WORLD SHOP
          </p>
          <h1>
            {configured
              ? "Product unavailable."
              : "Connect your Hygraph project."}
          </h1>
          <p>
            {configured
              ? "We couldn’t load this product right now. Please try again shortly."
              : "Add your Hygraph API endpoint to load products."}
          </p>
          <Link href="/products" className="button button-lime">
            Back to shop <span>↗</span>
          </Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const productTitle = item.product?.title ?? item.name;

  return (
    <main id="top" className="article-page">
      <SiteNavigation activeSection="shop" />
      <div className="product-detail-content">
        <Link href="/products" className="article-back">
          ← Back to shop
        </Link>
        <article className="product-detail">
          <div className="product-detail-image-wrap">
            {item.product?.thumbnail ? (
              <img
                className="product-detail-image"
                src={item.product.thumbnail}
                alt={productTitle}
              />
            ) : (
              <span className="product-placeholder">
                SW<span>.</span>
              </span>
            )}
          </div>
          <div className="product-detail-copy">
            <p className="eyebrow dark-eyebrow">
              <span /> SPORTS WORLD SHOP
            </p>
            <h1>{productTitle}</h1>
            {item.product?.rating != null && (
              <p className="product-rating">
                ★ {item.product.rating.toFixed(1)} customer rating
              </p>
            )}
            <p className="product-price">{formatPrice(item.product?.price)}</p>
            {item.product?.description && (
              <p className="product-description">{item.product.description}</p>
            )}
            <p className="product-note">
              Product information is provided by our shop catalogue.
            </p>
            <Link href="/products" className="button button-lime">
              Continue shopping <span>↗</span>
            </Link>
          </div>
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}
