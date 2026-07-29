import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Button, Card, EmptyState, Field, LoadingCards, Txt } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { getRepository } from '@/data/repository';
import { useTheme } from '@/theme';
import { env } from '@/lib/env';

/** Yardım merkezi — aranabilir, kısa ve tek konulu makaleler. */
export default function HelpScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useAsync(async () => {
    const repo = await getRepository();
    return repo.listHelpArticles({ onlyPublic: true });
  }, []);

  if (isLoading && !data) {
    return (
      <ScrollView contentContainerStyle={{ padding: theme.spacing.base }}>
        <LoadingCards count={4} />
      </ScrollView>
    );
  }

  const articles = data ?? [];
  const normalized = query.trim().toLocaleLowerCase('tr-TR');
  const filtered = normalized
    ? articles.filter(
        (article) =>
          article.title.toLocaleLowerCase('tr-TR').includes(normalized) ||
          article.summary.toLocaleLowerCase('tr-TR').includes(normalized),
      )
    : articles;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.base, gap: theme.spacing.md }}>
      <Field
        label="Yardım konusu ara"
        value={query}
        onChangeText={setQuery}
        placeholder="Örnek: oy nasıl değiştirilir"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Sonuç bulunamadı"
          description="Farklı bir kelime deneyebilir veya tüm konulara göz atabilirsin."
          action={<Button title="Aramayı temizle" onPress={() => setQuery('')} />}
        />
      ) : (
        filtered.map((article) => (
          <Card key={article.id}>
            <Txt variant="caption" color="muted">
              {article.category}
            </Txt>
            <Txt variant="h3">{article.title}</Txt>
            <Txt variant="small" color="secondary">
              {article.summary}
            </Txt>

            {openId === article.id ? (
              <Txt variant="small" color="secondary" style={{ marginTop: 8 }}>
                {article.body.replace(/\*\*/g, '')}
              </Txt>
            ) : null}

            <Button
              title={openId === article.id ? 'Kapat' : 'Ayrıntılı yanıt'}
              variant="ghost"
              size="sm"
              onPress={() => setOpenId((current) => (current === article.id ? null : article.id))}
            />
          </Card>
        ))
      )}

      <Card flat>
        <Txt variant="bodyStrong">Aradığını bulamadın mı?</Txt>
        <Txt variant="small" color="secondary">
          Web sitesindeki yardım merkezinde daha fazla içerik bulabilirsin.
        </Txt>
        <Button
          title="Web sitesini aç"
          variant="secondary"
          onPress={() => Linking.openURL(`${env.siteUrl}/sss`)}
        />
      </Card>

      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  );
}
