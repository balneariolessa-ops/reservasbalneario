import { useState } from 'react';
import { Plus, ClipboardList, Trash2, CalendarIcon, Camera, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useKioskReservations, uploadReceipt } from '@/hooks/useReservations';
import { KIOSKS, PAYMENT_METHODS, isOpenDay } from '@/types/reservation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type KioskPaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';

const KioskReservationPanel = () => {
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedKiosk, setSelectedKiosk] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { reservations, addReservation, removeReservation, isKioskBooked } = useKioskReservations();

  const handleSubmit = async () => {
    if (!selectedDateStr || selectedKiosk === null || !customerName.trim() || !paymentMethod || !paymentDate) {
      toast.error('Preencha os campos obrigatórios (Nome, Data, Quiosque, Pagamento, Data Pago)');
      return;
    }

    if (isKioskBooked(selectedKiosk, selectedDateStr)) {
      toast.error('Este quiosque já está reservado nesta data');
      return;
    }

    const kiosk = KIOSKS.find(k => k.id === selectedKiosk)!;
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
        kioskId: selectedKiosk,
        kioskName: kiosk.name,
        date: selectedDateStr,
        customerName: finalCustomerName,
        paymentMethod: paymentMethod as KioskPaymentMethod,
        paymentDate,
        price: kiosk.price,
        receiptUrl
      });
      toast.success(`Reserva do ${kiosk.name} confirmada!`);
      setCustomerName('');
      setNotes('');
      setPaymentMethod('');
      setPaymentDate('');
      setSelectedDateStr('');
      setSelectedKiosk(null);
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
      <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#dcfce7] border-2 border-[#16a34a]/30 shadow-lg flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#16a34a] flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 text-white stroke-[3]" />
          </div>
          <h3 className="font-display font-bold text-[22px] tracking-tight text-[#14532d] leading-none mt-1">
            Nova Reserva de<br />Quiosque
          </h3>
        </div>

        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Data da Reserva</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left rounded-xl h-[52px] font-bold border-2 bg-[#dcfce7] border-[#16a34a]/40 hover:bg-[#bbf7d0] hover:border-[#16a34a] hover:text-[#14532d] text-[15px] shadow-sm transition-all",
                    !selectedDateStr ? "text-[#166534]/60" : "text-[#14532d]"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-[#16a34a]" />
                  {selectedDateStr ? format(new Date(selectedDateStr + 'T12:00:00'), "PPP", { locale: ptBR }) : <span>Selecione a data no calendário...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-2 border-[#16a34a]/30 shadow-lg" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDateStr ? new Date(selectedDateStr + 'T12:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDateStr(format(date, 'yyyy-MM-dd'));
                      setSelectedKiosk(null);
                    } else {
                      setSelectedDateStr('');
                      setSelectedKiosk(null);
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

          {/* Kiosk Selection */}
          <div className="space-y-2 pt-2">
            <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Selecione o Quiosque</Label>
            <div className="grid grid-cols-2 gap-3">
              {KIOSKS.map(k => {
                const isBooked = selectedDateStr ? isKioskBooked(k.id, selectedDateStr) : false;
                const isSelected = selectedKiosk === k.id;
                return (
                  <button
                    key={k.id}
                    disabled={isBooked || !selectedDateStr}
                    onClick={() => setSelectedKiosk(k.id)}
                    className={cn(
                      'p-4 rounded-2xl border-[3px] transition-all flex flex-col items-start text-left',
                      (!selectedDateStr) && 'bg-[#f0fdf4] text-[#14532d]/40 border-[#bbf7d0] cursor-not-allowed',
                      isBooked && selectedDateStr && 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed',
                      isSelected && 'bg-[#16a34a] text-white border-[#14532d] shadow-[0_8px_20px_-6px_rgba(22,163,74,0.7)] scale-[1.03]',
                      !isSelected && !isBooked && selectedDateStr && 'bg-[#dcfce7] text-[#14532d] border-[#86efac] hover:bg-[#bbf7d0] hover:border-[#16a34a] hover:shadow-md hover:scale-[1.02] shadow-sm cursor-pointer'
                    )}
                  >
                    <span className={cn("font-extrabold text-[14px] uppercase tracking-tight", isSelected && "text-white")}>{k.name}</span>
                    <div className="flex items-center justify-between mt-2 w-full gap-2">
                      <span className={cn("text-[11px] truncate flex-1 font-bold", isSelected ? "text-green-100" : "text-[#166534]")}>Churrasqueira/Pia</span>
                      <span className={cn("text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shadow-sm", isSelected ? "bg-white/25 text-white" : "bg-[#166534] text-white")}>
                        R$ {k.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {!selectedDateStr && <p className="text-[11px] text-[#166534] font-semibold mt-2 italic ml-1">* O calendário habilitará apenas os dias em que o balneário funciona.</p>}
          </div>

          {/* Client Info */}
          <div className="bg-[#dcfce7] rounded-3xl p-6 border-2 border-[#86efac] space-y-5 shadow-sm mt-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Nome do Cliente</Label>
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ex: João Silva"
                className="rounded-xl h-[52px] font-bold bg-white border-2 border-[#86efac] focus-visible:ring-[#16a34a] focus-visible:border-[#16a34a] text-[#14532d] placeholder:text-[#14532d]/40 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="rounded-xl h-[52px] font-bold border-2 bg-white border-[#86efac] focus:ring-[#16a34a] text-[#14532d] shadow-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#86efac] font-bold text-[#14532d]">
                    {PAYMENT_METHODS.map(p => (
                      <SelectItem key={p.value} value={p.value} className="rounded-lg font-bold">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Data Pago</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="rounded-xl h-[52px] font-bold bg-white border-2 border-[#86efac] focus-visible:ring-[#16a34a] text-[#14532d] shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Observações (Opcional)</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Chegará ao meio-dia"
                className="rounded-xl min-h-[60px] font-bold border-2 bg-white border-[#86efac] focus-visible:ring-[#16a34a] text-[#14532d] placeholder:text-[#14532d]/40 resize-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-[12px] font-extrabold uppercase tracking-wider text-[#166534] ml-1">Anexar Comprovante (Imagem ou PDF)</Label>
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
                  id="kiosk-receipt-upload"
                />
                <label
                  htmlFor="kiosk-receipt-upload"
                  className={cn(
                    "flex items-center justify-center gap-3 w-full h-[52px] rounded-xl border-2 border-dashed cursor-pointer transition-all font-bold text-sm",
                    receiptFile 
                      ? "bg-[#dcfce7] border-[#16a34a] text-[#14532d]" 
                      : "bg-white border-[#86efac] text-[#166534]/60 hover:bg-[#f0fdf4] hover:border-[#16a34a]"
                  )}
                >
                  {receiptFile ? (
                    <>
                      <FileText className="w-5 h-5 text-[#16a34a]" />
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

          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="w-full rounded-2xl h-[64px] text-lg font-extrabold bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white shadow-[0_10px_30px_-8px_rgba(22,163,74,0.7)] hover:-translate-y-1 active:translate-y-0 transition-all mt-6 disabled:opacity-70 disabled:translate-y-0"
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
            ) : (
              <>✅ Confirmar Reserva</>
            )}
          </Button>
        </div>
      </Card>

      {/* History Area */}
      <Card className="p-6 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-2 border-[#16a34a]/20 shadow-lg rounded-[2.5rem]">
        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 text-[#14532d]">
          <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center shadow-sm">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          Últimas Reservas de Quiosques
        </h3>
        {reservations.length === 0 ? (
          <p className="text-[#14532d]/60 text-sm font-bold italic py-4 text-center">Nenhuma reserva registrada.</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            {reservations.slice(0, 30).map(r => (
              <div key={r.id} className="flex items-center justify-between bg-white/80 hover:bg-white transition-all rounded-2xl p-4 border-2 border-[#86efac] hover:border-[#16a34a] hover:shadow-md">
                <div>
                  <span className="font-bold text-[#15803d]">{r.customerName}</span>
                  <span className="text-[#14532d] text-xs ml-2 px-2 py-0.5 bg-[#dcfce7] rounded-md border border-[#86efac] font-extrabold shadow-sm">{r.kioskName}</span>
                  <div className="text-xs text-[#14532d] mt-1.5 font-bold flex gap-2">
                    <span>📅 {format(new Date(r.date + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                    <span>•</span>
                    <span className="text-[#16a34a] font-extrabold">R$ {r.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.receiptUrl && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 text-[#16a34a] border-[#16a34a] hover:bg-[#16a34a] hover:text-white rounded-full shadow-sm"
                      onClick={() => window.open(r.receiptUrl, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default KioskReservationPanel;
