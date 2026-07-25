import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { getNewsById } from '@/lib/api/services/newsService';
import { News } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const item = await getNewsById(id);
        if (!cancelled) {
          setNews(item);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('news.error'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const dateLabel = news
    ? new Date(news.publishedAt || news.createdAt).toLocaleDateString(
        currentLanguage === 'he' ? 'he-IL' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' },
      )
    : '';

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
          <ThemedText style={styles.backLabel}>{t('common.back')}</ThemedText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error || !news ? (
        <View style={styles.centered}>
          <ThemedText>{error || t('news.notFound')}</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {news.imageUrl ? (
            <Image source={{ uri: news.imageUrl }} style={styles.image} />
          ) : null}
          <ThemedText type="title" style={styles.title}>
            {news.title}
          </ThemedText>
          <ThemedText style={styles.date}>{dateLabel}</ThemedText>
          <ThemedText style={styles.body}>{news.content}</ThemedText>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  backLabel: {
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  date: {
    opacity: 0.55,
    marginBottom: 20,
    fontSize: 14,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
  },
});
