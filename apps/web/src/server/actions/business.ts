'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cancelReservation, completeReservation, respondToReservation } from '@hazirgrup/core';
import {
  addTeamMemberSchema,
  businessApplicationSchema,
  cancelReservationSchema,
  respondReservationSchema,
  updateBusinessSchema,
  upsertBranchSchema,
  upsertPackageSchema,
} from '@hazirgrup/validation';
import { requireBusinessMember, requireUser } from '@/server/auth';
import { getRepository, getServiceContext } from '@/server/repository';
import {
  actionError,
  actionSuccess,
  actionValidationError,
  isRedirectError,
  type ActionResult,
} from '@/server/actionResult';

/** İşletme paneli server action'ları. */

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

// ---------------------------------------------------------------------------
// Başvuru
// ---------------------------------------------------------------------------

export async function submitApplicationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser('/business/basvuru');

  const parsed = businessApplicationSchema.safeParse({
    businessName: formData.get('businessName'),
    contactName: formData.get('contactName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    cityId: formData.get('cityId'),
    districtId: formData.get('districtId'),
    categoryId: formData.get('categoryId'),
    taxInfo: formData.get('taxInfo') ?? '',
    instagram: formData.get('instagram') ?? '',
    website: formData.get('website') ?? '',
    acceptTerms: formData.get('acceptTerms') === 'on',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.createApplication(
      {
        applicantId: user.id,
        businessName: parsed.data.businessName,
        contactName: parsed.data.contactName,
        phone: parsed.data.phone,
        email: parsed.data.email,
        address: parsed.data.address,
        cityId: parsed.data.cityId,
        districtId: parsed.data.districtId,
        categoryId: parsed.data.categoryId,
        taxInfo: parsed.data.taxInfo,
        instagram: parsed.data.instagram,
        website: parsed.data.website,
      },
      new Date().toISOString(),
    );

    revalidatePath('/business/basvuru');
    return actionSuccess(
      'Başvurun alındı. Yönetici incelemesinden sonra sana bilgi vereceğiz. Genellikle 1–2 iş günü sürer.',
    );
  } catch (error) {
    return actionError(error);
  }
}

// ---------------------------------------------------------------------------
// İşletme bilgileri
// ---------------------------------------------------------------------------

export async function updateBusinessAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user, businessId } = await requireBusinessMember();

  const parsed = updateBusinessSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp') ?? '',
    website: formData.get('website') ?? '',
    instagram: formData.get('instagram') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.updateBusiness(businessId, parsed.data, user.id);
    revalidatePath('/business/isletme');
    return actionSuccess('İşletme bilgilerin güncellendi.');
  } catch (error) {
    return actionError(error);
  }
}

// ---------------------------------------------------------------------------
// Şube
// ---------------------------------------------------------------------------

export async function upsertBranchAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user, businessId } = await requireBusinessMember();

  const hours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    isClosed: formData.get(`closed-${weekday}`) === 'on',
    opensAt: String(formData.get(`opens-${weekday}`) ?? '10:00'),
    closesAt: String(formData.get(`closes-${weekday}`) ?? '23:00'),
  }));

  const parsed = upsertBranchSchema.safeParse({
    ...(formData.get('id') ? { id: String(formData.get('id')) } : {}),
    name: formData.get('name'),
    cityId: formData.get('cityId'),
    districtId: formData.get('districtId'),
    address: formData.get('address'),
    phone: formData.get('phone') ?? '',
    whatsapp: formData.get('whatsapp') ?? '',
    isActive: formData.get('isActive') === 'on',
    hours,
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.upsertBranch(
      {
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        businessId,
        name: parsed.data.name,
        cityId: parsed.data.cityId,
        districtId: parsed.data.districtId,
        address: parsed.data.address,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        isActive: parsed.data.isActive,
        hours: parsed.data.hours.map((h) => ({
          weekday: h.weekday,
          opensAt: h.isClosed ? null : (h.opensAt ?? null),
          closesAt: h.isClosed ? null : (h.closesAt ?? null),
          isClosed: h.isClosed,
        })),
      },
      user.id,
    );

    revalidatePath('/business/subeler');
    return actionSuccess(parsed.data.id ? 'Şube güncellendi.' : 'Yeni şube eklendi.');
  } catch (error) {
    return actionError(error);
  }
}

// ---------------------------------------------------------------------------
// Paket
// ---------------------------------------------------------------------------

