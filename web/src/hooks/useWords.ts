import { useState, useEffect } from 'react'
import { wordsApi } from '../api/client'
import type { Word, WordEntry } from '../types'

export const useWords = () => {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(false)

  const loadWords = async () => {
    setLoading(true)
    const data = await wordsApi.getWords()
    setWords(data)
    setLoading(false)
  }

  useEffect(() => {
    loadWords()
  }, [])

  return { words, loading, reload: loadWords }
}

// Хук для получения деталей слова
export const useWordEntries = (wordId: string) => {
  const [entries, setEntries] = useState<WordEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!wordId) return
    setLoading(true)
    wordsApi.getWordEntries(wordId).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [wordId])

  return { entries, loading }
}