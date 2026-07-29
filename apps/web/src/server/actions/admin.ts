'use server';

import { revalidatePath } from 'next/cache';
import {
  reviewApplicationSchema,
  suspendUserSchema,
  upsertCategorySchema,
  upsertCitySchema,
  upsertDistrictSchema,
} from '@hazirgrup/validation';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import {
  actionError,
  actionSuccess,
  actionValidationError,
  type ActionResult,
} from '@/server/actionResult';

/**
 * Yönetici paneli server action'ları.
 *
 * Her işlem `requireAdmin()` ile korunur ve `admin_logs` içine yazılır
 * (docs/SECURITY_MODEL.md §11).
 */

export async function reviewApplicationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/basvurular');

  const parsed = reviewApplicationSchema.safeParse({
    applicationId: formData.get('applicationId'),
    decision: formData.get('decision'),
    note: formData.get('note') ?? '',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.reviewApplication(
      parsed.data.applicationId,
      {
        status: parsed.data.decision,
        note: parsed.data.note ?? null,
        reviewerId: admin.id,
      },
      new Date().toISOString(),
    );

    revalidatePath('/admin/basvurular');
    revalidatePath('/admin');
    return actionSuccess(
      parsed.data.decision === 'approved'
        ? 'Başvuru onaylandı. İşletme oluşturuldu ve sahibi panele erişebilir.'
        : 'Başvuru reddedildi ve başvuru sahibi bilgilendirilecek.',
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function upsertCityAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/sehirler');

  const parsed = upsertCitySchema.safeParse({
    ...(formData.get('id') ? { id: String(formData.get('id')) } : {}),
    name: formData.get('name'),
    ...(formData.get('slug') ? { slug: String(formData.get('slug')) } : {}),
    intro: formData.get('intro') ?? '',
    isActive: formData.get('isActive') === 'on',
    isPublic: formData.get('isPublic') === 'on',
    isIndexable: formData.get('isIndexable') === 'on',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.upsertCity(parsed.data, admin.id);
    revalidatePath('/admin/sehirler');
    revalidatePath('/sehirler');
    return actionSuccess(
      parsed.data.id
        ? 'Şehir güncellendi.'
        : 'Yeni şehir eklendi. Aktif ettiğinde public sayfalarda görünmeye başlar.',
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function upsertDistrictAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/ilceler');

  const parsed = upsertDistrictSchema.safeParse({
    ...(formData.get('id') ? { id: String(formData.get('id')) } : {}),
    cityId: formData.get('cityId'),
    name: formData.get('name'),
    ...(formData.get('slug') ? { slug: String(formData.get('slug')) } : {}),
    intro: formData.get('intro') ?? '',
    isActive: formData.get('isActive') === 'on',
    isPublic: formData.get('isPublic') === 'on',
    isIndexable: formData.get('isIndexable') === 'on',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.upsertDistrict(parsed.data, admin.id);
    revalidatePath('/admin/ilceler');
    return actionSuccess(parsed.data.id ? 'İlçe güncellendi.' : 'Yeni ilçe eklendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function upsertCategoryAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/kategoriler');

  const parsed = upsertCategorySchema.safeParse({
    ...(formData.get('id') ? { id: String(formData.get('id')) } : {}),
    name: formData.get('name'),
    ...(formData.get('slug') ? { slug: String(formData.get('slug')) } : {}),
    icon: formData.get('icon') ?? 'tag',
    description: formData.get('description') ?? '',
    isActive: formData.get('isActive') === 'on',
    isIndexable: formData.get('isIndexable') === 'on',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  try {
    const repo = await getRepository();
    await repo.upsertCategory(parsed.data, admin.id);
    revalidatePath('/admin/kategoriler');
    revalidatePath('/kategoriler');
    return actionSuccess(parsed.data.id ? 'Kategori güncellendi.' : 'Yeni kategori eklendi.');
  } catch (error) {
    return actionError(error);
  }
}

export async function setPackageActiveAdminAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/paketler');
  const packageId = String(formData.get('packageId') ?? '');
  const nextActive = formData.get('isActive') === 'true';

  try {
    const repo = await getRepository();
    await repo.setPackageActive(packageId, nextActive, admin.id);
    revalidatePath('/admin/paketler');
    return actionSuccess(nextActive ? 'Paket yayına alındı.' : 'Paket pasife alındı.');
  } catch (error) {
    return actionError(error);
  }
}

export async function suspendUserAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/kullanicilar');

  const parsed = suspendUserSchema.safeParse({
    userId: formData.get('userId'),
    suspended: formData.get('suspended') === 'true',
  });
  if (!parsed.success) return actionValidationError(parsed.error);

  if (parsed.data.userId === admin.id) {
    return { ok: false, message: 'Kendi hesabını askıya alamazsın.' };
  }

  try {
    const repo = await getRepository();
    await repo.setUserSuspended(parsed.data.userId, parsed.data.suspended, admin.id);
    revalidatePath('/admin/kullanicilar');
    return actionSuccess(
      parsed.data.suspended ? 'Hesap askıya alındı.' : 'Hesap askıdan çıkarıldı.',
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function updateBusinessVerificationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin('/admin/isletmeler');
  const businessId = String(formData.get('businessId') ?? '');
  const status = String(formData.get('status') ?? '');

  if (!['verified', 'suspended', 'pending_review'].includes(status)) {
    return { ok: false, message: 'Geçersiz işletme durumu.' };
  }

  try {
    const repo = await getRepository();
    await repo.updateBusiness(
      businessId,
      {
        status: status as 'verified' | 'suspended' | 'pending_review',
        isPublic: status === 'verified',
        ...(status === 'verified'
          ? { verifiedAt: new Date().toISOString(), verifiedBy: admin.id }
          : {}),
      },
      admin.id,
    );
    revalidatePath('/admin/isletmeler');
    return actionSuccess('İşletme durumu güncellendi.');
  } catch (error) {
    return actionError(error);
  }
}
