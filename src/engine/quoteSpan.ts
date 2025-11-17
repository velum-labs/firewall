import createDebug from 'debug';

const debug = createDebug('firewall:quoteSpan');

type AnchorLists = {
  pre: string[];
  post: string[];
};

function pushAnchor(target: string[], fragment?: string): void {
  if (!fragment) {
    return;
  }
  const normalized = fragment.trim();
  if (normalized.length) {
    target.push(normalized);
  }
}

function splitAnchor(
  raw: string | undefined,
  defaultKind: 'pre' | 'post',
  quote: string,
  acc: AnchorLists
): void {
  if (!raw) {
    return;
  }
  const trimmed = raw.trim();
  if (!trimmed.length) {
    return;
  }
  let handled = false;

  if (trimmed.startsWith(quote)) {
    const after = trimmed.slice(quote.length);
    pushAnchor(acc.post, after);
    handled = true;
  }

  if (trimmed.endsWith(quote)) {
    const before = trimmed.slice(0, trimmed.length - quote.length);
    pushAnchor(acc.pre, before);
    handled = true;
  }

  if (!handled) {
    pushAnchor(acc[defaultKind], trimmed);
  }
}

function normalizeAnchors(quote: string, pre?: string, post?: string): AnchorLists {
  const anchors: AnchorLists = { pre: [], post: [] };
  splitAnchor(pre, 'pre', quote, anchors);
  splitAnchor(post, 'post', quote, anchors);
  return {
    pre: [...new Set(anchors.pre)],
    post: [...new Set(anchors.post)],
  };
}

function longestCommonSuffix(want: string, got: string): number {
  if (!want || !got) {
    return 0;
  }
  const normalizedGot = got.trimEnd();
  if (!normalizedGot.length) {
    return 0;
  }
  const minLen = Math.min(want.length, normalizedGot.length);
  let score = 0;
  for (let i = 1; i <= minLen; i++) {
    if (
      want.slice(want.length - i) === normalizedGot.slice(normalizedGot.length - i)
    ) {
      score = i;
    } else {
      break;
    }
  }
  return score;
}

function longestCommonPrefix(want: string, got: string): number {
  if (!want || !got) {
    return 0;
  }
  const normalizedGot = got.trimStart();
  if (!normalizedGot.length) {
    return 0;
  }
  const minLen = Math.min(want.length, normalizedGot.length);
  let score = 0;
  for (let i = 1; i <= minLen; i++) {
    if (want.slice(0, i) === normalizedGot.slice(0, i)) {
      score = i;
    } else {
      break;
    }
  }
  return score;
}

export function resolveQuoteSpan(
  text: string,
  quote: string,
  pre?: string,
  post?: string
): { start: number; end: number } | null {
  const positions: number[] = [];
  let idx = text.indexOf(quote, 0);
  while (idx !== -1) {
    positions.push(idx);
    idx = text.indexOf(quote, idx + 1);
  }

  debug('Quote "%s" found at %d positions: %o', quote, positions.length, positions);

  if (positions.length === 0) {
    debug('Quote not found in text');
    return null;
  }

  if (positions.length === 1) {
    const start = positions[0];
    debug('Quote is unique at position %d', start);
    return { start, end: start + quote.length };
  }

  const anchors = normalizeAnchors(quote, pre, post);
  const preAnchors = anchors.pre;
  const postAnchors = anchors.post;

  if (!preAnchors.length && !postAnchors.length) {
    debug('Quote appears %d times but no anchors provided - ambiguous', positions.length);
    return null;
  }

  const score = (pos: number): number => {
    let total = 0;

    if (preAnchors.length) {
      let bestPre = 0;
      for (const anchor of preAnchors) {
        const sliceStart = Math.max(0, pos - anchor.length - 4);
        const got = text.slice(sliceStart, pos);
        const match = longestCommonSuffix(anchor, got);
        debug(
          '  Position %d: pre anchor match score = %d (want: "%s", got: "%s")',
          pos,
          match,
          anchor,
          got.trimEnd()
        );
        if (match > bestPre) {
          bestPre = match;
        }
      }
      total += bestPre;
    }

    if (postAnchors.length) {
      let bestPost = 0;
      const endPos = pos + quote.length;
      for (const anchor of postAnchors) {
        const got = text.slice(
          endPos,
          Math.min(text.length, endPos + anchor.length + 4)
        );
        const match = longestCommonPrefix(anchor, got);
        debug(
          '  Position %d: post anchor match score = %d (want: "%s", got: "%s")',
          pos,
          match,
          anchor,
          got.trimStart()
        );
        if (match > bestPost) {
          bestPost = match;
        }
      }
      total += bestPost;
    }

    return total;
  };

  const ranked = positions
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s);

  debug('Ranked positions: %o', ranked);

  if (ranked.length && ranked[0].s > (ranked[1]?.s ?? -1)) {
    const start = ranked[0].p;
    debug('Clear winner at position %d with score %d', start, ranked[0].s);
    return { start, end: start + quote.length };
  }

  return null;
}

