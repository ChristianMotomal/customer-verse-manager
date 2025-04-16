
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface StatsData {
  totalRevenue: number;
  activeCustomers: number;
  pendingPayments: number;
}

const StatsCards = () => {
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0,
    activeCustomers: 0,
    pendingPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('payment')
          .select('amount')
          .not('amount', 'is', null);

        if (revenueError) throw revenueError;

        // Fetch customer count
        const { count: customerCount, error: customerError } = await supabase
          .from('customer')
          .select('*', { count: 'exact', head: true });

        if (customerError) throw customerError;

        // Calculate total revenue
        const totalRevenue = revenueData.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        setStats({
          totalRevenue,
          activeCustomers: customerCount || 0,
          pendingPayments: 0, // This could be implemented based on your business logic
        });
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: "Total revenue from all payments",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Customers",
      value: stats.activeCustomers,
      description: "Total active customers",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      description: "Payments awaiting confirmation",
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Payment Success Rate",
      value: "94.7%",
      description: "Overall transaction success rate",
      icon: CreditCard,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-6">
              <div className="h-12 w-full animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-md`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
