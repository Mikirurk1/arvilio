/** Emit one or more JSON-LD script tags (null entries skipped). */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | null | undefined | Array<Record<string, unknown> | null | undefined>;
}) {
  const items = (Array.isArray(data) ? data : [data]).filter(
    (item): item is Record<string, unknown> => item != null,
  );
  if (!items.length) return null;
  return (
    <>
      {items.map((obj, index) => (
        <script
          // Stable order; content is deterministic per page build.
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
