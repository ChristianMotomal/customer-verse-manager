
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define form schema for password reset request
const requestResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Define form schema for password update with confirmation
const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RequestResetValues = z.infer<typeof requestResetSchema>;
type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

const ResetPasswordPage = () => {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form for requesting password reset
  const requestForm = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form for setting new password
  const updateForm = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle password reset request
  const onRequestReset = async (data: RequestResetValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password?mode=update`,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess("If an account exists with that email, we've sent instructions to reset your password.");
    } catch (error: any) {
      setError(error.message || "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const onUpdatePassword = async (data: UpdatePasswordValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess("Your password has been updated successfully. You can now log in with your new password.");
      toast.success("Password updated successfully");
    } catch (error: any) {
      setError(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL parameters when component loads
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "update") {
      setMode("update");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">CustomerVerse</h1>
          <p className="text-gray-600 mt-1">Reset your password</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "request" ? "Reset Password" : "Create New Password"}
            </CardTitle>
            <CardDescription>
              {mode === "request" 
                ? "Enter your email address to receive password reset instructions" 
                : "Please enter your new password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {mode === "request" ? (
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="name@example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending instructions..." : "Send Reset Instructions"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                  <FormField
                    control={updateForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              className="pl-10" 
                              type="password" 
                              placeholder="••••••" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={updateForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              className="pl-10" 
                              type="password" 
                              placeholder="••••••" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating password..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="flex items-center text-primary font-medium hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
