import type { ReactNode } from "react";
import type { RichTextNode } from "@/lib/hygraph";

function isSafeArticleLink(href: string) {
  return (
    href.startsWith("/") ||
    href.startsWith("#") ||
    /^https?:\/\//i.test(href) ||
    /^mailto:/i.test(href)
  );
}

function RichText({
  node,
  path,
}: {
  node: RichTextNode;
  path: string;
}): ReactNode {
  if (typeof node.text === "string") {
    let text: ReactNode = node.text;
    if (node.code) text = <code>{text}</code>;
    if (node.underline) text = <u>{text}</u>;
    if (node.italic) text = <em>{text}</em>;
    if (node.bold) text = <strong>{text}</strong>;
    return text;
  }

  const children = node.children?.map((child, index) => (
    <RichText key={`${path}-${index}`} node={child} path={`${path}-${index}`} />
  ));

  switch (node.type) {
    case "paragraph":
      return <p>{children}</p>;
    case "heading-one":
      return <h2>{children}</h2>;
    case "heading-two":
      return <h3>{children}</h3>;
    case "heading-three":
      return <h4>{children}</h4>;
    case "unordered-list":
      return <ul>{children}</ul>;
    case "ordered-list":
      return <ol>{children}</ol>;
    case "list-item":
      return <li>{children}</li>;
    case "block-quote":
      return <blockquote>{children}</blockquote>;
    case "link":
      return node.url && isSafeArticleLink(node.url) ? (
        <a href={node.url}>{children}</a>
      ) : (
        <>{children}</>
      );
    case "horizontal-rule":
      return <hr />;
    default:
      return <>{children}</>;
  }
}

export function RichTextBody({
  content,
  entryId,
  fieldApiId,
}: {
  content: { raw: RichTextNode } | null | undefined;
  entryId?: string;
  fieldApiId?: string;
}) {
  if (!content?.raw) return null;

  return (
    <div
      className="article-body"
      data-hygraph-entry-id={entryId}
      data-hygraph-field-api-id={fieldApiId}
      data-hygraph-rich-text-format="text">
      <RichText node={content.raw} path="content" />
    </div>
  );
}
