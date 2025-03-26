import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { Room } from "@/types";

// Form schema derived from the Room interface
const roomFormSchema = z.object({
  room_number: z.string().min(1, {
    message: "Room number is required.",
  }),
  room_type: z.enum(["standard", "deluxe", "suite"], {
    required_error: "Please select a room type.",
  }),
  status: z.enum(["vacant", "occupied", "maintenance", "cleaning", "booked"], {
    required_error: "Please select a room status.",
  }),
  capacity_adults: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, {
      message: "At least 1 adult capacity is required.",
    })
  ),
  capacity_children: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, {
      message: "Children capacity must be 0 or more.",
    })
  ),
  price_per_night: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, {
      message: "Price must be 0 or more.",
    })
  ),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
  room?: Room;
  onSuccess: () => void;
}

export default function RoomForm({ room, onSuccess }: RoomFormProps) {
  const { toast } = useToast();
  const isEditing = !!room;

  // Set up form with default values
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: room ? {
      room_number: room.room_number,
      room_type: room.room_type,
      status: room.status,
      capacity_adults: room.capacity_adults,
      capacity_children: room.capacity_children,
      price_per_night: room.price_per_night,
      description: room.description || "",
      is_active: room.is_active,
    } : {
      room_number: "",
      room_type: "standard",
      status: "vacant",
      capacity_adults: 1,
      capacity_children: 0,
      price_per_night: 0,
      description: "",
      is_active: true,
    },
  });

  // Mutation for creating or updating a room
  const mutation = useMutation({
    mutationFn: async (values: RoomFormValues) => {
      if (isEditing && room) {
        return apiRequest("PUT", `/api/rooms/${room.id}`, values);
      } else {
        return apiRequest("POST", "/api/rooms", values);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Room updated" : "Room created",
        description: isEditing 
          ? "The room has been updated successfully." 
          : "A new room has been created successfully.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} room: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: RoomFormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="room_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Number</FormLabel>
                <FormControl>
                  <Input placeholder="101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="room_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
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
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="capacity_adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adult Capacity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    placeholder="2" 
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
            name="capacity_children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children Capacity</FormLabel>
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
            name="price_per_night"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Night ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    placeholder="120.00" 
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Comfortable room with a queen-sized bed and a view of the city..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Set whether this room is active and available for bookings.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
            {mutation.isPending ? "Saving..." : (isEditing ? "Update Room" : "Create Room")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
