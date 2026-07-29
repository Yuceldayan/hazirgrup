'use client';

import { useActionState, useState } from 'react';
import { Alert, Button, Card } from '@/components/ui';
import { SubmitButton, TextArea, TextInput, Select } from '@/components/ui/form';
import {
  reviewApplicationAction,
  setPackageActiveAdminAction,
  suspendUserAction,
  updateBusinessVerificationAction,
  upsertCategoryAction,
  upsertCityAction,
  upsertDistrictAction,
} from '@/server/actions/admin';
import { EMPTY_ACTION_RESULT } from '@/lib/actionResult';
import styles from '@/components/ui/ui.module.css';

/** Başvuru inceleme (onay / gerekçeli ret). */
export function ApplicationReview({ applicationId }: { applicationId: string }) {
  const [state, formAction] = useActionState(reviewApplicationAction, EMPTY_ACTION_RESULT);
  const [mode, setMode] = useState<'idle' | 'reject'>('idle');

  return (
    <div style={{ marginTop: 12 }}>
      {state.message ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        </div>
      ) : null}

      {mode === 'idle' ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <form action={formAction}>
            <input type="hidden" name="applicationId" value={applicationId} />
            <input type="hidden" name="decision" value="approved" />
            <input type="hidden" name="note" value="Belgeler eksiksiz." />
            <SubmitButton size="sm" pendingLabel="Onaylanıyor…">
              Onayla ve işletmeyi oluştur
            </SubmitButton>
          </form>
          <Button type="button" size="sm" variant="secondary" onClick={() => setMode('reject')}>
            Reddet
          </Button>
        </div>
      ) : (
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="decision" value="rejected" />
          <TextArea
            label="Ret gerekçesi"
            name="note"
            required
            maxLength={400}
            hint="Başvuru sahibine gösterilir; eksikleri açıkça yaz."
            {...(state.fieldErrors?.note ? { error: state.fieldErrors.note } : {})}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <SubmitButton size="sm" variant="danger" pendingLabel="Gönderiliyor…">
              Reddet
            </SubmitButton>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode('idle')}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Şehir oluşturma / güncelleme. */
export function CityForm({
  editing,
}: {
  editing: {
    id: string;
    name: string;
    slug: string;
    intro: string | null;
    isActive: boolean;
    isPublic: boolean;
    isIndexable: boolean;
  } | null;
}) {
  const [state, formAction] = useActionState(upsertCityAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
        {editing ? `${editing.name} şehrini düzenle` : 'Yeni şehir ekle'}
      </h2>

      <form
        action={formAction}
        key={editing?.id ?? 'new'}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        {state.message ? (
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        ) : null}

        <TextInput
          label="Şehir adı"
          name="name"
          defaultValue={editing?.name ?? ''}
          required
          {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
        />

        <TextInput
          label="Adres (slug)"
          name="slug"
          defaultValue={editing?.slug ?? ''}
          placeholder="Boş bırakırsan addan üretilir"
          hint="Küçük harf, rakam ve tire. Örnek: hakkari"
          {...(state.fieldErrors?.slug ? { error: state.fieldErrors.slug } : {})}
        />

        <TextArea
          label="Şehir tanıtım metni"
          name="intro"
          defaultValue={editing?.intro ?? ''}
          maxLength={1000}
          hint="Şehir sayfasının başında görünür; SEO açısından özgün içerik önemlidir."
        />

        <div className={styles.choiceGroup}>
          <label className={styles.choice}>
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? false} />
            <span>Aktif (plan oluşturmada seçilebilir)</span>
          </label>
          <label className={styles.choice}>
            <input type="checkbox" name="isPublic" defaultChecked={editing?.isPublic ?? false} />
            <span>Public sayfada göster</span>
          </label>
          <label className={styles.choice}>
            <input
              type="checkbox"
              name="isIndexable"
              defaultChecked={editing?.isIndexable ?? true}
            />
            <span>Arama motorlarında indekslensin</span>
          </label>
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          İçerik eşiği ayrıca uygulanır: en az 3 aktif paket ve 1 doğrulanmış işletme yoksa
          sayfa indekslenmez.
        </p>

        <SubmitButton pendingLabel="Kaydediliyor…">
          {editing ? 'Şehri güncelle' : 'Şehri ekle'}
        </SubmitButton>
      </form>
    </Card>
  );
}

/** İlçe oluşturma / güncelleme. */
export function DistrictForm({
  cities,
  editing,
}: {
  cities: Array<{ id: string; name: string }>;
  editing: {
    id: string;
    cityId: string;
    name: string;
    slug: string;
    isActive: boolean;
    isPublic: boolean;
    isIndexable: boolean;
  } | null;
}) {
  const [state, formAction] = useActionState(upsertDistrictAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
        {editing ? `${editing.name} ilçesini düzenle` : 'Yeni ilçe ekle'}
      </h2>

      <form
        action={formAction}
        key={editing?.id ?? 'new'}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        {state.message ? (
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        ) : null}

        <Select
          label="Şehir"
          name="cityId"
          defaultValue={editing?.cityId ?? cities[0]?.id ?? ''}
          required
          options={cities.map((city) => ({ value: city.id, label: city.name }))}
        />

        <TextInput
          label="İlçe adı"
          name="name"
          defaultValue={editing?.name ?? ''}
          required
          {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
        />

        <TextInput
          label="Adres (slug)"
          name="slug"
          defaultValue={editing?.slug ?? ''}
          placeholder="Boş bırakırsan addan üretilir"
        />

        <div className={styles.choiceGroup}>
          <label className={styles.choice}>
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
            <span>Aktif</span>
          </label>
          <label className={styles.choice}>
            <input type="checkbox" name="isPublic" defaultChecked={editing?.isPublic ?? true} />
            <span>Public</span>
          </label>
          <label className={styles.choice}>
            <input
              type="checkbox"
              name="isIndexable"
              defaultChecked={editing?.isIndexable ?? true}
            />
            <span>İndekslensin</span>
          </label>
        </div>

        <SubmitButton pendingLabel="Kaydediliyor…">
          {editing ? 'İlçeyi güncelle' : 'İlçeyi ekle'}
        </SubmitButton>
      </form>
    </Card>
  );
}

/** Kategori oluşturma / güncelleme. */
export function CategoryForm({
  editing,
}: {
  editing: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string | null;
    isActive: boolean;
    isIndexable: boolean;
  } | null;
}) {
  const [state, formAction] = useActionState(upsertCategoryAction, EMPTY_ACTION_RESULT);

  return (
    <Card>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
        {editing ? `${editing.name} kategorisini düzenle` : 'Yeni kategori ekle'}
      </h2>

      <form
        action={formAction}
        key={editing?.id ?? 'new'}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        {state.message ? (
          <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
        ) : null}

        <TextInput
          label="Kategori adı"
          name="name"
          defaultValue={editing?.name ?? ''}
          required
          {...(state.fieldErrors?.name ? { error: state.fieldErrors.name } : {})}
        />
        <TextInput label="Adres (slug)" name="slug" defaultValue={editing?.slug ?? ''} />
        <TextInput label="İkon anahtarı" name="icon" defaultValue={editing?.icon ?? 'tag'} />
        <TextArea
          label="Açıklama"
          name="description"
          defaultValue={editing?.description ?? ''}
          maxLength={500}
        />

        <div className={styles.choiceGroup}>
          <label className={styles.choice}>
            <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} />
            <span>Aktif</span>
          </label>
          <label className={styles.choice}>
            <input
              type="checkbox"
              name="isIndexable"
              defaultChecked={editing?.isIndexable ?? true}
            />
            <span>İndekslensin</span>
          </label>
        </div>

        <SubmitButton pendingLabel="Kaydediliyor…">
          {editing ? 'Kategoriyi güncelle' : 'Kategoriyi ekle'}
        </SubmitButton>
      </form>
    </Card>
  );
}

