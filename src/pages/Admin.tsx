import { useState, useMemo } from 'react';
import { AdminLogin } from "@/components/admin/AdminLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, RefreshCw, Trash2, Pencil, X, Check, CalendarCheck, Bike, Tent, History, ChevronDown, ChevronUp, AlertTriangle, FileText } from "lucide-react";
import { useKioskReservations, useATVReservations } from '@/hooks/useReservations';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PAYMENT_METHODS, KIOSKS, ATV_TIME_SLOTS } from '@/types/reservation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const { toast } = useToast();

  const { reservations: kioskReservations, loading: kioskLoading, removeReservation: removeKiosk, updateReservation: updateKiosk, refetch: refetchKiosk } = useKioskReservations();
  const { reservations: atvReservations, loading: atvLoading, removeReservation: removeATV, updateReservation: updateATV, refetch: refetchATV } = useATVReservations();

  // Kiosk edit states
  const [editingKioskId, setEditingKioskId] = useState<string | null>(null);
  const [editKioskName, setEditKioskName] = useState('');
  const [editKioskPayment, setEditKioskPayment] = useState('');
  const [editKioskDate, setEditKioskDate] = useState('');
  const [editKioskKioskId, setEditKioskKioskId] = useState<number>(0);
  const [editKioskPrice, setEditKioskPrice] = useState('');

  // ATV edit states
  const [editingATVId, setEditingATVId] = useState<string | null>(null);
  const [editATVName, setEditATVName] = useState('');
  const [editATVPayment, setEditATVPayment] = useState('');
  const [editATVDate, setEditATVDate] = useState('');
  const [editATVTimeSlot, setEditATVTimeSlot] = useState('');
  const [editATVVehicleCount, setEditATVVehicleCount] = useState('1');

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'kiosk' | 'atv'; id: string; name: string; detail: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // History expanded states
  const [expandedKioskMonths, setExpandedKioskMonths] = useState<Set<string>>(new Set());
  const [expandedATVMonths, setExpandedATVMonths] = useState<Set<string>>(new Set());

  const isLoading = kioskLoading || atvLoading;
  const today = startOfDay(new Date());

  const handleRefresh = async () => {
    await Promise.all([refetchKiosk(), refetchATV()]);
    toast({ title: "✅ Dados atualizados em tempo real!" });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  // Kiosk edit
  const startEditKiosk = (r: typeof kioskReservations[0]) => {
    setEditingKioskId(r.id);
    setEditKioskName(r.customerName);
    setEditKioskPayment(r.paymentMethod);
    setEditKioskDate(r.date);
    setEditKioskKioskId(r.kioskId);
    setEditKioskPrice(r.price.toString());
  };
  const cancelEditKiosk = () => setEditingKioskId(null);
  const saveEditKiosk = async () => {
    if (!editingKioskId) return;
    const selectedKiosk = KIOSKS.find(k => k.id === editKioskKioskId);
    try {
      await updateKiosk(editingKioskId, {
        customerName: editKioskName,
        paymentMethod: editKioskPayment as any,
        date: editKioskDate,
        kioskId: editKioskKioskId,
        kioskName: selectedKiosk?.name || '',
        price: parseFloat(editKioskPrice) || 0,
      });
      toast({ title: "✅ Reserva atualizada!" });
      setEditingKioskId(null);
    } catch {
      toast({ title: "❌ Erro ao atualizar", variant: "destructive" });
    }
  };

  // ATV edit
  const startEditATV = (r: typeof atvReservations[0]) => {
    setEditingATVId(r.id);
    setEditATVName(r.customerName);
    setEditATVPayment(r.paymentMethod);
    setEditATVDate(r.date);
    setEditATVTimeSlot(r.timeSlot);
    setEditATVVehicleCount(r.vehicleCount.toString());
  };
  const cancelEditATV = () => setEditingATVId(null);
  const saveEditATV = async () => {
    if (!editingATVId) return;
    try {
      await updateATV(editingATVId, {
        customerName: editATVName,
        paymentMethod: editATVPayment as any,
        date: editATVDate,
        timeSlot: editATVTimeSlot,
        vehicleCount: parseInt(editATVVehicleCount) || 1,
      });
      toast({ title: "✅ Reserva atualizada!" });
      setEditingATVId(null);
    } catch {
      toast({ title: "❌ Erro ao atualizar", variant: "destructive" });
    }
  };

  // Delete with popup
  const requestDelete = (type: 'kiosk' | 'atv', id: string, name: string, detail: string) => {
    setDeleteTarget({ type, id, name, detail });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'kiosk') {
        await removeKiosk(deleteTarget.id);
      } else {
        await removeATV(deleteTarget.id);
      }
      toast({ title: "🗑️ Reserva excluída com sucesso! O horário/quiosque voltou a ficar disponível." });
    } catch {
      toast({ title: "❌ Erro ao excluir", variant: "destructive" });
    }
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // Separate current vs past reservations
  const currentKiosk = kioskReservations.filter(r => !isBefore(parseISO(r.date), today));
  const pastKiosk = kioskReservations.filter(r => isBefore(parseISO(r.date), today));

  const currentATV = atvReservations.filter(r => !isBefore(parseISO(r.date), today));
  const pastATV = atvReservations.filter(r => isBefore(parseISO(r.date), today));

  // Group past by month
  const kioskByMonth = useMemo(() => {
    const map = new Map<string, typeof pastKiosk>();
    pastKiosk.forEach(r => {
      const key = r.date.substring(0, 7); // yyyy-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [pastKiosk]);

  const atvByMonth = useMemo(() => {
    const map = new Map<string, typeof pastATV>();
    pastATV.forEach(r => {
      const key = r.date.substring(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [pastATV]);

  const toggleKioskMonth = (month: string) => {
    setExpandedKioskMonths(prev => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  };

  const toggleATVMonth = (month: string) => {
    setExpandedATVMonths(prev => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  };

  const formatMonthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return format(d, 'MMMM yyyy', { locale: ptBR });
  };

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#dcfce7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] p-6 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-md">
              <CalendarCheck className="w-7 h-7 text-[#14532d]" />
            </div>
            Administração Central
          </h1>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleRefresh} disabled={isLoading} className="rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">Atualizar</span>
            </Button>
            <Button size="sm" onClick={handleLogout} className="rounded-xl bg-red-500/80 hover:bg-red-600 text-white font-bold">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-[#16a34a]/20 shadow-md text-center">
            <p className="text-3xl font-black text-[#16a34a]">{currentKiosk.length}</p>
            <p className="text-[12px] font-extrabold text-[#14532d] uppercase mt-1">Quiosques Ativos</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-[#2563eb]/20 shadow-md text-center">
            <p className="text-3xl font-black text-[#2563eb]">{currentATV.length}</p>
            <p className="text-[12px] font-extrabold text-[#1e3a8a] uppercase mt-1">Quadriciclos Ativos</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-[#f59e0b]/30 shadow-md text-center">
            <p className="text-3xl font-black text-[#d97706]">R$ {currentKiosk.reduce((s, r) => s + r.price, 0).toFixed(0)}</p>
            <p className="text-[12px] font-extrabold text-[#92400e] uppercase mt-1">Receita Ativa (Qui.)</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-[#f59e0b]/30 shadow-md text-center">
            <p className="text-3xl font-black text-[#d97706]">R$ {currentATV.reduce((s, r) => s + r.finalPrice, 0).toFixed(0)}</p>
            <p className="text-[12px] font-extrabold text-[#92400e] uppercase mt-1">Receita Ativa (Quad.)</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="quiosques" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mb-6 h-[56px] rounded-2xl bg-white/80 backdrop-blur-sm p-2 border-2 border-[#166534]/20 shadow-md">
            <TabsTrigger value="quiosques" className="rounded-xl font-extrabold text-[15px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#16a34a] data-[state=active]:to-[#15803d] data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-[#14532d] hover:bg-[#dcfce7] active:scale-95">
              <Tent className="w-4 h-4 mr-2" /> Quiosques ({currentKiosk.length})
            </TabsTrigger>
            <TabsTrigger value="quadriciclos" className="rounded-xl font-extrabold text-[15px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#1d4ed8] data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-[#14532d] hover:bg-[#dbeafe] active:scale-95">
              <Bike className="w-4 h-4 mr-2" /> Quadriciclos ({currentATV.length})
            </TabsTrigger>
          </TabsList>

          {/* ============ KIOSK TAB ============ */}
          <TabsContent value="quiosques" className="animate-in fade-in duration-300 space-y-6">
            {/* Current (active) reservations */}
            <div className="bg-white rounded-3xl border-2 border-[#16a34a]/20 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#dcfce7] to-[#bbf7d0] px-6 py-4 border-b-2 border-[#16a34a]/10">
                <h2 className="font-extrabold text-[#14532d] text-lg">🛖 Reservas Ativas de Quiosques</h2>
                <p className="text-[13px] text-[#166534] font-semibold">Reservas de hoje em diante • Tempo real</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f0fdf4] text-[#166534] font-extrabold uppercase tracking-wider text-[11px] border-b-2 border-[#16a34a]/10">
                    <tr>
                      <th className="px-5 py-4">📅 Data</th>
                      <th className="px-5 py-4">👤 Cliente</th>
                      <th className="px-5 py-4">🏠 Quiosque</th>
                      <th className="px-5 py-4">💰 Valor</th>
                      <th className="px-5 py-4">💳 Pagamento</th>
                      <th className="px-5 py-4 text-right">⚙️ Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16a34a]/10">
                    {currentKiosk.map(r => {
                      const isEditing = editingKioskId === r.id;
                      return (
                      <tr key={r.id} className={isEditing ? "bg-[#fef3c7]/50" : "hover:bg-[#f0fdf4] transition-colors"}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <Input type="date" value={editKioskDate} onChange={e => setEditKioskDate(e.target.value)} className="h-9 w-[140px] rounded-lg border-2 border-[#86efac] bg-[#dcfce7] text-[#14532d] font-bold" />
                          ) : (
                            <span className="font-bold text-[#14532d]">{format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Input value={editKioskName} onChange={e => setEditKioskName(e.target.value)} className="h-9 rounded-lg border-2 border-[#86efac] bg-[#dcfce7] text-[#14532d] font-bold" />
                          ) : (
                            <span className="font-bold text-[#15803d]">{r.customerName}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Select value={String(editKioskKioskId)} onValueChange={v => { const kid = parseInt(v); setEditKioskKioskId(kid); const k = KIOSKS.find(x => x.id === kid); if (k) setEditKioskPrice(k.price.toString()); }}>
                              <SelectTrigger className="h-9 rounded-lg border-2 border-[#86efac] bg-[#dcfce7] text-[#14532d] font-bold w-[160px]"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-[#86efac]">
                                {KIOSKS.map(k => <SelectItem key={k.id} value={String(k.id)} className="font-bold">{k.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className="bg-[#16a34a] text-white font-bold border-0 shadow-sm">{r.kioskName}</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-[#166534] text-sm">R$</span>
                              <Input type="number" value={editKioskPrice} onChange={e => setEditKioskPrice(e.target.value)} className="h-9 w-[90px] rounded-lg border-2 border-[#86efac] bg-[#dcfce7] text-[#14532d] font-bold" />
                            </div>
                          ) : (
                            <span className="font-extrabold text-[#166534]">R$ {r.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Select value={editKioskPayment} onValueChange={setEditKioskPayment}>
                              <SelectTrigger className="h-9 rounded-lg border-2 border-[#86efac] bg-[#dcfce7] text-[#14532d] font-bold w-[140px]"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-[#86efac]">
                                {PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value} className="font-bold">{p.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-[#14532d] font-bold uppercase text-[12px] bg-[#dcfce7] px-2 py-1 rounded-lg">{r.paymentMethod}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <Button size="icon" className="h-8 w-8 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm" onClick={saveEditKiosk}><Check className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-slate-200" onClick={cancelEditKiosk}><X className="w-4 h-4" /></Button>
                              </>
                            ) : (
                              <>
                                {r.receiptUrl && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-[#16a34a] hover:bg-[#dcfce7]" onClick={() => window.open(r.receiptUrl, '_blank')}>
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-[#2563eb] hover:bg-[#dbeafe]" onClick={() => startEditKiosk(r)}><Pencil className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-700" onClick={() => requestDelete('kiosk', r.id, r.customerName, `${r.kioskName} — ${format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}`)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );})}
                    {currentKiosk.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-[#14532d]/60 font-bold italic">Nenhuma reserva ativa.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* History by month */}
            {kioskByMonth.length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-[#d97706]/20 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#fef3c7] to-[#fde68a] px-6 py-4 border-b-2 border-[#d97706]/10">
                  <h2 className="font-extrabold text-[#92400e] text-lg flex items-center gap-2">
                    <History className="w-5 h-5" /> Histórico de Quiosques
                  </h2>
                  <p className="text-[13px] text-[#92400e] font-semibold">Reservas anteriores organizadas por mês</p>
                </div>
                <div className="divide-y divide-[#d97706]/10">
                  {kioskByMonth.map(([monthKey, monthReservations]) => {
                    const isExpanded = expandedKioskMonths.has(monthKey);
                    const monthRevenue = monthReservations.reduce((s, r) => s + r.price, 0);
                    return (
                      <div key={monthKey}>
                        <button onClick={() => toggleKioskMonth(monthKey)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#fef3c7]/50 transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-sm">
                              <span className="text-[#92400e] font-black text-sm">{monthReservations.length}</span>
                            </div>
                            <div>
                              <span className="font-extrabold text-[#92400e] text-[16px] capitalize">{formatMonthLabel(monthKey)}</span>
                              <span className="block text-[12px] font-bold text-[#b45309]">R$ {monthRevenue.toFixed(2)} total</span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-[#92400e]" /> : <ChevronDown className="w-5 h-5 text-[#92400e]" />}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            {monthReservations.map(r => (
                              <div key={r.id} className="flex items-center justify-between bg-[#fef3c7]/50 rounded-xl p-3 border border-[#fbbf24]/30">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-[#92400e] text-sm">{format(new Date(r.date + 'T12:00:00'), 'dd/MM')}</span>
                                  <span className="font-bold text-[#14532d]">{r.customerName}</span>
                                  <Badge className="bg-[#16a34a] text-white font-bold border-0 text-[10px]">{r.kioskName}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-[#166534] text-sm">R$ {r.price.toFixed(2)}</span>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-100" onClick={() => requestDelete('kiosk', r.id, r.customerName, `${r.kioskName} — ${format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}`)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============ ATV TAB ============ */}
          <TabsContent value="quadriciclos" className="animate-in fade-in duration-300 space-y-6">
            {/* Current reservations */}
            <div className="bg-white rounded-3xl border-2 border-[#2563eb]/20 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#dbeafe] to-[#bfdbfe] px-6 py-4 border-b-2 border-[#2563eb]/10">
                <h2 className="font-extrabold text-[#1e3a8a] text-lg">🛞 Reservas Ativas de Quadriciclos</h2>
                <p className="text-[13px] text-[#1e3a8a] font-semibold">Reservas de hoje em diante • Tempo real</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#eff6ff] text-[#1e3a8a] font-extrabold uppercase tracking-wider text-[11px] border-b-2 border-[#2563eb]/10">
                    <tr>
                      <th className="px-5 py-4">📅 Data</th>
                      <th className="px-5 py-4">🕐 Horário</th>
                      <th className="px-5 py-4">👤 Cliente</th>
                      <th className="px-5 py-4">🏍️ Veículos</th>
                      <th className="px-5 py-4">💰 Valor</th>
                      <th className="px-5 py-4">💳 Pagamento</th>
                      <th className="px-5 py-4 text-right">⚙️ Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2563eb]/10">
                    {currentATV.map(r => {
                      const isEditing = editingATVId === r.id;
                      return (
                      <tr key={r.id} className={isEditing ? "bg-[#fef3c7]/50" : "hover:bg-[#eff6ff] transition-colors"}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <Input type="date" value={editATVDate} onChange={e => setEditATVDate(e.target.value)} className="h-9 w-[140px] rounded-lg border-2 border-[#93c5fd] bg-[#dbeafe] text-[#1e3a8a] font-bold" />
                          ) : (
                            <span className="font-bold text-[#1e3a8a]">{format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Select value={editATVTimeSlot} onValueChange={setEditATVTimeSlot}>
                              <SelectTrigger className="h-9 rounded-lg border-2 border-[#93c5fd] bg-[#dbeafe] text-[#1e3a8a] font-bold w-[150px]"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-[#93c5fd]">
                                {ATV_TIME_SLOTS.map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className="bg-[#2563eb] text-white font-bold border-0 shadow-sm">{r.timeSlot}</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Input value={editATVName} onChange={e => setEditATVName(e.target.value)} className="h-9 rounded-lg border-2 border-[#93c5fd] bg-[#dbeafe] text-[#1e3a8a] font-bold" />
                          ) : (
                            <span className="font-bold text-[#1d4ed8]">{r.customerName}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Select value={editATVVehicleCount} onValueChange={setEditATVVehicleCount}>
                              <SelectTrigger className="h-9 rounded-lg border-2 border-[#93c5fd] bg-[#dbeafe] text-[#1e3a8a] font-bold w-[80px]"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-[#93c5fd]">
                                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)} className="font-bold">{n}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className="bg-[#fbbf24] text-[#92400e] font-extrabold border-0 shadow-sm">{r.vehicleCount} quad.</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-[#1d4ed8]">R$ {r.finalPrice.toFixed(2)}</span>
                          {r.discount > 0 && <span className="block text-[10px] font-bold text-[#16a34a]">(-R$ {r.discount.toFixed(2)})</span>}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <Select value={editATVPayment} onValueChange={setEditATVPayment}>
                              <SelectTrigger className="h-9 rounded-lg border-2 border-[#93c5fd] bg-[#dbeafe] text-[#1e3a8a] font-bold w-[140px]"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-[#93c5fd]">
                                {PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value} className="font-bold">{p.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-[#1e3a8a] font-bold uppercase text-[12px] bg-[#dbeafe] px-2 py-1 rounded-lg">{r.paymentMethod}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <Button size="icon" className="h-8 w-8 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm" onClick={saveEditATV}><Check className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-slate-200" onClick={cancelEditATV}><X className="w-4 h-4" /></Button>
                              </>
                            ) : (
                              <>
                                {r.receiptUrl && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-[#2563eb] hover:bg-[#eff6ff]" onClick={() => window.open(r.receiptUrl, '_blank')}>
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-[#2563eb] hover:bg-[#dbeafe]" onClick={() => startEditATV(r)}><Pencil className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-700" onClick={() => requestDelete('atv', r.id, r.customerName, `${r.timeSlot} — ${format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}`)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );})}
                    {currentATV.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-[#1e3a8a]/60 font-bold italic">Nenhuma reserva ativa.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* History by month */}
            {atvByMonth.length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-[#d97706]/20 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#fef3c7] to-[#fde68a] px-6 py-4 border-b-2 border-[#d97706]/10">
                  <h2 className="font-extrabold text-[#92400e] text-lg flex items-center gap-2">
                    <History className="w-5 h-5" /> Histórico de Quadriciclos
                  </h2>
                  <p className="text-[13px] text-[#92400e] font-semibold">Reservas anteriores organizadas por mês</p>
                </div>
                <div className="divide-y divide-[#d97706]/10">
                  {atvByMonth.map(([monthKey, monthReservations]) => {
                    const isExpanded = expandedATVMonths.has(monthKey);
                    const monthRevenue = monthReservations.reduce((s, r) => s + r.finalPrice, 0);
                    return (
                      <div key={monthKey}>
                        <button onClick={() => toggleATVMonth(monthKey)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#fef3c7]/50 transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center shadow-sm">
                              <span className="text-white font-black text-sm">{monthReservations.length}</span>
                            </div>
                            <div>
                              <span className="font-extrabold text-[#92400e] text-[16px] capitalize">{formatMonthLabel(monthKey)}</span>
                              <span className="block text-[12px] font-bold text-[#b45309]">R$ {monthRevenue.toFixed(2)} total</span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-[#92400e]" /> : <ChevronDown className="w-5 h-5 text-[#92400e]" />}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            {monthReservations.map(r => (
                              <div key={r.id} className="flex items-center justify-between bg-[#eff6ff]/50 rounded-xl p-3 border border-[#93c5fd]/30">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="font-bold text-[#1e3a8a] text-sm">{format(new Date(r.date + 'T12:00:00'), 'dd/MM')}</span>
                                  <Badge className="bg-[#2563eb] text-white font-bold border-0 text-[10px]">{r.timeSlot}</Badge>
                                  <span className="font-bold text-[#1d4ed8]">{r.customerName}</span>
                                  <Badge className="bg-[#fbbf24] text-[#92400e] font-extrabold border-0 text-[10px]">{r.vehicleCount} quad.</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-[#1d4ed8] text-sm">R$ {r.finalPrice.toFixed(2)}</span>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-100" onClick={() => requestDelete('atv', r.id, r.customerName, `${r.timeSlot} — ${format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}`)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ============ DELETE CONFIRMATION POPUP ============ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-2 border-red-200 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-extrabold text-red-800">
                Confirmar Exclusão
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-[15px] text-[#14532d] font-medium space-y-3">
              <p>Você está prestes a <strong className="text-red-700">excluir permanentemente</strong> a reserva:</p>
              {deleteTarget && (
                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 space-y-1">
                  <p className="font-extrabold text-red-800 text-[16px]">{deleteTarget.name}</p>
                  <p className="font-bold text-red-700 text-sm">{deleteTarget.detail}</p>
                  <p className="font-bold text-red-600/80 text-[12px] uppercase">{deleteTarget.type === 'kiosk' ? '🛖 Quiosque' : '🛞 Quadriciclo'}</p>
                </div>
              )}
              <p className="text-[13px] text-red-700 font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
                ⚠️ Esta ação é <strong>irreversível</strong>. O horário/quiosque voltará a ficar disponível para novas reservas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <button
              type="button"
              onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-bold text-sm border-2 border-slate-300 bg-white hover:bg-slate-100 text-[#14532d] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => confirmDelete()}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-extrabold text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Sim, Excluir Reserva
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
