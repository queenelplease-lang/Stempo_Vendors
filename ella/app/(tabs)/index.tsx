import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getNews } from '@/lib/api/services/newsService';
import { News } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { isAuthenticated } = useRequireAuth();
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const result = await getNews(1, 50);
      setNews(result.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('news.error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNews();
    }
  }, [isAuthenticated, loadNews]);

  const formatDate = useCallback(
    (value?: string) => {
      if (!value) return '';
      return new Date(value).toLocaleDateString(
        currentLanguage === 'he' ? 'he-IL' : 'en-US',
        { day: 'numeric', month: 'short', year: 'numeric' },
      );
    },
    [currentLanguage],
  );

  const renderItem = useCallback(
    ({ item }: { item: News }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/news/${item.id}` as any)}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.tint + '22' }]} />
        )}
        <View style={styles.cardBody}>
          <ThemedText type="subtitle" style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.cardDate}>
            {formatDate(item.publishedAt || item.createdAt)}
          </ThemedText>
          <ThemedText style={styles.cardExcerpt} numberOfLines={3}>
            {item.content}
          </ThemedText>
        </View>
      </TouchableOpacity>
    ),
    [colors.tint, formatDate, router],
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <ThemedText type="title">{t('news.title')}</ThemedText>
        <ThemedText style={styles.subtitle}>{t('news.subtitle')}</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={() => loadNews()}>
            <ThemedText style={{ color: colors.tint }}>{t('common.retry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            news.length === 0 && styles.centered,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadNews(true)}
              tintColor={colors.tint}
            />
          }
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>{t('news.empty')}</ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.6,
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F7F7F8',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 120,
  },
  cardBody: {
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
  },
  cardDate: {
    fontSize: 13,
    opacity: 0.55,
  },
  cardExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
