import { useState } from 'react';
import { ClipboardList, Trash2, Bike, CalendarIcon, Camera, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useATVReservations, uploadReceipt } from '@/hooks/useReservations';
import { ATV_TIME_SLOTS, ATV_RIDE_TYPES, TOTAL_ATV_VEHICLES, PAYMENT_METHODS, getDayDiscount, getDayName, isOpenDay } from '@/types/reservation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ATVReservationPanel = () => {
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [rideType, setRideType] = useState('');
  const [vehicleCount, setVehicleCount] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { reservations, addReservation, removeReservation, getVehiclesBookedForSlot } = useATVReservations();

  const selectedDateObj = selectedDateStr ? new Date(`${selectedDateStr}T12:00:00`) : null;
  const discount = selectedDateObj ? getDayDiscount(selectedDateObj) : 0;
  const rideInfo = ATV_RIDE_TYPES.find(r => r.value === rideType);
  const count = parseInt(vehicleCount) || 1;
  const basePrice = rideInfo ? rideInfo.price * count : 0;
  const discountAmount = basePrice * discount;
  const finalPrice = basePrice - discountAmount;

  const handleSubmit = async () => {
    if (!selectedDateStr || !selectedSlot || !rideType || !customerName.trim() || !paymentMethod || !paymentDate) {
      toast.error('Preencha os campos obrigatórios (Data, Horário, Modalidade, Nome, Pagamento, Data Pago)');
      return;
    }

    const booked = getVehiclesBookedForSlot(selectedDateStr, selectedSlot);
    if (booked + count > TOTAL_ATV_VEHICLES) {
      toast.error(`Apenas ${Math.max(0, TOTAL_ATV_VEHICLES - booked)} quadriciclo(s) disponível(is) neste horário`);
      return;
    }

    const finalCustomerName = customerName.trim() + (notes.trim() ? ` | Obs: ${notes.trim()}` : '');

    setIsUploading(true);
    try {
      let receiptUrl = '';
      if (receiptFile) {
        try {
          receiptUrl = await uploadReceipt(receiptFile);
        } catch (err) {
          toast.error('Erro ao fazer upload do comprovante');
          setIsUploading(false);
          return;
        }
      }

      await addReservation({
        date: selectedDateStr,
        timeSlot: selectedSlot,
        rideType: rideType as 'individual' | 'dupla' | 'adulto_crianca',
        vehicleCount: count,
        customerName: finalCustomerName,
        paymentMethod: paymentMethod as 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito',
        paymentDate,
        price: basePrice,
        discount: discountAmount,
        finalPrice,
        receiptUrl
      });

      toast.success('Reserva de quadriciclo confirmada!');
      setSelectedSlot('');
      setRideType('');
      setVehicleCount('1');
      setCustomerName('');
      setNotes('');
      setPaymentMethod('');
      setPaymentDate('');
      setSelectedDateStr('');
      setReceiptFile(null);
    } catch {
      toast.error('Erro ao salvar reserva');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Form Area */}
      <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe] border-2 border-[#2563eb]/30 shadow-lg flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center shadow-md">
            <Bike className="w-5 h-5 text-white stroke-[3]" />
          </div>
          <h3 className="font-display font-bold text-[22px] tracking-tight text-[#1e3a8a] leading-none mt-1">
            Nova Reserva de<br />Quadriciclo
          </h3>
        </div>

        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Data da Reserva</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left rounded-xl h-[52px] font-bold border-2 bg-[#dbeafe] border-[#3b82f6]/50 hover:bg-[#bfdbfe] hover:border-[#2563eb] hover:text-[#1e3a8a] text-[15px] shadow-sm transition-all",
                    !selectedDateStr ? "text-[#1e3a8a]/60" : "text-[#1e3a8a]"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-[#2563eb]" />
                  {selectedDateStr ? format(new Date(selectedDateStr + 'T12:00:00'), "PPP", { locale: ptBR }) : <span>Selecione a data no calendário...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-2 border-[#2563eb]/30 shadow-lg" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDateStr ? new Date(selectedDateStr + 'T12:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDateStr(format(date, 'yyyy-MM-dd'));
                      setSelectedSlot('');
                    } else {
                      setSelectedDateStr('');
                      setSelectedSlot('');
                    }
                  }}
                  disabled={(date) => !isOpenDay(date) || isBefore(date, startOfDay(new Date()))}
                  initialFocus
                  locale={ptBR}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-2 pt-2">
            <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Selecione o Horário (1h30)</Label>
            <div className="grid grid-cols-2 gap-3">
              {ATV_TIME_SLOTS.map(slot => {
                const booked = selectedDateStr ? getVehiclesBookedForSlot(selectedDateStr, slot) : 0;
                const available = TOTAL_ATV_VEHICLES - booked;
                const isSlotSelected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    disabled={available <= 0 || !selectedDateStr}
                    onClick={() => {
                      setSelectedSlot(slot);
                      if (parseInt(vehicleCount) > available) {
                        setVehicleCount(String(Math.max(1, available)));
                      }
                    }}
                    className={cn(
                      'p-4 rounded-2xl border-[3px] transition-all text-center flex flex-col items-center justify-center',
                      (!selectedDateStr) && 'bg-[#eff6ff] text-[#1e3a8a]/40 border-[#93c5fd] cursor-not-allowed',
                      available <= 0 && selectedDateStr && 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed',
                      isSlotSelected && 'bg-[#2563eb] text-white border-[#1e3a8a] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.7)] scale-[1.03]',
                      !isSlotSelected && available > 0 && selectedDateStr && 'bg-[#dbeafe] text-[#1e3a8a] border-[#93c5fd] hover:bg-[#bfdbfe] hover:border-[#2563eb] hover:shadow-md hover:scale-[1.02] cursor-pointer shadow-sm'
                    )}
                  >
                    <span className={cn("text-[16px]", isSlotSelected ? "font-bold text-white" : "font-extrabold")}>{slot}</span>
                    <span className={cn("text-[11px] mt-0.5", isSlotSelected ? "text-blue-100 font-bold" : "text-[#2563eb] font-bold")}>
                      {!selectedDateStr ? '-' : (available <= 0 ? '🚫 Lotação Max' : `${available} Disp.`)}
                    </span>
                  </button>
                );
              })}
            </div>
            {!selectedDateStr && <p className="text-[11px] text-[#1e3a8a] font-semibold mt-2 italic ml-1">* O calendário habilitará apenas os dias em que o balneário funciona.</p>}
          </div>

          {/* Client Info */}
          <div className="bg-[#dbeafe] rounded-3xl p-6 border-2 border-[#93c5fd] space-y-5 shadow-sm mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Modalidade</Label>
                <Select value={rideType} onValueChange={setRideType}>
                  <SelectTrigger className="rounded-xl h-[52px] font-bold border-2 bg-white border-[#93c5fd] focus:ring-[#2563eb] text-[#1e3a8a] shadow-sm">
                    <SelectValue placeholder="Trilha" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#93c5fd] font-bold text-[#1e3a8a]">
                    {ATV_RIDE_TYPES.map(r => (
                      <SelectItem key={r.value} value={r.value} className="rounded-lg font-bold">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Qtde. Autos</Label>
                <Select value={vehicleCount} onValueChange={setVehicleCount} disabled={!selectedSlot}>
                  <SelectTrigger className="rounded-xl h-[52px] font-bold border-2 bg-white border-[#93c5fd] focus:ring-[#2563eb] text-[#1e3a8a] shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#93c5fd] font-bold text-[#1e3a8a]">
                    {(selectedDateStr && selectedSlot) ? (
                      Array.from({ length: Math.max(1, TOTAL_ATV_VEHICLES - getVehiclesBookedForSlot(selectedDateStr, selectedSlot)) }).map((_, i) => {
                        const n = i + 1;
                        return <SelectItem key={n} value={String(n)} className="rounded-lg font-bold">{n} quadriciclo{n !== 1 ? 's' : ''}</SelectItem>
                      })
                    ) : (
                      <SelectItem value="1" className="rounded-lg" disabled>Selecione um horário</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Nome do Cliente</Label>
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ex: João Silva"
                className="rounded-xl h-[52px] font-bold bg-white border-2 border-[#93c5fd] focus-visible:ring-[#2563eb] focus-visible:border-[#2563eb] text-[#1e3a8a] placeholder:text-[#1e3a8a]/40 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="rounded-xl h-[52px] font-bold border-2 bg-white border-[#93c5fd] focus:ring-[#2563eb] text-[#1e3a8a] shadow-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#93c5fd] font-bold text-[#1e3a8a]">
                    {PAYMENT_METHODS.map(p => (
                      <SelectItem key={p.value} value={p.value} className="rounded-lg font-bold">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Data Pago</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="rounded-xl h-[52px] font-bold bg-white border-2 border-[#93c5fd] focus-visible:ring-[#2563eb] text-[#1e3a8a] shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Observações (Opcional)</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Anotações sobre a reserva..."
                className="rounded-xl min-h-[60px] font-bold border-2 bg-white border-[#93c5fd] focus-visible:ring-[#2563eb] text-[#1e3a8a] placeholder:text-[#1e3a8a]/40 resize-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#1e3a8a] ml-1">Anexar Comprovante (Imagem ou PDF)</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="atv-receipt-upload"
                />
                <label
                  htmlFor="atv-receipt-upload"
                  className={cn(
                    "flex items-center justify-center gap-3 w-full h-[52px] rounded-xl border-2 border-dashed cursor-pointer transition-all font-bold text-sm",
                    receiptFile 
                      ? "bg-[#dbeafe] border-[#2563eb] text-[#1e3a8a]" 
                      : "bg-white border-[#93c5fd] text-[#1e3a8a]/60 hover:bg-[#eff6ff] hover:border-[#2563eb]"
                  )}
                >
                  {receiptFile ? (
                    <>
                      <FileText className="w-5 h-5 text-[#2563eb]" />
                      <span className="truncate max-w-[200px]">{receiptFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Clique para anexar comprovante</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {rideInfo && (
            <div className="bg-gradient-to-r from-[#fef3c7] to-[#fde68a] rounded-2xl p-5 border-2 border-[#f59e0b] space-y-2 !mt-6 shadow-md">
              <div className="flex justify-between text-sm text-[#92400e] font-bold">
                <span>{rideInfo.label} × {count}</span>
                <span>R$ {basePrice.toFixed(2)}</span>
              </div>
              {discount > 0 && selectedDateObj && (
                <div className="flex justify-between text-sm text-[#15803d] font-bold">
                  <span>🎉 Promoção de {getDayName(selectedDateObj)}</span>
                  <span>- R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-[18px] pt-3 border-t-2 border-[#f59e0b]/40 mt-2">
                <span className="text-[#92400e]">Total Final</span>
                <span className="text-[#1d4ed8]">R$ {finalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="w-full rounded-2xl h-[64px] text-lg font-extrabold bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.7)] hover:-translate-y-1 active:translate-y-0 transition-all mt-6 disabled:opacity-70 disabled:translate-y-0"
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
            ) : (
              <>🏍️ Confirmar Reserva</>
            )}
          </Button>
        </div>
      </Card>

      {/* History Area */}
      <Card className="p-6 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border-2 border-[#2563eb]/20 shadow-lg rounded-[2.5rem]">
        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 text-[#1e3a8a]">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center shadow-sm">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          Últimas Reservas de Quadriciclos
        </h3>
        {reservations.length === 0 ? (
          <p className="text-[#1e3a8a]/60 text-sm font-bold italic py-4 text-center">Nenhuma reserva registrada.</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            {reservations.slice(0, 30).map(r => (
              <div key={r.id} className="flex items-center justify-between bg-white/80 hover:bg-white transition-all rounded-2xl p-4 border-2 border-[#93c5fd] hover:border-[#2563eb] hover:shadow-md">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1d4ed8]">{r.customerName}</span>
                    <Badge variant="secondary" className="bg-[#fbbf24] text-[#92400e] hover:bg-[#fbbf24] border-0 text-[10px] uppercase font-extrabold py-0.5 shadow-sm">{r.vehicleCount} quad.</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1e3a8a] mt-1">
                    <span className="font-bold bg-[#dbeafe] px-2 py-0.5 rounded-md border border-[#93c5fd]">
                      📅 {format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}
                    </span>
                    <span>•</span>
                    <span className="font-extrabold text-[#2563eb]">{r.timeSlot}</span>
                    <span>•</span>
                    <span className="font-extrabold text-[#16a34a]">R$ {r.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.receiptUrl && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 text-[#2563eb] border-[#2563eb] hover:bg-[#2563eb] hover:text-white rounded-full shadow-sm"
                      onClick={() => window.open(r.receiptUrl, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all shadow-sm border border-red-200 hover:border-red-500" onClick={async () => {
                    if (confirm('Deseja realmente excluir esta reserva?')) {
                      try {
                        await removeReservation(r.id);
                        toast.success('Reserva removida');
                      } catch {
                        toast.error('Erro ao remover');
                      }
                    }
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ATVReservationPanel;
