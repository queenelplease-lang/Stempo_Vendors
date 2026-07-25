import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export function AuthLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
        <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
        <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
        <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
      </View>
      <ThemedText style={styles.text}>STEMPO</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    height: 60,
    gap: 4,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 2,
  },
});
