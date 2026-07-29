import type { IsoDate } from '@hazirgrup/types';
import { AppError } from '../errors/AppError';
import { DemoRepository } from './demo/DemoRepository';
import type { Repository } from './repository';

/**
 * Veri kaynağı fabrikası (docs/DECISIONS.md D-004).
 *
 * Supabase anahtarları tanımlıysa gerçek veritabanı, değilse seed verisiyle
 * dolu bellek içi kaynak kullanılır. Uygulama katmanı farkı bilmez.
 */

export type DataSourceMode = 'auto' | 'demo' | 'supabase';

export interface RepositoryConfig {
  mode: DataSourceMode;
  supabaseUrl?: string | undefined;
  supabaseAnonKey?: string | undefined;
  supabaseServiceRoleKey?: string | undefined;
  /** Demo verisinin türetileceği referans tarih (bugün). */
  referenceDate: IsoDate;
}

export function resolveDataSource(config: RepositoryConfig): 'demo' | 'supabase' {
  const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  if (config.mode === 'demo') return 'demo';
  if (config.mode === 'supabase') {
    if (!hasSupabase) {
      throw new AppError(
        'unavailable',
        'HG_DATA_SOURCE=supabase ancak NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.',
        {
          userMessage:
            'Veri kaynağı yapılandırması eksik. Yöneticiye bildirin veya HG_DATA_SOURCE=demo kullanın.',
        },
      );
    }
    return 'supabase';
  }
  return hasSupabase ? 'supabase' : 'demo';
}

/**
 * Demo modda depo süreç ömrü boyunca tekildir; böylece istekler arasında
 * oluşturulan planlar ve oylar korunur.
 */
let demoSingleton: DemoRepository | null = null;

export function getDemoRepository(referenceDate: IsoDate): DemoRepository {
  if (!demoSingleton) {
    demoSingleton = new DemoRepository(referenceDate);
  }
  return demoSingleton;
}

/** Test yardımı: demo verisini sıfırlar. */
export function resetDemoRepository(referenceDate: IsoDate): DemoRepository {
  if (demoSingleton) {
    demoSingleton.reset(referenceDate);
    return demoSingleton;
  }
  demoSingleton = new DemoRepository(referenceDate);
  return demoSingleton;
}

/**
 * Supabase deposu ağır bağımlılık (`@supabase/supabase-js`) getirdiği için
 * yalnızca gerçekten gerektiğinde yüklenir.
 */
export async function createRepository(config: RepositoryConfig): Promise<Repository> {
  const source = resolveDataSource(config);

  if (source === 'demo') {
    return getDemoRepository(config.referenceDate);
  }

  const { SupabaseRepository } = await import('./supabase/SupabaseRepository');
  return new SupabaseRepository({
    url: config.supabaseUrl as string,
    anonKey: config.supabaseAnonKey as string,
    serviceRoleKey: config.supabaseServiceRoleKey,
  });
}

export { DemoRepository };
export type { Repository };
