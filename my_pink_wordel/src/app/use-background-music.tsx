import React, { createContext, useContext, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';

type BackgroundMusicPlayer = ReturnType<typeof useAudioPlayer>;

const BackgroundMusicContext = createContext<BackgroundMusicPlayer | null>(null);

/**
 * Mount this ONCE, above every screen that might play background music
 * (i.e. in your root app/_layout.tsx, wrapping the whole navigator).
 * Because it lives above the navigator, it never unmounts when the user
 * navigates between Home and Game, so the same track just keeps playing.
 */
export function BackgroundMusicProvider({ children }: { children: React.ReactNode }) {
  // Adjust this path to be correct relative to wherever you place this file.
  const bgMusic = useAudioPlayer(require('../../assets/audio/background.mp3'));

  useEffect(() => {
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    bgMusic.play();

    return () => {
      bgMusic.pause();
    };
  }, [bgMusic]);

  return (
    <BackgroundMusicContext.Provider value={bgMusic}>
      {children}
    </BackgroundMusicContext.Provider>
  );
}

/**
 * Only needed if a screen wants to actively control music (e.g. mute button,
 * duck volume during a sound effect, etc). Most screens don't need to call
 * this at all — the provider handles play/pause on its own.
 */
export function useBackgroundMusic() {
  const ctx = useContext(BackgroundMusicContext);
  if (!ctx) {
    throw new Error('useBackgroundMusic must be used within a BackgroundMusicProvider');
  }
  return ctx;
}