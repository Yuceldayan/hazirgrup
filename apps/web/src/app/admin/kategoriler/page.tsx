import type { Metadata } from 'next';
import { ROUTES } from '@hazirgrup/core';
import { requireAdmin } from '@/server/auth';
import { getRepository } from '@/server/repository';
import { Badge, Card, LinkButton, SectionHeader } from '@/components/ui';
import { CategoryForm } from '../AdminForms';
import styles from '@/components/layout/layout.module.css';

export const metadata: Metadata = {
  title: 'Kategoriler | Yönetici',
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ duzenle?: string }>;
}) {
  await requireAdmin('/admin/kategoriler');
  const { duzenle } = await searchParams;

  const repo = await getRepository();
  const categories = await repo.listCategories();

  const rows = await Promise.all(
    categories.map(async (category) => ({
      category,
      summary: await repo.getPublicCategorySummary(category.slug),
    })),
  );

  const editing = duzenle ? (categories.find((c) => c.id === duzenle) ?? null) : null;

  return (
    <div>
      <header className={styles.panelHeader}>
        <h1 className={styles.panelTitle}>Kategoriler</h1>
        <p className={styles.panelSubtitle}>
          Yeni kategori ekleyebilirsin. Faz 1 kullanıcı arayüzünü gereksiz seçeneklerle
          doldurmamak için kategori sayısını sınırlı tutmak önerilir.
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          title={`Kategoriler (${categories.length})`}
          action={
            editing ? (
              <LinkButton href="/admin/kategoriler" variant="ghost" size="sm">
                Düzenlemeyi bırak
              </LinkButton>
            ) : undefined
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(({ category, summary }) => (
            <Card key={category.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge tone={category.isActive ? 'success' : 'neutral'}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <Badge tone={category.isIndexable ? 'brand' : 'warning'}>
                      {category.isIndexable ? 'İndekslenebilir' : 'noindex'}
                    </Badge>
                  </div>
                  <p style={{ fontWeight: 600, marginTop: 8 }}>{category.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <code>{ROUTES.category(category.slug)}</code> ·{' '}
                    {summary?.packageCount ?? 0} paket · {summary?.businessCount ?? 0} mekân
                  </p>
                </div>

                <LinkButton
                  href={`/admin/kategoriler?duzenle=${category.id}`}
                  size="sm"
                  variant="secondary"
                >
                  Düzenle
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <CategoryForm
        editing={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                icon: editing.icon,
                description: editing.description,
                isActive: editing.isActive,
                isIndexable: editing.isIndexable,
              }
            : null
        }
      />
    </div>
  );
}
