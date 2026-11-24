"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userRegisterSchema, UserRegisterSchemaType } from '../schema/accountSchema';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/features/auth/hooks/auth.hooks';
import { toast } from 'sonner';
import { errorHandler } from '@/lib/http/errorHandler';


export default function UserRegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { mutateAsync: registerUser } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<UserRegisterSchemaType>({
        resolver: zodResolver(userRegisterSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data: UserRegisterSchemaType) => {
        try {
            const response = await registerUser(data);
            toast.success(response.message);
            // replace: the register page shouldn't be in history once logged in
            // hard navigation to bypass a cached guest redirect (see UserLoginForm)
            window.location.replace('/account');
        } catch (error) {
            toast.error(errorHandler(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-neutral-900">
                            Name
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John"
                            disabled={isSubmitting}
                            className={`h-11 rounded-none border-neutral-300 focus-visible:ring-black ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            {...register('name')}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-neutral-900">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                        className={`h-11 rounded-none border-neutral-300 focus-visible:ring-black ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        {...register('email')}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-neutral-900">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className={`h-11 pr-10 rounded-none border-neutral-300 focus-visible:ring-black ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 rounded-none"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Creating account...</span>
                    </>
                ) : (
                    <span>Create Account</span>
                )}
            </button>
        </form>
    );
}
