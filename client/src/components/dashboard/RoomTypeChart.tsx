import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface RoomTypeData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

const RoomTypeChart = () => {
  const { data: roomTypeData, isLoading } = useQuery({
    queryKey: ["/api/statistics/rooms/popular"],
    queryFn: async () => {
      const response = await fetch("/api/statistics/rooms/popular");
      if (!response.ok) {
        throw new Error("Failed to fetch room type statistics");
      }
      return response.json();
    }
  });

  const transformedData: RoomTypeData[] = roomTypeData?.map((item: any, index: number) => ({
    name: item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1),
    value: Number(item.percentage) || 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Sample data for when the API isn't returning real data yet
  const sampleData: RoomTypeData[] = [
    { name: "Deluxe", value: 45, color: COLORS[0] },
    { name: "Standard", value: 30, color: COLORS[1] },
    { name: "Suite", value: 25, color: COLORS[2] }
  ];

  const displayData = transformedData.length > 0 ? transformedData : sampleData;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800">Room Types Booked</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
        
        <div className="h-44 w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={false}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          {displayData.map((entry, index) => (
            <div key={index} className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="ml-2 text-sm text-gray-600">
                {entry.name} ({entry.value}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomTypeChart;