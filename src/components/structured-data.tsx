/**
 * Emits a JSON-LD graph. The payload is built from our own constants, never
 * from user input, so there is nothing here that could carry markup out of the
 * script tag.
 */
export function StructuredData({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
