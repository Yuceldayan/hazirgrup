import type { ReactNode } from 'react';

/**
 * Küçük ölçekli Markdown render edici.
 *
 * Yalnızca yardım ve hukuki metinlerde kullanılan alt küme desteklenir:
 * başlık (##, ###), paragraf, madde listesi, numaralı liste, tablo, kalın metin,
 * satır içi kod ve bağlantı.
 *
 * Neden harici kütüphane yok: içerik uygulama tarafından üretilir (kullanıcı
 * girdisi değildir), çıktı React elemanı olarak oluşturulur ve `dangerouslySetInnerHTML`
 * kullanılmaz — bu da HTML enjeksiyonu yüzeyini tamamen ortadan kaldırır.
 */

let keySeed = 0;
const nextKey = () => `md-${(keySeed += 1)}`;

/** `**kalın**`, `` `kod` `` ve `[metin](bağlantı)` biçimlerini işler. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={nextKey()}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={nextKey()}>{token.slice(1, -1)}</code>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a key={nextKey()} href={linkMatch[2]}>
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    const trimmed = line.trim();

    // Boş satır
    if (trimmed === '') {
      index += 1;
      continue;
    }

    // Başlık
    if (trimmed.startsWith('### ')) {
      blocks.push(<h3 key={nextKey()}>{renderInline(trimmed.slice(4))}</h3>);
      index += 1;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(<h2 key={nextKey()}>{renderInline(trimmed.slice(3))}</h2>);
      index += 1;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(<h2 key={nextKey()}>{renderInline(trimmed.slice(2))}</h2>);
      index += 1;
      continue;
    }

    // Tablo
    if (trimmed.startsWith('|') && (lines[index + 1] ?? '').includes('---')) {
      const header = parseTableRow(trimmed);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && (lines[index] ?? '').trim().startsWith('|')) {
        rows.push(parseTableRow(lines[index] ?? ''));
        index += 1;
      }
      blocks.push(
        <div key={nextKey()} className="scroll-x">
          <table>
            <thead>
              <tr>
                {header.map((cell) => (
                  <th key={nextKey()}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={nextKey()}>
                  {row.map((cell) => (
                    <td key={nextKey()}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Numaralı liste
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test((lines[index] ?? '').trim())) {
        items.push((lines[index] ?? '').trim().replace(/^\d+\.\s/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={nextKey()}>
          {items.map((item) => (
            <li key={nextKey()}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Madde listesi
    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && (lines[index] ?? '').trim().startsWith('- ')) {
        items.push((lines[index] ?? '').trim().slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={nextKey()}>
          {items.map((item) => (
            <li key={nextKey()}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Paragraf (ardışık satırlar birleştirilir)
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = (lines[index] ?? '').trim();
      if (
        current === '' ||
        current.startsWith('#') ||
        current.startsWith('- ') ||
        current.startsWith('|') ||
        /^\d+\.\s/.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      index += 1;
    }
    if (paragraph.length > 0) {
      blocks.push(<p key={nextKey()}>{renderInline(paragraph.join(' '))}</p>);
    }
  }

  return <div className="prose">{blocks}</div>;
}
