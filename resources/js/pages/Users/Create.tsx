import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
    roles: Array<{
        id: string;
        name: string;
    }>;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    flash?: {
        error?: string;
        success?: string;
    };
}

export default function Create({ roles, auth, flash }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: '',
    });

    React.useEffect(() => {
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.success) {
            toast.success(flash.success);
            // Reset form after successful submission
            reset('first_name', 'last_name', 'email', 'password', 'role');
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                toast.success('User created successfully');
                reset('first_name', 'last_name', 'email', 'password', 'role');
            },
            onError: (errors) => {
                toast.error('Error creating user');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Create User', href: '/users/create' }]}>
            <Head title="Create User" />
            <ToastContainer position="top-right" />

            <div className="container mx-auto select-none">
                <Card className="rounded-none border-none">
                    <CardHeader>
                        <CardDescription>Fill in the details to create a new user</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            required
                                            placeholder="Enter first name"
                                            className={errors.first_name ? 'border-red-500' : ''}
                                        />
                                        {errors.first_name && <div className="text-red-500 text-sm mt-1">{errors.first_name}</div>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            required
                                            placeholder="Enter last name"
                                            className={errors.last_name ? 'border-red-500' : ''}
                                        />
                                        {errors.last_name && <div className="text-red-500 text-sm mt-1">{errors.last_name}</div>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                    placeholder="Enter email address"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                    placeholder="Enter password"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            </div>

                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select 
                                    value={data.role || ''} 
                                    onValueChange={(value) => setData('role', value)}
                                    required
                                >
                                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Choose Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <div className="text-red-500 text-sm mt-1">{errors.role}</div>}
                            </div>

                            <div className="flex justify-end">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-[#47859e] hover:bg-[#3a7186]"
                                >
                                    {processing ? 'Submitting...' : 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 