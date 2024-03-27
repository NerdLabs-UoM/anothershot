"use client"

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const SignInFormSchema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

const SignInForm = () => {

    const router = useRouter();
    const session = useSession();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.status === "authenticated") {
            if (session.data.user.userRole === "ADMIN") {
                router.push(`/user/admin/${session.data.user.id}`);
            } else if (session.data.user.userRole === "PHOTOGRAPHER") {
                router.push(`/user/photographer/${session.data.user.id}`);
            } else if (session.data.user.userRole === "CLIENT") {
                router.push(`/user/client/${session.data.user.id}`);
            }
        }
    }, [session, router])

    const form = useForm<z.infer<typeof SignInFormSchema>>({
        resolver: zodResolver(SignInFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof SignInFormSchema>, e: any) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        if (res?.error) {
            toast.error(res.error);
        }

        if (res?.status === 200) {
            toast.success("Signed in successfully");
            router.push("/home");
        }
        setLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-4 text-left">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel >Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email" {...field} />
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
                <Button disabled={loading} className="w-full" type="submit">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mr-1" /> : null}
                    Sign In
                </Button>
            </form>
        </Form>
    );
}


export default SignInForm;