import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Payment, BookingWithDetails } from "@/types";

// Form schema derived from the Payment interface
const paymentFormSchema = z.object({
  booking_id: z.coerce.number({
    required_error: "Please select a booking.",
  }),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, {
      message: "Amount must be 0 or more.",
    })
  ),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in the format YYYY-MM-DD.",
  }),
  payment_method: z.enum(["credit_card", "debit_card", "cash", "bank_transfer", "online"], {
    required_error: "Please select a payment method.",
  }),
  status: z.enum(["paid", "pending", "refunded", "cancelled"], {
    required_error: "Please select a payment status.",
  }),
  transaction_id: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  payment?: Payment;
  onSuccess: () => void;
}

export default function PaymentForm({ payment, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const isEditing = !!payment;

  // Format date to YYYY-MM-DD for input type="date"
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch bookings for dropdown
  const { data: bookings } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings?limit=100");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    }
  });

  // Set up form with default values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment ? {
      booking_id: payment.booking_id,
      amount: payment.amount,
      payment_date: formatDateForInput(payment.payment_date),
      payment_method: payment.payment_method,
      status: payment.status,
      transaction_id: payment.transaction_id || "",
      notes: payment.notes || "",
    } : {
      booking_id: undefined as unknown as number,
      amount: 0,
      payment_date: formatDateForInput(new Date().toISOString()),
      payment_method: "credit_card",
      status: "pending",
      transaction_id: "",
      notes: "",
    },
  });

  // Update amount when booking is selected (for new payments)
  const watchedBookingId = form.watch("booking_id");
  
  // Fetch the booking details when booking is selected
  const { data: bookingDetails } = useQuery({
    queryKey: ["/api/bookings", watchedBookingId],
    enabled: !!watchedBookingId && !isEditing,
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${watchedBookingId}`);
      if (!response.ok) throw new Error("Failed to fetch booking details");
      return response.json();
    }
  });

  // Set the amount based on the selected booking (if this is a new payment)
  if (bookingDetails && !isEditing && bookingDetails.total_price !== form.getValues("amount")) {
    form.setValue("amount", bookingDetails.total_price);
  }

  // Mutation for creating or updating a payment
  const mutation = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      if (isEditing && payment) {
        return apiRequest("PUT", `/api/payments/${payment.id}`, values);
      } else {
        return apiRequest("POST", "/api/payments", values);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Payment updated" : "Payment created",
        description: isEditing 
          ? "The payment has been updated successfully." 
          : "A new payment has been created successfully.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: PaymentFormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="booking_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value?.toString()}
                disabled={isEditing}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bookings?.data?.map((booking: BookingWithDetails) => (
                    <SelectItem key={booking.id} value={booking.id.toString()}>
                      {booking.booking_id} - {booking.guest_first_name} {booking.guest_last_name} (${booking.total_price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="transaction_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input placeholder="Transaction reference number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional payment notes..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : (isEditing ? "Update Payment" : "Create Payment")}
          </Button>
        </div>
      </form>
    </Form>
  );
}