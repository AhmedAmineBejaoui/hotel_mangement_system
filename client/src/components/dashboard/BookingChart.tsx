import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";

type Period = "weekly" | "monthly" | "yearly";

interface BookingData {
  name: string;
  bookings: number;
}

const BookingChart = () => {
  const [period, setPeriod] = useState<Period>("weekly");
  
  const { data: bookingData, isLoading } = useQuery({
    queryKey: ["/api/statistics/bookings", period],
    queryFn: async () => {
      const response = await fetch(`/api/statistics/bookings/${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking statistics");
      }
      return response.json();
    }
  });

  const transformedData = bookingData?.map((item: any) => ({
    name: item.period,
    bookings: Number(item.total) || 0
  })) || [];

  // Sample data for when the API isn't returning real data yet
  const sampleData: BookingData[] = [
    { name: "Mon", bookings: 24 },
    { name: "Tue", bookings: 35 },
    { name: "Wed", bookings: 29 },
    { name: "Thu", bookings: 45 },
    { name: "Fri", bookings: 39 },
    { name: "Sat", bookings: 48 },
    { name: "Sun", bookings: 33 }
  ];

  const displayData = transformedData.length > 0 ? transformedData : [];

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800">Booking Overview</h3>
          <div className="flex space-x-2">
            <button 
              className={`text-xs px-2 py-1 rounded ${period === "weekly" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button 
              className={`text-xs px-2 py-1 rounded ${period === "monthly" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
            <button 
              className={`text-xs px-2 py-1 rounded ${period === "yearly" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-100"}`}
              onClick={() => setPeriod("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>
        
        <div className="h-64 w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayData.length > 0 ? displayData : sampleData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3B82F6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingChart;
