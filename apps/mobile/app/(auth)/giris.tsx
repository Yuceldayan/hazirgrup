import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { DEMO_LOGIN_HINTS, userMessageOf } from '@hazirgrup/core';
import { signInSchema, toFieldErrors } from '@hazirgrup/validation';
import { Alert, Button, Card, Field, Txt } from '@/components/ui';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';
import { env } from '@/lib/env';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showDemoHints = env.dataSource !== 'supabase' && !env.supabaseUrl;

  async function handleSubmit() {
    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await signIn(parsed.data.email, parsed.data.password);
      router.replace('/(tabs)');
    } catch (error) {
      setFormError(userMessageOf(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.base }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 4, marginBottom: theme.spacing.sm }}>
          <Txt variant="h1">Tekrar hoş geldin</Txt>
          <Txt variant="small" color="secondary">
            Planlarını yönetmek ve rezervasyon göndermek için giriş yap.
          </Txt>
        </View>

        <Card>
          {formError ? <Alert tone="error" message={formError} /> : null}

          <Field
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="ornek@eposta.com"
            {...(errors.email ? { error: errors.email } : {})}
          />

          <Field
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            {...(errors.password ? { error: errors.password } : {})}
          />

          <Button title="Giriş yap" onPress={handleSubmit} loading={loading} fullWidth size="lg" />

          <Link href="/(auth)/kayit" asChild>
            <Button title="Hesabın yok mu? Kayıt ol" variant="ghost" fullWidth />
          </Link>
        </Card>

        {showDemoHints ? (
          <Card flat>
            <Txt variant="bodyStrong">Demo hesapları</Txt>
            <Txt variant="small" color="secondary">
              Supabase yapılandırılmadığı için demo verisiyle çalışıyorsun.
            </Txt>
            {DEMO_LOGIN_HINTS.map((hint) => (
              <Button
                key={hint.email}
                title={`${hint.label}: ${hint.email}`}
                variant="secondary"
                size="sm"
                fullWidth
                onPress={() => {
                  setEmail(hint.email);
                  setPassword(hint.password);
                }}
              />
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
