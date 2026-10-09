import Link from 'next/link';

export function SiteNavigation({
  activeSection,
}: {
  activeSection: "stories" | "clubs" | "shop";
}) {
  return (
    <>
      <div className="announcement">
        <span className="live-dot" /> THE GAME, CLOSER THAN EVER
        <span className="announcement-arrow">↗</span>
      </div>
      <header className="site-header">
        <Link className="wordmark" href="/#home" aria-label="Sports World home">
          SPORTS<span>WORLD</span>
          <b>.</b>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/#home">Home</Link>
          <Link href="/#fixtures">Fixtures</Link>
          <Link
            className={activeSection === "stories" ? "active" : undefined}
            href="/#stories"
            aria-current={activeSection === "stories" ? "page" : undefined}>
            Stories
          </Link>
          <Link
            className={activeSection === "clubs" ? "active" : undefined}
            href="/#clubs"
            aria-current={activeSection === "clubs" ? "page" : undefined}>
            Clubs
          </Link>
          <Link
            className={activeSection === "shop" ? "active" : undefined}
            href="/products"
            aria-current={activeSection === "shop" ? "page" : undefined}>
            Shop
          </Link>
        </nav>
        <Link href="/#fixtures" className="header-cta">
          The matchday <span>↗</span>
        </Link>
        <Link
          href="/products"
          className="mobile-menu"
          aria-label="Shop products">
          Shop ↗
        </Link>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" href="/#home" aria-label="Sports World home">
        SPORTS<span>WORLD</span>
        <b>.</b>
      </Link>
      <span>Made for the love of the game.</span>
      <Link href="#top" className="back-top">
        Back to top ↑
      </Link>
    </footer>
  );
}
