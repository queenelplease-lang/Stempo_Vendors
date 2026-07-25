import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslation } from '@/hooks/use-translation';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import { Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { redeemBonus } from '@/lib/api/services/bonusRedemptionsService';
import {
  addStamp as addStampThunk,
  createLoyaltyCard,
  getLoyaltyCardsByBusiness,
} from '@/lib/api/services/loyaltyCardsService';
import { getMyBusinessPrograms } from '@/lib/api/services/bonusProgramsService';
import { useRestaurantRole } from '@/hooks/use-restaurant-role';

interface QRCodeData {
  businessId?: string;
  programId?: string;
  businessName?: string;
  programName?: string;
}

function ScanQRScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const collectStampForBusiness = async (businessId: string | number) => {
    const businessIdStr = String(businessId);
    const cardsResult = await dispatch(getLoyaltyCardsByBusiness(businessIdStr));
    let cardId: string | number | undefined;

    if (getLoyaltyCardsByBusiness.fulfilled.match(cardsResult) && cardsResult.payload.length > 0) {
      cardId = cardsResult.payload[0].id;
    } else {
      const createResult = await dispatch(createLoyaltyCard({ businessId: businessIdStr }));
      if (!createLoyaltyCard.fulfilled.match(createResult)) {
        throw new Error(
          typeof createResult.payload === 'string'
            ? createResult.payload
            : t('errors.unknownError'),
        );
      }
      cardId = createResult.payload.id;
    }

    const stampResult = await dispatch(addStampThunk(String(cardId)));
    if (!addStampThunk.fulfilled.match(stampResult)) {
      throw new Error(
        typeof stampResult.payload === 'string'
          ? stampResult.payload
          : t('errors.unknownError'),
      );
    }

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(t('common.success'), t('qr.stampCollected'), [
      { text: t('common.ok'), onPress: () => router.push('/bonuses' as any) },
    ]);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;

    setIsProcessing(true);
    setScanned(true);

    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Hex string: backend QR code or redemption code
      if (/^[0-9a-f]{32,}$/i.test(data.trim())) {
        try {
          const { validateQRCode } = await import('@/lib/api/services/qrCodeService');
          const validatedQR = await validateQRCode(data.trim());

          Alert.alert(
            t('qr.qrScanned'),
            t('qr.addStampConfirm'),
            [
              {
                text: t('common.cancel'),
                style: 'cancel',
                onPress: () => {
                  setScanned(false);
                  setIsProcessing(false);
                },
              },
              {
                text: t('qr.addStamp'),
                onPress: async () => {
                  try {
                    await collectStampForBusiness(validatedQR.businessId);
                  } catch (err) {
                    Alert.alert(
                      t('common.error'),
                      err instanceof Error ? err.message : t('errors.unknownError'),
                    );
                  } finally {
                    setScanned(false);
                    setIsProcessing(false);
                  }
                },
              },
            ],
          );
          return;
        } catch {
          Alert.alert(
            t('qr.redeemBonus'),
            t('qr.redeemConfirm'),
            [
              {
                text: t('common.cancel'),
                style: 'cancel',
                onPress: () => {
                  setScanned(false);
                  setIsProcessing(false);
                },
              },
              {
                text: t('bonuses.useBonus'),
                onPress: async () => {
                  await redeemBonusCode(data.trim());
                  setScanned(false);
                  setIsProcessing(false);
                },
              },
            ],
          );
          return;
        }
      }

      // Legacy JSON QR codes
      let qrData: QRCodeData;
      try {
        qrData = JSON.parse(data);
      } catch {
        Alert.alert(t('qr.invalidQR'), t('qr.invalidQRMessage'));
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      if (qrData.businessId || qrData.programId) {
        const businessId = qrData.businessId || qrData.programId;

        Alert.alert(
          t('qr.qrScanned'),
          t('qr.addStampConfirm'),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              },
            },
            {
              text: t('qr.addStamp'),
              onPress: async () => {
                try {
                  await collectStampForBusiness(businessId!);
                } catch (err) {
                  Alert.alert(
                    t('common.error'),
                    err instanceof Error ? err.message : t('errors.unknownError'),
                  );
                } finally {
                  setScanned(false);
                  setIsProcessing(false);
                }
              },
            },
          ],
        );
      } else {
        Alert.alert(t('qr.invalidQR'), t('qr.invalidQRMessage'));
        setScanned(false);
        setIsProcessing(false);
      }
    } catch {
      Alert.alert(t('common.error'), t('errors.unknownError'));
      setScanned(false);
      setIsProcessing(false);
    }
  };

  const redeemBonusCode = async (code: string) => {
    try {
      const result = await dispatch(redeemBonus(code));
      if (redeemBonus.fulfilled.match(result)) {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert(t('common.success'), t('qr.redemptionSuccess'));
      } else {
        Alert.alert(t('common.error'), result.payload || t('errors.unknownError'));
      }
    } catch {
      Alert.alert(t('common.error'), t('errors.unknownError'));
    }
  };

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        t('qr.cameraPermissionRequired'),
        t('qr.cameraPermissionDenied'),
        [{ text: t('common.ok') }],
      );
    }
  }, [permission, t]);

  if (!permission) {
    return (
      <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <IconSymbol name="camera.fill" size={64} color={colors.icon} />
          <ThemedText style={styles.title}>{t('qr.cameraPermissionRequired')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('qr.cameraPermissionDescription')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={requestPermission}
          >
            <ThemedText style={styles.buttonText}>{t('qr.grantPermission')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container} lightColor="#000000" darkColor="#000000">
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>{t('qr.scanQR')}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {t('qr.positionQR')}
            </ThemedText>
          </View>

          <View style={styles.scanArea}>
            <View style={[styles.scanFrame, { borderColor: colors.tint }]}>
              <View style={[styles.corner, styles.topLeft, { borderColor: colors.tint }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: colors.tint }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.tint }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: colors.tint }]} />
            </View>
          </View>

          <View style={styles.footer}>
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.processingText}>{t('qr.processing')}</ThemedText>
              </View>
            )}
            {!isProcessing && (
              <ThemedText style={styles.footerText}>
                {t('qr.positionQR')}
              </ThemedText>
            )}
          </View>
        </View>
      </CameraView>
    </ThemedView>
  );
}

function GenerateQRScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const myBusiness = useAppSelector((state) => state.app.myBusiness);
  const myBusinessPrograms = useAppSelector((state) => state.bonusPrograms.myBusinessPrograms);
  const [selectedProgram, setSelectedProgram] = useState<string | number | null>(
    myBusinessPrograms.length > 0 ? myBusinessPrograms[0].id ?? null : null
  );
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (myBusiness?.id) {
      dispatch(getMyBusinessPrograms(myBusiness.id));
    }
  }, [dispatch, myBusiness?.id]);

  // Update selectedProgram when programs change
  useEffect(() => {
    if (myBusinessPrograms.length > 0 && !selectedProgram) {
      setSelectedProgram(myBusinessPrograms[0].id ?? null);
    } else if (myBusinessPrograms.length === 0) {
      setSelectedProgram(null);
      setQrCode(null);
    } else if (selectedProgram && !myBusinessPrograms.some(p => String(p.id) === String(selectedProgram))) {
      setSelectedProgram(myBusinessPrograms[0].id ?? null);
      setQrCode(null);
    }
  }, [myBusinessPrograms, selectedProgram]);

  const handleGenerateQR = async () => {
    if (!selectedProgram) {
      Alert.alert(t('common.error'), t('qr.selectProgram'));
      return;
    }

    const selectedProgramData = myBusinessPrograms.find((p) => String(p.id) === String(selectedProgram));
    if (!selectedProgramData) {
      Alert.alert(t('common.error'), t('qr.selectProgram'));
      return;
    }

    setIsGenerating(true);
    try {
      const { generateQRCode } = await import('@/lib/api/services/qrCodeService');
      const programId = typeof selectedProgram === 'string' ? parseInt(selectedProgram, 10) : selectedProgram;
      const qrType = selectedProgramData.qrCodeType || 'permanent';

      const generatedQR = await generateQRCode({
        programId,
        type: qrType,
      });

      setQrCode(generatedQR.code);
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('errors.unknownError'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!myBusiness) {
    return (
      <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <IconSymbol name="storefront.fill" size={64} color={colors.icon} />
          <ThemedText style={styles.title}>{t('restaurant.notFound')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('restaurant.error')}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const selectedProgramData = myBusinessPrograms.find((p) => String(p.id) === String(selectedProgram));
  // Use backend-generated QR code if available, otherwise use JSON format for compatibility
  const qrString = qrCode || (selectedProgramData ? JSON.stringify({
    businessId: myBusiness.id,
    programId: selectedProgramData.id,
    businessName: myBusiness.name,
    programName: selectedProgramData.name,
  }) : '');

  const handleSaveQR = async () => {
    try {
      if (!viewShotRef.current?.capture) return;

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('qr.cameraPermissionDenied'));
        return;
      }

      const uri = await viewShotRef.current.capture();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Stempo QR Codes', asset, false);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(t('common.success'), t('qr.savedToGallery'));
    } catch {
      Alert.alert(t('common.error'), t('qr.saveFailed'));
    }
  };

  const handleShareQR = async () => {
    try {
      if (!viewShotRef.current?.capture) return;

      const uri = await viewShotRef.current.capture();

      await Share.share({
        message: t('qr.shareMessage') + ` ${myBusiness.name}!`,
        url: uri,
      });
    } catch {
      Alert.alert(t('common.error'), t('qr.shareFailed'));
    }
  };

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <ScrollView
        contentContainerStyle={[
          styles.generateContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.generateHeader}>
          <ThemedText style={styles.generateTitle}>{t('qr.generateQR')}</ThemedText>
          <ThemedText style={styles.generateSubtitle}>
            {t('qr.qrDescription')}
          </ThemedText>
        </View>

        <View style={styles.businessInfo}>
          <ThemedText style={styles.businessName}>{myBusiness.name}</ThemedText>
          <ThemedText style={styles.businessCategory}>{myBusiness.category}</ThemedText>
        </View>

        {myBusinessPrograms.length > 0 ? (
          <>
            <View style={styles.programSelector}>
              <ThemedText style={styles.selectorLabel}>{t('qr.selectProgram')}</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.programButtons}>
                  {myBusinessPrograms.map((program) => (
                    <TouchableOpacity
                      key={program.id}
                      style={[
                        styles.programButton,
                        {
                          backgroundColor:
                            String(selectedProgram) === String(program.id) ? colors.tint + '20' : '#F3F4F6',
                          borderColor:
                            String(selectedProgram) === String(program.id) ? colors.tint : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedProgram(program.id)}
                    >
                      <ThemedText
                        style={[
                          styles.programButtonText,
                          {
                            color: String(selectedProgram) === String(program.id) ? colors.tint : colors.text,
                            fontWeight: String(selectedProgram) === String(program.id) ? '600' : '400',
                          },
                        ]}
                      >
                        {program.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {selectedProgramData && (
              <>
                <View style={styles.programInfo}>
                  <ThemedText style={styles.programInfoLabel}>
                    {selectedProgramData.pointsRequired} {t('bonuses.stamps')}
                  </ThemedText>
                  <ThemedText style={styles.programInfoValue}>
                    {selectedProgramData.discount}
                    {selectedProgramData.discountType === 'percentage' ? '%' : ' $'}
                  </ThemedText>
                </View>
                {!qrCode && (
                  <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: colors.tint }]}
                    onPress={handleGenerateQR}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <ThemedText style={styles.generateButtonText}>{t('qr.generate')}</ThemedText>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        ) : (
          <View style={styles.noPrograms}>
            <ThemedText style={styles.noProgramsText}>
              {t('business.noProgramsAvailable')}
            </ThemedText>
          </View>
        )}

        <View style={styles.qrContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
            <View style={[styles.qrWrapper, { borderColor: colors.tint + '40' }]}>
              <QRCode
                value={qrString}
                size={250}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
          </ViewShot>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton, { borderColor: colors.tint }]}
            onPress={handleShareQR}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color={colors.tint} />
            <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
              Share
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSaveQR}
          >
            <IconSymbol name="square.and.arrow.down" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

export default function ScanScreen() {
  const { isAuthenticated } = useRequireAuth();
  const isBusinessOwner = useAppSelector((state) => state.app.isBusinessOwner);
  const { syncRestaurantRole } = useRestaurantRole();

  useEffect(() => {
    if (isAuthenticated) {
      syncRestaurantRole();
    }
  }, [isAuthenticated, syncRestaurantRole]);

  if (!isAuthenticated) {
    return null;
  }

  if (isBusinessOwner) {
    return <GenerateQRScreen />;
  }

  return <ScanQRScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: 20,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  generateContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  generateHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  generateTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  generateSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  businessInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    opacity: 0.6,
    textTransform: 'capitalize',
  },
  programSelector: {
    width: '100%',
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  programButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  programButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  programButtonText: {
    fontSize: 14,
  },
  programInfo: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  programInfoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  programInfoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  noPrograms: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 32,
  },
  noProgramsText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  qrContainer: {
    marginBottom: 32,
  },
  qrWrapper: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  shareButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {},
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formSection: {
    width: '100%',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  generateButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
