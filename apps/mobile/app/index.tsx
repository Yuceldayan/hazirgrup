import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

/** Açılış yönlendirmesi: oturum varsa sekmeler, yoksa giriş. */
export default function Index() {
  const { user, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.bgCanvas,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.brandDefault} />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/giris" />;
}
