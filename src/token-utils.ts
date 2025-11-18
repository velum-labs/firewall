/**
 * Generic token utilities for parsing, normalizing, and converting firewall tokens
 * No case-specific logic - works with any entity types
 */

export type TokenFormat = 'brackets' | 'markdown' | 'scheme' | 'hash';

export interface ParsedToken {
  kind: 'SUBJ' | 'PRED';
  label: string;
  tokenId: string;
  format: TokenFormat;
  raw: string;
}

const MARKDOWN_TOKEN_PATTERN =
  /^\s*\[(SUBJ|PRED):([^:\]]+):([A-Za-z0-9]+)\]\(firewall:\/\/(subj|pred)\/([^/]+)\/([A-Za-z0-9]+)\)\s*$/i;
const BRACKETS_TOKEN_PATTERN =
  /^\s*\[\[(SUBJ|PRED):([^:\]]+):([A-Za-z0-9]+)\]\]\s*$/i;
const FIREWALL_SCHEME_PATTERN =
  /^\s*firewall:\/\/(subj|pred)\/([^/]+)\/([A-Za-z0-9]+)\s*$/i;
const HASH_TOKEN_PATTERN = /^\s*#firewall-token=([^)\s]+)\s*$/i;

/**
 * Normalize kind to uppercase SUBJ or PRED
 */
function normalizeKind(kind: string): 'SUBJ' | 'PRED' {
  return kind.toLowerCase() === 'pred' ? 'PRED' : 'SUBJ';
}

/**
 * Parse a token string into its components
 * Returns null if the token format is not recognized
 */
export function parseToken(token: string): ParsedToken | null {
  const value = token?.trim();
  if (!value) {
    return null;
  }

  // Try hash format first (may contain encoded token)
  const hashMatch = value.match(HASH_TOKEN_PATTERN);
  if (hashMatch) {
    try {
      const decoded = decodeURIComponent(hashMatch[1]);
      const parsed = parseToken(decoded);
      if (parsed) {
        return { ...parsed, raw: value };
      }
    } catch {
      // Fall through if decoding fails
    }
  }

  // Try markdown format
  const markdownMatch = value.match(MARKDOWN_TOKEN_PATTERN);
  if (markdownMatch) {
    const [, kind, label, id] = markdownMatch;
    return {
      kind: normalizeKind(kind),
      label,
      tokenId: id,
      format: 'markdown',
      raw: value,
    };
  }

  // Try brackets format
  const bracketMatch = value.match(BRACKETS_TOKEN_PATTERN);
  if (bracketMatch) {
    const [, kind, label, id] = bracketMatch;
    return {
      kind: normalizeKind(kind),
      label,
      tokenId: id,
      format: 'brackets',
      raw: value,
    };
  }

  // Try scheme format
  const schemeMatch = value.match(FIREWALL_SCHEME_PATTERN);
  if (schemeMatch) {
    const [, kind, label, id] = schemeMatch;
    return {
      kind: normalizeKind(kind),
      label,
      tokenId: id,
      format: 'scheme',
      raw: value,
    };
  }

  return null;
}

/**
 * Convert a parsed token to a specific format
 */
export function convertTokenFormat(
  token: ParsedToken,
  targetFormat: TokenFormat
): string {
  const normalizedKind = token.kind;
  const schemeKind = normalizedKind === 'PRED' ? 'pred' : 'subj';

  switch (targetFormat) {
    case 'markdown':
      return `[${normalizedKind}:${token.label}:${token.tokenId}](firewall://${schemeKind}/${token.label}/${token.tokenId})`;
    case 'brackets':
      return `[[${normalizedKind}:${token.label}:${token.tokenId}]]`;
    case 'scheme':
      return `firewall://${schemeKind}/${token.label}/${token.tokenId}`;
    case 'hash':
      const markdown = `[${normalizedKind}:${token.label}:${token.tokenId}](firewall://${schemeKind}/${token.label}/${token.tokenId})`;
      return `#firewall-token=${encodeURIComponent(markdown)}`;
    default:
      return token.raw;
  }
}

/**
 * Normalize a token to a canonical format (default: brackets)
 * Returns empty string if token cannot be parsed
 */
export function normalizeToken(
  token: string,
  targetFormat: TokenFormat = 'brackets'
): string {
  const parsed = parseToken(token);
  if (!parsed) {
    return '';
  }
  return convertTokenFormat(parsed, targetFormat);
}

/**
 * Get all possible format variants of a token
 * Useful for flexible lookup across different storage formats
 */
export function getTokenVariants(token: string): string[] {
  const parsed = parseToken(token);
  if (!parsed) {
    return [];
  }

  const variants = new Set<string>();
  variants.add(convertTokenFormat(parsed, 'brackets'));
  variants.add(convertTokenFormat(parsed, 'markdown'));
  variants.add(convertTokenFormat(parsed, 'scheme'));

  return Array.from(variants);
}

/**
 * Extract all firewall tokens from a text string
 */
export function extractTokensFromText(text: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  const seen = new Set<string>();

  // Match bracket format
  const bracketRegex = /\[\[(SUBJ|PRED):([^:\]]+):([A-Za-z0-9]+)\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = bracketRegex.exec(text)) !== null) {
    const token = match[0];
    if (!seen.has(token)) {
      const parsed = parseToken(token);
      if (parsed) {
        tokens.push(parsed);
        seen.add(token);
      }
    }
  }

  // Match markdown format
  const markdownRegex =
    /\[(SUBJ|PRED):([^:\]]+):([A-Za-z0-9]+)\]\(firewall:\/\/(subj|pred)\/([^/]+)\/([A-Za-z0-9]+)\)/g;

  while ((match = markdownRegex.exec(text)) !== null) {
    const token = match[0];
    if (!seen.has(token)) {
      const parsed = parseToken(token);
      if (parsed) {
        tokens.push(parsed);
        seen.add(token);
      }
    }
  }

  return tokens;
}

/**
 * Normalize multiple tokens at once, removing duplicates
 */
export function normalizeTokens(
  tokens: string[],
  targetFormat: TokenFormat = 'brackets'
): string[] {
  const unique = new Set<string>();

  for (const token of tokens) {
    const normalized = normalizeToken(token, targetFormat);
    if (normalized) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}

