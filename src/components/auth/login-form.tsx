"use client";

import CardWrapper from "./card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoginSchema } from "@root/schema"; // Assuming you have a LoginSchema
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import type { z } from "zod";
import { UserIcon, MailIcon, LockIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection

type FormData = z.infer<typeof LoginSchema>;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for login errors
  const router = useRouter(); // Initialize the router

  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "", // Changed from identifier to email to match your previous form
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Login successful:", responseData);
        localStorage.setItem('authToken', responseData.token )
        console.log("JWT stored:", localStorage.getItem("authToken")); 
        // Store user information (e.g., in local storage or state management)
        // Redirect the user to a protected page (e.g., dashboard)
        router.push("/dashboard"); // Replace "/dashboard" with your desired route
      } else {
        console.error("Login failed:", responseData);
        setError(responseData.message || "Invalid credentials");
      }
    } catch (e: any) {
      console.error("Error during login:", e);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      label="Login to your Account"
      title="Login"
      backButtonHref="/auth/register"
      backButtonLabel="Don't have an account? Register Here"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email<span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="johndoe@email.com"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="********"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in...." : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;