export async function upsertPackageAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user, businessId } = await requireBusinessMember();

  const items = String(formData.get('items') ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const availability = [0, 1, 2, 3, 4, 5, 6]
    .filter((weekday) => formData.get(`day-${weekday}`) === 'on')
    .map((weekday) => ({
      weekday,
      startTime: String(formData.get('availStart') ?? '12:00'),
      endTime: String(formData.get('availEnd') ?? '23:00'),
    }));

  const priceLira = parseNumber(formData.get('price'));

  const parsed = upsertPackageSchema.safeParse({
    ...(formData.get('id') ? { id: String(formData.get('id')) } : {}),
    branchId: formData.get('branchId'),
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    description: formData.get('description'),
    minPeople: parseNumber(formData.get('minPeople')) ?? 0,
    maxPeople: parseNumber(formData.get('maxPeople')) ?? 0,
    pricingModel: formData.get('pricingModel'),
    priceAmount: priceLira !== null ? Math.round(priceLira * 100) : 0,
    durationMinutes: parseNumber(formData.get('durationMinutes')),
    reservationTerms: formData.get('reservationTerms') ?? '',
    cancellationTerms: formData.get('cancellationTerms') ?? '',
    isActive: formData.get('isActive') === 'on',
    isPublic: formData.get('isPublic') === 'on',
    items,
    availability,
    preferenceKeys: formData.getAll('preferenceKeys').map(String),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.upsertPackage(
      {
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        businessId,
        branchId: parsed.data.branchId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description,
        minPeople: parsed.data.minPeople,
        maxPeople: parsed.data.maxPeople,
        pricingModel: parsed.data.pricingModel,
        priceAmount: parsed.data.priceAmount,
        durationMinutes: parsed.data.durationMinutes,
        reservationTerms: parsed.data.reservationTerms,
        cancellationTerms: parsed.data.cancellationTerms,
        isActive: parsed.data.isActive,
        isPublic: parsed.data.isPublic,
        items: parsed.data.items,
        availability: parsed.data.availability,
        preferenceKeys: parsed.data.preferenceKeys,
      },
      user.id,
      new Date().toISOString(),
    );

    revalidatePath('/business/paketler');
    return actionSuccess(parsed.data.id ? 'Paket güncellendi.' : 'Yeni paket eklendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function togglePackageActiveAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user, businessId } = await requireBusinessMember();
  const packageId = String(formData.get('packageId') ?? '');
  const nextActive = formData.get('isActive') === 'true';

  try {
    const repo = await getRepository();
    const pkg = await repo.getPackage(packageId);
    if (!pkg || pkg.businessId !== businessId) {
      return { ok: false, message: 'Bu paket üzerinde yetkin yok.' };
    }

    await repo.setPackageActive(packageId, nextActive, user.id);
    revalidatePath('/business/paketler');
    return actionSuccess(
      nextActive ? 'Paket yayına alındı.' : 'Paket rezervasyona kapatıldı.',
    );
  } catch (error) {
    return actionError(error);
  }
}

// ---------------------------------------------------------------------------
// Rezervasyon
// ---------------------------------------------------------------------------

export async function respondReservationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireBusinessMember();

  const parsed = respondReservationSchema.safeParse({
    reservationId: formData.get('reservationId'),
    decision: formData.get('decision'),
    ...(formData.get('rejectionReason')
      ? { rejectionReason: formData.get('rejectionReason') }
      : {}),
    note: formData.get('note') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const ctx = await getServiceContext();
    await respondToReservation(ctx, {
      reservationId: parsed.data.reservationId,
      actorId: user.id,
      decision: parsed.data.decision,
      ...(parsed.data.rejectionReason ? { rejectionReason: parsed.data.rejectionReason } : {}),
      note: parsed.data.note ?? null,
    });

    revalidatePath('/business/rezervasyonlar');
    return actionSuccess(
      parsed.data.decision === 'confirm'
        ? 'Rezervasyon onaylandı. Müşteriye bildirim gönderildi.'
        : 'Talep reddedildi ve müşteri alternatiflere yönlendirildi.',
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function completeReservationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireBusinessMember();
  const reservationId = String(formData.get('reservationId') ?? '');
  const noShow = formData.get('noShow') === 'true';

  try {
    const ctx = await getServiceContext();
    await completeReservation(ctx, { reservationId, actorId: user.id, noShow });
    revalidatePath('/business/rezervasyonlar');
    return actionSuccess(noShow ? 'Gelinmedi olarak işaretlendi.' : 'Rezervasyon tamamlandı.');
  } catch (error) {
    return actionError(error);
  }
}

export async function businessCancelReservationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireBusinessMember();

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
      byBusiness: true,
      reason: parsed.data.reason ?? null,
    });
    revalidatePath('/business/rezervasyonlar');
    return actionSuccess('Rezervasyon iptal edildi ve müşteri bilgilendirildi.');
  } catch (error) {
    return actionError(error);
  }
}

// ---------------------------------------------------------------------------
// Ekip
// ---------------------------------------------------------------------------

export async function addTeamMemberAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user, businessId, isOwner } = await requireBusinessMember();

  if (!isOwner) {
    return { ok: false, message: 'Ekip yönetimi yalnızca işletme sahibine açıktır.' };
  }

  const parsed = addTeamMemberSchema.safeParse({
    businessId,
    email: formData.get('email'),
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.addBusinessMember(businessId, parsed.data.email, user.id);
    revalidatePath('/business/calisanlar');
    return actionSuccess('Çalışan ekibine eklendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function removeTeamMemberAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user, businessId, isOwner } = await requireBusinessMember();
  if (!isOwner) {
    return { ok: false, message: 'Ekip yönetimi yalnızca işletme sahibine açıktır.' };
  }

  try {
    const repo = await getRepository();
    await repo.removeBusinessMember(businessId, String(formData.get('userId') ?? ''), user.id);
    revalidatePath('/business/calisanlar');
    return actionSuccess('Çalışan ekipten çıkarıldı.');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }
}

export async function goToBusinessPanelAction(): Promise<void> {
  await requireBusinessMember();
  redirect('/business');
}
