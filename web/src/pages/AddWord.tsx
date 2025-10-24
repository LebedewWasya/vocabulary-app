import { useState } from 'react'
import { wordsApi } from '../api/client'


export default function AddWord() {
  // Состояние формы
  const [englishWord, setEnglishWord] = useState('')
  const [isPhrase, setIsPhrase] = useState(false) // Новое состояние для словосочетания
  const [comment, setComment] = useState('') // Новое состояние для комментария

  // Все части речи
  type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'pronoun' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'phrase'
  
  const [activeTab, setActiveTab] = useState<PartOfSpeech>('noun')
  
  const [translations, setTranslations] = useState<Record<PartOfSpeech, string[]>>({
    phrase: [],
    noun: [],
    verb: [],
    adjective: [],
    pronoun: [],
    adverb: [],
    preposition: [],
    conjunction: [],
    interjection: []
  })

  // Мок-данные слов
  const words = [
    {
      word: 'run',
      comment: 'Часто используется в спорте',
      entries: [
        { partOfSpeech: 'гл.', proficiency: 2, translations: ['бегать', 'работать'] },
        { partOfSpeech: 'сущ.', proficiency: 0, translations: ['бег', 'пробежка'] }
      ]
    },
    {
      word: 'book',
      comment: 'Многозначное слово',
      entries: [
        { partOfSpeech: 'сущ.', proficiency: 5, translations: ['книга'] },
        { partOfSpeech: 'гл.', proficiency: 1, translations: ['бронировать', 'заказывать'] }
      ]
    }
  ]

  // Добавить перевод
  const addTranslation = () => {
    if (!englishWord.trim()) return

    const newTranslations = [...translations[activeTab], '']
    setTranslations({
      ...translations,
      [activeTab]: newTranslations
    })
  }

  // Удалить перевод
  const removeTranslation = (index: number) => {
    const newTranslations = translations[activeTab].filter((_, i) => i !== index)
    setTranslations({
      ...translations,
      [activeTab]: newTranslations
    })
  }

  // Обновить перевод
  const updateTranslation = (index: number, value: string) => {
    const newTranslations = [...translations[activeTab]]
    newTranslations[index] = value
    setTranslations({
      ...translations,
      [activeTab]: newTranslations
    })
  }

  // Сохранить слово (заглушка)
  const saveWord = () => {
    if (isPhrase) {
      alert(`Словосочетание "${englishWord}" сохранено с переводом: "${translations.noun[0] || ''}"\nКомментарий: ${comment}`)
    } else {
      alert(`Слово "${englishWord}" сохранено с переводами:\n${JSON.stringify(translations, null, 2)}\nКомментарий: ${comment}`)
    }
    setEnglishWord('')
    setComment('')
    setIsPhrase(false)
    setTranslations({ 
      noun: [], verb: [], adjective: [], pronoun: [], 
      adverb: [], preposition: [], conjunction: [], interjection: [], phrase: [] 
    })
  }

  // Маппинг частей речи для отображения
  const partOfSpeechLabels: Record<PartOfSpeech, string> = {
    noun: 'Существительное',
    verb: 'Глагол',
    adjective: 'Прилагательное',
    pronoun: 'Местоимение',
    adverb: 'Наречие',
    preposition: 'Предлог',
    conjunction: 'Союз',
    interjection: 'Междометие', 
    phrase: 'phrase'
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Заголовок */}
      <h1 className="text-xl font-bold mb-4">Добавить новое слово</h1>

      {/* Форма добавления слова */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {/* Поле ввода английского слова */}
        <div className="mb-4">
          <input
            type="text"
            value={englishWord}
            onChange={(e) => setEnglishWord(e.target.value)}
            placeholder="Введите слово или словосочетание на английском языке"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Чекбокс "Словосочетание" */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPhrase"
            checked={isPhrase}
            onChange={(e) => setIsPhrase(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPhrase" className="text-sm text-gray-700">
            Это словосочетание
          </label>
        </div>

        {/* Вкладки по частям речи (только если не словосочетание) */}
        {!isPhrase && (
          <>
            <div className="border-b border-gray-200 mb-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(partOfSpeechLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as PartOfSpeech)}
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

            {/* Переводы для активной вкладки */}
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

            {/* Кнопка добавить перевод */}
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

        {/* Поле для перевода словосочетания */}
        {isPhrase && (
          <div className="mb-4">
            <input
              type="text"
              value={translations.noun[0] || ''}
              onChange={(e) => setTranslations({
                ...translations,
                noun: [e.target.value]
              })}
              placeholder="Перевод словосочетания"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Поле для комментария */}
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* Кнопка сохранить слово */}
        <button
          onClick={saveWord}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Сохранить слово
        </button>
      </div>

      {/* Список слов */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Мои слова</h2>

        {words.map((word, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
            <h3 className="text-xl font-bold">{word.word}</h3>
            {word.entries.map((entry, idx) => (
              <div key={idx} className="mt-2 text-sm">
                <span className="font-medium">{entry.partOfSpeech}</span>
                <span className="text-gray-500"> (заученность: {entry.proficiency}/10)</span>
                <div className="mt-1">
                  {entry.translations.join(', ')}
                </div>
              </div>
            ))}
            {word.comment && (
              <div className="mt-2 text-xs text-gray-600 italic">
                Комментарий: {word.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}