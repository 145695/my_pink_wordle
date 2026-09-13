import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import type { LetterStatus } from '@/service/game_logic';

interface KeyboardProps {
  onKeyPress: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyStatuses: Record<string, LetterStatus>;
  disabled?: boolean;
}

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];

function getCellStyle(status: LetterStatus | undefined) {
  switch (status) {
    case 'correct': return styles.keyCorrect;
    case 'present': return styles.keyPresent;
    case 'absent': return styles.keyAbsent;
    default: return styles.keyDefault;
  }
}

function getTextStyle(status: LetterStatus | undefined) {
  return status && status !== 'empty' ? styles.keyTextOnColor : undefined;
}

export default function Keyboard({ onKeyPress, onEnter, onBackspace, keyStatuses, disabled }: KeyboardProps) {
  const { width } = useWindowDimensions();
 const typeSound = useAudioPlayer(require('../../../assets/audio/drop_002.ogg'));

  const handlePress = (key: string) => {
    if (disabled) return;
    if (key === 'enter') return onEnter();
    if (key === 'backspace') return onBackspace();

    typeSound.seekTo(0);
    typeSound.play();
    onKeyPress(key);
  };

  const gap = 6;
  const horizontalPadding = 8;
  const availableWidth = width - horizontalPadding * 2;
  const unit = (availableWidth - gap * 9) / 10;

  return (
    <View style={[styles.keyboard, { paddingHorizontal: horizontalPadding }]}>
      {ROWS.map((row, rowIndex) => (
        <View style={[styles.keyboardRow, { gap }]} key={rowIndex}>
          {row.map((key) => {
            const isWide = key === 'enter' || key === 'backspace';
            const status = keyStatuses[key];
            const keyWidth = isWide ? unit * 1.5 + gap * 0.5 : unit;

            return (
              <Pressable
                key={key}
                onPress={() => handlePress(key)}
                disabled={disabled}
                android_ripple={{ color: '#e0e0e0', borderless: false }}
                style={({ pressed }) => [
                  styles.key,
                  { width: keyWidth },
                  getCellStyle(status),
                  pressed && styles.keyPressed,
                  disabled && styles.keyDisabled,
                ]}
                accessibilityLabel={key === 'backspace' ? 'Delete letter' : key === 'enter' ? 'Submit guess' : key}
              >
                <Text style={[styles.keyText, getTextStyle(status)]} numberOfLines={1}>
                  {key === 'backspace' ? '⌫' : key === 'enter' ? 'ENTER' : key.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { gap: 10 },
  keyboardRow: { flexDirection: 'row', justifyContent: 'center' },
  key: {
    height: 64,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDefault: {
    backgroundColor: '#ffffff',
  },
  keyPressed: {
    backgroundColor: '#f0f0f0',
  },
  keyDisabled: { opacity: 0.5 },
  keyCorrect: { backgroundColor: '#6F826A' },
  keyPresent: { backgroundColor: '#FCE59A' },
  keyAbsent: { backgroundColor: '#e8bedb' },
  keyText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  keyTextOnColor: { color: 'black' },
});