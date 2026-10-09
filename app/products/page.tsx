import { SiteFooter, SiteNavigation } from '@/components/site-chrome';
import { getShopItems, ShopItem } from '@/lib/hygraph';
import { draftMode } from 'next/headers';
import Link from 'next/link';

import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop | Sports World",
  description: "Shop sports gear and accessories picked by Sports World clubs.",
};

function formatPrice(price: number | null | undefined) {
  if (price == null) return "Price unavailable";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function ProductCard({ item }: { item: ShopItem }) {
  return (
    <article className="product-card">
      <Link
        className="product-card-link"
        href={`/products/${encodeURIComponent(item.slug)}`}>
        <div className="product-image-wrap">
          {item.product?.thumbnail ? (
            <img
              className="product-image"
              src={item.product.thumbnail}
              alt={item.product.title || item.name}
            />
          ) : (
            <span className="product-placeholder">
              SW<span>.</span>
            </span>
          )}
          <span className="product-view">View product ↗</span>
        </div>
        <div className="product-card-copy">
          <div className="product-card-kicker">
            <span
              data-hygraph-entry-id={item.id}
              data-hygraph-field-api-id="name">
              {item.name}
            </span>
            {item.product?.rating != null && (
              <span>★ {item.product.rating.toFixed(1)}</span>
            )}
          </div>
          <h2>{item.product?.title ?? item.name}</h2>
          <div className="product-card-bottom">
            <span>{formatPrice(item.product?.price)}</span>
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default async function ProductsPage() {
  const { isEnabled } = await draftMode();
  const { items, configured, available } = await getShopItems(isEnabled);

  return (
    <main id="top" className="article-page">
      <SiteNavigation activeSection="shop" />
      <section className="products-intro">
        <p className="eyebrow dark-eyebrow">
          <span /> THE SPORTS WORLD SHOP
        </p>
        <h1>
          Gear up<span>.</span>
        </h1>
        <p>Club-picked essentials for the moments on and off the pitch.</p>
      </section>

      {!configured && (
        <div className="connection-note" role="status">
          <strong>Connect your Hygraph project</strong>
          <span>Add HYGRAPH_ENDPOINT to .env.local to load the shop.</span>
        </div>
      )}
      {configured && !available && (
        <div className="connection-note" role="status">
          <strong>The shop is temporarily unavailable</strong>
          <span>We couldn’t load product data from Hygraph just now.</span>
        </div>
      )}

      <section className="products-content" aria-label="Products">
        {items.length > 0 ? (
          <div className="products-grid">
            {items.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            {configured && available
              ? "No products have been published yet."
              : "Products will appear here when the shop is connected."}
          </p>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
