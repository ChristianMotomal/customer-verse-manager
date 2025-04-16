
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CustomerData {
  custno: string;
  custname: string | null;
}

const CustomerInsights = () => {
  const [recentCustomers, setRecentCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: customersData, error: customersError } = await supabase
          .from('customer')
          .select('*')
          .order('custno', { ascending: false })
          .limit(3);

        if (customersError) throw customersError;
        setRecentCustomers(customersData || []);
      } catch (error: any) {
        console.error('Error fetching customer data:', error);
        toast({
          title: "Error",
          description: "Failed to load customer data. " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Customer Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Recent Customers</p>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : recentCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers found.</p>
            ) : (
              recentCustomers.map((customer) => (
                <div
                  key={customer.custno}
                  className="flex justify-between items-center"
                >
                  <Link
                    to={`/customers/${customer.custno}`}
                    className="hover:underline text-primary"
                  >
                    {customer.custname || customer.custno}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <Button asChild className="w-full gap-2">
          <Link to="/customers">
            <PlusCircle className="h-4 w-4" />
            View All Customers
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerInsights;
