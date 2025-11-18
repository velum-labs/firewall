import { createHmac } from 'crypto';

type SubjectMatter = { label: string; surface: string; entityId?: string };

export type Matter =
  | ({ kind: 'SUBJ' } & SubjectMatter)
  | ({
      kind: 'PRED';
      label: string;
      surface: string;
      subjects?: SubjectMatter[];
    });

export type TokenFormat = 'brackets' | 'markdown';

export function makeTokenizer(secret: string, format: TokenFormat = 'brackets') {
  const hmac = (s: string) => createHmac('sha256', secret).update(s).digest();
  const b32 = (buf: Buffer) =>
    buf
      .toString('base64')
      .replace(/[+/=]/g, '')
      .slice(0, 16);

  function id(m: Matter) {
    const norm = (s: string) => s.normalize('NFKC').trim().toLowerCase();
    const encodeSurface = (surface: string, entityId?: string) =>
      entityId ? `EID:${entityId}` : norm(surface);
    const baseSurface =
      m.kind === 'SUBJ' ? encodeSurface(m.surface, m.entityId) : norm(m.surface);
    let payload = `${m.kind}|${m.label}|${baseSurface}`;
    if (m.kind === 'PRED' && m.subjects?.length) {
      const parts = m.subjects
        .map((s) => `${s.label}=${encodeSurface(s.surface, s.entityId)}`)
        .sort()
        .join(';');
      payload += `|SUBJ:${parts}`;
    }
    return b32(hmac(payload));
  }

  function token(m: Matter): string {
    const tokenId = id(m);
    if (format === 'markdown') {
      return `[${m.kind}:${m.label}:${tokenId}](firewall://${m.kind.toLowerCase()}/${m.label}/${tokenId})`;
    }
    return `[[${m.kind}:${m.label}:${tokenId}]]`;
  }

  return { token, id };
}

