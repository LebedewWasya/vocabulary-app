Для настройки проекта необходимое следующие
1) Установленный node.js             node --version = v22.19.0
2) npm                               npm -- version = '10.9.3',
3) Нужно установить vite, команда npm create vite@latest web -- --template react-ts, команда выполняется из корневой папки проекта 
4) установить tailwind npm install tailwindcss @tailwindcss/vite
   В конфигурацию vite.config.ts добавить 
   
   import tailwindcss from '@tailwindcss/vite'
   export default defineConfig({
   plugins: [
   tailwindcss(),
   ],
   })
5) В файлах с стилями первой строчкой писать @import "tailwindcss";
6) установить маршрутизатор страниц от реакта, команда npm install react-router-dom
7) Установить npm install lucide-react - это иконки реакта  
8) npm run dev