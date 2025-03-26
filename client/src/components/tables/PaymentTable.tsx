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
  DialogTitle 
} from "@/components/ui/dialog";
import PaymentForm from "../forms/PaymentForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Payment, PaymentWithDetails } from "@/types";

const statusStyles: Record<string, { color: string; bg: string }> = {
  paid: { color: "text-green-800", bg: "bg-green-100" },
  pending: { color: "text-yellow-800", bg: "bg-yellow-100" },
  refunded: { color: "text-blue-800", bg: "bg-blue-100" },
  cancelled: { color: "text-red-800", bg: "bg-red-100" }
};

const methodIcons: Record<string, string> = {
  credit_card: "ri-bank-card-line",
  debit_card: "ri-bank-card-line",
  cash: "ri-money-dollar-box-line",
  bank_transfer: "ri-bank-line",
  online: "ri-global-line"
};

const PaymentTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/payments", page, limit, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (statusFilter) queryParams.append("status", statusFilter);
      
      const response = await fetch(`/api/payments?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      return response.json();
    }
  });
  
  const deletePaymentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Payment deleted",
        description: "Payment has been successfully deleted",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete payment: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      deletePaymentMutation.mutate(id);
    }
  };
  
  const handleEdit = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      if (!response.ok) throw new Error("Failed to fetch payment details");
      const payment = await response.json();
      
      setSelectedPayment(payment);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment details for editing",
        variant: "destructive"
      });
    }
  };
  
  const payments = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  
  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          New Payment
        </Button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: PaymentWithDetails) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.payment_id}</TableCell>
                  <TableCell>{payment.booking_id_string}</TableCell>
                  <TableCell>{payment.guest_first_name} {payment.guest_last_name}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <i className={`${methodIcons[payment.payment_method]} mr-1`}></i>
                      {formatPaymentMethod(payment.payment_method)}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${statusStyles[payment.status]?.bg} ${statusStyles[payment.status]?.color} border-none capitalize`}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(payment.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(payment.id)}
                        disabled={deletePaymentMutation.isPending}
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
          {data?.pagination && `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total} payments`}
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(page => Math.max(page - 1, 1))}
                className={page === 1 ? "disabled-class" : ""}
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
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(page => Math.min(page + 1, totalPages))}
                className={page === 1 ? "disabled-class" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      {/* Create Payment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm 
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <PaymentForm 
              payment={selectedPayment}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTable;
