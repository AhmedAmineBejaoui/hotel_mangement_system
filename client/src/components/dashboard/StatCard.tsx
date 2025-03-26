import { Progress } from "@/components/ui/progress";

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  progressValue?: number;
}

const StatCard = ({ icon, title, value, change, progressValue = 0 }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 rounded-md p-3 bg-primary-50 text-primary-600">
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-xl font-semibold">{value}</h3>
            {change && (
              <span 
                className={`ml-2 text-xs font-medium flex items-center ${
                  change.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                <i className={change.isPositive ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                {change.value}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Progress value={progressValue} className="h-1 bg-gray-100" />
      </div>
    </div>
  );
};

export default StatCard;
