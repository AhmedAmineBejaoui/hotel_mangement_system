import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/StatCard";
import BookingChart from "@/components/dashboard/BookingChart";
import RoomTypeChart from "@/components/dashboard/RoomTypeChart";
import RecentBookingsTable from "@/components/dashboard/RecentBookingsTable";
import StaffActivityList from "@/components/dashboard/StaffActivityList";
import { DashboardStatistics } from "@/types";

const Dashboard = () => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["/api/statistics/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/statistics/dashboard");
      if (!response.ok) {
        throw new Error("Failed to load dashboard statistics");
      }
      return response.json() as Promise<DashboardStatistics>;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Overview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Hotel Overview</h2>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white">
              <option>Today</option>
              <option>This Week</option>
              <option selected>This Month</option>
              <option>This Year</option>
            </select>
            
            <button className="bg-primary-50 text-primary-700 text-sm px-3 py-1.5 rounded-md flex items-center">
              <i className="ri-download-2-line mr-1"></i>
              Export
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon="ri-hotel-bed-line" 
            title="Room Occupancy" 
            value={`${Math.round(statistics?.occupancyRate || 0)}%`}
            change={{ value: "4.3%", isPositive: true }}
            progressValue={statistics?.occupancyRate || 0}
          />
          
          <StatCard 
            icon="ri-calendar-check-line" 
            title="New Bookings" 
            value={statistics?.newBookings || 0}
            change={{ value: "12.1%", isPositive: true }}
            progressValue={75}
          />
          
          <StatCard 
            icon="ri-bank-card-line" 
            title="Revenue" 
            value={`$${Math.round(statistics?.totalRevenue || 0).toLocaleString()}`}
            change={{ value: "2.5%", isPositive: false }}
            progressValue={62}
          />
          
          <StatCard 
            icon="ri-user-line" 
            title="Guests Checked In" 
            value={statistics?.checkedInGuests || 0}
            change={{ value: "7.2%", isPositive: true }}
            progressValue={55}
          />
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BookingChart />
        </div>
        <div>
          <RoomTypeChart />
        </div>
      </div>
      
      {/* Recent Activity and Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <RecentBookingsTable />
        <StaffActivityList />
      </div>
    </>
  );
};

export default Dashboard;
