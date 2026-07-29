import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Oturum saklama.
 *
 * Token `expo-secure-store` ile cihazın güvenli deposunda tutulur
 * (docs/SECURITY_MODEL.md §2). Web (Expo web) hedefinde SecureStore
 * kullanılamadığı için `localStorage`'a düşülür — yalnızca geliştirme amaçlıdır.
 */

const SESSION_KEY = 'hg_session_user_id';

export async function saveSession(userId: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SESSION_KEY, userId);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, userId);
}

export async function readSession(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(SESSION_KEY) ?? null;
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
