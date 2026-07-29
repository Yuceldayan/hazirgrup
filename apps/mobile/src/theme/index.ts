import { useColorScheme } from 'react-native';
import {
  colorSchemes,
  elevation,
  fontStacks,
  layout,
  radius,
  spacing,
  typography,
  type SemanticColors,
} from '@hazirgrup/ui';

/**
 * Mobil tema.
 *
 * Değerler `packages/ui` tokenlarından gelir — web ile birebir aynı kaynak
 * (docs/DECISIONS.md D-002). Mobilde CSS değişkeni yoktur; tokenlar doğrudan
 * `StyleSheet` değerlerine dönüşür.
 */

export interface Theme {
  colors: SemanticColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  layout: typeof layout;
  isDark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    colors: isDark ? colorSchemes.dark : colorSchemes.light,
    spacing,
    radius,
    typography,
    elevation,
    layout,
    isDark,
  };
}

/** Android/iOS gölge stilini elevation tokenından üretir. */
export function shadow(token: keyof typeof elevation) {
  const value = elevation[token];
  return {
    elevation: value.elevation,
    shadowColor: '#0F172A',
    shadowOpacity: value.shadowOpacity,
    shadowRadius: value.shadowRadius,
    shadowOffset: { width: 0, height: value.shadowOffsetY },
  };
}

export { fontStacks, spacing, radius, typography, layout };
