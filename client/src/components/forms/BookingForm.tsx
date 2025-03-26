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
import { Booking, Guest, Room } from "@/types";
import { format } from "date-fns";
import { calculateNights } from "@/lib/utils";

// Form schema derived from the Booking interface
const bookingFormSchema = z.object({
  guest_id: z.coerce.number({
    required_error: "Please select a guest.",
  }),
  room_id: z.coerce.number({
    required_error: "Please select a room.",
  }),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in the format YYYY-MM-DD.",
  }),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in the format YYYY-MM-DD.",
  }),
  adults: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, {
      message: "At least 1 adult is required.",
    })
  ),
  children: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, {
      message: "Children count must be 0 or more.",
    })
  ),
  total_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, {
      message: "Total price must be 0 or more.",
    })
  ),
  status: z.enum(["confirmed", "pending", "cancelled", "checked_in", "checked_out"], {
    required_error: "Please select a booking status.",
  }),
  special_requests: z.string().optional(),
}).refine((data) => {
  const checkIn = new Date(data.check_in_date);
  const checkOut = new Date(data.check_out_date);
  return checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["check_out_date"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  booking?: Booking;
  onSuccess: () => void;
}

export default function BookingForm({ booking, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const isEditing = !!booking;

  // Format date to YYYY-MM-DD for input type="date"
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch guests for dropdown
  const { data: guests } = useQuery({
    queryKey: ["/api/guests"],
    queryFn: async () => {
      const response = await fetch("/api/guests?limit=100");
      if (!response.ok) throw new Error("Failed to fetch guests");
      return response.json();
    }
  });

  // Fetch rooms for dropdown (only vacant or the current room if editing)
  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms", isEditing ? booking?.room_id : undefined],
    queryFn: async () => {
      let url = "/api/rooms?limit=100";
      if (!isEditing) {
        url += "&status=vacant";
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      return response.json();
    }
  });

  // Set up form with default values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: booking ? {
      guest_id: booking.guest_id,
      room_id: booking.room_id,
      check_in_date: formatDateForInput(booking.check_in_date),
      check_out_date: formatDateForInput(booking.check_out_date),
      adults: booking.adults,
      children: booking.children,
      total_price: booking.total_price,
      status: booking.status,
      special_requests: booking.special_requests || "",
    } : {
      guest_id: undefined as unknown as number,
      room_id: undefined as unknown as number,
      check_in_date: formatDateForInput(new Date().toISOString()),
      check_out_date: formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
      adults: 1,
      children: 0,
      total_price: 0,
      status: "pending",
      special_requests: "",
    },
  });

  // Calculate total price based on selected room and dates
  const calculateTotalPrice = (roomId: number, checkInDate: string, checkOutDate: string) => {
    if (!rooms || !roomId || !checkInDate || !checkOutDate) return 0;
    
    const room = rooms.data?.find((r: Room) => r.id === roomId);
    if (!room) return 0;
    
    const nights = calculateNights(checkInDate, checkOutDate);
    return room.price_per_night * nights;
  };

  // Watch form fields to update total price
  const watchedRoomId = form.watch("room_id");
  const watchedCheckInDate = form.watch("check_in_date");
  const watchedCheckOutDate = form.watch("check_out_date");

  // Update total price when room or dates change
  if (watchedRoomId && watchedCheckInDate && watchedCheckOutDate) {
    const newTotalPrice = calculateTotalPrice(watchedRoomId, watchedCheckInDate, watchedCheckOutDate);
    if (newTotalPrice > 0 && newTotalPrice !== form.getValues("total_price")) {
      form.setValue("total_price", newTotalPrice);
    }
  }

  // Mutation for creating or updating a booking
  const mutation = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      if (isEditing && booking) {
        return apiRequest("PUT", `/api/bookings/${booking.id}`, values);
      } else {
        return apiRequest("POST", "/api/bookings", values);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Booking updated" : "Booking created",
        description: isEditing 
          ? "The booking has been updated successfully." 
          : "A new booking has been created successfully.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: BookingFormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="guest_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guest</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a guest" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {guests?.data?.map((guest: Guest) => (
                      <SelectItem key={guest.id} value={guest.id.toString()}>
                        {guest.first_name} {guest.last_name} ({guest.guest_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="room_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms?.data?.map((room: Room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.room_number} - {room.room_type.toUpperCase()} (${room.price_per_night}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="check_in_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check_out_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adults</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    placeholder="1" 
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
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    placeholder="0" 
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
            name="total_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price ($)</FormLabel>
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
        </div>

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
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="special_requests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requests from the guest..." 
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
            {mutation.isPending ? "Saving..." : (isEditing ? "Update Booking" : "Create Booking")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
