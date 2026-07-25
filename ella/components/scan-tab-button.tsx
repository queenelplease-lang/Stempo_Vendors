import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  type GestureResponderEvent,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/lib/store/hooks';
import * as Haptics from 'expo-haptics';

export function ScanTabButton({ onPress, accessibilityLabel }: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isBusinessOwner = useAppSelector((state) => state.app.isBusinessOwner);

  const handlePress = (event: GestureResponderEvent) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? undefined}
      style={[styles.button, { backgroundColor: colors.tint }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <IconSymbol
        name={isBusinessOwner ? 'qrcode' : 'qrcode.viewfinder'}
        size={24}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'center',
  },
});
