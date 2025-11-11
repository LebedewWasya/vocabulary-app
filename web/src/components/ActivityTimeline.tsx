import { useEffect, useState, useRef } from 'react';
import { Check, X } from 'lucide-react';

import type { DatePeriod, ActivityPak } from '../objecttypes'
import { activityApi } from '../api/client'

function getSundayOfNextWeek(nowDate: Date): Date {
  const currentDay = nowDate.getDay();
  const daysUntilNextSunday = 7 - currentDay;
  const nextSunday = new Date(nowDate);
  nextSunday.setDate(nowDate.getDate() + daysUntilNextSunday + 7);

  //console.log("called getSundayOfNextWeek: " + nextSunday.toLocaleDateString('sv'))
  return nextSunday;
}

// для запроса дат в апи на первый рендер
  function getDatePeriodForFirst(nowDate: Date): DatePeriod {
    const start = new Date(nowDate.getFullYear(), nowDate.getMonth() - 2, 1);

    //console.log("called getDatePeriodForFirst: S = " + start + " E = " + nowDate);
    return { startDate: start, endDate: nowDate }
  };

  // для запроса дат в апи на последующие рендеры
  function getDatePeriodForOthers(curDate: Date, leftmostDate: Date, rightmostDate: Date): DatePeriod {
    let start = new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1);
    start = start > leftmostDate ? start : leftmostDate;

    let end = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1);
    end = end < rightmostDate ? end : rightmostDate;
    
    //console.log("called getDatePeriodForOthers: S = " + start + " E = " + end);
    return { startDate: start, endDate: end }
  };

