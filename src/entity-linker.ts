import createDebug from 'debug';
import type { Catalog } from './catalog';
import type { SubjectMention } from './engine/types';

const debug = createDebug('firewall:entity-linker');

export type EntityLinkInput = {
  label: string;
  surface: string;
  namespace?: string;
};

export type EntityLinkResult = {
  label: string;
  surface: string;
  canonicalSurface: string;
  entityId: string;
};

export interface EntityLinker {
  resolveMany(
    inputs: EntityLinkInput[],
    options?: { signal?: AbortSignal }
  ): Promise<EntityLinkResult[]>;
}

const hasStructuredSpec = (label: string, catalog: Catalog): boolean => {
  const spec = catalog.subjects[label];
  return Boolean(spec?.structured);
};

export async function linkSubjectsWithEntityLinker({
  subjects,
  catalog,
  linker,
  namespace,
}: {
  subjects: Array<
    SubjectMention & { entityId?: string; canonicalSurface?: string }
  >;
  catalog: Catalog;
  linker: EntityLinker;
  namespace?: string;
}): Promise<void> {
  const linkable = subjects
    .map((subject, index) => ({ subject, index }))
    .filter(({ subject }) => !hasStructuredSpec(subject.type, catalog));

  if (!linkable.length) {
    return;
  }

  const inputs = linkable.map(({ subject }) => ({
    label: subject.type,
    surface: subject.text,
    namespace,
  }));

  const results = await linker.resolveMany(inputs);

  if (results.length !== linkable.length) {
    debug(
      'EntityLinker returned %d results for %d inputs',
      results.length,
      linkable.length
    );
  }

  for (let i = 0; i < linkable.length; i += 1) {
    const result = results[i];
    if (!result) {
      continue;
    }
    const target = linkable[i].subject;
    target.entityId = result.entityId;
    target.canonicalSurface = result.canonicalSurface || result.surface || target.text;
  }
}

