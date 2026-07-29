import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import { useMemo, type ReactNode } from 'react';
import type { BadgeTone, ButtonVariant } from '@hazirgrup/ui';
import { badgeColors, buttonColors, buttonSizes } from '@hazirgrup/ui';
import { shadow, useTheme } from '@/theme';

/**
 * Mobil ortak bileşenler.
 *
 * Varyant tanımları web ile aynı kaynaktan (`packages/ui`) gelir; yalnızca
 * render hedefi farklıdır (docs/DECISIONS.md D-002).
 */

// ---------------------------------------------------------------------------
// Metin
// ---------------------------------------------------------------------------

type TypeToken = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'mono';

export function Txt({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}: {
  variant?: TypeToken;
  color?: 'primary' | 'secondary' | 'muted' | 'brand' | 'danger' | 'success' | 'inverse';
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Text>, 'children'>) {
  const theme = useTheme();
  const type = theme.typography[variant];

  const colorValue = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    brand: theme.colors.brandText,
    danger: theme.colors.dangerText,
    success: theme.colors.successText,
    inverse: theme.colors.textOnBrand,
  }[color ?? 'primary'];

  return (
    <Text
      // Sistem yazı büyüklüğüne uyum, düzeni bozmayacak üst sınırla.
      allowFontScaling
      maxFontSizeMultiplier={1.4}
      style={[
        {
          fontSize: type.fontSize,
          lineHeight: type.lineHeight,
          fontWeight: String(type.fontWeight) as '400' | '500' | '600' | '700',
          color: colorValue,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Buton
// ---------------------------------------------------------------------------

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  ...rest
}: {
  title: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
} & Omit<PressableProps, 'children' | 'style'>) {
  const theme = useTheme();
  const colors = buttonColors(theme.colors, variant);
  const spec = buttonSizes[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: spec.height,
          // Erişilebilirlik: minimum dokunma alanı
          minHeight: theme.layout.minTouchTarget,
          paddingHorizontal: spec.paddingHorizontal,
          borderRadius: spec.borderRadius,
          backgroundColor: pressed ? colors.backgroundPressed : colors.background,
          borderWidth: colors.border === 'transparent' ? 0 : 1,
          borderColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spec.gap,
          opacity: isDisabled ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={colors.text} /> : null}
      <Text
        allowFontScaling
        maxFontSizeMultiplier={1.3}
        style={{ color: colors.text, fontSize: spec.fontSize, fontWeight: '600' }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Kart
// ---------------------------------------------------------------------------

export function Card({ children, style, flat = false, ...rest }: ViewProps & { flat?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.bgSurface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.borderDefault,
          padding: theme.spacing.base,
          gap: theme.spacing.sm,
        },
        flat ? null : shadow('sm'),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Rozet
// ---------------------------------------------------------------------------

export function Badge({
  tone = 'neutral',
  icon,
  label,
}: {
  tone?: BadgeTone;
  icon?: string;
  label: string;
}) {
  const theme = useTheme();
  const palette = badgeColors(theme.colors, tone);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: theme.radius.full,
        backgroundColor: palette.background,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      {icon ? <Text style={{ fontSize: 11 }}>{icon}</Text> : null}
      <Text style={{ color: palette.text, fontSize: 12, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Alan (etiket her zaman görünür)
// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  error,
  ...rest
}: { label: string; hint?: string; error?: string } & TextInputProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 6 }}>
      <Txt variant="small" style={{ fontWeight: '600' }}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        style={{
          minHeight: 48,
          paddingHorizontal: theme.spacing.md,
          borderWidth: 1,
          borderRadius: theme.radius.sm,
          borderColor: error ? theme.colors.dangerSolid : theme.colors.borderStrong,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.bgSurface,
          fontSize: 15,
        }}
        {...rest}
      />
      {hint && !error ? (
        <Txt variant="small" color="secondary">
          {hint}
        </Txt>
      ) : null}
      {error ? (
        <Txt variant="small" color="danger" accessibilityLiveRegion="polite">
          ⚠ {error}
        </Txt>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Durum bileşenleri
// ---------------------------------------------------------------------------

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
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing['2xl'],
        backgroundColor: theme.colors.bgSubtle,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.borderStrong,
      }}
    >
      <Text style={{ fontSize: 30 }}>{icon}</Text>
      <Txt variant="h3" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      <Txt variant="small" color="secondary" style={{ textAlign: 'center' }}>
        {description}
      </Txt>
      {action}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Bir şeyler ters gitti"
      description={message}
      action={onRetry ? <Button title="Tekrar dene" onPress={onRetry} /> : undefined}
    />
  );
}

/** Skeleton — gerçek içerikle aynı yükseklikte olmalıdır (CLS koruması). */
export function Skeleton({ height = 16, width = '100%' }: { height?: number; width?: number | `${number}%` }) {
  const theme = useTheme();
  return (
    <View
      style={{
        height,
        width,
        backgroundColor: theme.colors.skeleton,
        borderRadius: theme.radius.sm,
      }}
    />
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  const theme = useTheme();
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  return (
    <View style={{ gap: theme.spacing.md }} accessibilityLabel="Yükleniyor">
      {items.map((index) => (
        <Card key={index}>
          <Skeleton height={20} width="60%" />
          <Skeleton height={14} width="85%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={44} />
        </Card>
      ))}
    </View>
  );
}

export function Alert({
  tone = 'info',
  title,
  message,
}: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
}) {
  const theme = useTheme();

  const palette = {
    info: { bg: theme.colors.infoBg, border: theme.colors.infoBorder, text: theme.colors.infoText, icon: 'ℹ️' },
    success: {
      bg: theme.colors.successBg,
      border: theme.colors.successBorder,
      text: theme.colors.successText,
      icon: '✓',
    },
    warning: {
      bg: theme.colors.warningBg,
      border: theme.colors.warningBorder,
      text: theme.colors.warningText,
      icon: '⚠',
    },
    error: {
      bg: theme.colors.dangerBg,
      border: theme.colors.dangerBorder,
      text: theme.colors.dangerText,
      icon: '⛔',
    },
  }[tone];

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      style={{
        flexDirection: 'row',
        gap: 8,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <Text style={{ color: palette.text }}>{palette.icon}</Text>
      <View style={{ flex: 1 }}>
        {title ? (
          <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 2 }}>{title}</Text>
        ) : null}
        <Text style={{ color: palette.text, fontSize: 14 }}>{message}</Text>
      </View>
    </View>
  );
}

/** İlerleme çubuğu. */
export function Progress({ value, max = 1 }: { value: number; max?: number }) {
  const theme = useTheme();
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(percent), min: 0, max: 100 }}
      style={{
        height: 6,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.bgSubtle,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: theme.colors.brandDefault,
          borderRadius: theme.radius.full,
        }}
      />
    </View>
  );
}

export const layoutStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
