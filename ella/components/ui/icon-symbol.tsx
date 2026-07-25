import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'person.fill': 'person',
  'person.2.fill': 'people',
  'magnifyingglass': 'search',
  'qrcode': 'qr-code',
  'qrcode.viewfinder': 'qr-code-scanner',
  'faceid': 'face',
  'apple.logo': 'apple',
  'phone.fill': 'phone',
  'map.fill': 'map',
  'mappin.circle.fill': 'place',
  'location.fill': 'location-on',
  'star.fill': 'star',
  'star': 'star-border',
  'gift.fill': 'card-giftcard',
  'creditcard.fill': 'credit-card',
  'creditcard': 'credit-card',
  'bell.fill': 'notifications',
  'gearshape.fill': 'settings',
  'questionmark.circle.fill': 'help',
  'rectangle.portrait.and.arrow.right': 'logout',
  'heart.fill': 'favorite',
  'tag.fill': 'local-offer',
  'flame.fill': 'whatshot',
  'square.grid.2x2.fill': 'apps',
  'clock.fill': 'schedule',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.circle': 'check-circle-outline',
  'checkmark.circle.fill': 'check-circle',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'pencil': 'edit',
  'trash': 'delete-outline',
  'trash.fill': 'delete',
  'camera.fill': 'camera-alt',
  'storefront.fill': 'storefront',
  'building.2.fill': 'business',
  'square.and.arrow.up': 'ios-share',
  'square.and.arrow.down': 'file-download',
  'chart.bar': 'bar-chart',
  'person.2': 'people-outline',
  'gamecontroller': 'sports-esports',
  'crown': 'workspace-premium',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
