export interface KioskReservation {
  id: string;
  kioskId: number;
  kioskName: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
  paymentDate: string; // YYYY-MM-DD
  price: number;
  receiptUrl?: string;
  createdAt: string;
}

export interface ATVReservation {
  id: string;
  date: string;
  timeSlot: string;
  rideType: 'individual' | 'dupla' | 'adulto_crianca';
  vehicleCount: number;
  customerName: string;
  paymentMethod: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
  paymentDate: string;
  price: number;
  discount: number;
  finalPrice: number;
  receiptUrl?: string;
  createdAt: string;
}

export interface Kiosk {
  id: number;
  name: string;
  price: number;
  capacity: string;
  description: string;
}

export const KIOSKS: Kiosk[] = [
  { id: 1, name: 'Quiosque Grande', price: 100, capacity: '20 a 25 pessoas', description: 'Churrasqueira, pia e grelha' },
  { id: 2, name: 'Quiosque 2', price: 75, capacity: 'Até 15 pessoas', description: 'Churrasqueira, pia e grelha' },
  { id: 3, name: 'Quiosque 3', price: 75, capacity: 'Até 15 pessoas', description: 'Churrasqueira, pia e grelha' },
  { id: 4, name: 'Quiosque 4', price: 75, capacity: 'Até 15 pessoas', description: 'Churrasqueira, pia e grelha' },
  { id: 5, name: 'Quiosque 5', price: 75, capacity: 'Até 15 pessoas', description: 'Churrasqueira, pia e grelha' },
];

export const ATV_TIME_SLOTS = [
  '09:00 - 10:30',
  '10:30 - 12:00',
  '13:00 - 14:30',
  '14:30 - 16:00',
];

export const ATV_RIDE_TYPES = [
  { value: 'individual' as const, label: 'Individual', price: 150 },
  { value: 'dupla' as const, label: 'Dupla', price: 250 },
  { value: 'adulto_crianca' as const, label: 'Adulto + Criança (até 11 anos)', price: 200 },
];

export const TOTAL_ATV_VEHICLES = 5;

export const PAYMENT_METHODS = [
  { value: 'pix' as const, label: 'PIX' },
  { value: 'dinheiro' as const, label: 'Dinheiro' },
  { value: 'cartao_credito' as const, label: 'Cartão de Crédito' },
  { value: 'cartao_debito' as const, label: 'Cartão de Débito' },
];

export function isOpenDay(date: Date): boolean {
  const day = date.getDay();
  // 0=Sunday, 1=Monday, 5=Friday, 6=Saturday
  return day === 0 || day === 1 || day === 5 || day === 6;
}

export function getDayDiscount(date: Date): number {
  const day = date.getDay();
  if (day === 1 || day === 5) return 0.20; // Monday/Friday 20%
  if (day === 0 || day === 6) return 0.10; // Sunday/Saturday 10%
  return 0;
}

export function getDayName(date: Date): string {
  const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return names[date.getDay()];
}
