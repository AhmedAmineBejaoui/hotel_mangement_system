import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentTable from "@/components/tables/PaymentTable";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

const Payments = () => {
  // Get revenue statistics
  const { data: revenue } = useQuery({
    queryKey: ["/api/revenue"],
    queryFn: async () => {
      const response = await fetch("/api/revenue");
      if (!response.ok) {
        throw new Error("Failed to fetch revenue statistics");
      }
      return response.json();
    }
  });

  // Get recent payments (we'll use this to calculate some basic stats)
  const { data: recentPayments } = useQuery({
    queryKey: ["/api/payments", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/payments?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      return response.json();
    }
  });

  // Calculate overview statistics (in a real app, these would come from dedicated API endpoints)
  const getTotalRevenue = () => {
    return revenue?.revenue || 0;
  };

  const getPaymentsByStatus = (status: string) => {
    if (!recentPayments?.data) return 0;
    return recentPayments.data.filter((payment: any) => payment.status === status).length;
  };

  // Calculate average transaction value
  const getAverageTransaction = () => {
    if (!recentPayments?.data || recentPayments.data.length === 0) return 0;
    
    const totalValue = recentPayments.data.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    return totalValue / recentPayments.data.length;
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Payment Management</h2>
        <p className="text-muted-foreground">
          Manage hotel payments, including processing, tracking, and refunding transactions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
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
            <div className="text-2xl font-bold">{getPaymentsByStatus('pending')}</div>
            <p className="text-xs text-muted-foreground">
              Payments awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getAverageTransaction())}</div>
            <p className="text-xs text-muted-foreground">
              Average payment amount
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
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
            <div className="text-2xl font-bold">{getPaymentsByStatus('paid')}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentTable />
        </CardContent>
      </Card>
    </>
  );
};

export default Payments;
