import Link from 'next/link';

export function PreviewBanner({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <aside className="preview-banner" role="status">
      <span>
        <strong>Hygraph draft preview</strong> — unsaved-to-published content is
        visible only to you.
      </span>
      <Link href="/api/preview/exit" prefetch={false}>
        Exit preview
      </Link>
    </aside>
  );
}
