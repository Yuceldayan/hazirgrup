import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import type { BadgeTone, ButtonSize, ButtonVariant } from '@hazirgrup/ui';
import styles from './ui.module.css';

/**
 * Ortak sunucu bileşenleri.
 *
 * Varyant tanımları `packages/ui` tokenlarından gelir; stil değerleri
 * `ui.module.css` içinde CSS değişkenleriyle uygulanır (D-002/D-003).
 */

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Buton
// ---------------------------------------------------------------------------

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: styles.buttonPrimary!,
  secondary: styles.buttonSecondary!,
  ghost: styles.buttonGhost!,
  danger: styles.buttonDanger!,
};

const buttonSizeClass: Record<ButtonSize, string> = {
  sm: styles.buttonSm!,
  md: styles.buttonMd!,
  lg: styles.buttonLg!,
};

export function buttonClassName(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  return cx(
    styles.button,
    buttonVariantClass[options.variant ?? 'primary'],
    buttonSizeClass[options.size ?? 'md'],
    options.fullWidth && styles.buttonFullWidth,
    options.className,
  );
}

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClassName({ variant, size, fullWidth, ...(className ? { className } : {}) })} {...rest}>
      {children}
    </button>
  );
}

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, fullWidth, ...(className ? { className } : {}) })}
      {...rest}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Kart
// ---------------------------------------------------------------------------

export function Card({
  children,
  raised = false,
  flat = false,
  className,
  ...rest
}: ComponentProps<'div'> & { raised?: boolean; flat?: boolean }) {
  return (
    <div
      className={cx(styles.card, raised && styles.cardRaised, flat && styles.cardFlat, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardLink({
  href,
  children,
  className,
  ...rest
}: ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cx(styles.card, styles.cardInteractive, className)} {...rest}>
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Rozet
// ---------------------------------------------------------------------------

const badgeToneStyle: Record<BadgeTone, { background: string; color: string; border: string }> = {
  neutral: {
    background: 'var(--color-bg-subtle)',
    color: 'var(--color-text-secondary)',
    border: 'var(--color-border-default)',
  },
  brand: {
    background: 'var(--color-brand-surface)',
    color: 'var(--color-brand-text)',
    border: 'var(--color-brand-subtle)',
  },
  success: {
    background: 'var(--color-success-bg)',
    color: 'var(--color-success-text)',
    border: 'var(--color-success-border)',
  },
  warning: {
    background: 'var(--color-warning-bg)',
    color: 'var(--color-warning-text)',
    border: 'var(--color-warning-border)',
  },
  danger: {
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    border: 'var(--color-danger-border)',
  },
  info: {
    background: 'var(--color-info-bg)',
    color: 'var(--color-info-text)',
    border: 'var(--color-info-border)',
  },
  accent: {
    background: 'var(--color-accent-subtle)',
    color: 'var(--color-accent-text)',
    border: 'var(--color-accent-subtle)',
  },
};

/**
 * Rozet — durum yalnızca renkle anlatılmaz; ikon ve metin birlikte kullanılır
 * (docs/DESIGN_SYSTEM.md §10.3).
 */
export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: string;
  children: ReactNode;
}) {
  const palette = badgeToneStyle[tone];
  return (
    <span
      className={styles.badge}
      style={{
        background: palette.background,
        color: palette.color,
        borderColor: palette.border,
      }}
    >
      {icon ? (
        <span className={styles.badgeIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Boş durum
// ---------------------------------------------------------------------------

/**
 * Boş durum — her zaman açıklayıcı metin ve bir aksiyon içerir
 * (docs/INFORMATION_ARCHITECTURE.md §6).
 */
export function EmptyState({
  icon = '📋',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

/** Skeleton — gerçek içerikle aynı yükseklikte olmalıdır (CLS koruması). */
export function Skeleton({
  height = 16,
  width = '100%',
  radius,
}: {
  height?: number | string;
  width?: number | string;
  radius?: number;
}) {
  return (
    <div
      className={styles.skeleton}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        ...(radius !== undefined ? { borderRadius: `${radius}px` } : {}),
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="85%" />
        <Skeleton height={14} width="40%" />
        <Skeleton height={44} radius={10} />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Uyarı kutusu
// ---------------------------------------------------------------------------

const alertToneClass = {
  info: styles.alertInfo,
  success: styles.alertSuccess,
  warning: styles.alertWarning,
  error: styles.alertError,
} as const;

const alertToneIcon = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠',
  error: '⛔',
} as const;

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof alertToneClass;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.alert, alertToneClass[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{alertToneIcon[tone]}</span>
      <div className={styles.alertBody}>
        {title ? <p className={styles.alertTitle}>{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Neredesiniz" className={styles.breadcrumb}>
      {items.map((item, index) => (
        <span key={`${item.name}-${index}`} style={{ display: 'inline-flex', gap: 6 }}>
          {index > 0 ? (
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              ›
            </span>
          ) : null}
          {item.href && index < items.length - 1 ? (
            <Link href={item.href}>{item.name}</Link>
          ) : (
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {item.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// İlerleme
// ---------------------------------------------------------------------------

export function Progress({
  value,
  max = 1,
  label,
  hint,
}: {
  value: number;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label || hint ? (
        <div className={styles.progressLabel}>
          {label ? <span>{label}</span> : <span />}
          {hint ? <span>{hint}</span> : null}
        </div>
      ) : null}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'İlerleme'}
      >
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bölüm başlığı
// ---------------------------------------------------------------------------

export function SectionHeader({
  title,
  description,
  action,
  as: Tag = 'h2',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <Tag className={styles.sectionTitle}>{title}</Tag>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Zaman çizelgesi
// ---------------------------------------------------------------------------

export function Timeline({
  items,
}: {
  items: Array<{
    label: string;
    meta?: string;
    state: 'done' | 'current' | 'upcoming';
    icon?: string;
  }>;
}) {
  return (
    <ol className={styles.timeline}>
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className={styles.timelineItem}>
          <span
            className={cx(
              styles.timelineDot,
              item.state === 'done' && styles.timelineDotDone,
              item.state === 'current' && styles.timelineDotCurrent,
            )}
            aria-hidden="true"
          >
            {item.state === 'done' ? '✓' : item.icon ?? ''}
          </span>
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>
              {item.label}
              {item.state === 'current' ? <span className="sr-only"> (şu anki adım)</span> : null}
            </p>
            {item.meta ? <p className={styles.timelineMeta}>{item.meta}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export { styles as uiStyles };
