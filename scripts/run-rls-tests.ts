/**
 * RLS SQL testlerini çalıştırır.
 *
 * Supabase CLI kuruluysa local veritabanına karşı `supabase/tests/rls.sql`
 * dosyasını çalıştırır. CLI yoksa uyarı verip ATLAR (CI'yı kırmaz) —
 * RLS mantığının uygulama tarafı karşılığı `tests/security/` içinde test edilir
 * (docs/KNOWN_LIMITATIONS.md L-14).
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SQL_FILE = resolve(HERE, '../supabase/tests/rls.sql');

function hasCommand(command: string, args: string[]): boolean {
  const result = spawnSync(command, args, { stdio: 'ignore', shell: true });
  return result.status === 0;
}

function main(): void {
  if (!existsSync(SQL_FILE)) {
    console.error(`✗ Test dosyası bulunamadı: ${SQL_FILE}`);
    process.exit(1);
  }

  const databaseUrl =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

  if (hasCommand('psql', ['--version'])) {
    console.log(`→ psql ile çalıştırılıyor: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
    try {
      execFileSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', SQL_FILE], {
        stdio: 'inherit',
        shell: true,
      });
      console.log('✓ RLS testleri geçti.');
      return;
    } catch {
      console.error('✗ RLS testleri başarısız oldu.');
      process.exit(1);
    }
  }

  console.warn(
    [
      '⚠ psql bulunamadı — RLS SQL testleri ATLANDI.',
      '',
      'Çalıştırmak için:',
      '  1. Supabase CLI kurun:  npm i -g supabase',
      '  2. Local ortamı başlatın:  supabase start',
      '  3. Migration ve seed uygulayın:  supabase db reset',
      '  4. Tekrar deneyin:  npm run test:rls',
      '',
      'RLS mantığının uygulama tarafı karşılığı `npm test` içinde doğrulanır.',
    ].join('\n'),
  );
}

main();
