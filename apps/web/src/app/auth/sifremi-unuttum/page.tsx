import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Şifremi unuttum | HazırGrup',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
