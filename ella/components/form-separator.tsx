import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export function FormSeparator() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <ThemedText style={styles.text}>or</ThemedText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  text: {
    fontSize: 14,
    opacity: 0.6,
  },
});
