import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DEMO_LOGIN_HINTS } from '@hazirgrup/core';
import { getCurrentUser } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { SignInForm } from './SignInForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Giriş yap | HazırGrup',
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  const user = await getCurrentUser();
  const { devam } = await searchParams;
  const redirectTo = devam && devam.startsWith('/') && !devam.startsWith('//') ? devam : '/hesap';

  if (user) redirect(redirectTo);

  const repo = await getRepository();

  return (
    <SignInForm
      redirectTo={redirectTo}
      demoHints={repo.mode === 'demo' ? DEMO_LOGIN_HINTS : []}
    />
  );
}
