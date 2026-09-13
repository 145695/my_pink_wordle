import { generate } from 'random-words';
import wordList from 'an-array-of-english-words';

export interface WordData {
  originalWord: string;
  totalLetters: number;
  lettersAsArray: string[];
}

const wordSet = new Set(wordList as string[]);

export function isValidEnglishWord(inputWord: string): boolean {
  return wordSet.has(inputWord.toLowerCase());
}

export function processRandomWord(): WordData {
  let word: string = generate() as string;

  while (word.length < 3 || word.length > 6 || !isValidEnglishWord(word)) {
    word = generate() as string;
  }

  const letterCount: number = word.length;
  const letterArray: string[] = [...word];
console.log('Generated word:', word);
  return {
    originalWord: word,
    totalLetters: letterCount,
    lettersAsArray: letterArray,
  };
  
}

// --- scoring (unchanged) ---

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export function getLetterStatuses(guess: string, answer: string): LetterStatus[] {
  const result: LetterStatus[] = new Array(guess.length).fill('absent');
  const answerLetters = answer.split('');
  const consumed = new Array(answer.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answerLetters[i]) {
      result[i] = 'correct';
      consumed[i] = true;
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = answerLetters.findIndex((l, j) => l === guess[i] && !consumed[j]);
    if (idx !== -1) {
      result[i] = 'present';
      consumed[idx] = true;
    }
  }
  return result;
}

export function getKeyStatuses(guesses: string[], answer: string): Record<string, LetterStatus> {
  const priority: Record<LetterStatus, number> = { empty: 0, absent: 1, present: 2, correct: 3 };
  const result: Record<string, LetterStatus> = {};

  for (const guess of guesses) {
    const statuses = getLetterStatuses(guess, answer);
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const current = result[letter] ?? 'empty';
      if (priority[statuses[i]] > priority[current]) {
        result[letter] = statuses[i];
      }
    }
  }
  return result;
}