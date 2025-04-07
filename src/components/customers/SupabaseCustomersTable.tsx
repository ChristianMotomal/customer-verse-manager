
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CustomerData {
  custno: string;
  custname: string | null;
  address: string | null;
  payterm: string | null;
}

const SupabaseCustomersTable = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customer')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setCustomers(data || []);
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        toast({
          title: "Error",
          description: "Failed to load customers. " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  const filteredCustomers = customers.filter((customer) => {
    // Apply search filter
    return searchQuery === "" ||
      (customer.custname && customer.custname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.custno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2">
            <UserPlus size={16} />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden lg:table-cell">Payment Term</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.custno}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/customers/${customer.custno}`}
                        className="hover:underline text-primary"
                      >
                        {customer.custno}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {customer.custname || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {customer.address || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {customer.payterm || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SupabaseCustomersTable;
