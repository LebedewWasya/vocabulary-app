//  настоящий бэкенд будет на http://localhost:8080/api
// Сейчас эмулируем ответы через setTimeout

import type { Word, WordEntry, User, DatePeriod, ActivityPak } from '../types'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

// Активность ---------------------------------------------------------------------------------------- 
// Твоя предустановленная константа — меняй на свою
const PRESET_LEFTMOST_DATE = new Date('2023-01-01');

function normalizeDate(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function generateActivityPak(startDate: Date, endDate: Date): ActivityPak {
  const leftmostDate = normalizeDate(PRESET_LEFTMOST_DATE);
  const rightmostDate = normalizeDate(new Date()); // сегодня

  const actualStart = normalizeDate(startDate) > leftmostDate ? normalizeDate(startDate) : leftmostDate;
  const actualEnd = normalizeDate(endDate) < rightmostDate ? normalizeDate(endDate) : rightmostDate;

  if (actualStart > actualEnd) {
    return {
      activities: {},
      leftmostDate
    };
  }

  const activities: Record<string, boolean> = {};
  const current = new Date(actualStart);

  while (current <= actualEnd) {
    const dateKey = current.toLocaleDateString('sv'); // формат: YYYY-MM-DD
    activities[dateKey] = Math.random() < 0.5; // рандомный completed
    current.setDate(current.getDate() + 1);
  }

  return {
    activities,
    leftmostDate
  };
}

// Имитация получения данных об активности
export const activityApi = {
  getActivity: async(datePeriod: DatePeriod): Promise<ActivityPak> => {
    await delay(200)
    
    return generateActivityPak(datePeriod.startDate, datePeriod.endDate);
  }
}

// Активность Конец ---------------------------------------------------------------------------------------- 


// Имитация авторизации
export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(300)
    if (email === 'test@example.com' && password === '123456') {
      return { id: 'user-1', email }
    }
    throw new Error('Invalid credentials')
  }
}

// Имитация работы со словами
export const wordsApi = {
  // Получить все слова пользователя
  getWords: async (): Promise<Word[]> => {
    await delay(200)
    return [
      { id: 'word-1', original: 'run', language: 'en' },
      { id: 'word-2', original: 'light', language: 'en' }
    ]
  },

  // Получить детали слова (все части речи)
  getWordEntries: async (wordId: string): Promise<WordEntry[]> => {
    await delay(200)
    if (wordId === 'word-1') {
      return [
        {
          id: 'entry-1',
          wordId,
          partOfSpeech: 'verb',
          definitions: ['бежать', 'управлять', 'запускать'],
          proficiency: 3
        },
        {
          id: 'entry-2',
          wordId,
          partOfSpeech: 'noun',
          definitions: ['бег', 'серия'],
          proficiency: 1
        }
      ]
    }
    return []
  },

  // Сохранить новое слово
  createWord: async (original: string): Promise<Word> => {
    await delay(200)
    return { id: `word-${Date.now()}`, original, language: 'en' }
  }
}

// Имитация тренировки
export const trainingApi = {
  // Получить слова для тренировки
  getTrainingWords: async (count: number): Promise<WordEntry[]> => {
    await delay(200)
    return [
      {
        id: 'entry-2',
        wordId: 'word-1',
        partOfSpeech: 'noun',
        definitions: ['бег', 'серия'],
        proficiency: 1
      }
    ]
  },

  // Отправить ответ
  submitAnswer: async (answer: { wordEntryId: string; userInput: string }): Promise<{
    correctness: number;
    expected: string;
    newProficiency: number
  }> => {
    await delay(200)
    // ЗАГЛУШКА: всегда "почти правильно"
    return {
      correctness: 2, // орфографическая ошибка
      expected: 'бег, серия',
      newProficiency: 2
    }
  }
}