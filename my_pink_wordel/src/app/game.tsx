import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import Svg, { Circle } from 'react-native-svg';
import Grid from '../components/my_components/grid';
import Keyboard from '@/components/my_components/keybord';
import { ThemedText } from '@/components/themed-text';
import { processRandomWord, isValidEnglishWord, getKeyStatuses } from '@/service/game_logic';

const playSound = (player: ReturnType<typeof useAudioPlayer>) => {
  player.seekTo(0);
  player.play();
};

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

// --- Confetti ---

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#FCE59A', '#6F826A', '#f9dcee', '#e8bedb', '#ffffff'];
const CONFETTI_COUNT = 40;

function ConfettiPiece({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const drift = useRef((Math.random() - 0.5) * 80).current;
  const size = useRef(6 + Math.random() * 6).current;
  const color = useRef(
    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  ).current;
  const duration = useRef(2500 + Math.random() * 1500).current;

  useEffect(() => {
    const fall = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT + 20,
            duration,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: drift,
            duration,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotate, {
          toValue: 1,
          duration: duration / 2,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    fall.start();
    return () => fall.stop();
  }, [delay, drift, duration, rotate, translateX, translateY]);

  const rotateInterpolated = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        width: size,
        height: size * 1.6,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ translateY }, { translateX }, { rotate: rotateInterpolated }],
      }}
    />
  );
}

function Confetti() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiPiece key={i} delay={Math.random() * 1500} />
      ))}
    </View>
  );
}

// --- Game screen ---

export default function GameScreen() {
  const router = useRouter();
  const winsound = useAudioPlayer(require('../../assets/audio/confirmation_003.ogg'));
  const errorsound = useAudioPlayer(require('../../assets/audio/error_008.ogg'));

  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [wordData] = useState(() => processRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const answer = wordData.originalWord.toLowerCase();
  const hasWon = guesses.includes(answer);
  const keyStatuses = useMemo(() => getKeyStatuses(guesses, answer), [guesses, answer]);

  const handleKeyPress = (letter: string) => {
    if (gameOver) return;
    setCurrentGuess((g) => (g.length < wordData.totalLetters ? g + letter : g));
  };

  const handleBackspace = () => {
    if (gameOver) return;
    setCurrentGuess((g) => g.slice(0, -1));
  };

  const handleEnter = () => {
    if (gameOver) return;

    if (currentGuess.length !== wordData.totalLetters) {
      setShakeTrigger((t) => t + 1);
      playSound(errorsound);
      return;
    }
    if (!isValidEnglishWord(currentGuess)) {
      setShakeTrigger((t) => t + 1);
      playSound(errorsound);
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === answer || nextGuesses.length >= wordData.totalLetters) {
      playSound(winsound);
      setGameOver(true);
    }
  };

  return (
    <View style={styles.container}>
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
        {gameOver && !hasWon && (
          <View style={styles.revealBanner}>
            <ThemedText style={styles.revealText}>
              The word was: {answer.toUpperCase()}
            </ThemedText>
            <Pressable style={styles.returnButton} onPress={() => router.push('/')}>
              <ThemedText style={styles.returnButtonText}>Return</ThemedText>
            </Pressable>
          </View>
        )}

        <View style={styles.gridArea}>
          <Grid
            wordData={wordData}
            guesses={guesses}
            currentGuess={currentGuess}
            shakeTrigger={shakeTrigger}
          />
        </View>
        <Keyboard
          onKeyPress={handleKeyPress}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          keyStatuses={keyStatuses}
          disabled={gameOver}
        />
      </SafeAreaView>

      {gameOver && hasWon && (
        <View style={styles.winOverlay} pointerEvents="box-none">
          <Confetti />
          <View style={styles.winBannerCenter}>
            <ThemedText style={styles.winTitle}>You Win! </ThemedText>
            <Pressable style={styles.returnButton} onPress={() => router.push('/')}>
              <ThemedText style={styles.returnButtonText}>Return</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8bedb',
  },
  flowerLayer: {
    ...StyleSheet.absoluteFill,
  },
  flowerWrap: {
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  gridArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardArea: {
    flex: 1,
    justifyContent: 'center',
  },
  revealBanner: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffffcc',
    borderRadius: 12,
    marginBottom: 12,
  },
  revealText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F826A',
  },
  returnButton: {
    backgroundColor: '#6F826A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#e8bedb',
    fontWeight: 'bold',
  },
  winOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winBannerCenter: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  winTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6F826A',
  },
});