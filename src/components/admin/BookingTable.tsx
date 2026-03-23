import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingTableProps {
  bookings: any[];
  onStatusChange: (id: string, status: string) => void;
  onAddNote: () => void;
  updatingId: string | null;
}

export const BookingTable = ({ bookings, onStatusChange, updatingId }: BookingTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{new Date(booking.visit_date).toLocaleDateString()}</TableCell>
              <TableCell>{booking.customer_name}</TableCell>
              <TableCell>
                <Badge variant={booking.status === 'confirmed' ? 'black' : 'outline'}>
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                  disabled={updatingId === booking.id}
                >
                  Confirmar
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                Nenhuma reserva encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
