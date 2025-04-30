
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
import { Button } from "@/components/ui/button";
import { UserPlus, Pencil, Trash2, Info } from "lucide-react";
import { CustomerDialog } from "./CustomerDialog";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTableLoading } from "./CustomerTableLoading";
import { useCustomers } from "@/hooks/useCustomers";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SupabaseCustomersTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  const { customers, isLoading, deleteCustomer, fetchCustomers } = useCustomers();

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    const success = await deleteCustomer(customerToDelete);
    if (success) {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    return searchQuery === "" ||
      (customer.custname && customer.custname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.custno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <CustomerSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Button className="gap-2" onClick={handleAddClick}>
          <UserPlus size={16} />
          <span>Add Customer</span>
        </Button>
      </div>

      {isLoading ? (
        <CustomerTableLoading />
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden lg:table-cell">Payment Term</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.custno}>
                    <TableCell className="font-medium">
                      {customer.custno}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/customers/${customer.custno}`}
                        className="hover:underline text-primary"
                      >
                        {customer.custname || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {customer.address || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {customer.payterm || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setCustomerToDelete(customer.custno);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete customer</p>
                              <p className="text-xs text-muted-foreground">
                                Only customers with no sales can be deleted
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupabaseCustomersTable;
