'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cancelReservation } from '@hazirgrup/core';
import {
  cancelReservationSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from '@hazirgrup/validation';
import { requireUser } from '@/server/auth';
import { getRepository, getServiceContext } from '@/server/repository';
import { destroySession } from '@/server/session';
import {
  actionError,
  actionSuccess,
  actionValidationError,
  isRedirectError,
  type ActionResult,
} from '@/server/actionResult';

/** Hesap alanı server action'ları. */

export async function updateProfileAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser('/hesap/ayarlar');

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get('displayName'),
    phone: formData.get('phone') ?? '',
    cityId: formData.get('cityId') ?? '',
    districtId: formData.get('districtId') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.updateProfile(user.id, {
      displayName: parsed.data.displayName,
      phone: parsed.data.phone,
      cityId: parsed.data.cityId,
      districtId: parsed.data.districtId,
    });
    revalidatePath('/hesap/ayarlar');
    return actionSuccess('Profil bilgilerin güncellendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser('/hesap/bildirimler');
  const repo = await getRepository();
  await repo.markAllNotificationsRead(user.id, new Date().toISOString());
  revalidatePath('/hesap/bildirimler');
}

export async function toggleFavoriteAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const packageId = String(formData.get('packageId') ?? '');

  try {
    const repo = await getRepository();
    const added = await repo.toggleFavorite(user.id, packageId, new Date().toISOString());
    revalidatePath('/hesap/favoriler');
    return actionSuccess(added ? 'Paket favorilere eklendi.' : 'Paket favorilerden çıkarıldı.');
  } catch (error) {
    return actionError(error);
  }
}

export async function cancelReservationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = cancelReservationSchema.safeParse({
    reservationId: formData.get('reservationId'),
    reason: formData.get('reason') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    await cancelReservation(ctx, {
      reservationId: parsed.data.reservationId,
      actorId: user.id,
      byBusiness: false,
      reason: parsed.data.reason ?? null,
    });
    revalidatePath('/hesap/rezervasyonlar');
    return actionSuccess('Rezervasyon iptal edildi. İşletme bilgilendirildi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAccountAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser('/hesap/ayarlar');

  const parsed = deleteAccountSchema.safeParse({ confirmation: formData.get('confirmation') });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.deleteAccount(user.id, new Date().toISOString());
    await destroySession();
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }

  redirect('/?hesap=silindi');
}
