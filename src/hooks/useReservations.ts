import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { KioskReservation, ATVReservation } from '@/types/reservation';

export const uploadReceipt = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath);

  return publicUrl;
};

export function useKioskReservations() {
  const [reservations, setReservations] = useState<KioskReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from('kiosk_reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReservations(data.map(r => ({
        id: r.id,
        kioskId: r.kiosk_id,
        kioskName: r.kiosk_name,
        date: r.date,
        customerName: r.customer_name,
        paymentMethod: r.payment_method as KioskReservation['paymentMethod'],
        paymentDate: r.payment_date,
        price: Number(r.price),
        receiptUrl: r.receipt_url,
        createdAt: r.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('kiosk_reservations_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosk_reservations' }, () => {
        fetchReservations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReservations]);

  const addReservation = async (reservation: Omit<KioskReservation, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('kiosk_reservations').insert({
      kiosk_id: reservation.kioskId,
      kiosk_name: reservation.kioskName,
      date: reservation.date,
      customer_name: reservation.customerName,
      payment_method: reservation.paymentMethod,
      payment_date: reservation.paymentDate,
      price: reservation.price,
      receipt_url: reservation.receiptUrl,
    }).select().single();

    if (!error && data) {
      await fetchReservations();
      return data;
    }
    throw error;
  };

  const updateReservation = async (id: string, updates: Partial<Omit<KioskReservation, 'id' | 'createdAt'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.kioskId !== undefined) dbUpdates.kiosk_id = updates.kioskId;
    if (updates.kioskName !== undefined) dbUpdates.kiosk_name = updates.kioskName;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.paymentDate !== undefined) dbUpdates.payment_date = updates.paymentDate;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;

    const { error } = await supabase.from('kiosk_reservations').update(dbUpdates).eq('id', id);
    if (!error) await fetchReservations();
    else throw error;
  };

  const removeReservation = async (id: string) => {
    const { error } = await supabase.from('kiosk_reservations').delete().eq('id', id);
    if (!error) await fetchReservations();
    else throw error;
  };

  const getReservationsForDate = (date: string) =>
    reservations.filter(r => r.date === date);

  const isKioskBooked = (kioskId: number, date: string) =>
    reservations.some(r => r.kioskId === kioskId && r.date === date);

  return { reservations, loading, addReservation, updateReservation, removeReservation, getReservationsForDate, isKioskBooked, refetch: fetchReservations };
}

export function useATVReservations() {
  const [reservations, setReservations] = useState<ATVReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from('atv_reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReservations(data.map(r => ({
        id: r.id,
        date: r.date,
        timeSlot: r.time_slot,
        rideType: r.ride_type as ATVReservation['rideType'],
        vehicleCount: r.vehicle_count,
        customerName: r.customer_name,
        paymentMethod: r.payment_method as ATVReservation['paymentMethod'],
        paymentDate: r.payment_date,
        price: Number(r.price),
        discount: Number(r.discount),
        finalPrice: Number(r.final_price),
        receiptUrl: r.receipt_url,
        createdAt: r.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('atv_reservations_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atv_reservations' }, () => {
        fetchReservations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReservations]);

  const addReservation = async (reservation: Omit<ATVReservation, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('atv_reservations').insert({
      date: reservation.date,
      time_slot: reservation.timeSlot,
      ride_type: reservation.rideType,
      vehicle_count: reservation.vehicleCount,
      customer_name: reservation.customerName,
      payment_method: reservation.paymentMethod,
      payment_date: reservation.paymentDate,
      price: reservation.price,
      discount: reservation.discount,
      final_price: reservation.finalPrice,
      receipt_url: reservation.receiptUrl,
    }).select().single();

    if (!error && data) {
      await fetchReservations();
      return data;
    }
    throw error;
  };

  const updateReservation = async (id: string, updates: Partial<Omit<ATVReservation, 'id' | 'createdAt'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.timeSlot !== undefined) dbUpdates.time_slot = updates.timeSlot;
    if (updates.rideType !== undefined) dbUpdates.ride_type = updates.rideType;
    if (updates.vehicleCount !== undefined) dbUpdates.vehicle_count = updates.vehicleCount;
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.paymentDate !== undefined) dbUpdates.payment_date = updates.paymentDate;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.finalPrice !== undefined) dbUpdates.final_price = updates.finalPrice;
    if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;

    const { error } = await supabase.from('atv_reservations').update(dbUpdates).eq('id', id);
    if (!error) await fetchReservations();
    else throw error;
  };

  const removeReservation = async (id: string) => {
    const { error } = await supabase.from('atv_reservations').delete().eq('id', id);
    if (!error) await fetchReservations();
    else throw error;
  };

  const getVehiclesBookedForSlot = (date: string, timeSlot: string) =>
    reservations
      .filter(r => r.date === date && r.timeSlot === timeSlot)
      .reduce((sum, r) => sum + r.vehicleCount, 0);

  return { reservations, loading, addReservation, updateReservation, removeReservation, getVehiclesBookedForSlot, refetch: fetchReservations };
}
