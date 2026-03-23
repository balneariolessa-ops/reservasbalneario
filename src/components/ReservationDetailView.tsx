import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KioskReservation, ATVReservation, KIOSKS, ATV_TIME_SLOTS } from '@/types/reservation';
import { Users, Bike, Info } from 'lucide-react';

interface ReservationDetailViewProps {
  date: Date;
  kioskReservations: KioskReservation[];
  atvReservations: ATVReservation[];
}

export const ReservationDetailView = ({ date, kioskReservations, atvReservations }: ReservationDetailViewProps) => {
  const dateStr = format(date, "dd 'de' MMMM", { locale: ptBR });

  return (
    <Card className="bg-white shadow-md border-2 border-yellow-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl">
      <CardHeader className="bg-yellow-50 pb-4 border-b-2 border-yellow-200">
        <CardTitle className="text-xl font-display flex items-center gap-2 text-yellow-900 font-extrabold">
          <Info className="w-6 h-6 text-yellow-600" />
          Resumo de {dateStr}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 border-yellow-100">
          {/* Quiosques Column */}
          <div className="p-6 space-y-5 bg-[#f0fdf4]">
            <h4 className="text-lg font-extrabold flex items-center gap-2 text-[#15803d]">
              <Users className="w-5 h-5 text-[#15803d]" />
              Quiosques ({kioskReservations.length}/5)
            </h4>
            
            <div className="space-y-3">
              {KIOSKS.map(k => {
                const res = kioskReservations.find(r => r.kioskId === k.id);
                return (
                  <div key={k.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-white border-2 border-[#166534]/20 shadow-sm">
                    <span className="font-bold text-[#14532d]">{k.name}</span>
                    {res ? (
                      <span className="px-3 py-1 bg-[#15803d] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-sm">{res.customerName}</span>
                    ) : (
                      <span className="text-[#14532d]/60 italic font-bold">Livre</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quadriciclos Column */}
          <div className="p-6 space-y-5 bg-[#eff6ff]">
            <h4 className="text-lg font-extrabold flex items-center gap-2 text-[#1d4ed8]">
              <Bike className="w-5 h-5 text-[#1d4ed8]" />
              Quadriciclos
            </h4>

            <div className="space-y-4">
              {ATV_TIME_SLOTS.map(slot => {
                const slotRes = atvReservations.filter(r => r.timeSlot === slot);
                const totalVehicles = slotRes.reduce((sum, r) => sum + r.vehicleCount, 0);
                
                return (
                  <div key={slot} className="space-y-2 bg-white p-3 rounded-xl border-2 border-[#1e3a8a]/20 shadow-sm">
                    <div className="flex justify-between items-center text-[13px] mb-1">
                      <span className="font-extrabold text-[#1e3a8a]">{slot}</span>
                      <span className={totalVehicles >= 5 ? 'text-red-600 font-extrabold' : 'text-[#1d4ed8] font-bold'}>
                        {totalVehicles}/5 ocupados
                      </span>
                    </div>
                    {slotRes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {slotRes.map(r => (
                          <span key={r.id} className="px-2.5 py-1 bg-[#1d4ed8] text-white text-[10px] font-bold rounded-md shadow-sm">
                            {r.customerName} ({r.vehicleCount})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="h-6 bg-white border-2 border-[#1e3a8a]/10 rounded-lg flex items-center justify-center px-3">
                        <span className="text-[10px] text-[#1e3a8a]/60 font-bold italic">Nenhuma reserva</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 text-center border-t-2 border-yellow-200">
          <p className="text-[12px] text-yellow-900 uppercase tracking-widest font-extrabold">
            Total de Reservas no Dia: {kioskReservations.length + atvReservations.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
