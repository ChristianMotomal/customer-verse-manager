
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .order('custno', { ascending: true });
      
      if (error) throw error;
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

  const checkCustomerHasSales = async (customerNo: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select('transno')
      .eq('custno', customerNo)
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return data && data.length > 0;
  };

  const deleteCustomer = async (customerToDelete: string) => {
    try {
      // First check if customer has related sales
      const hasSales = await checkCustomerHasSales(customerToDelete);
      
      if (hasSales) {
        toast({
          title: "Cannot Delete",
          description: "This customer has sales records and cannot be deleted. Please remove the related sales records first.",
          variant: "destructive",
        });
        return false;
      }

      // If no sales, proceed with deletion
      const { error } = await supabase
        .from('customer')
        .delete()
        .eq('custno', customerToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      await fetchCustomers();
      return true;
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer. " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    isLoading,
    deleteCustomer,
    fetchCustomers
  };
};
