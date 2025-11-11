// src/pages/TrainingSettings.tsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { trainingSettingsApi } from '../api/client'
import type { TrainingSettings } from '../objecttypes'

const LOCAL_STORAGE_KEY = 'trainingSettings'

export default function TrainingSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<TrainingSettings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Загрузка данных
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 1. Получаем данные из API
        const { settings: serverSettings, updatedAt: serverDate } = await trainingSettingsApi.getSettings()

        // 2. Получаем данные из localStorage
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
        let localSettings: TrainingSettings[] = []
        let localDate = new Date(0)

        if (localData) {
          try {
            const parsed = JSON.parse(localData)
            localSettings = parsed.settings
            localDate = new Date(parsed.timestamp)
          } catch (e) {
            console.warn('Failed to parse local settings')
          }
        }

        // 3. Выбираем более актуальные данные
        const finalSettings = localDate > serverDate ? localSettings : serverSettings
        const finalDate = localDate > serverDate ? localDate : serverDate

        setSettings(finalSettings)
        setLastUpdated(finalDate)
      } catch (error) {
        console.error('Failed to load settings', error)
        // Fallback к локальным данным
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (localData) {
          try {
            const parsed = JSON.parse(localData)
            setSettings(parsed.settings)
            setLastUpdated(new Date(parsed.timestamp))
          } catch (e) {
            console.warn('Failed to load local settings')
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Debounced сохранение
  const debouncedSave = useCallback(
    debounce(async (newSettings: TrainingSettings[]) => {
      try {
        // Сохраняем на сервере
        await trainingSettingsApi.saveSettings(newSettings)

        // Сохраняем в localStorage с временной меткой
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          settings: newSettings,
          timestamp: new Date().toISOString()
        }))
      } catch (error) {
        console.error('Failed to save settings', error)
        // В случае ошибки всё равно сохраняем локально
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          settings: newSettings,
          timestamp: new Date().toISOString()
        }))
      }
    }, 1500),
    []
  )

  // Обработчики изменений
  const handleSelect = (id: string) => {
    const newSettings = settings.map(setting => ({
      ...setting,
      isSelected: setting.id === id
    }))
    setSettings(newSettings)
    debouncedSave(newSettings)
  }

  const updateSetting = (id: string, field: keyof TrainingSettings, value: any) => {
    const newSettings = settings.map(setting =>
      setting.id === id ? { ...setting, [field]: value } : setting
    )
    setSettings(newSettings)
    debouncedSave(newSettings)
  }

  const handleStartTraining = () => {
    // Сохраняем текущую конфигурацию для тренировки
    const activeSetting = settings.find(s => s.isSelected)
    if (activeSetting) {
      localStorage.setItem('currentTrainingConfig', JSON.stringify(activeSetting))
    }
    navigate('/training')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">Загрузка настроек...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-xl font-bold mb-6">Настройки тренировки</h1>

      <div className="space-y-6 mb-8">
        {settings.map(setting => (
          <div
            key={setting.id}
            className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
              setting.isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50 opacity-80'
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Чекбокс */}
              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={setting.isSelected}
                  onChange={() => handleSelect(setting.id)}
                  className="h-6 w-6 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {/* Контент */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  {setting.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  {setting.description}
                </p>

                {/* Поля настройки */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Количество слов */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Слова в тренировке
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={setting.wordCount}
                      onChange={(e) => updateSetting(
                        setting.id,
                        'wordCount',
                        Math.max(1, parseInt(e.target.value) || 1)
                      )}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  {/* Работа над ошибками */}
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={setting.shuffleMistakes}
                        onChange={(e) => updateSetting(
                          setting.id,
                          'shuffleMistakes',
                          e.target.checked
                        )}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">Работа над ошибками</span>
                    </label>
                  </div>

                  {/* Наказание за ошибку */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Наказание за ошибку
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={setting.penalty}
                      onChange={(e) => updateSetting(
                        setting.id,
                        'penalty',
                        Math.max(0, parseInt(e.target.value) || 0)
                      )}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка начала тренировки */}
      <button
        onClick={handleStartTraining}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Начать тренировку
      </button>
    </div>
  )
}

// Вспомогательная функция для debounce
function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }
}