import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StaffTable from "@/components/tables/StaffTable";
import { useQuery } from "@tanstack/react-query";

const Staff = () => {
  const { data: staffCount } = useQuery({
    queryKey: ["/api/staff", "count"],
    queryFn: async () => {
      // This is a simplified approach, ideally we would have a specific endpoint for this
      const response = await fetch("/api/staff?limit=1");
      if (!response.ok) {
        throw new Error("Failed to fetch staff count");
      }
      const data = await response.json();
      return data.pagination?.total || 0;
    }
  });

  // Get recent staff activities
  const { data: recentActivities } = useQuery({
    queryKey: ["/api/staff-activities"],
    queryFn: async () => {
      const response = await fetch("/api/staff-activities");
      if (!response.ok) {
        throw new Error("Failed to fetch staff activities");
      }
      return response.json();
    }
  });

  // Calculate activity stats (in a real app, this would come from the API)
  const getActivityCount = () => {
    return recentActivities?.length || 0;
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Manage hotel staff, including viewing, adding, editing, and removing staff information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active staff members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActivityCount()}</div>
            <p className="text-xs text-muted-foreground">
              Activities in the past 24 hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
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
              <path d="M21 9H3M21 3h-6m6 18h-6M3 3h6m0 18H3M21 15H3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Active operational departments
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffTable />
        </CardContent>
      </Card>
    </>
  );
};

export default Staff;
