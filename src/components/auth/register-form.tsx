"use client";

import CardWrapper from "./card-wrapper";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RegisterSchema } from "@root/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import type { z } from "zod";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  MapPinIcon,
} from "lucide-react";
import axios from "axios"; // Import axios for making API requests

interface Country {
  name: {
    common: string;
  };
  cca2: string; // Or any other unique identifier
}

type FormData = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null); // State for registration errors
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false); // State for successful registration

  const form = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      country: "",
      referralID: "",
    },
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get<Country[]>(
          "https://restcountries.com/v3.1/all?fields=name,cca2" // Example API endpoint
        );
        setCountries(response.data);
      } catch (error: any) {
        console.error("Error fetching countries:", error);
        setFetchError("Failed to load countries. Please try again later.");
      }
    };

    fetchCountries();
  }, []); // Empty dependency array means this effect runs once after the initial render

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setRegistrationError(null); // Clear previous errors
    setRegistrationSuccess(false); // Reset success state

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Send all form data in the body
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Registration successful:", responseData);
        setRegistrationSuccess(true);
        // Optionally redirect the user or show a success message
      } else {
        console.error("Registration failed:", responseData);
        setRegistrationError(responseData.error || responseData.message || "Registration failed");
        // You can also handle specific error messages from the backend here,
        // for example, if (responseData.error === 'Username already exists') { ... }
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setRegistrationError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      label="Create an Account"
      title="Register"
      backButtonHref="/auth/login"
      backButtonLabel="Already have an account? Login Here"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* ... your form fields for username, fullname, email, password, confirmPassword, phoneNumber, country, referralID ... */}
            {/* Make sure all your FormField components are correctly connected to the form using the 'name' prop */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter your username"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  </div>
                  <FormMessage />
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
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-4 w-4 text-gray-500" />{" "}
                      {/* You might reuse the lock icon */}
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="********"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />{" "}
                      {/* Example icon for country */}
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+*** **** *** ***"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPinIcon className="h-4 w-4 text-gray-500" />{" "}
                      {/* Example icon for country */}
                    </div>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={
                          countries.length === 0 || fetchError !== null
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="pl-10 h-10 w-full">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fetchError && <div>{fetchError}</div>}
                          {countries.map((country) => (
                            <SelectItem
                              key={country.cca2}
                              value={country.name.common}
                            >
                              {country.name.common}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referralID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Optional ID"
                      className="h-10 text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {registrationError && (
            <p className="text-red-500">{registrationError}</p>
          )}
          {registrationSuccess && (
            <p className="text-green-500">Registration successful!</p>
            // Optionally add a link to the login page
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || countries.length === 0 || fetchError !== null}
          >
            {loading ? "loading..." : "Register"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;