
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FilterX } from "lucide-react";
import { payments, customers, Customer } from "@/utils/data";

const PaymentsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredPayments = payments.filter((payment) => {
    // Find corresponding customer for this payment
    const customer = customers.find((c) => c.id === payment.customerId);

    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus =
      statusFilter === null || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getStatusBadgeColor = (status: string) => {
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

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={resetFilters}>
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/customers/${payment.customerId}`}
                      className="hover:underline text-primary"
                    >
                      {getCustomerName(payment.customerId)}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {payment.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize">
                    {payment.method}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(payment.status)}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsTable;
