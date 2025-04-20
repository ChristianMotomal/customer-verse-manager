
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </div>
          <DialogFooter>
            <Button type="submit">
              {isEditing ? "Save changes" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
