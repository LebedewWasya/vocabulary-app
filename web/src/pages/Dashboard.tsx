import { useNavigate } from 'react-router-dom'
import { Plus, Settings, BarChart3, Play, UserRoundSearch } from 'lucide-react';
import ActivityTimeline from '../components/ActivityTimeline'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        {/* Карточки функций */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
               onClick={() => navigate('/add-word')}>
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Добавить слова</h3>
            <p className="text-sm text-gray-600">Управление словарем</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
               onClick={() => navigate('/training-settings')}>
            <Settings className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Настройка тренировки</h3>
            <p className="text-sm text-gray-600">Параметры обучения</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
               onClick={() => navigate('/training')}>
            <Play className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold">Тренировка</h3>
            <p className="text-sm text-gray-600">Начать изучение</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
               onClick={() => navigate('/analytics')}>
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold">Аналитика</h3>
            <p className="text-sm text-gray-600">Прогресс и метрики</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
               onClick={() => navigate('/contacts')}>
            <UserRoundSearch className="w-8 h-8 text-blue-900 mb-2" />
            <h3 className="font-semibold">Сеть контактов</h3>
            <p className="text-sm text-gray-600">Работа с контактами</p>
          </div>
        </div>

        {/* Статистика */}
        <ActivityTimeline />
      </main>


    </div>
  )
}