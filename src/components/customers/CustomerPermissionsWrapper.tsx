
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SupabaseCustomersTable from "./SupabaseCustomersTable";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

interface CustomerPermissionsWrapperProps {
  userRole: string;
}

const CustomerPermissionsWrapper = ({ userRole }: CustomerPermissionsWrapperProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "edit" | null>(null);

  const handleDeleteAttempt = () => {
    if (userRole !== "admin") {
      setActionType("delete");
      setShowPermissionDialog(true);
      return false;
    }
    return true;
  };

  const handleEditAttempt = () => {
    if (userRole === "blocked") {
      setActionType("edit");
      setShowPermissionDialog(true);
      return false;
    }
    return true;
  };

  return (
    <>
      <SupabaseCustomersTable 
        // We can't modify the component, but we can use contextual clues and logic in our wrapper
      />

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permission Denied</DialogTitle>
            <DialogDescription>
              {actionType === "delete" && "Only administrators can delete customer records."}
              {actionType === "edit" && "You do not have permission to edit customer records."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerPermissionsWrapper;