// Возвращает дни которые будут отображены
  function getPreparedDays(datePeriod: DatePeriod, leftmostDate: Date, rightmostDate: Date): Date[] {
    const days = [];
    const current = datePeriod.startDate > leftmostDate ? new Date(datePeriod.startDate) : new Date(leftmostDate);
    while (current <= datePeriod.endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

          // TODO костыльно напишу, в шоке, что юля этого нет нормального компоратора 
    const d1 = new Date(datePeriod.endDate.getFullYear(), datePeriod.endDate.getMonth(), datePeriod.endDate.getDate());
    const d2 = new Date(rightmostDate.getFullYear(), rightmostDate.getMonth(), rightmostDate.getDate());
    console.log("Неприятно удивлен, СЭРъ datePeriod.endDate = " + datePeriod.endDate + " rightmostDate = " + rightmostDate);
    if (d1 >= d2) {
      console.log("asdasdvygdafvgdfvuyghd");
      const and = getSundayOfNextWeek(datePeriod.endDate);
      current.setDate(current.getDate() + 1);
      while (current <= and) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return days;
  };

//   
function formatDate(date: Date): string {
  return date.toLocaleDateString('sv');
}
  
export default function ActivityTimeline() {
  //const [activityMap, setActivityMap] = useState<Record<string, boolean>>({});
  //const [nowDate, setNowDate] = useState(new Date()); // сегодня - TODO Эта ЗЛП на самом деле мешает 
  const [currentDate, setCurrentDate] = useState(new Date()); // текущая дата 
  //const [leftmostDate, setLeftmostDate] = useState(new Date()) // Самая ранняя дата за котороую есть инфа
  //const [rightmostDate, setRightmostDate] = useState(new Date()) // Самая поздняя дата за котороую есть инфа
  const [isLoading, setIsLoading] = useState(true); // после первого useEffect - для прогрузки данных выставляется в false и больше не меняется

  //console.log("ActivityTimeline Хочу отрендериться братан.... isLoading = " + isLoading);

  const leftmostDate = useRef(new Date()); // Самая ранняя дата за котороую есть инфа
  const containerRef = useRef<HTMLDivElement>(null); //TODO тут еще подумать 
  const days = useRef<Date[]>([]);
  const activityMap = useRef<Record<string, boolean>>({}); 
  const nowDate = useRef(new Date());
  const currentIndex = useRef(0); // Этот индекс определяет положение текузего компонента в новом масссиве
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const toLeft = useRef(false); // прокрутка в лево? 

  const todayStr: string = nowDate.current.toISOString().split('T')[0]; // Хз почему королева тут решила сделать так

  const loadActivityforFirst = async () => {
    try {
      nowDate.current = new Date();
      const datePeriod: DatePeriod = getDatePeriodForFirst(currentDate);

      const activityPak: ActivityPak = await activityApi.getActivity(datePeriod); 
      leftmostDate.current = activityPak.leftmostDate;
      activityMap.current = activityPak.activities;

      days.current = getPreparedDays(datePeriod, leftmostDate.current, nowDate.current);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load activity', err);
    };  
  }

  // сраобатывает один раз при первом рендере, для заполенения первичных данных 
  useEffect(() => {
    loadActivityforFirst();
  }, []);

  // Обработка колёсика
  const handleWheel = (e: WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    containerRef.current.scrollLeft += e.deltaY;
  };

    // Начало перетаскивания
  const handleMouseDown = (e: MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current!.offsetLeft;
    scrollLeft.current = containerRef.current!.scrollLeft;
    containerRef.current!.classList.add('cursor-grabbing');
  };

  // Перемещение мыши
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current!.offsetLeft;
    const walk = (x - startX.current) * 2; // множитель для скорости
    containerRef.current!.scrollLeft = scrollLeft.current - walk;
  };

  // Завершение перетаскивания
  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grabbing');
    }
  };

  // Эта ЗЛП должна отработать один раз для того чтобы при первой загрузке данных перевести скроллинг в крайнее правое положение 
  useEffect(() => {
    if (containerRef.current && !isLoading) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: false }); 
      containerRef.current.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp); 

      // Прокручиваем в самый конец
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [isLoading]);

  // Это должно меняться при каждом изменении текущей даты (текущая это самая левая при прокручивании на лево и самая крайняя при прокручивании на право)
  useEffect(() => {
    if (!containerRef.current) return;

    // Получаем все дочерние элементы
    const children = Array.from(containerRef.current.children);
  
    // Проверяем, что индекс валиден
    if (currentIndex.current < 0 || currentIndex.current >= children.length) return;

    const targetElement = children[currentIndex.current] as HTMLElement;
  
    // Прокручиваем до левого края элемента
    console.log("Так браток, поидее я должен жедать то что ты хочешь containerRef.current.scrollWidth = " + containerRef.current.scrollWidth + " containerRef.current.scrollWidth / 3 = " + containerRef.current.scrollWidth / 3);
    console.log("currentIndex = " + currentIndex.current); 
    console.log("targetElement.offsetLef = " + targetElement.offsetLeft); 
    
    containerRef.current.scrollLeft = toLeft.current ? targetElement.offsetLeft : targetElement.offsetLeft - containerRef.current.clientWidth;
  }, [currentDate]);

  const handleScroll = async () => {
    if (!containerRef.current) return;

    const { scrollLeft, clientWidth, scrollWidth } = containerRef.current;

    // Проверка: доскроллил ли до левого края?
    if (scrollLeft === 0) {
      //console.log('Доскроллил до самого левого элемента!');
      const cdate: Date = days.current[0];
      if (leftmostDate.current < cdate) { // Браток, если самый левый элемент в скролле, это есть самая крайняя дата за которую есть инфа, пытаться что то грузить нет смылса
        nowDate.current = new Date();
        const datePeriod: DatePeriod = getDatePeriodForOthers(cdate, leftmostDate.current, nowDate.current);

        const activityPak: ActivityPak = await activityApi.getActivity(datePeriod); 
        activityMap.current = activityPak.activities;

        days.current = getPreparedDays(datePeriod, leftmostDate.current, nowDate.current);

        toLeft.current = true;
        setCurrentDate(cdate);
      }
    }

    // Проверка: доскроллил ли до правого края?
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
      console.log('Доскроллил до самого правого элемента!');
      const ndate = new Date();
      const cdate: Date = days.current[days.current.length - 1];

      // TODO костыльно напишу, в шоке, что юля этого нет нормального компоратора 
      const d1 = new Date(cdate.getFullYear(), cdate.getMonth(), cdate.getDate());
      const d2 = new Date(ndate.getFullYear(), ndate.getMonth(), ndate.getDate());

      if (d1 < d2) { // Если мы докрутили до сегодняшнего дня, то крутить дальше не имеет смысл браток
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXX ' + cdate + 'ndate = ' + ndate);
        nowDate.current = ndate;
        const datePeriod: DatePeriod = getDatePeriodForOthers(cdate, leftmostDate.current, nowDate.current);

        const activityPak: ActivityPak = await activityApi.getActivity(datePeriod); 
        activityMap.current = activityPak.activities;

        days.current = getPreparedDays(datePeriod, leftmostDate.current, nowDate.current);

        toLeft.current = false;
        setCurrentDate(cdate);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-center">Загружаю братишка.... ща все будет</h2>
      </div>
    );
  } else {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-center">Активность</h2>
        <div ref={containerRef} className="flex overflow-x-auto hide-scrollbar pb-2 space-x-4  relative" onScroll={handleScroll} >
          {days.current.map((day, index) => {
            const dateStr = formatDate(day);
            const dayName = day.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 2);
            const dayNum = day.getDate();
            //console.log("YYYY day = " + day.toString()) // TODO 
            //console.log("YYYY dayNum = " + dayNum) // TODO 
            const month = day.getMonth();
            const isFirstDayOfMonth = index === 0 || days.current[index - 1].getMonth() !== month;

            if (currentDate.getTime() === day.getTime()) {
              console.log("FFF index = " + index); // TODO 
              currentIndex.current = index
            } 
            
            // Определяем тип дня
            const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Вс=0, Сб=6
            //console.log("XXXX2 dateStr = " + dateStr + " todayStr = " + todayStr) // TODO 
            const isToday = dateStr === todayStr;
            //console.log("XXXX3 isToday = " + isToday) // TODO 
            const isFuture = day > nowDate.current;

            // Стили для текста
            const textColor = isWeekend
              ? 'text-red-600'
              : isFuture
              ? 'text-gray-400'
              : 'text-gray-700';

            const fontWeight = isWeekend ? 'font-bold' : 'font-medium';

            // Фон для сегодняшнего дня
            const bgColor = isToday ? 'bg-blue-100' : '';
            //console.log("XXXX4 bgColor = " + bgColor) // TODO 
            return (
              <div
                key={dateStr}
                className={`flex flex-col items-center min-w-[60px] pt-6 rounded ${bgColor} ${
                  isFuture ? 'opacity-60' : ''
                }`}
              >
                {isFirstDayOfMonth && (
                  <div
                    className="absolute top-0 text-xs font-medium text-gray-700 whitespace-nowrap"
                    style={{ left: `${index * (60 + 16)}px` }}
                  >
                    {day.toLocaleDateString('ru-RU', { month: 'short' })} {day.getFullYear()}
                  </div>
                )}

                {/* День недели */}
                <div className={`text-xs ${textColor} ${fontWeight}`}>
                {dayName}
                </div>

                {/* Число */}
                <div className={`text-sm ${textColor} ${fontWeight}`}>{dayNum}</div>

                {/* Иконка активности */}
                <div className="mt-1">
                  {activityMap.current[dateStr] ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
          );
        })}
      </div>
    </div>
    );
  }
}