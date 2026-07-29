import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { userMessageOf } from '@hazirgrup/core';
import { signUpSchema, toFieldErrors } from '@hazirgrup/validation';
import { Alert, Button, Card, Field, Txt } from '@/components/ui';
import { useAuth } from '@/state/AuthContext';
import { useTheme } from '@/theme';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const parsed = signUpSchema.safeParse({
      displayName,
      email,
      password,
      passwordConfirm,
      acceptTerms: true,
    });

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await signUp(parsed.data.displayName, parsed.data.email, parsed.data.password);
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
          <Txt variant="h1">Hesap oluştur</Txt>
          <Txt variant="small" color="secondary">
            Plan oluşturmak için hesap gerekir. Arkadaşların kayıt olmadan katılabilir.
          </Txt>
        </View>

        <Card>
          {formError ? <Alert tone="error" message={formError} /> : null}

          <Field
            label="Görünen adın"
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
            placeholder="Örnek: Elif"
            hint="Arkadaşlarının planda göreceği isim."
            {...(errors.displayName ? { error: errors.displayName } : {})}
          />

          <Field
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            {...(errors.email ? { error: errors.email } : {})}
          />

          <Field
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            hint="En az 8 karakter, en az bir harf ve bir rakam."
            {...(errors.password ? { error: errors.password } : {})}
          />

          <Field
            label="Şifre tekrar"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            autoComplete="new-password"
            {...(errors.passwordConfirm ? { error: errors.passwordConfirm } : {})}
          />

          <Button
            title="Hesap oluştur"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />

          <Txt variant="caption" color="muted" style={{ textAlign: 'center' }}>
            Devam ederek kullanım koşullarını ve KVKK aydınlatma metnini kabul etmiş olursun.
          </Txt>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
