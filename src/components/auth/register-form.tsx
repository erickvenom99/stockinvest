"use client";

import CardWrapper from "./card-wrapper"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RegisterSchema } from "@root/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { Input } from "../ui/input";
import type { z } from "zod"; 
import { useFormStatus } from "react-dom";
import { useState } from "react";

type FormData = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues:{
      email: "",
      name: "",
      password: "",
      confirmPassword: ""
    }
  })
  const onSubmit = (data: FormData) => {
    setLoading(true);
    console.log(data)
  }
  const { pending } = useFormStatus();
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input {...field} type="email" placeholder="Enter your email"  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input {...field}  placeholder="John Doe"  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input {...field} type="password" placeholder="********"  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                    <Input {...field} type="password" placeholder="********"  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
          </div>
          <Button type="submit" className="w-full">
            {loading ? "loading...": "Register"}
            </Button>
      </form>
    </Form>
    </CardWrapper>
  )
}

export default RegisterForm