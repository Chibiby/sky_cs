import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { useRef, useState, useEffect } from 'react';
import { DatePicker } from '@/components/ui/mui-date-picker';
import { format } from 'date-fns';
import type { PageProps } from '@inertiajs/core';
import { ToastContainer, toast } from 'react-toastify';
import { Menu } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

interface User {
    id: number;
    name: string;
    email: string;
}

interface CustomPageProps extends PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
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

export default function Welcome() {
    const { auth, flash } = usePage<CustomPageProps>().props;
    const bookingFormRef = useRef<HTMLDivElement>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [roomType, setRoomType] = useState<string>('');
    const [numberOfGuests, setNumberOfGuests] = useState<string>('');

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            // Reset form and state after successful submission
            reset();
            setRoomType('');
            setNumberOfGuests('');
        }
        if (flash.error) {
            toast.error(flash.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }, [flash.success, flash.error]);

    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm<FormData>({
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

    const scrollToBooking = () => {
        setShowBookingForm(true);
        setTimeout(() => {
            bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

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
        
        post(route('public.reservations.store'), {
            ...data,
            check_in_date: data.check_in_date ? format(data.check_in_date, 'yyyy-MM-dd') : null,
            check_out_date: data.check_out_date ? format(data.check_out_date, 'yyyy-MM-dd') : null,
        } as unknown as Record<string, unknown>);
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <ToastContainer />
            <div className="relative min-h-screen flex flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
    {/* Fixed Header */}
                <header className="fixed top-0 left-0 w-full bg-[#FDFDFC] dark:bg-[#0a0a0a] shadow-md p-4 z-50">
                    <nav className="max-w-4xl mx-auto flex justify-between items-center">
                        <div className="flex items-center">
                            <img src="/favicon.svg" alt="Sky Nature Park Logo" className="h-6 sm:h-8 w-auto mr-2" />
                            <span className="text-lg sm:text-xl font-semibold text-[#47859e]">Sky Nature Park</span>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex gap-4">
            {auth.user ? (
                <Link
                    href={route('dashboard')}
                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Dashboard
                </Link>
            ) : (
                <>
                    <Link
                        href={route('login')}
                        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                    >
                        Log in
                    </Link>
                    <Link
                        href={route('register')}
                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Register
                    </Link>
                </>
            )}
                        </div>

                        {/* Mobile Navigation */}
                        <div className="sm:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-64">
                                    <SheetHeader className="text-left">
                                        <div className="flex items-center mb-6">
                                            <img src="/favicon.svg" alt="Sky Nature Park Logo" className="h-6 w-auto mr-2" />
                                            <span className="text-lg font-semibold text-[#47859e]">Sky Nature Park</span>
                                        </div>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-4">
                                        {auth.user ? (
                                            <Link
                                                href={route('dashboard')}
                                                className="inline-block rounded-sm border border-[#19140035] px-4 py-1.5 text-sm text-center text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                            >
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    href={route('login')}
                                                    className="inline-block rounded-sm border border-transparent px-4 py-1.5 text-sm text-center text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                                >
                                                    Log in
                                                </Link>
                                                <Link
                                                    href={route('register')}
                                                    className="inline-block rounded-sm border border-[#19140035] px-4 py-1.5 text-sm text-center text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                                >
                                                    Register
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
        </nav>
    </header>

    {/* Main Content */}
                <main className="flex flex-col items-center min-h-screen pb-20">
                    <div className="text-center max-w-3xl mt-32 mb-40">
                        <img src="/favicon.svg" alt="Sky Nature Park Logo" className="h-24 w-auto mx-auto mb-6" />
                        <h1 className="text-4xl font-bold text-[#47859e] mb-4">Welcome to Sky Nature Park</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Discover the beauty of nature in our immersive park experience
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={scrollToBooking}
                                className="inline-block rounded-md bg-[#47859e] px-6 py-3 text-white font-medium hover:bg-[#3a7186] transition-colors"
                            >
                                Book Now
                            </button>
                            <Link
                                href={route('register')}
                                className="inline-block rounded-md border border-[#47859e] px-6 py-3 text-[#47859e] font-medium hover:bg-[#47859e10] transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div 
                        ref={bookingFormRef} 
                        className={`w-full max-w-3xl scroll-mt-16 px-4 mt-10 transition-all duration-500 ${
                            showBookingForm ? 'opacity-100' : 'opacity-0 hidden'
                        }`}
                    >
                        <Card className="rounded-none border-none">
                            <CardHeader className="pt-0">
                                <CardTitle>Make a Reservation</CardTitle>
                                <CardDescription>Fill in your details to book your stay</CardDescription>
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
                                                placeholder="Enter any special requests or requirements"
                                                value={data.special_requests}
                                                onChange={e => setData('special_requests', e.target.value)}
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
    </main>
</div>
        </>
    );
}
