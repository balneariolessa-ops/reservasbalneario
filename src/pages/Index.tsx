import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import InfoPanel from '@/components/InfoPanel';
import KioskReservationPanel from '@/components/KioskReservationPanel';
import ATVReservationPanel from '@/components/ATVReservationPanel';
import SummaryPanel from '@/components/SummaryPanel';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#dcfce7]">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-[68px] bg-white/80 backdrop-blur-sm border-2 border-[#166534]/25 p-2 rounded-2xl mb-8 shadow-md">
            <TabsTrigger value="resumo" className="font-display font-extrabold text-[16px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#fbbf24] data-[state=active]:to-[#f59e0b] data-[state=active]:text-[#78350f] data-[state=active]:shadow-lg transition-all text-[#14532d] py-3 hover:bg-[#fef3c7] active:scale-95">📊 Visão Geral</TabsTrigger>
            <TabsTrigger value="quiosques" className="font-display font-extrabold text-[16px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#16a34a] data-[state=active]:to-[#15803d] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-[#14532d] py-3 hover:bg-[#dcfce7] active:scale-95">🛖 Quiosques</TabsTrigger>
            <TabsTrigger value="quadriciclo" className="font-display font-extrabold text-[16px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#1d4ed8] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-[#14532d] py-3 hover:bg-[#dbeafe] active:scale-95">🛞 Quadriciclos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="mt-8">
            <SummaryPanel />
          </TabsContent>
          <TabsContent value="quiosques" className="mt-8">
            <KioskReservationPanel />
          </TabsContent>
          <TabsContent value="quadriciclo" className="mt-8">
            <ATVReservationPanel />
          </TabsContent>
        </Tabs>

        {/* InfoPanel moved to the very bottom */}
        <div className="pt-8 border-t-2 border-[#166534]/10 mt-12">
          <InfoPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
