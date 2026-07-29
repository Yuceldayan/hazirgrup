import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/state/AuthContext';
import { useTheme } from '@/theme';

/** Kök düzen — tema, güvenli alan ve oturum sağlayıcısı. */
export default function RootLayout() {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.bgCanvas },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: theme.colors.bgCanvas },
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="plan/[id]" options={{ title: 'Plan' }} />
          <Stack.Screen name="plan/[id]/davet" options={{ title: 'Arkadaşlarını davet et' }} />
          <Stack.Screen name="plan/[id]/rezervasyon" options={{ title: 'Rezervasyon talebi' }} />
          <Stack.Screen name="rezervasyon/[id]" options={{ title: 'Rezervasyon' }} />
          <Stack.Screen name="bildirimler" options={{ title: 'Bildirimler' }} />
          <Stack.Screen name="yardim" options={{ title: 'Yardım' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
