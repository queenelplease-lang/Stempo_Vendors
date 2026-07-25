import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { LoyaltyCard as LoyaltyCardType } from '@/types/bonus';
import { useAppDispatch } from '@/lib/store/hooks';
import { generateRedemptionCode } from '@/lib/api/services/bonusRedemptionsService';
import { getLoyaltyCards } from '@/lib/api/services/loyaltyCardsService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

interface LoyaltyCardProps {
  card: LoyaltyCardType;
}

const REDEMPTION_WINDOW_SECONDS = 60;

export function LoyaltyCard({ card }: LoyaltyCardProps) {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [showQRModal, setShowQRModal] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(REDEMPTION_WINDOW_SECONDS);

  const progress = Math.min((card.stamps / card.stampsRequired) * 100, 100);
  const remaining = Math.max(card.stampsRequired - card.stamps, 0);
  const canUse = card.stamps >= card.stampsRequired;

  useEffect(() => {
    if (!showQRModal || !redemptionCode) return;
    setTimeRemaining(REDEMPTION_WINDOW_SECONDS);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowQRModal(false);
          setRedemptionCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showQRModal, redemptionCode]);

  const handleUseBonus = async () => {
    if (!canUse) {
      Alert.alert(t('bonuses.notEnoughStamps'), t('bonuses.needMoreStamps', { count: remaining }));
      return;
    }

    setIsGenerating(true);
    try {
      const result = await dispatch(generateRedemptionCode(String(card.id)));
      if (generateRedemptionCode.fulfilled.match(result)) {
        setRedemptionCode(result.payload.code);
        setShowQRModal(true);
      } else {
        Alert.alert(t('common.error'), result.payload || t('errors.unknownError'));
      }
    } catch {
      Alert.alert(t('common.error'), t('errors.unknownError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setRedemptionCode(null);
    setTimeRemaining(REDEMPTION_WINDOW_SECONDS);
    dispatch(getLoyaltyCards());
  };

  return (
    <>
      <ThemedView style={styles.card} lightColor="#FFFFFF" darkColor="#FFFFFF">
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: card.iconColor + '20' }]}>
            <ThemedText style={styles.icon}>{card.icon}</ThemedText>
          </View>
          <View style={styles.info}>
            <ThemedText type="defaultSemiBold" style={styles.businessName}>
              {card.businessName}
            </ThemedText>
            <ThemedText style={styles.category}>{card.category}</ThemedText>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%`, backgroundColor: card.progressColor }
                  ]} 
                />
              </View>
              <ThemedText style={styles.remainingText}>
                {remaining > 0
                  ? t('bonuses.moreToEarn', { count: remaining })
                  : t('bonuses.readyToUse')}
              </ThemedText>
            </View>
          </View>
          <View style={styles.stampsContainer}>
            <ThemedText type="defaultSemiBold" style={styles.stampsCount}>
              {card.stamps}/{card.stampsRequired}
            </ThemedText>
            <ThemedText style={styles.stampsLabel}>{t('bonuses.stamps')}</ThemedText>
          </View>
        </View>
        {canUse && (
          <TouchableOpacity
            style={[styles.useButton, { backgroundColor: colors.tint }]}
            onPress={handleUseBonus}
            disabled={isGenerating}
          >
            <ThemedText style={styles.useButtonText}>
              {isGenerating ? t('qr.generating') : t('bonuses.useBonus')}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <ThemedView
          style={styles.modalOverlay}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(0,0,0,0.8)"
        >
          <ThemedView style={styles.modalContent} lightColor="#FFFFFF" darkColor="#1C1C1E">
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t('qr.showStaff')}</ThemedText>
              <TouchableOpacity onPress={handleCloseModal}>
                <IconSymbol name="xmark" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              {redemptionCode && (
                <QRCode
                  value={redemptionCode}
                  size={250}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              )}
            </View>

            <ThemedText style={styles.timerText}>
              {timeRemaining > 0
                ? t('qr.expiresInSeconds', { seconds: timeRemaining })
                : t('qr.expired')}
            </ThemedText>

            <ThemedText style={styles.modalSubtitle}>{t('qr.showThisQR')}</ThemedText>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.tint }]}
              onPress={handleCloseModal}
            >
              <ThemedText style={styles.closeButtonText}>{t('common.close')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
    opacity: 0.6,
  },
  stampsContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  stampsCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  stampsLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  useButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
