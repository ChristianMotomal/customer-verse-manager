
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, CalendarDays, DollarSign } from "lucide-react";
import { getCustomerById, getPaymentsByCustomerId } from "@/utils/data";
import { useToast } from "@/components/ui/use-toast";

const CustomerDetails = () => {
  const { customerId = "" } = useParams<{ customerId: string }>();
  const customer = getCustomerById(customerId);
  const customerPayments = getPaymentsByCustomerId(customerId);
  const { toast } = useToast();

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Customer Not Found</h2>
        <p className="mb-6">The customer you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "successful":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: `Email has been sent to ${customer.email}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>
        <Button onClick={handleSendEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Contact Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center pt-2 pb-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-medium text-primary">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold">{customer.name}</h3>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeColor(customer.status)}
                  >
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    Joined on{" "}
                    {customer.joinedDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-sm gap-2 pt-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">
                    Total spent: ${customer.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {customerPayments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No payment history available.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="capitalize">
                        {payment.method}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPaymentStatusBadgeColor(payment.status)}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${payment.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetails;
