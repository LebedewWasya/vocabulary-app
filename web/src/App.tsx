// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddWord from './pages/AddWord'
import TrainingSettings from './pages/TrainingSettings'
import Training from './pages/Training'
import Analytics from './pages/Analytics'
import Contacts from './pages/Contacts'
import Settings from './pages/Settings'
import Registration from './pages/Registration'
import Header from './components/layout/Header';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 min-w-[320px] min-h-[320px]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/add-word" element={<><Header title="Работа со словарем" /><AddWord /></>} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/training-settings" element={<TrainingSettings />} />
            <Route path="/training" element={<Training />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/registration" element={<Registration />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App