import type { Metadata } from 'next';
import { ResetPasswordForm } from './ResetPasswordForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Şifre sıfırla | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ''} />;
}
