import { useNavigate, Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth'
import { useEffect } from 'react'

export default function Layout() {
  const { getUser } = useAuth()
  const user = getUser(); // Эта ЗЛП вызывается при каждом рендеринге, ацтой
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Layout useEffect ' + user);

    if (!user) {
      navigate('/login', { replace: true });
    }
  }, []);

  console.log('Layout ' + user);
  if (!user) { return null }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};