import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomerTransactions } from "./CustomerTransactions";
import { Check } from "lucide-react";

interface CustomerFormData {
  custno: string;
  custname: string;
  address: string;
  payterm: string;
}

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: {
    custno: string;
    custname: string | null;
    address: string | null;
    payterm: string | null;
  } | null;
  onSuccess: () => void;
}

export function CustomerDialog({ open, onOpenChange, customer, onSuccess }: CustomerDialogProps) {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingFormData, setPendingFormData] = React.useState<CustomerFormData | null>(null);
  const isEditing = !!customer?.custno;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CustomerFormData>({
    defaultValues: {
      custno: "",
      custname: "",
      address: "",
      payterm: "",
    },
  });

  useEffect(() => {
    if (customer) {
      setValue("custno", customer.custno);
      setValue("custname", customer.custname || "");
      setValue("address", customer.address || "");
      setValue("payterm", customer.payterm || "");
    } else {
      reset();
    }
  }, [customer, setValue, reset]);

  const handleFormSubmit = (data: CustomerFormData) => {
    setPendingFormData(data);
    setShowConfirmDialog(true);
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("customer")
          .update({
            custname: data.custname,
            address: data.address,
            payterm: data.payterm,
          })
          .eq("custno", customer?.custno);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        // Generate new customer number
        const { data: lastCustomer, error: fetchError } = await supabase
          .from("customer")
          .select("custno")
          .order("custno", { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        let nextCustomerNo = "C0001";
        if (lastCustomer && lastCustomer.length > 0) {
          const lastNo = parseInt(lastCustomer[0].custno.substring(1));
          nextCustomerNo = `C${String(lastNo + 1).padStart(4, "0")}`;
        }

        const { error: insertError } = await supabase
          .from("customer")
          .insert([
            {
              custno: nextCustomerNo,
              custname: data.custname,
              address: data.address,
              payterm: data.payterm,
            },
          ]);

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Customer added successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const handleConfirmSave = () => {
    if (pendingFormData) {
      onSubmit(pendingFormData);
      setShowConfirmDialog(false);
      setPendingFormData(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="custname">Name</Label>
                <Input
                  id="custname"
                  {...register("custname", { required: "Customer name is required" })}
                />
                {errors.custname && <p className="text-sm text-red-500">{errors.custname.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payterm">Payment Term</Label>
                <Input
                  id="payterm"
                  {...register("payterm")}
                />
              </div>
              
              {isEditing && (
                <div className="mt-6">
                  <CustomerTransactions customerId={customer.custno} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isEditing ? "Save changes" : "Add customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {isEditing ? "update" : "add"} this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFormData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
