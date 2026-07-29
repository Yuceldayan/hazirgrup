import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { SignUpForm } from './SignUpForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kayıt ol | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  const user = await getCurrentUser();
  const { devam } = await searchParams;
  const redirectTo = devam && devam.startsWith('/') && !devam.startsWith('//') ? devam : '/hesap';

  if (user) redirect(redirectTo);

  return <SignUpForm redirectTo={redirectTo} />;
}
