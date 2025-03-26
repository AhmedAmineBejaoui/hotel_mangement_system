import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RecentBooking {
  id: number;
  booking_id: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_id: string;
  room_number: string;
  room_type: string;
  check_in_date: string;
  nights: number;
  status: string;
}

const statusVariants: Record<string, { color: string, bg: string }> = {
  confirmed: { color: "text-green-800", bg: "bg-green-100" },
  pending: { color: "text-yellow-800", bg: "bg-yellow-100" },
  cancelled: { color: "text-red-800", bg: "bg-red-100" },
  checked_in: { color: "text-blue-800", bg: "bg-blue-100" },
  checked_out: { color: "text-gray-800", bg: "bg-gray-100" }
};

const RecentBookingsTable = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings/recent"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/recent");
      if (!response.ok) {
        throw new Error("Failed to fetch recent bookings");
      }
      return response.json();
    }
  });

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
          <a href="/bookings" className="text-sm text-primary-600 hover:underline">View All</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center">Loading recent bookings...</td>
                </tr>
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking: RecentBooking) => (
                  <tr key={booking.id}>
                    <td className="py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-xs">
                          {booking.guest_first_name.charAt(0)}{booking.guest_last_name.charAt(0)}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.guest_first_name} {booking.guest_last_name}
                          </div>
                          <div className="text-xs text-gray-500">{booking.guest_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.room_number}</div>
                      <div className="text-xs text-gray-500">{booking.room_type}</div>
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(booking.check_in_date), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">{booking.nights} nights</div>
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <Badge 
                        className={`${statusVariants[booking.status]?.bg} ${statusVariants[booking.status]?.color} border-none`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center">No recent bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentBookingsTable;
