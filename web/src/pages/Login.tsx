import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const { getUser, login } = useAuth()
  const navigate = useNavigate()

  console.log('Login before const user = getUser();');

  const user = getUser(); // Эта ЗЛП вызывается при каждом рендеринге, ацтой

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
     if (user) {
       navigate('/')
     }
  }, [])

  if (user) {
     return null;
  }

  return (

        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Vocabulary Application</h1>

            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Логин"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Пароль"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button type="submit"
                  className="text-white w-full bg-[#3333FF] hover:bg-[#3333FF]/90
                  focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50
                  font-medium rounded-lg text-sm px-5 py-2.5 relative mr-2 mb-2"
                >
                Войти
              </button>
            </form>

            <button
              type="button"
              onClick={() => alert('Google OAuth (заглушка)')}
              className="text-white w-full bg-[#4285F4] hover:bg-[#4285F4]/90
              focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50
              font-medium rounded-lg text-sm px-5 py-2.5 relative mr-2 mb-2"
            >
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="12"
                  y="22"
                  fontFamily="Trebuchet MS, Arial, sans-serif"
                  fontSize="28"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                >
                  G
                </text>
              </svg>
              <span className="block w-full text-center">Войти с Google</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Yandex OAuth (заглушка)')}
              className="text-white w-full bg-[#FF0000] hover:bg-[#FF0000]/75
              focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50
              font-medium rounded-lg text-sm px-5 py-2.5 relative mr-2 mb-2"
            >
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="12"
                  y="22"
                  fontFamily="Trebuchet MS, Arial, sans-serif"
                  fontSize="28"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                >
                  Я
                </text>
              </svg>
              <span className="block w-full text-center">Войти с Яндекс</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/registration')}
              className="text-white w-full bg-[#666666] hover:bg-[#666666]/85
              focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50
              font-medium rounded-lg text-sm px-5 py-2.5 relative mr-2">
                Регистрация
            </button>
          </div>
        </div>


  )
}