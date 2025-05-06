
import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type UserRole = "admin" | "user" | "blocked";

interface UserProfileWithRole {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  created_at: string | null;
  avatar_url?: string | null;
  updated_at?: string | null;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserProfileWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Cast the role field to UserRole type to fix the TypeScript error
      const typedData = data?.map(user => ({
        ...user,
        role: user.role as UserRole
      })) || [];
      
      setUsers(typedData);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      if (!profile || profile.role !== "admin") {
        toast.error("Only administrators can update user roles");
        return;
      }

      if (userId === user?.id) {
        toast.error("You cannot change your own role");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: role } : u))
      );
      toast.success(`User role updated to ${role}`);
    } catch (error: any) {
      console.error("Error updating user role:", error.message);
      toast.error("Failed to update user role");
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case "user":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "blocked":
        return <ShieldX className="h-4 w-4 text-red-500" />;
    }
  };

  const isCurrentUserAdmin = profile?.role === "admin";

  if (!isCurrentUserAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <ShieldX className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You need administrator privileges to access this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Roles</h2>
          <p className="text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-green-500" /> Admin: Can view,
              edit, and delete customer data. Can manage users.
            </span>
            <span className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-500" /> User: Can view and
              edit customer data, but cannot delete.
            </span>
            <span className="flex items-center gap-2">
              <ShieldX className="h-4 w-4 text-red-500" /> Blocked: Cannot view,
              edit, or delete customer data.
            </span>
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  Showing {users.length} registered users
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead className="w-[300px]">Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "No name"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role as UserRole)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={user.role as string}
                            onValueChange={(value) =>
                              updateUserRole(user.id, value as UserRole)
                            }
                            disabled={user.id === profile?.id}
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default UserManagementPage;
