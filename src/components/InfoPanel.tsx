import { Card } from '@/components/ui/card';
import { Check, X, Info, Tent, Bike } from 'lucide-react';

const InfoPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
      {/* Quiosques Info Panel */}
      <Card className="p-6 sm:p-8 bg-green-50/50 border-2 border-emerald-200 shadow-sm rounded-3xl">
        <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2 text-[#15803d]">
          <Tent className="w-5 h-5 text-emerald-600" />
          Quiosques
        </h3>
        <div className="space-y-4 text-[15px] text-emerald-950 font-medium">
          <p><span className="font-extrabold text-[#15803d]">Quiosque Maior:</span> R$ 100,00 — 20 a 25 pessoas</p>
          <p><span className="font-extrabold text-[#15803d]">Quiosques Menores (4):</span> R$ 75,00 — até 15 pessoas</p>
          <p className="text-emerald-700 italic">Todos com churrasqueira, pia e grelha</p>
          <ul className="space-y-2 mt-4 text-[14px] bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <li className="flex items-center gap-2 text-[#15803d] font-bold">
              <Check className="w-4 h-4" /> Pode levar alimentação para preparar
            </li>
            <li className="flex items-center gap-2 text-red-700 font-bold">
              <X className="w-4 h-4" /> Bebidas alcoólicas proibidas
            </li>
            <li className="flex items-center gap-2 text-red-700 font-bold">
              <X className="w-4 h-4" /> Refrigerantes/sucos/energéticos — apenas consumo local
            </li>
          </ul>
          <div className="flex items-center gap-2 mt-4 text-[13px] text-yellow-900 bg-yellow-100 p-4 rounded-2xl border border-yellow-300 font-bold shadow-sm">
            <Info className="w-4 h-4 shrink-0 text-yellow-600" />
            <p>Entradas cobradas à parte. Não há reembolso em caso de desistência.</p>
          </div>
        </div>
      </Card>

      {/* ATV Info Panel */}
      <Card className="p-6 sm:p-8 bg-blue-50/50 border-2 border-blue-200 shadow-sm rounded-3xl">
        <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2 text-[#1d4ed8]">
          <Bike className="w-5 h-5 text-blue-600" />
          Trilha de Quadriciclo
        </h3>
        <div className="space-y-4 text-[15px] text-blue-950 font-medium">
          <p><span className="font-extrabold text-[#1d4ed8]">Individual:</span> R$ 150,00</p>
          <p><span className="font-extrabold text-[#1d4ed8]">Dupla:</span> R$ 250,00</p>
          <p><span className="font-extrabold text-[#1d4ed8]">Adulto + Criança (até 11 anos):</span> R$ 200,00</p>
          <p className="text-blue-700 italic">Duração: 1h30 por trilha</p>
          
          <div className="mt-4 bg-[#fbbf24]/10 p-5 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
            <p className="font-extrabold flex items-center gap-2 mb-3 text-[#b45309] text-[16px]">
              🎉 Descontos para reservas antecipadas:
            </p>
            <ul className="space-y-2 text-[#92400e]">
              <li className="flex justify-between items-center bg-white p-2 px-3 rounded-lg border border-yellow-200 shadow-sm"><span className="font-bold">Segunda e Sexta:</span> <span className="font-extrabold text-[#15803d]">20% de desconto</span></li>
              <li className="flex justify-between items-center bg-white p-2 px-3 rounded-lg border border-yellow-200 shadow-sm"><span className="font-bold">Sábado e Domingo:</span> <span className="font-extrabold text-[#15803d]">10% de desconto</span></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InfoPanel;
