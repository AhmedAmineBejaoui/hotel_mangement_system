import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoomTable from "@/components/tables/RoomTable";
import { useQuery } from "@tanstack/react-query";

const Rooms = () => {
  const { data: roomStats } = useQuery({
    queryKey: ["/api/room-stats/by-status"],
    queryFn: async () => {
      const response = await fetch("/api/room-stats/by-status");
      if (!response.ok) {
        throw new Error("Failed to fetch room statistics");
      }
      return response.json();
    }
  });

  // Calculate overview statistics
  const getTotalRooms = () => {
    if (!roomStats) return 0;
    return roomStats.reduce((sum: number, stat: {count: number}) => sum + stat.count, 0);
  };

  const getVacantRooms = () => {
    if (!roomStats) return 0;
    const vacant = roomStats.find((stat: {status: string}) => stat.status === 'vacant');
    return vacant ? vacant.count : 0;
  };

  const getOccupiedRooms = () => {
    if (!roomStats) return 0;
    const occupied = roomStats.find((stat: {status: string}) => stat.status === 'occupied');
    return occupied ? occupied.count : 0;
  };

  const getOccupancyRate = () => {
    const total = getTotalRooms();
    const occupied = getOccupiedRooms();
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Room Management</h2>
        <p className="text-muted-foreground">
          Manage hotel rooms, including viewing statuses, adding, editing, and configuring rooms.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M2 22h20V2z M2 22 22 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalRooms()}</div>
            <p className="text-xs text-muted-foreground">
              Total number of rooms available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacancy</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVacantRooms()}</div>
            <p className="text-xs text-muted-foreground">
              Available rooms for booking
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 22V2" />
              <path d="M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOccupancyRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Current room occupancy rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomTable />
        </CardContent>
      </Card>
    </>
  );
};

export default Rooms;
