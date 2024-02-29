"use client"

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const SignUpFormSchema = z.object({
    userName: z.string().min(2, { message: "Username must be at least 2 characters long" }).max(15, { message: "Username must be at most 15 characters long" }),
    userRole: z.enum(["PHOTOGRAPHER", "CLIENT"]),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    passwordConfirmation: z.string().min(8, { message: "Password must be at least 8 characters long" }),
}).refine(data => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
});

const SignUpForm = () => {

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof SignUpFormSchema>>({
        resolver: zodResolver(SignUpFormSchema),
        defaultValues: {
            userName: "",
            userRole: "CLIENT",
            email: "",
            password: "",
            passwordConfirmation: "",
        },
    });

    const onTabsChange = (value: string) => {
        if (value === "PHOTOGRAPHER" || value === "CLIENT") {
            form.setValue("userRole", value);
        }
    }

    const onSubmit = async (values: z.infer<typeof SignUpFormSchema>, e: any) => {
        try {
            setLoading(true);
            if (values) {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                    email: values.email,
                    password: values.password,
                    userName: values.userName,
                    userRole: values.userRole,
                });

                if (response.data.error) {
                    toast.error(response.data.error);
                }

                if (response.data) {
                    toast.success("Account created successfully");
                    router.push("/sign-in");
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-4 text-left">
                <FormField
                    control={form.control}
                    name="userRole"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Tabs onValueChange={(value) => onTabsChange(value)} defaultValue="CLIENT">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="CLIENT">Client</TabsTrigger>
                                        <TabsTrigger value="PHOTOGRAPHER">Photographer</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel >Username</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="username" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel >Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="email" />
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
                                <Input type="password" placeholder="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="passwordConfirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password Confirmation</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="password confirmation" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormDescription>
                    By clicking Sign Up, you agree to our <a href="#">Terms of Use</a> and our <a href="#">Privacy Policy</a>.
                </FormDescription>
                <Button disabled={loading} className="w-full" type="submit">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mr-1" /> : null}
                    Sign Up
                </Button>
            </form>
        </Form >
    );
}

export default SignUpForm;