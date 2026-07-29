// Domain tipleri — tüketiciler tek paketten import edebilsin diye yeniden ihraç edilir.
export * from '@hazirgrup/types';

// Sabitler ve yapılandırma
export * from './config/constants';

// Hata modeli
export * from './errors/AppError';

// Kriptografi (taşınabilir)
export * from './crypto/index';

// Metin ve biçimlendirme
export * from './text/slug';
export * from './format/index';

// Domain
export * from './budget/index';
export * from './matching/index';
export * from './status/plan';
export * from './status/reservation';
export * from './invite/token';
export * from './rate-limit/index';

// SEO
export * from './seo/routes';
export * from './seo/metadata';
export * from './seo/indexability';
export * from './seo/structured-data';

// Veri erişimi
export * from './data/repository';
export * from './data/projections';
export * from './data/createRepository';

// Servisler
export * from './services/planService';
export * from './services/votingService';
export * from './services/invitationService';
export * from './services/reservationService';

// Seed / demo verisi
export {
  buildDataset,
  DEMO_INVITE_TOKENS,
  SEED_REFERENCE_DATE,
  todayIso,
  GUIDE_PAGES,
  HELP_ARTICLES,
  LEGAL_DOCUMENTS,
} from './seed/dataset';
export type { DemoDataset, GuidePage, DemoUser } from './seed/dataset';
export { DEMO_LOGIN_HINTS } from './seed/people';
export { PREFERENCE_LABELS } from './seed/catalog';
