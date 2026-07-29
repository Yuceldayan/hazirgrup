import { serializeJsonLd, type JsonLd as JsonLdNode } from '@hazirgrup/core';

/**
 * JSON-LD gömme bileşeni.
 *
 * `serializeJsonLd` `<` karakterini kaçırarak script kırma saldırısını engeller
 * (docs/SEO_STRATEGY.md §7).
 */
export function JsonLd({ data }: { data: JsonLdNode | Array<JsonLdNode | null> }) {
  const nodes = Array.isArray(data) ? data.filter((node): node is JsonLdNode => node !== null) : [data];
  if (nodes.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(nodes.length === 1 ? nodes[0]! : nodes) }}
    />
  );
}
