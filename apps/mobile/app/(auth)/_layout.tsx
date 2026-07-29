import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bgCanvas },
        headerTintColor: theme.colors.textPrimary,
        contentStyle: { backgroundColor: theme.colors.bgCanvas },
      }}
    >
      <Stack.Screen name="giris" options={{ title: 'Giriş yap' }} />
      <Stack.Screen name="kayit" options={{ title: 'Kayıt ol' }} />
    </Stack>
  );
}
