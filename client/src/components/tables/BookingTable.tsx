import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import BookingForm from "../forms/BookingForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { calculateNights } from "@/lib/utils";
import { Booking, BookingWithDetails } from "@/types";

const statusStyles: Record<string, { color: string; bg: string }> = {
  pending: { color: "text-yellow-800", bg: "bg-yellow-100" },
  confirmed: { color: "text-green-800", bg: "bg-green-100" },
  checked_in: { color: "text-blue-800", bg: "bg-blue-100" },
  checked_out: { color: "text-gray-800", bg: "bg-gray-100" },
  cancelled: { color: "text-red-800", bg: "bg-red-100" }
};

const BookingTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/bookings", page, limit, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (statusFilter) queryParams.append("status", statusFilter);
      
      const response = await fetch(`/api/bookings?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    }
  });
  
  const deleteBookingMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking deleted",
        description: "Booking has been successfully deleted",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete booking: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this booking? This will also update the room status.")) {
      deleteBookingMutation.mutate(id);
    }
  };
  
  const handleEdit = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error("Failed to fetch booking details");
      const booking = await response.json();
      
      setSelectedBooking(booking);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load booking details for editing",
        variant: "destructive"
      });
    }
  };
  
  const bookings = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          New Booking
        </Button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Loading bookings...
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking: BookingWithDetails) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.booking_id}</TableCell>
                  <TableCell>
                    <div>{booking.guest_first_name} {booking.guest_last_name}</div>
                    <div className="text-xs text-gray-500">{booking.guest_id_string}</div>
                  </TableCell>
                  <TableCell>
                    <div>{booking.room_number}</div>
                    <div className="text-xs text-gray-500 capitalize">{booking.room_type}</div>
                  </TableCell>
                  <TableCell>
                    <div>{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-500">
                      {calculateNights(booking.check_in_date, booking.check_out_date)} nights
                    </div>
                  </TableCell>
                  <TableCell>${booking.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${statusStyles[booking.status]?.bg} ${statusStyles[booking.status]?.color} border-none capitalize`}
                    >
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(booking.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(booking.id)}
                        disabled={deleteBookingMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data?.pagination && `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total} bookings`}
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => {
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
              <PaginationNext 
                onClick={() => {
                  if (page < totalPages) setPage(page + 1);
                }}
              />
          </PaginationContent>
        </Pagination>      
            
      
      {/* Create Booking Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Create a new booking for a guest. Available rooms will be shown.
            </DialogDescription>
          </DialogHeader>
          <BookingForm 
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingForm 
              booking={selectedBooking}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
    </div>
)};

export default BookingTable;
