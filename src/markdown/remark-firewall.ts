/**
 * Generic remark plugin for extracting and transforming firewall tokens
 * No case-specific logic - works with any token format
 */

import type { Plugin } from 'unified';
import type { Root, Text, Link } from 'mdast';
import { visit } from 'unist-util-visit';
import type { ParsedToken } from '../token-utils';
import { parseToken, extractTokensFromText } from '../token-utils';

export interface RemarkFirewallOptions {
  /** Mode of operation: 'extract' to collect tokens, 'transform' to modify them */
  mode: 'extract' | 'transform';
  /** Custom transform function for tokens (only used in 'transform' mode) */
  tokenTransform?: (token: ParsedToken) => string;
  /** Custom regex patterns to match (in addition to default firewall tokens) */
  patterns?: RegExp[];
  /** Callback to receive extracted tokens (only used in 'extract' mode) */
  onExtract?: (tokens: ParsedToken[]) => void;
}

/**
 * Remark plugin for extracting or transforming firewall tokens in markdown.
 * 
 * In 'extract' mode, collects all firewall tokens found in the document.
 * In 'transform' mode, applies a custom transformation to each token.
 * 
 * @example
 * ```typescript
 * import { remark } from 'remark';
 * import { remarkFirewall } from '@velum/firewall/markdown/remark-firewall';
 * 
 * // Extract tokens
 * const extracted: ParsedToken[] = [];
 * const processor = remark()
 *   .use(remarkFirewall, {
 *     mode: 'extract',
 *     onExtract: (tokens) => extracted.push(...tokens)
 *   });
 * 
 * // Transform tokens
 * const transformer = remark()
 *   .use(remarkFirewall, {
 *     mode: 'transform',
 *     tokenTransform: (token) => `<redacted:${token.label}>`
 *   });
 * ```
 */
export const remarkFirewall: Plugin<[RemarkFirewallOptions], Root> = (
  options: RemarkFirewallOptions
) => {
  const mode = options.mode;
  const tokenTransform = options.tokenTransform;
  const patterns = options.patterns || [];
  const onExtract = options.onExtract;

  return (tree: Root) => {
    const extractedTokens: ParsedToken[] = [];

    visit(tree, 'text', (node: Text) => {
      const text = node.value;

      if (mode === 'extract') {
        // Extract all tokens from text
        const tokens = extractTokensFromText(text);
        extractedTokens.push(...tokens);

        // Apply custom patterns if provided
        for (const pattern of patterns) {
          const matches = Array.from(text.matchAll(pattern));
          for (const match of matches) {
            const token = parseToken(match[0]);
            if (token) {
              extractedTokens.push(token);
            }
          }
        }
      } else if (mode === 'transform' && tokenTransform) {
        // Transform tokens in text
        let transformed = text;
        const tokens = extractTokensFromText(text);

        for (const token of tokens) {
          const replacement = tokenTransform(token);
          transformed = transformed.replace(token.raw, replacement);
        }

        // Apply custom patterns if provided
        for (const pattern of patterns) {
          const matches = Array.from(text.matchAll(pattern));
          for (const match of matches) {
            const token = parseToken(match[0]);
            if (token) {
              const replacement = tokenTransform(token);
              transformed = transformed.replace(match[0], replacement);
            }
          }
        }

        if (transformed !== text) {
          node.value = transformed;
        }
      }
    });

    // Visit link nodes to handle markdown-format tokens
    visit(tree, 'link', (node: Link) => {
      const url = node.url;

      if (mode === 'extract') {
        // Check if this is a firewall link
        if (url.startsWith('firewall://')) {
          const token = parseToken(url);
          if (token) {
            extractedTokens.push(token);
          }
        }

        // Check if children contain token text
        for (const child of node.children) {
          if (child.type === 'text') {
            const fullToken = `[${child.value}](${url})`;
            const parsed = parseToken(fullToken);
            if (parsed) {
              extractedTokens.push(parsed);
            }
          }
        }
      } else if (mode === 'transform' && tokenTransform) {
        // Transform firewall links
        if (url.startsWith('firewall://')) {
          for (const child of node.children) {
            if (child.type === 'text') {
              const fullToken = `[${child.value}](${url})`;
              const parsed = parseToken(fullToken);
              if (parsed) {
                child.value = tokenTransform(parsed);
              }
            }
          }
        }
      }
    });

    // Call the extract callback with collected tokens
    if (mode === 'extract' && onExtract && extractedTokens.length > 0) {
      onExtract(extractedTokens);
    }
  };
};

