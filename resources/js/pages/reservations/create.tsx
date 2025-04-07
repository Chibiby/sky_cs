import React, { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/mui-date-picker';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    check_in_date: Date | null;
    check_out_date: Date | null;
    room_type: string;
    number_of_guests: string;
    special_requests: string;
    status: string;
    [key: string]: string | Date | null;
}

export default function CreateReservation() {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm<FormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        check_in_date: null,
        check_out_date: null,
        room_type: '',
        number_of_guests: '',
        special_requests: '',
        status: 'pending'
    });

    const [numberOfGuests, setNumberOfGuests] = useState<string>('');
    const [roomType, setRoomType] = useState<string>('');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { zIndex: 9999 }
            });
            reset(); // Reset the form after successful submission
        }
        if (flash?.error) {
            toast.error(flash.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { zIndex: 9999 }
            });
        }
    }, [flash?.success, flash?.error]);

    const validateField = (name: string, value: string): string | null => {
        const patterns = {
            first_name: {
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'First name should only contain letters and be 2-50 characters long'
            },
            last_name: {
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'Last name should only contain letters and be 2-50 characters long'
            },
            email: {
                pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                pattern: /^(\+63|0)[\d]{10}$/,
                message: 'Please enter a valid Philippine phone number (e.g., +639123456789 or 09123456789)'
            },
            number_of_guests: {
                pattern: /^[1-9][0-9]*$/,
                message: 'Number of guests must be a positive number'
            }
        };

        if (name === 'room_type' && !value) {
            return 'Please select a room type';
        }

        if (name === 'number_of_guests' && !value) {
            return 'Please specify the number of guests';
        }

        if (name in patterns) {
            const { pattern, message } = patterns[name as keyof typeof patterns];
            return !value || pattern.test(value) ? null : message;
        }
        return null;
    };

    const handleInputChange = (field: string, value: string) => {
        const error = validateField(field, value);
        setData(field, value);
        
        // Update the error state immediately for real-time feedback
        if (error) {
            setError(field, error);
        } else {
            clearErrors(field);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use the data directly with the post method
        const formData = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            check_in_date: data.check_in_date ? format(data.check_in_date, 'yyyy-MM-dd') : '',
            check_out_date: data.check_out_date ? format(data.check_out_date, 'yyyy-MM-dd') : '',
            room_type: data.room_type,
            number_of_guests: data.number_of_guests,
            special_requests: data.special_requests,
            status: data.status
        } as any;

        // Submit the form
        post(route('reservations.store'), formData);
        
        // Show a toast message after submission
        setTimeout(() => {
            toast.success('Reservation created successfully!');
            reset();
        }, 1000);
    };

    return (
        <>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 9999 }}
            />
            <AppLayout breadcrumbs={[{ title: 'Create Booking', href: '/reservations/create' }]}>
                <Head title="New Booking" />
                <div className="container mx-auto">
                    <Card className="rounded-none border-none">
                        <CardHeader>
                            <CardDescription>Fill in the details to create a new reservation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Guest Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Guest Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={data.first_name}
                                                onChange={e => handleInputChange('first_name', e.target.value)}
                                                placeholder="Enter first name"
                                                className={errors.first_name ? 'border-red-500' : ''}
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-500">{errors.first_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={data.last_name}
                                                onChange={e => handleInputChange('last_name', e.target.value)}
                                                placeholder="Enter last name"
                                                className={errors.last_name ? 'border-red-500' : ''}
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-500">{errors.last_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => handleInputChange('email', e.target.value)}
                                                placeholder="Enter email address"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={e => handleInputChange('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Booking Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Check-in Date</Label>
                                            <DatePicker
                                                value={data.check_in_date}
                                                onChange={(date) => setData('check_in_date', date)}
                                            />
                                            {errors.check_in_date && (
                                                <p className="text-sm text-red-500">{errors.check_in_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Check-out Date</Label>
                                            <DatePicker
                                                value={data.check_out_date}
                                                onChange={(date) => setData('check_out_date', date)}
                                            />
                                            {errors.check_out_date && (
                                                <p className="text-sm text-red-500">{errors.check_out_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="roomType">Room Type</Label>
                                            <Select 
                                                value={roomType} 
                                                onValueChange={(value) => {
                                                    setRoomType(value);
                                                    handleInputChange('room_type', value);
                                                }}
                                            >
                                                <SelectTrigger className={errors.room_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select room type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Standard Room</SelectItem>
                                                    <SelectItem value="deluxe">Deluxe Room</SelectItem>
                                                    <SelectItem value="suite">Suite</SelectItem>
                                                    <SelectItem value="executive">Executive Suite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.room_type && (
                                                <p className="text-sm text-red-500">{errors.room_type}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="numberOfGuests">Number of Guests</Label>
                                            <div className="flex gap-2">
                                                <Select 
                                                    value={numberOfGuests} 
                                                    onValueChange={(value) => {
                                                        setNumberOfGuests(value);
                                                        if (value === 'custom') {
                                                            // When "Custom" is selected, don't update the form data yet
                                                            setData('number_of_guests', '');
                                                        } else {
                                                            handleInputChange('number_of_guests', value);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className={`w-full ${errors.number_of_guests && !numberOfGuests ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Select number of guests" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Guest</SelectItem>
                                                        <SelectItem value="2">2 Guests</SelectItem>
                                                        <SelectItem value="3">3 Guests</SelectItem>
                                                        <SelectItem value="4">4 Guests</SelectItem>
                                                        <SelectItem value="custom">Custom number</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {numberOfGuests === 'custom' && (
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Enter number"
                                                        value={data.number_of_guests}
                                                        onChange={e => handleInputChange('number_of_guests', e.target.value)}
                                                        className={`w-32 ${errors.number_of_guests ? 'border-red-500' : ''}`}
                                                    />
                                                )}
                                            </div>
                                            {errors.number_of_guests && (
                                                <p className="text-sm text-red-500">{errors.number_of_guests}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Requests */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Additional Requests</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="specialRequests">Special Requests</Label>
                                        <Input
                                            id="specialRequests"
                                            value={data.special_requests}
                                            onChange={e => setData('special_requests', e.target.value)}
                                            placeholder="Enter any special requests or requirements"
                                        />
                                        {errors.special_requests && (
                                            <p className="text-sm text-red-500">{errors.special_requests}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        className="bg-[#47859e] hover:bg-[#3a7186]"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creating...' : 'Create Reservation'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}