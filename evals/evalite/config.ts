import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const E2E_DIR = dirname(fileURLToPath(import.meta.url));

export type FirewallEvaliteConfig = {
  caseFilters: string[];
  tagFilters: string[];
  caseSet?: string[];
  globPattern?: string;
  maxRetries: number;
  reportDir: string;
  reportFormats: Array<'json' | 'md'>;
  noReport: boolean;
  shuffleSeed?: string;
  autoReport: boolean;
};

export function resolveEvaliteConfig(): FirewallEvaliteConfig {
  return {
    caseFilters: parseList(process.env.FIREWALL_EVALITE_CASE_FILTERS),
    tagFilters: parseList(process.env.FIREWALL_EVALITE_TAG_FILTERS),
    caseSet: parseJsonList(process.env.FIREWALL_EVALITE_CASE_SET),
    globPattern: process.env.FIREWALL_EVALITE_GLOB,
    maxRetries: parseNumber(process.env.FIREWALL_EVALITE_MAX_RETRIES, 0),
    reportDir:
      process.env.FIREWALL_EVALITE_REPORT_DIR ??
      join(E2E_DIR, '..', 'report'),
    reportFormats: parseList(
      process.env.FIREWALL_EVALITE_REPORT_FORMATS ?? 'json,md'
    ).filter((fmt): fmt is 'json' | 'md' => fmt === 'json' || fmt === 'md'),
    noReport: parseBoolean(process.env.FIREWALL_EVALITE_NO_REPORT),
    shuffleSeed: process.env.FIREWALL_EVALITE_SHUFFLE_SEED,
    autoReport: parseBoolean(process.env.FIREWALL_EVALITE_AUTOREPORT),
  };
}

function parseList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseJsonList(value?: string): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
  } catch {
    // ignore malformed json and fall back to default selection
  }
  return undefined;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value?: string): boolean {
  if (!value) return false;
  return value === '1' || value.toLowerCase() === 'true';
}

