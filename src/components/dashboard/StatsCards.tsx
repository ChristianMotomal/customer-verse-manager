
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, AlertCircle } from "lucide-react";
import { 
  getActiveCustomersCount, 
  getTotalRevenue, 
  getPendingPaymentsCount 
} from "@/utils/data";

const StatsCards = () => {
  const totalRevenue = getTotalRevenue();
  const activeCustomers = getActiveCustomersCount();
  const pendingPayments = getPendingPaymentsCount();

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "Total revenue from all payments",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Customers",
      value: activeCustomers,
      description: "Total active customers",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
