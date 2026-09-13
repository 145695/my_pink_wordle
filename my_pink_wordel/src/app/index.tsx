import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

function Flower({ size = 56, color = '#f9dcee' }: { size?: number; color?: string }) {
  const r = size / 4;
  const cx = size / 2;
  const cy = size / 2;
  const offset = r * 0.9;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy - offset} r={r} fill={color} />
      <Circle cx={cx + offset} cy={cy} r={r} fill={color} />
      <Circle cx={cx} cy={cy + offset} r={r} fill={color} />
      <Circle cx={cx - offset} cy={cy} r={r} fill={color} />
      <Circle cx={cx} cy={cy} r={r * 0.75} fill={color} opacity={0.6} />
    </Svg>
  );
}


const FLOWER_LAYOUT = [
  { side: 'left', top: '8%', size: 48 },
  { side: 'left', top: '32%', size: 64 },
  { side: 'left', top: '58%', size: 44 },
  { side: 'left', top: '82%', size: 56 },
  { side: 'right', top: '15%', size: 52 },
  { side: 'right', top: '40%', size: 40 },
  { side: 'right', top: '65%', size: 60 },
  { side: 'right', top: '88%', size: 46 },
] as const;

function FlowerButton({
  size = 160,
  color = '#6F826A',
  petalCount = 6,
  onPress,
  children,
}: {
  size?: number;
  color?: string;
  petalCount?: number;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const r = size / 4;
  const cx = size / 2;
  const cy = size / 2;
  const offset = r * 0.95;

  const petals = Array.from({ length: petalCount }).map((_, i) => {
    const angle = (2 * Math.PI * i) / petalCount;
    const px = cx + offset * Math.cos(angle);
    const py = cy + offset * Math.sin(angle);
    return { px, py, key: i };
  });

  return (
     <Pressable onPress={onPress} style={[{ width: size, height: size }, styles.flowerShadow]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFill}
      >
        {petals.map((p) => (
          <Circle key={p.key} cx={p.px} cy={p.py} r={r} fill={color} />
        ))}
        <Circle cx={cx} cy={cy} r={r * 0.85} fill={color} />
      </Svg>
      <View style={styles.flowerButtonLabel}>{children}</View>
    </Pressable>
  );
}
export default function HomeScreen() {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    float.start();
    return () => float.stop();
  }, [floatAnim]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.flowerLayer} pointerEvents="none">
        {FLOWER_LAYOUT.map((f, i) => (
          <View
            key={i}
            style={[
              styles.flowerWrap,
              f.side === 'left' ? { left: 4 } : { right: 4 },
              { top: f.top },
            ]}
          >
            <Flower size={f.size} />
          </View>
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
           <FlowerButton petalCount={6} onPress={() => router.push('/game')}>
            <ThemedText type="title" style={styles.playButtonText}>
              Start
            </ThemedText>
          </FlowerButton>
          </Animated.View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#e8bedb',
  },
  flowerButtonLabel: {
  ...StyleSheet.absoluteFill,
  alignItems: 'center',
  justifyContent: 'center',
},
flowerShadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 8, // Android
},
  flowerLayer: {
    ...StyleSheet.absoluteFill,
  },
  flowerWrap: {
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  playButton: {
    backgroundColor: '#6F826A',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 30,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#e8bedb',
  },
});