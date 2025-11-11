export interface TrainingSettings {
  id: string
  name: string
  description: string
  isSelected: boolean
  wordCount: number
  shuffleMistakes: boolean
  penalty: number
}

// Пользователь
export interface User {
  id: string
  email: string
  avatar?: string
}

export interface PartOfSpeech {
  memorization: string,
  translations: string[]
}

// Слово
export interface Word {
   id: string
   spelling: string
   phrase: PartOfSpeech
   noun: PartOfSpeech,
   verb: PartOfSpeech,
   adjective: PartOfSpeech,
   pronoun: PartOfSpeech,
   adverb: PartOfSpeech,
   preposition: PartOfSpeech,
   conjunction: PartOfSpeech,
   interjection: PartOfSpeech,
   comment: string, 
   memorization: string,
   changeTime: Date
}



// Часть речи + переводы
export interface WordEntryold {
  id: string
  wordId: string
  partOfSpeech: string // "verb", "noun"
  definitions: string[] // ["бежать", "управлять"]
  proficiency: number // 0-10
}

// Ответ пользователя
export interface UserAnswer {
  wordId: string
  partOfSpeech: string
  userInput: string
}

export interface DatePeriod {
  startDate: Date
  endDate: Date
}

export interface ActivityPak {
  activities: Record<string, boolean>
  leftmostDate: Date
}