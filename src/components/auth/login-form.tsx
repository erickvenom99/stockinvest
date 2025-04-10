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
import { LoginSchema } from "@root/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { Input } from "../ui/input";
import type { z } from "zod"; 
import { UserIcon, MailIcon, LockIcon } from "lucide-react";
import { useState } from "react";


type FormData = z.infer<typeof LoginSchema>;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues:{
      email: "",
      password: "",
    }
  })
  const onSubmit = (data: FormData) => {
    setLoading(true);
    console.log(data)
  }

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
                <FormLabel>Email<span className="text-red-500">*</span></FormLabel>      
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                   </div>
                <FormControl>
                    <Input {...field} type="email" placeholder="johndoe@email.com" className="pl-10 h-10 text-lg"  />
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
                <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LockIcon className="h-4 w-4 text-gray-500" />
                    </div>
                <FormControl>
                    <Input {...field} type="password" placeholder="********"  className="pl-10 h-10 text-lg"  />
                </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading....": "Login"}
            </Button>
      </form>
    </Form>
    </CardWrapper>
  )
}

export default LoginForm