import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getRestaurant } from '@/lib/api/services/restaurantService';
import { Business } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isAuthenticated } = useRequireAuth();
  const [restaurant, setRestaurant] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const data = await getRestaurant();
      setRestaurant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('restaurant.error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated, load]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      {isLoading ? (
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error || !restaurant ? (
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ThemedText>{error || t('restaurant.notFound')}</ThemedText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => load(true)}
              tintColor={colors.tint}
            />
          }
        >
          {restaurant.imageUrl ? (
            <Image source={{ uri: restaurant.imageUrl }} style={styles.hero} />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: colors.tint + '22' }]}>
              <ThemedText type="title" style={{ color: colors.tint }}>
                {restaurant.name}
              </ThemedText>
            </View>
          )}

          <ThemedText type="title" style={styles.name}>
            {restaurant.name}
          </ThemedText>

          <View style={styles.metaRow}>
            <ThemedText style={styles.meta}>
              {restaurant.isOpen ? t('restaurant.open') : t('restaurant.closed')}
            </ThemedText>
            {restaurant.category ? (
              <ThemedText style={styles.meta}>· {restaurant.category}</ThemedText>
            ) : null}
          </View>

          {restaurant.address ? (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('restaurant.address')}
              </ThemedText>
              <ThemedText style={styles.sectionBody}>{restaurant.address}</ThemedText>
            </View>
          ) : null}

          {restaurant.description ? (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('restaurant.about')}
              </ThemedText>
              <ThemedText style={styles.sectionBody}>{restaurant.description}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  hero: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  name: {
    fontSize: 30,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  meta: {
    opacity: 0.6,
    fontSize: 15,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
  },
});
