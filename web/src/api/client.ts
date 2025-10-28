//  настоящий бэкенд будет на http://localhost:8080/api
// Сейчас эмулируем ответы через setTimeout

import type { Word, User, DatePeriod, ActivityPak, PartOfSpeech } from '../types'

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

// Имитация работы со словарем ==========================================================================================
// TODO для операций со словом (создание, изменение) Нужно высчитывать среднее между всеми memorization частей речи где есть хотябы один перевод, для фраз смотреть только memorization фразы
// TODO при добавлении новой части речи(как и создании нового слова или фразы) меморизация для нее 0 - имею ввиду именно PartOfSpeech.memorization
/**
 * Выбрасывает ошибку с заданной вероятностью
 * @param errorChance - вероятность ошибки в процентах (0–100)
 * @param errorMessage - сообщение об ошибке
 */
const maybeThrowError = (errorChance: number, errorMessage: string): void => {
  if (errorChance <= 0) return;
  if (errorChance >= 100) throw new Error(errorMessage);

  const randomPercent = Math.random() * 100; // 0.0 – 99.999...
  if (randomPercent < errorChance) {
    throw new Error(errorMessage);
  }
};

// Вспомогательная функция для создания пустой части речи
const emptyPart = (): PartOfSpeech => ({
  memorization: '0',
  translations: [],
});

export const wordsApi = {
  words: [
    {
      id: '1',
      spelling: 'say hello',
      phrase: { memorization: '5', translations: ['поздороваться'] },
      noun: emptyPart(),
      verb: emptyPart(),
      adjective: emptyPart(),
      pronoun: emptyPart(),
      adverb: emptyPart(),
      preposition: emptyPart(),
      conjunction: emptyPart(),
      interjection: emptyPart(),
      comment: 'Основное приветствие в английском языке',
      memorization: '5',
      changeTime: new Date('2024-01-10'),
    },
    {
      id: '2',
      spelling: 'goodbye',
      phrase:  emptyPart(),
      noun: { memorization: '9', translations: ['прощание'] },
      verb: emptyPart(),
      adjective: emptyPart(),
      pronoun: emptyPart(),
      adverb: emptyPart(),
      preposition: emptyPart(),
      conjunction: emptyPart(),
      interjection: emptyPart(),
      comment: 'Основное прощание в английском языке',
      memorization: '9',
      changeTime: new Date('2024-01-15'),
    },
  ] as Word[],

  // TODO в word не будет приходить id - нужно сделать так чтобы id генерировалось путем инкрементации самого большого id в списке words
  saveWord(word: Word): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      await delay(500);
      try {
        maybeThrowError(0, "Возникла ошибка при сохранении, ваши данные не были сохранены.");
        this.words.push({ ...word, spelling: word.spelling.toLowerCase(), changeTime: new Date() });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  async getWordsSortedByChengeTime(wordCount: number, startedFrom?: string): Promise<Word[]> {
    await delay(200);
    maybeThrowError(0, "Возникла ошибка при загрузке слов.");

    let filtered = this.words;

    if (startedFrom) {
      const query = startedFrom.toLowerCase();
      filtered = this.words.filter(word => word.spelling.toLowerCase().startsWith(query));
    }

    const sorted = filtered
      .slice()
      .sort((a, b) => b.changeTime.getTime() - a.changeTime.getTime());

    return sorted.slice(0, wordCount);
  },

  async updateWord(id: string): Promise<void> {
    await delay(300);
    maybeThrowError(0, "Возникла ошибка при обновлении слова. Ваши данные не были сохранены");

    const index = this.words.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Слово не найдено. Такого быть не должно! Обратитесь к разработчику.');
    }
    this.words[index] = { ...this.words[index], changeTime: new Date() };
  },

  async deleteWord(id: string): Promise<void> {
    await delay(300);
    maybeThrowError(0, "Возникла ошибка при удалении слова. Данные не были удаленны.");

    const initialLength = this.words.length;
    this.words = this.words.filter(w => w.id !== id);
    if (this.words.length === initialLength) {
      throw new Error('Слово не найдено. Такого быть не должно! Обратитесь к разработчику.');
    }
  },
};
// Имитация работы со словарем ======================================================================================================================

// Имитация тренировки
// export const trainingApi = {
//   // Получить слова для тренировки
//   getTrainingWords: async (count: number): Promise<WordEntry[]> => {
//     await delay(200)
//     return [
//       {
//         id: 'entry-2',
//         wordId: 'word-1',
//         partOfSpeech: 'noun',
//         definitions: ['бег', 'серия'],
//         proficiency: 1
//       }
//     ]
//   },

//   // Отправить ответ
//   submitAnswer: async (answer: { wordEntryId: string; userInput: string }): Promise<{
//     correctness: number;
//     expected: string;
//     newProficiency: number
//   }> => {
//     await delay(200)
//     // ЗАГЛУШКА: всегда "почти правильно"
//     return {
//       correctness: 2, // орфографическая ошибка
//       expected: 'бег, серия',
//       newProficiency: 2
//     }
//   }
// }