import { Redirect, Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

/**
 * Alt menü (docs/INFORMATION_ARCHITECTURE.md §1.1).
 * 1 Ana Sayfa · 2 Planlarım · 3 Yeni Plan · 4 Rezervasyonlar · 5 Profil
 */
export default function TabsLayout() {
  const theme = useTheme();
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) return <Redirect href="/(auth)/giris" />;

  const icon = (glyph: string) => {
    const IconComponent = ({ color }: { color: ColorValue }) => (
      <Text style={{ fontSize: 20, color }}>{glyph}</Text>
    );
    IconComponent.displayName = `TabIcon(${glyph})`;
    return IconComponent;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.brandDefault,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.bgSurface,
          borderTopColor: theme.colors.borderDefault,
        },
        headerStyle: { backgroundColor: theme.colors.bgCanvas },
        headerTintColor: theme.colors.textPrimary,
        sceneStyle: { backgroundColor: theme.colors.bgCanvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Ana Sayfa', tabBarIcon: icon('🏠'), headerTitle: 'HazırGrup' }}
      />
      <Tabs.Screen
        name="planlar"
        options={{ title: 'Planlarım', tabBarIcon: icon('📋') }}
      />
      <Tabs.Screen
        name="yeni"
        options={{ title: 'Yeni Plan', tabBarIcon: icon('➕') }}
      />
      <Tabs.Screen
        name="rezervasyonlar"
        options={{ title: 'Rezervasyon', tabBarIcon: icon('📅') }}
      />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
