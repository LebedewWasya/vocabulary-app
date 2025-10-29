import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { wordsApi } from '../api/client';
import type { Word, PartOfSpeech } from '../types';

const BASIC_COUNT_WORD_ON_PAGE: number = 5;
const ENABLE_LOGGING: boolean = true;

function log(message: string): void {
  if (ENABLE_LOGGING) {
    console.log(message);
  }
}

export default function AddWord() {
  // Определяем тип ключей
  const SPEECH_PART_KEYS = [
    'noun', 'verb', 'adjective', 'pronoun', 'adverb',
    'preposition', 'conjunction', 'interjection', 'phrase'
  ] as const;
  type SpeechPartKey = typeof SPEECH_PART_KEYS[number];

  const [englishWord, setEnglishWord] = useState('');
  const [isPhrase, setIsPhrase] = useState(false);
  const [comment, setComment] = useState('');
  // Состояние вкладки
  const [activeTab, setActiveTab] = useState<SpeechPartKey>('noun');
  // Состояние переводов
  const [translations, setTranslations] = useState<Record<SpeechPartKey, string[]>>({
    phrase: [], noun: [], verb: [], adjective: [], pronoun: [],
    adverb: [], preposition: [], conjunction: [], interjection: [],
  });

  // Состояние списка слов
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);

  // Модальные состояния
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  // Валидаторы
  const isValidEnglish = (value: string): boolean => /^[a-z\s']*$/.test(value);
  const isValidRussian = (value: string): boolean => /^[\u0430-\u044F\u0451\s\-.,;:!?()]*$/.test(value);

  // Загрузка слов
  const loadWords = async (query = '') => {
    log("loadWords CALLED");
    setLoading(true);
    try {
      const loaded = await wordsApi.getWordsSortedByChengeTime(BASIC_COUNT_WORD_ON_PAGE, query);
      setWords(loaded);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    log("useEffect on searchQuery CALLED");
    loadWords(searchQuery);
  }, [searchQuery]);

  const showError = (message: string) => {
    setErrorModal({
      show: true,
      message: `Извините, что-то пошло не так.\n${message}\n\nОбратитесь за помощью к разработчику.`,
    });
  };

  // Добавить перевод к части речи
  const addTranslation = () => {
    log("addTranslation CALLED");
    if (!englishWord.trim()) return;
    setTranslations(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], ''],
    }));
  };

  // Добавить перевод у части речи
  const removeTranslation = (index: number) => {
    log("removeTranslation CALLED");
    setTranslations(prev => {
      const newTranslations = [...prev[activeTab]];
      newTranslations.splice(index, 1);
      return { ...prev, [activeTab]: newTranslations };
    });
  };

  const updateTranslation = (index: number, value: string) => {
    log("updateTranslation CALLED");
    // Валидация перевода
    if (!isValidRussian(value)) return;
    setTranslations(prev => {
      const newTranslations = [...prev[activeTab]];
      newTranslations[index] = value;
      return { ...prev, [activeTab]: newTranslations };
    });
  };

  // Сохранение
  const saveWord = async () => {
    log("saveWord CALLED");
    if (!englishWord.trim()) return;
    try {
      const newWord: Word = {
        id: editingWordId || "",
        spelling: englishWord,
        comment,
        memorization: '0',
        changeTime: new Date(),
        phrase: { memorization: '0', translations: isPhrase ? translations.phrase : [] },
        noun: { memorization: '0', translations: isPhrase ? [] : translations.noun },
        verb: { memorization: '0', translations: isPhrase ? [] : translations.verb },
        adjective: { memorization: '0', translations: isPhrase ? [] : translations.adjective },
        pronoun: { memorization: '0', translations: isPhrase ? [] : translations.pronoun },
        adverb: { memorization: '0', translations: isPhrase ? [] : translations.adverb },
        preposition: { memorization: '0', translations: isPhrase ? [] : translations.preposition },
        conjunction: { memorization: '0', translations: isPhrase ? [] : translations.conjunction },
        interjection: { memorization: '0', translations: isPhrase ? [] : translations.interjection },
      };

      if (isEditing && editingWordId) {
        log("saveWord newWord.id = " + newWord.id);
        await wordsApi.updateWord(newWord);
      } else {
        await wordsApi.saveWord(newWord);
      }

      // Сброс формы
      resetForm();
      loadWords(searchQuery);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const resetForm = () => {
    setEnglishWord('');
    setComment('');
    setIsPhrase(false);
    setIsEditing(false);
    setEditingWordId(null);
    setActiveTab('noun');
    setTranslations({
      phrase: [], noun: [], verb: [], adjective: [], pronoun: [],
      adverb: [], preposition: [], conjunction: [], interjection: [],
    });
  };

  // Редактирование слова
  const handleEditWord = (word: Word) => {
    log("handleEditWord CALLED");
    setEnglishWord(word.spelling);
    setComment(word.comment);
    setIsEditing(true);
    setEditingWordId(word.id);

    // Заполняем переводы
    const newTranslations = {
      phrase: word.phrase.translations,
      noun: word.noun.translations,
      verb: word.verb.translations,
      adjective: word.adjective.translations,
      pronoun: word.pronoun.translations,
      adverb: word.adverb.translations,
      preposition: word.preposition.translations,
      conjunction: word.conjunction.translations,
      interjection: word.interjection.translations,
    };
    setTranslations(newTranslations);

    // Определяем, фраза ли это
    const isItPhrase = word.phrase.translations.length > 0;
    setIsPhrase(isItPhrase);

    if (isItPhrase) {
      setActiveTab('phrase');
    } else {
      // Ищем первую непустую часть речи
      const firstNonEmpty = SPEECH_PART_KEYS
        .filter(key => key !== 'phrase')
        .find(key => newTranslations[key].length > 0);
      setActiveTab(firstNonEmpty || 'noun');
    }
  };

  const confirmDelete = (id: string) => {
    log("confirmDelete CALLED");
    setWordToDelete(id);
    setShowDeleteModal(true);
  };

  // Удаление слова
  const handleDelete = async () => {
    if (!wordToDelete) return;
    try {
      await wordsApi.deleteWord(wordToDelete);
      setShowDeleteModal(false);
      setWordToDelete(null);
      loadWords(searchQuery);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidEnglish(value)) {
      setSearchQuery(value);
    }
  };

  const handleEnglishWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidEnglish(value)) {
      setEnglishWord(value);
    }
  };

  // Маппинг частей речи
  const partOfSpeechLabels: Record<SpeechPartKey, string> = {
    noun: 'Существительное',
    verb: 'Глагол',
    adjective: 'Прилагательное',
    pronoun: 'Местоимение',
    adverb: 'Наречие',
    preposition: 'Предлог',
    conjunction: 'Союз',
    interjection: 'Междометие',
    phrase: 'Фраза',
  };

  const handleIsPhrase = (isPhrase: boolean) => {
    log("handleIsPhrase CALLED");
    if (isPhrase) {
          setActiveTab('phrase');
    } else {
      // Ищем первую непустую часть речи
      const firstNonEmpty = SPEECH_PART_KEYS
         .filter(key => key !== 'phrase')
         .find(key => translations[key].length > 0);
      setActiveTab(firstNonEmpty || 'noun');
    }
    setIsPhrase(isPhrase);
  };

  const getCardColor = (memorization: string): string => {
    const level = parseInt(memorization, 10);
    if (isNaN(level)) return 'bg-white'; // fallback

    if (level <= 3) return 'border-l-red-500 bg-red-50';       // 0–3 → красный
    if (level <= 6) return 'border-l-yellow-500 bg-yellow-50'; // 4–6 → жёлтый
    return 'border-l-green-500 bg-green-50';                   // 7–10 → зелёный
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Заголовок */}
      <h1 className="text-xl font-bold mb-4">
        {isEditing ? 'Изменить слово' : 'Добавить новое слово'}
      </h1>

      {/* Форма для работы со словом */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          <input
            type="text"
            value={englishWord}
            onChange={handleEnglishWordChange}
            placeholder="Введите слово или словосочетание на английском языке"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPhrase"
            checked={isPhrase}
            onChange={(e) => handleIsPhrase(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPhrase" className="text-sm text-gray-700">
            Это словосочетание
          </label>
        </div>

        {/* Вкладки для слов */}
        {!isPhrase && (
          <>
            <div className="border-b border-gray-200 mb-4">
              <div className="flex flex-wrap gap-2">
                {(Object.entries(partOfSpeechLabels) as [SpeechPartKey, string][])
                  .filter(([key]) => key !== 'phrase')
                  .map(([key, label]) => (
                    <button // Эти баттоны сами вкладки сущ, глагол и тд
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`pb-2 px-3 text-sm font-medium whitespace-nowrap ${
                        activeTab === key
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {translations[activeTab].map((translation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={translation}
                    onChange={(e) => updateTranslation(index, e.target.value)}
                    placeholder={`Перевод ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeTranslation(index)}
                    className="p-2 text-red-600 hover:text-red-800 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <button
                onClick={addTranslation}
                className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200 transition-colors"
              >
                + Добавить перевод
              </button>
            </div>
          </>
        )}

        {/* Фраза */}
        {isPhrase && (
          <>
            <div className="space-y-2 mb-4">
              {translations.phrase.map((translation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={translation}
                    onChange={(e) => updateTranslation(index, e.target.value)}
                    placeholder={`Перевод ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeTranslation(index)}
                    className="p-2 text-red-600 hover:text-red-800 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <button
                onClick={() => {
                  //setActiveTab('phrase'); // Хз зачем это нейронка добавила, это лишнее, скорее всего
                  addTranslation();
                }}
                className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200 transition-colors"
              >
                + Добавить перевод
              </button>
            </div>
          </>
        )}

        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveWord}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Сохранить изменения' : 'Сохранить слово'}
          </button>
          {isEditing && (
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          )}
          {!isEditing && (
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Список слов */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Мои слова</h2>

        {/* Строка поиска */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Начните вводить слово"
            className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {loading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : words.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Слов не найдено</div>
        ) : (
          words
            .filter(word => word.id !== editingWordId) // ← Исключаем редактируемое слово
            .map(word => (
              <div
                key={word.id}
                onClick={() => handleEditWord(word)}
                className={`mb-4 p-4 border-l-4 rounded relative cursor-pointer hover:bg-gray-50 ${getCardColor(word.memorization)}`}
              >
                {/* Крестик удаления */}
                <button
                  onClick={e => { e.stopPropagation(); confirmDelete(word.id); }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>

                <h3 className="text-xl font-bold">{word.spelling}</h3>
                <div className="mt-2 text-sm">
                  {Object.entries(word)
                    .filter(
                      ([key]) =>
                        !['id', 'spelling', 'comment', 'memorization', 'changeTime'].includes(key) &&
                        (word[key as keyof Word] as PartOfSpeech).translations.length > 0
                    )
                    .map(([key, part]) => (
                      <div key={key} className="mt-1">
                        <span className="font-medium">{partOfSpeechLabels[key as SpeechPartKey]}</span>
                        <div>{(part as PartOfSpeech).translations.join(', ')}</div>
                      </div>
                    ))}
                </div>
                {word.comment && (
                  <div className="mt-2 text-xs text-gray-600 italic">
                    Комментарий: {word.comment}
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* Модалка удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-center text-gray-800 mb-4">
              Вы уверены, что хотите удалить слово?
            </h2>
            <div className="flex space-x-3">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                Да
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                Нет
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка ошибки */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 mb-4">
              {errorModal.message}
            </pre>
            <button
              onClick={() => setErrorModal({ show: false, message: '' })}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}