import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Header({ title }: { title?: string }) {
  const { getUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false) // ← Новое состояние
  const user = getUser()

  useEffect(() => {
    return () => {
      console.log('Хедер УНИЧТОЖЕН!!!!! ААААААААААА - это хорошо'); // Это почему то вызывается при входе = Ohh nooo!!!
    };
  }, []);

  console.log('Header ' + user);

  const avatarLetter = user.email.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    console.log('navigate!');
    navigate('/login')
  }

  return (
    <>
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        {/* Логотип V-App */}
        <div
          onClick={() => navigate('/')}
          className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
        >
          V-App
        </div>

        {/* Центр: опциональный заголовок */}
        {title ? (
        <div className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-800">
          {title}
        </div>
        ) : null}

        {/* Правая часть: аватарка + иконки */}
        <div className="flex items-center space-x-3">
          {/* Вопросительный знак */}
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label="Помощь"
            >
              <svg width="24" height="24">
                <text 
                  x="12" 
                  y="14" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill="#666666" 
                  fontFamily="Trebuchet MS, Arial, sans-serif"
                  fontSize="20"
                  fontWeight="700"
                >
                  ?
                </text>
              </svg>
            </button>

            {showTooltip && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                Если у вас возникли проблемы или пожелания, пожалуйста пишите на почту test@example.com
              </div>
            )}
          </div>

          {/* Аватарка с выпадающим меню */}
          <div className="relative">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer overflow-hidden"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>

            {/* Выпадающее меню */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                <button
                  onClick={() => {
                    navigate('/settings')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Настройки
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Выход
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Модальное окно подтверждения выхода */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-center text-gray-800 mb-2">
              {user.email}
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Вы уверены что хотите выйти?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Да
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}