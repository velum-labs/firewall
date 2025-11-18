type SimilarityScores = {
  levenshtein: number;
  jaroWinkler: number;
  ngram: number;
};

const COMBINING_MARKS = /\p{M}/gu;
const NON_ALNUM = /[^a-z0-9\s]/g;
const WHITESPACE = /\s+/g;

const GREEK_MAP: Record<string, string> = {
  α: 'a',
  β: 'b',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  ζ: 'z',
  η: 'i',
  θ: 'th',
  ι: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  τ: 't',
  υ: 'y',
  φ: 'f',
  χ: 'ch',
  ψ: 'ps',
  ω: 'o',
};

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ы: 'y',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const transliterate = (value: string): string => {
  let output = '';
  for (const char of value) {
    const lower = char.toLowerCase();
    if (GREEK_MAP[lower]) {
      output += GREEK_MAP[lower];
    } else if (CYRILLIC_MAP[lower]) {
      output += CYRILLIC_MAP[lower];
    } else {
      output += char;
    }
  }
  return output;
};

export function normalizeSurface(value: string): string {
  if (!value) {
    return '';
  }
  const transliterated = transliterate(value);
  return transliterated
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(NON_ALNUM, ' ')
    .replace(WHITESPACE, ' ')
    .trim();
}

export function levenshteinRatio(a: string, b: string): number {
  if (a === b) {
    return 1;
  }
  if (!a.length || !b.length) {
    return 0;
  }
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array<number>(cols));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[a.length][b.length];
  return 1 - distance / Math.max(a.length, b.length);
}

export function jaroWinkler(a: string, b: string): number {
  if (!a.length || !b.length) {
    return 0;
  }
  const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array<boolean>(a.length).fill(false);
  const bMatches = new Array<boolean>(b.length).fill(false);
  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < a.length; i += 1) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, b.length);

    for (let j = start; j < end; j += 1) {
      if (bMatches[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches += 1;
      break;
    }
  }

  if (matches === 0) {
    return 0;
  }

  let k = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) {
      k += 1;
    }
    if (a[i] !== b[k]) {
      transpositions += 1;
    }
    k += 1;
  }

  const jaro =
    (matches / a.length +
      matches / b.length +
      (matches - transpositions / 2) / matches) /
    3;

  const prefix = Math.min(
    4,
    [...a].findIndex((char, idx) => char !== b[idx]) + 1 || 0
  );
  return jaro + prefix * 0.1 * (1 - jaro);
}

const buildNgrams = (value: string, size = 3): Set<string> => {
  const grams = new Set<string>();
  if (!value.length) {
    return grams;
  }
  const padded = ` ${value} `;
  for (let i = 0; i <= padded.length - size; i += 1) {
    grams.add(padded.slice(i, i + size));
  }
  return grams;
};

export function ngramSimilarity(a: string, b: string, size = 3): number {
  const aSet = buildNgrams(a, size);
  const bSet = buildNgrams(b, size);
  if (!aSet.size || !bSet.size) {
    return 0;
  }

  let intersection = 0;
  for (const gram of aSet) {
    if (bSet.has(gram)) {
      intersection += 1;
    }
  }
  const union = aSet.size + bSet.size - intersection;
  return intersection / union;
}

export function computeSimilarityScores(a: string, b: string): SimilarityScores {
  return {
    levenshtein: levenshteinRatio(a, b),
    jaroWinkler: jaroWinkler(a, b),
    ngram: ngramSimilarity(a, b),
  };
}

