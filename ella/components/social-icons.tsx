import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SocialIconsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onPhonePress?: () => void;
}

export function SocialIcons({ onGooglePress, onApplePress, onPhonePress }: SocialIconsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {onGooglePress && (
        <TouchableOpacity 
          style={[styles.icon, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1 }]}
          onPress={onGooglePress}
        >
          <ThemedText style={styles.googleIcon}>G</ThemedText>
        </TouchableOpacity>
      )}
      {onApplePress && (
        <TouchableOpacity 
          style={[styles.icon, { backgroundColor: '#000000' }]}
          onPress={onApplePress}
        >
          <IconSymbol name="apple.logo" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      {onPhonePress && (
        <TouchableOpacity 
          style={[styles.icon, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1 }]}
          onPress={onPhonePress}
        >
          <IconSymbol name="phone.fill" size={24} color={colors.tint} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4285F4',
  },
});
