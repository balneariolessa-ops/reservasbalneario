import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useKioskReservations, useATVReservations } from '@/hooks/useReservations';
import { isOpenDay, TOTAL_ATV_VEHICLES, ATV_TIME_SLOTS } from '@/types/reservation';
import { ReservationDetailView } from './ReservationDetailView';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const SummaryPanel = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { getReservationsForDate: getKioskReservationsForDate } = useKioskReservations();
  const { reservations: atvReservations } = useATVReservations();

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const handleDateClick = (date: Date) => {
    if (!isOpenDay(date)) return;
    setSelectedDate(date);
  };

  const getKioskCount = (date: Date) => getKioskReservationsForDate(format(date, 'yyyy-MM-dd')).length;
  
  const getATVCount = (date: Date) => {
    const str = format(date, 'yyyy-MM-dd');
    const resForDate = atvReservations.filter(r => r.date === str);
    return resForDate.reduce((sum, r) => sum + r.vehicleCount, 0);
  };
  
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  return (
    <div className="flex flex-col-reverse xl:grid xl:grid-cols-12 gap-8 items-start w-full">
      
      {/* Details (Left Side, 7 or 8 columns) */}
      <div className="xl:col-span-8 relative w-full">
        <div className="sticky top-6">
          <Card className="p-6 sm:p-8 bg-white border-2 border-[#166534]/20 shadow-md rounded-3xl" style={{ minHeight: '600px' }}>
            {selectedDate ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 border-b-2 border-[#166534]/10 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#166534] flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-sm">
                    {format(selectedDate, 'dd')}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-[#14532d] capitalize leading-tight flex items-center gap-2">
                      Operação Diária
                    </h3>
                    <p className="text-[15px] font-bold text-[#14532d]/80 capitalize mt-1">
                      {format(selectedDate, 'EEEE, yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <ReservationDetailView 
                  date={selectedDate}
                  kioskReservations={getKioskReservationsForDate(dateStr)}
                  atvReservations={atvReservations.filter(r => r.date === dateStr)}
                />
              </div>
            ) : (
              <div className="text-center py-12 opacity-80 h-full flex flex-col items-center justify-center">
                <Info className="w-10 h-10 text-[#14532d] mx-auto mb-4" />
                <h4 className="font-display font-bold text-xl text-[#14532d]">Informações do Dia</h4>
                <p className="text-[15px] text-[#14532d]/80 font-medium mt-2">Selecione uma data no calendário ao lado para ver o resumo completo das ocupações.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Calendar (Right Side, 4 or 5 columns) */}
      <div className="xl:col-span-4 w-full">
        <Card className="overflow-hidden border-2 border-[#14532d]/20 shadow-md bg-white rounded-3xl">
          <div className="p-5 border-b-2 border-[#14532d]/10 flex flex-col items-start gap-4 bg-[#f0fdf4]">
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight text-[#14532d] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#166534]" />
                Resumo Geral
              </h3>
              <p className="text-[13px] text-[#14532d] mt-1.5 font-semibold leading-snug">
                Selecione uma data para organizar<br/>seu dia de operações.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
               <span className="text-[10.5px] font-extrabold uppercase bg-[#15803d] text-white px-3 py-1.5 rounded-lg w-full text-center tracking-wider shadow-sm">🛖 Quiosques Ocupados</span>
               <span className="text-[10.5px] font-extrabold uppercase bg-[#1d4ed8] text-white px-3 py-1.5 rounded-lg w-full text-center tracking-wider shadow-sm">🛞 Quadriciclos Alugados</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl border-2 border-[#166534]/20 w-9 h-9 shadow-sm hover:border-[#166534]/50 hover:bg-[#166534]/10 text-[#14532d]">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h4 className="text-[17px] font-display font-extrabold capitalize tracking-tight text-[#14532d]">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h4>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl border-2 border-[#166534]/20 w-9 h-9 shadow-sm hover:border-[#166534]/50 hover:bg-[#166534]/10 text-[#14532d]">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-[11px] font-extrabold text-[#14532d] uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {days.map(day => {
                const open = isOpenDay(day);
                const past = isBefore(day, today);
                const kCount = getKioskCount(day);
                const aCount = getATVCount(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={!open}
                    className={cn(
                      'relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200 group overflow-hidden border-2',
                      !open && 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed opacity-50',
                      open && past && 'bg-[#f0fdf4] border-[#166534]/20 text-[#14532d]/40 hover:border-[#166534]/40',
                      open && !past && 'bg-white hover:bg-[#fbbf24]/20 font-bold cursor-pointer border-[#166534]/30 shadow-sm text-[#14532d]',
                      isSelected && 'bg-[#fbbf24] border-[#d97706] scale-105 shadow-md z-10 text-[#78350f] font-extrabold',
                      isToday && !isSelected && 'border-[#2563eb] font-bold text-[#1e3a8a]'
                    )}
                  >
                    <span className={cn(
                      "text-[14px] font-display",
                      isSelected ? "font-black" : (open && !past ? "font-bold" : "font-semibold")
                    )}>{format(day, 'd')}</span>
                    
                    {open && (kCount > 0 || aCount > 0) && (
                      <div className="absolute bottom-1 w-full flex justify-center gap-[3px]">
                        {kCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" title={`${kCount} quiosques`}></span>}
                        {aCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" title={`${aCount} quadriciclos`}></span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default SummaryPanel;
