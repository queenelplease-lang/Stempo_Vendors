import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { BonusProgram } from '@/types/bonus';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';

interface BonusProgramCardProps {
  program: BonusProgram;
}

const STATUS_COLORS: Record<BonusProgram['status'], string> = {
  active: '#10B981',
  approved: '#10B981',
  pending: '#F59E0B',
  rejected: '#EF4444',
  expired: '#6B7280',
};

export function BonusProgramCard({ program }: BonusProgramCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const getStatusColor = () => STATUS_COLORS[program.status] ?? colors.icon;

  const getStatusText = () => t(`programs.${program.status}`).toUpperCase();

  const getBusinessName = () => program.cafeName || program.business?.name || t('business.business');

  const getDiscountText = () => {
    if (program.discountType === 'percentage') {
      return `${program.discount}% OFF`;
    }
    return `$${program.discount} OFF`;
  };

  const progressData = program.userProgress;

  const getProgressText = () => {
    if (!progressData) return null;
    const label =
      progressData.type === 'stamps' ? t('bonuses.stamps') : t('bonuses.points');
    return `${progressData.current}/${progressData.required} ${label}`;
  };

  const progress = progressData
    ? Math.min((progressData.current / progressData.required) * 100, 100)
    : 0;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="defaultSemiBold" style={styles.cafeName}>
            {getBusinessName()}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.programName}>
            {program.name}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.description}>{program.description}</ThemedText>

      {progressData && (
        <View style={styles.pointsContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%`, backgroundColor: colors.tint }
              ]} 
            />
          </View>
          <ThemedText style={styles.pointsText}>{getProgressText()}</ThemedText>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.discountBadge}>
          <ThemedText style={styles.discountText}>{getDiscountText()}</ThemedText>
        </View>
        {program.expiresAt && (
          <ThemedText style={styles.expiresText}>
            Expires: {new Date(program.expiresAt).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  cafeName: {
    fontSize: 12,
    opacity: 0.7,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  pointsContainer: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  discountBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expiresText: {
    fontSize: 11,
    opacity: 0.6,
  },
});

