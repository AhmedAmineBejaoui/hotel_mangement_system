import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface StaffActivity {
  id: number;
  staff_first_name: string;
  staff_last_name: string;
  activity_type: string;
  description: string;
  created_at: string;
}

const StaffActivityList = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/staff-activities"],
    queryFn: async () => {
      const response = await fetch("/api/staff-activities");
      if (!response.ok) {
        throw new Error("Failed to fetch staff activities");
      }
      return response.json();
    }
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Staff Activity</h3>
          <a href="/staff" className="text-sm text-primary-600 hover:underline">View All</a>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-4 text-center">Loading staff activities...</div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity: StaffActivity) => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                  {getInitials(activity.staff_first_name, activity.staff_last_name)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.staff_first_name} {activity.staff_last_name} {activity.activity_type.replace(/_/g, ' ')}
                    </p>
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center">No staff activities found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffActivityList;