"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { LockIcon } from "lucide-react";
import CardWrapper from "./card-wrapper";
import { ResetPasswordSchema, type FormData} from "@root/schema";

interface ResetPasswordFormProps {
    token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            token: token,
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: FormData) => {
        setLoading(true);
        setError(null);

        if (!recaptchaValue) {
            setLoading(false);
            setError("Please complete the CAPTCHA verification");
            return;
        }

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: values.token,
                    password: values.password,
                    recaptchaToken: recaptchaValue,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Password reset failed");
            }

            setSuccess(true);
        } catch (err) {
            console.error("Error during password reset:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CardWrapper
            label="Create a new password"
            title="Reset Password"
            backButtonHref="/auth/login"
            backButtonLabel="Back to login"
            showForgetButton={false}
        >
            {success ? (
                <div className="space-y-4">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline"> Your password has been updated.</span>
                    </div>
                    <Button onClick={() => router.push("/auth/login")} className="w-full">
                        Go to Login
                    </Button>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password<span className="text-red-500">*</span></FormLabel>
                                        <div className="relative">
                                            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
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
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password<span className="text-red-500">*</span></FormLabel>
                                        <div className="relative">
                                            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
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

                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            onChange={setRecaptchaValue}
                            onExpired={() => setRecaptchaValue(null)}
                        />

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !recaptchaValue}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </Form>
            )}
        </CardWrapper>
    );
};

export default ResetPasswordForm;