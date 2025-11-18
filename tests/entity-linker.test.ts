import { describe, it, expect } from 'vitest';
import { createFuzzyEntityLinker } from '../src/fuzzy-linker';
import { linkSubjectsWithEntityLinker } from '../src/entity-linker';
import type { Catalog } from '../src/catalog';
import type { SubjectMention } from '../src/engine/types';

const catalog: Catalog = {
  subjects: {
    PERSON: {},
    EMAIL: {
      structured: {
        pattern: '.+@.+',
      },
    },
  },
  predicates: {},
};

const makeSubject = (
  id: string,
  type: string,
  text: string
): SubjectMention => ({
  id,
  type,
  text,
  spans: [{ start: 0, end: text.length }],
  confidence: 0.99,
});

describe('entity linker', () => {
  it('assigns shared entityId for fuzzy matches', async () => {
    const subjects = [
      makeSubject('s1', 'PERSON', 'Alen Rubilar'),
      makeSubject('s2', 'PERSON', 'Alen'),
      makeSubject('s3', 'EMAIL', 'alen@example.com'),
    ];

    const linker = createFuzzyEntityLinker({
      thresholds: {
        PERSON: { accept: 0.75, ambiguous: 0.7, minLength: 3 },
      },
    });
    await linkSubjectsWithEntityLinker({
      subjects,
      catalog,
      linker,
    });

    expect(subjects[0].entityId).toBeTruthy();
    expect(subjects[1].entityId).toBe(subjects[0].entityId);
    expect(subjects[1].canonicalSurface).toBe('Alen Rubilar');
    expect(subjects[2].entityId).toBeUndefined();
  });

  it('isolates namespaces', async () => {
    const linker = createFuzzyEntityLinker();
    const subjectsTenantA = [makeSubject('a', 'PERSON', 'Dana Carvey')];
    const subjectsTenantB = [makeSubject('b', 'PERSON', 'Dana Carvey')];

    await linkSubjectsWithEntityLinker({
      subjects: subjectsTenantA,
      catalog,
      linker,
      namespace: 'tenant-a',
    });
    await linkSubjectsWithEntityLinker({
      subjects: subjectsTenantB,
      catalog,
      linker,
      namespace: 'tenant-b',
    });

    expect(subjectsTenantA[0].entityId).toBeTruthy();
    expect(subjectsTenantB[0].entityId).toBeTruthy();
    expect(subjectsTenantA[0].entityId).not.toBe(subjectsTenantB[0].entityId);
  });
});

