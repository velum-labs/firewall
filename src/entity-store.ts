import { randomUUID } from "node:crypto";

export type EntityStoreEntry = {
  id: string;
  label: string;
  canonicalSurface: string;
  normalized: string;
  surfaces: Map<string, string>;
  updatedAt: number;
};

export interface EntityStore {
  getEntries(label: string): EntityStoreEntry[];
  addEntry(entry: EntityStoreEntry): void;
  touch(entry: EntityStoreEntry, surface: string, normalized: string): void;
}

export function createEntityStore(): EntityStore {
  const byLabel = new Map<string, EntityStoreEntry[]>();

  const getEntries = (label: string) => byLabel.get(label) ?? [];

  const addEntry = (entry: EntityStoreEntry) => {
    const existing = byLabel.get(entry.label) ?? [];
    existing.push(entry);
    byLabel.set(entry.label, existing);
  };

  const touch = (
    entry: EntityStoreEntry,
    surface: string,
    normalized: string
  ) => {
    entry.surfaces.set(normalized, surface);
    entry.updatedAt = Date.now();
  };

  return {
    getEntries,
    addEntry,
    touch,
  };
}

export const createEntry = (
  label: string,
  canonicalSurface: string,
  normalized: string
): EntityStoreEntry => ({
  id: randomUUID(),
  label,
  canonicalSurface,
  normalized,
  surfaces: new Map([[normalized, canonicalSurface]]),
  updatedAt: Date.now(),
});

