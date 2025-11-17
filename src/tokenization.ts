import { createHmac } from 'crypto';

export type Matter =
  | { kind: 'SUBJ'; label: string; surface: string }
  | {
      kind: 'PRED';
      label: string;
      surface: string;
      subjects?: Array<{ label: string; surface: string }>;
    };

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
    let payload = `${m.kind}|${m.label}|${norm(m.surface)}`;
    if (m.kind === 'PRED' && m.subjects?.length) {
      const parts = m.subjects
        .map((s) => `${s.label}=${norm(s.surface)}`)
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

