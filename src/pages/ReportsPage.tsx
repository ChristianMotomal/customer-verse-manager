
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerListReport from '@/components/reports/CustomerListReport';
import CustomerTransactionsReport from '@/components/reports/CustomerTransactionsReport';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("customer-list");
  const { profile } = useAuth();
  
  // Check if user is blocked
  if (profile?.role === "blocked") {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and print reports for customers and transactions
          </p>
        </div>
        
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view reports. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Generate and print reports for customers and transactions
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="customer-list">Customer List</TabsTrigger>
          <TabsTrigger value="customer-transactions">Customer Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer-list" className="space-y-6">
          <CustomerListReport />
        </TabsContent>
        
        <TabsContent value="customer-transactions" className="space-y-6">
          <CustomerTransactionsReport />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ReportsPage;
