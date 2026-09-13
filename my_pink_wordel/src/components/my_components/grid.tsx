import { useMemo, useRef, useEffect } from 'react';
import { Animated, View, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import type { WordData, LetterStatus } from '@/service/game_logic';
import { getLetterStatuses } from '@/service/game_logic';

 export interface GridProps {
  wordData: WordData;
  guesses: string[];
  currentGuess: string;
  maxAttempts?: number;
  shakeTrigger?: number; 
}

function getCellStyle(status: LetterStatus) {
  switch (status) {
    case 'correct': return styles.gridCellCorrect;
    case 'present': return styles.gridCellPresent;
    case 'absent': return styles.gridCellAbsent;
    default: return undefined;
  }
}

export default function Grid({ wordData, guesses, currentGuess, maxAttempts , shakeTrigger = 0 }: GridProps) {
  const { originalWord, totalLetters } = wordData;
  maxAttempts = totalLetters;
  const answer = useMemo(() => originalWord.toLowerCase(), [originalWord]);
  const { width } = useWindowDimensions();

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shakeTrigger === 0) return; // skip on first mount

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeTrigger, shakeAnim]);

  const gap = 6;
  const horizontalPadding = 16;
  const maxGridWidth = 420;

  const availableWidth = Math.min(width, maxGridWidth) - horizontalPadding * 2;
  const rawSize = (availableWidth - gap * (totalLetters - 1)) / totalLetters;
  const cellSize = Math.max(32, Math.min(64, rawSize));

  return (
    <View style={styles.grid}>
      {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
        const isSubmitted = rowIndex < guesses.length;
        const isCurrentRow = rowIndex === guesses.length;
        const rowValue = isSubmitted ? guesses[rowIndex] : isCurrentRow ? currentGuess : '';
        const statuses = isSubmitted ? getLetterStatuses(rowValue, answer) : null;

        const rowContent = Array.from({ length: totalLetters }).map((_, colIndex) => {
          const letter = rowValue[colIndex] ?? '';
          const status: LetterStatus = statuses ? statuses[colIndex] : 'empty';

          return (
            <TextInput
              key={colIndex}
              style={[
                styles.gridCell,
                { width: cellSize, height: cellSize, fontSize: cellSize * 0.45 },
                getCellStyle(status),
              ]}
              value={letter.toUpperCase()}
              editable={false}
              maxLength={1}
              caretHidden={true}
              accessibilityLabel={`Row ${rowIndex + 1}, letter ${colIndex + 1}`}
            />
          );
        });

        // only the row being actively typed into shakes
        if (isCurrentRow) {
          return (
            <Animated.View
              key={rowIndex}
              style={[styles.gridRow, { gap, transform: [{ translateX: shakeAnim }] }]}
            >
              {rowContent}
            </Animated.View>
          );
        }

        return (
          <View style={[styles.gridRow, { gap }]} key={rowIndex}>
            {rowContent}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'column', gap: 6 },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    textAlign: 'center',
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#d3d6da',
    borderRadius: 4,
    backgroundColor: 'white',
    color: '#000',
  },
  gridCellCorrect: { backgroundColor: '#6F826A', borderColor: '#6F826A', color: 'white' },
  gridCellPresent: { backgroundColor: '#FCE59A', borderColor: '#FCE59A', color: 'white' },
  gridCellAbsent: { backgroundColor: '#e8bedb', borderColor: '#e8bedb', color: 'white' },
});