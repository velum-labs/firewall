/**
 * Generic rehype plugin for transforming firewall:// links
 * No case-specific logic - works with any firewall token format
 */

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export interface RehypeFirewallOptions {
  /** Scheme to match (default: 'firewall://') */
  scheme?: string;
  /** Prefix for hash references (default: '#firewall-token=') */
  hashPrefix?: string;
  /** Data attribute name to store original href (default: 'data-firewall-href') */
  dataAttribute?: string;
}

/**
 * Rehype plugin that rewrites firewall:// links into hash URLs
 * while preserving the original href in a data attribute.
 * 
 * This allows firewall links to bypass content security policies
 * that may block custom URI schemes, while still maintaining
 * the original href for client-side components to consume.
 * 
 * @example
 * ```typescript
 * import { rehype } from 'rehype';
 * import { rehypeFirewall } from '@velum/firewall/markdown/rehype-firewall';
 * 
 * const processor = rehype()
 *   .use(rehypeFirewall, {
 *     scheme: 'firewall://',
 *     hashPrefix: '#firewall-token=',
 *     dataAttribute: 'data-firewall-href'
 *   });
 * ```
 */
export const rehypeFirewall: Plugin<[RehypeFirewallOptions?], Root> = (
  options?: RehypeFirewallOptions
) => {
  const scheme = options?.scheme || 'firewall://';
  const hashPrefix = options?.hashPrefix || '#firewall-token=';
  const dataAttribute = options?.dataAttribute || 'data-firewall-href';

  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') {
        return;
      }

      const href = node.properties?.href;
      if (typeof href !== 'string' || !href.startsWith(scheme)) {
        return;
      }

      // Encode the original firewall:// href
      const encoded = encodeURIComponent(href);

      if (!node.properties) {
        node.properties = {};
      }

      // Store original href in data attribute
      node.properties[dataAttribute] = href;

      // Rewrite href to hash reference
      node.properties.href = `${hashPrefix}${encoded}`;
    });
  };
};