/** Paket pasife alma / yayına alma (yönetici denetimi). */
export function AdminPackageToggle({
  packageId,
  isActive,
}: {
  packageId: string;
  isActive: boolean;
}) {
  const [state, formAction] = useActionState(setPackageActiveAdminAction, EMPTY_ACTION_RESULT);

  return (
    <form action={formAction} style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <input type="hidden" name="packageId" value={packageId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <SubmitButton size="sm" variant={isActive ? 'secondary' : 'primary'} pendingLabel="…">
        {isActive ? 'Pasife al' : 'Yayına al'}
      </SubmitButton>
      {state.message && !state.ok ? (
        <span style={{ fontSize: 12, color: 'var(--color-danger-text)' }}>{state.message}</span>
      ) : null}
    </form>
  );
}

/** Kullanıcı askıya alma. */
export function SuspendUserButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const [state, formAction] = useActionState(suspendUserAction, EMPTY_ACTION_RESULT);

  return (
    <form action={formAction} style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="suspended" value={String(!suspended)} />
      <SubmitButton size="sm" variant={suspended ? 'primary' : 'secondary'} pendingLabel="…">
        {suspended ? 'Askıdan çıkar' : 'Askıya al'}
      </SubmitButton>
      {state.message && !state.ok ? (
        <span style={{ fontSize: 12, color: 'var(--color-danger-text)' }}>{state.message}</span>
      ) : null}
    </form>
  );
}

/** İşletme doğrulama durumu değiştirme. */
export function BusinessStatusForm({
  businessId,
  status,
}: {
  businessId: string;
  status: string;
}) {
  const [state, formAction] = useActionState(
    updateBusinessVerificationAction,
    EMPTY_ACTION_RESULT,
  );

  return (
    <form action={formAction} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input type="hidden" name="businessId" value={businessId} />
      {status !== 'verified' ? (
        <SubmitButton size="sm" name="status" value="verified" pendingLabel="…">
          Doğrula
        </SubmitButton>
      ) : (
        <SubmitButton size="sm" variant="secondary" name="status" value="suspended" pendingLabel="…">
          Askıya al
        </SubmitButton>
      )}
      {state.message && !state.ok ? (
        <span style={{ fontSize: 12, color: 'var(--color-danger-text)' }}>{state.message}</span>
      ) : null}
    </form>
  );
}
