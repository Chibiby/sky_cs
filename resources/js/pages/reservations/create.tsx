import React, { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBookingForm } from '@/hooks/useBookingForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';

// Function to handle JSON responses
const handleDirectJsonResponse = () => {
    // Check if we have a JSON response message in the DOM
    const jsonResponseElement = document.querySelector('.inertia-error');
    if (jsonResponseElement) {
        try {
            const jsonText = jsonResponseElement.textContent || '';
            console.log("Found JSON text:", jsonText);
            
            // Try to parse JSON from the error message
            const match = jsonText.match(/\{.*\}/);
            if (match) {
                const jsonData = JSON.parse(match[0]);
                console.log("Parsed JSON data:", jsonData);
                
                if (jsonData.success === true) {
                    // Hide the JSON error message immediately
                    (jsonResponseElement as HTMLElement).style.display = 'none';
                    document.body.classList.add('show-booking-confirmation');
                    
                    // Store the success data in sessionStorage for the component to use
                    sessionStorage.setItem('booking_success', JSON.stringify({
                        message: jsonData.message,
                        reservation_id: jsonData.reservation_id
                    }));
                    
                    // Dispatch a success event for components to listen to
                    window.dispatchEvent(new CustomEvent('booking:success', { 
                        detail: { 
                            message: jsonData.message,
                            reservationId: jsonData.reservation_id
                        } 
                    }));
                    
                    return true;
                }
            }
        } catch (e) {
            console.error("Error handling JSON response:", e);
        }
    }
    return false;
};

// Try to handle JSON response immediately when the script loads
if (typeof document !== 'undefined') {
    // Execute after a small delay to ensure the DOM is ready
    setTimeout(handleDirectJsonResponse, 100);
}

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

export default function CreateReservation() {
    const { flash } = usePage<PageProps>().props;
    
    // State for success modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [bookingId, setBookingId] = useState<number | null>(null);
    
    // Use the shared booking hook for consistent date handling
    const {
        data,
        setData,
        errors,
        reset,
        setError,
        clearErrors,
        isSubmitting,
        setIsSubmitting,
        validateField,
        handleInputChange,
        roomTypes,
        availableRoomNumbers,
        isLoadingRooms,
        getAccommodationId
    } = useBookingForm();

    const [numberOfGuests, setNumberOfGuests] = useState<string>('');

    useEffect(() => {
        // Check for success data in sessionStorage or JSON response
        try {
            const storedSuccess = sessionStorage.getItem('booking_success');
            if (storedSuccess) {
                const successData = JSON.parse(storedSuccess);
                console.log("Found stored booking success:", successData);
                
                // Clear sessionStorage after reading
                sessionStorage.removeItem('booking_success');
                
                // Show confirmation modal
                setBookingId(successData.reservation_id);
                setShowSuccessModal(true);
                
                // Also hide any Inertia error message element if it exists
                const jsonElement = document.querySelector('.inertia-error');
                if (jsonElement) {
                    (jsonElement as HTMLElement).style.display = 'none';
                }
                
                return; // Exit early - we've handled the success
            }
        } catch (e) {
            console.error("Error checking sessionStorage:", e);
        }
        
        // Direct check for JSON response in DOM
        const handleDirectResponse = () => {
            // Check if we have a JSON response message in the DOM
            const jsonResponseElement = document.querySelector('.inertia-error');
            if (jsonResponseElement) {
                try {
                    const jsonText = jsonResponseElement.textContent || '';
                    // Try to parse JSON from the error message
                    const match = jsonText.match(/\{.*\}/);
                    if (match) {
                        const jsonData = JSON.parse(match[0]);
                        if (jsonData.success === true) {
                            console.log("Found success JSON response:", jsonData);
                            // Show confirmation modal
                            if (jsonData.reservation_id) {
                                setBookingId(jsonData.reservation_id);
                            }
                            setShowSuccessModal(true);
                            // Reset form
                            reset();
                            setNumberOfGuests('');
                            // Hide the JSON error message
                            (jsonResponseElement as HTMLElement).style.display = 'none';
                            return true;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                }
            }
            return false;
        };
        
        // Try to handle direct JSON response immediately
        handleDirectResponse();
        
        // Check flash messages
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
        
        // Add event listener for custom booking:success event
        const handleBookingSuccess = (event: CustomEvent) => {
            console.log("Custom booking success event:", event.detail);
            if (event.detail.reservationId) {
                setBookingId(event.detail.reservationId);
            }
            setShowSuccessModal(true);
            reset();
            setNumberOfGuests('');
        };
        
        window.addEventListener('booking:success', handleBookingSuccess as EventListener);
        
        return () => {
            window.removeEventListener('booking:success', handleBookingSuccess as EventListener);
        };
    }, [flash?.success, flash?.error]);

    // Form submission handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'check_in_date', 'check_out_date', 'room_type', 'room_number', 'number_of_guests'];
        let hasErrors = false;
        
        requiredFields.forEach(field => {
            if (!data[field]) {
                setError(field, `${field.replace(/_/g, ' ')} is required`);
                hasErrors = true;
            }
        });

        if (hasErrors) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Prevent multiple submissions
        if (isSubmitting) return;

        // Set submitting state for UI feedback
        setIsSubmitting(true);

        // Prepare the data for submission using the shared format function
        const check_in_formatted = data.check_in_date ? format(data.check_in_date as Date, 'yyyy-MM-dd') : '';
        const check_out_formatted = data.check_out_date ? format(data.check_out_date as Date, 'yyyy-MM-dd') : '';
        
        // Get accommodation_id from room type and room number
        const accommodation_id = getAccommodationId(data.room_type, data.room_number);
        
        if (accommodation_id === 0) {
            toast.error('Invalid room selection');
            setIsSubmitting(false);
            return;
        }
        
        // Prepare request data
        const requestData = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            accommodation_id: accommodation_id.toString(),
            check_in: check_in_formatted,
            check_out: check_out_formatted,
            number_of_guests: data.number_of_guests,
            special_requests: data.special_requests || '',
            notes: data.special_requests || '',
            total_amount: "0",
            address: 'Default Address',
            status: 'pending'
        };
        
        // Use axios to submit the form data with direct API endpoint
        axios.post('/reservations', requestData)
            .then(response => {
                console.log('API response:', response.data);
                
                if (response.data.success) {
                    // Store success in sessionStorage for retrieval on page refresh
                    sessionStorage.setItem('booking_success', JSON.stringify({
                        message: response.data.message,
                        reservation_id: response.data.reservation_id
                    }));
                    
                    // Set booking ID if available
                    if (response.data.reservation_id) {
                        setBookingId(response.data.reservation_id);
                    }
                    
                    // Reset the form
                    reset();
                    setNumberOfGuests('');
                    
                    // Show success modal
                    setShowSuccessModal(true);
                    
                    // Add special class to body to hide JSON error
                    document.body.classList.add('show-booking-confirmation');
                    
                    // Dispatch booking success event
                    window.dispatchEvent(new CustomEvent('booking:success', { 
                        detail: { 
                            message: response.data.message,
                            reservationId: response.data.reservation_id
                        } 
                    }));
                    
                    // Hide any Inertia error if present
                    const inertiaError = document.querySelector('.inertia-error');
                    if (inertiaError) {
                        (inertiaError as HTMLElement).style.display = 'none';
                    }
                } else {
                    // Handle server errors
                    toast.error(response.data.message || 'An error occurred while creating the reservation');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                
                if (axios.isAxiosError(error) && error.response) {
                    // Handle validation errors
                    if (error.response.status === 422 && error.response.data.errors) {
                        console.error('Validation errors:', error.response.data.errors);
                        toast.error('Please check the form for errors and try again.');
                    } else {
                        // General error
                        toast.error(error.response.data.message || 'An error occurred. Please try again.');
                    }
                } else {
                    // Network error
                    toast.error('Network error. Please check your connection and try again.');
                }
            })
            .finally(() => {
                setIsSubmitting(false);
        });
    };

    // Handle redirect to dashboard after successful booking
    const handleViewDashboard = () => {
        setShowSuccessModal(false);
        router.visit(route('dashboard'));
    };

    // Handle create new booking after successful one
    const handleNewBooking = () => {
        setShowSuccessModal(false);
        // Form is already reset, just close the modal
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
            
            {/* Add CSS to hide the JSON error when success is shown */}
            <style>
                {`
                body.show-booking-confirmation .inertia-error {
                    display: none !important;
                }
                `}
            </style>
            
            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                            Booking Successful!
                        </DialogTitle>
                        <DialogDescription>
                            Your reservation has been created successfully.
                            {bookingId && <span className="block font-medium">Reservation ID: {bookingId}</span>}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Thank you for booking with Sky Nature Park!</p>
                        <p className="mt-2">A confirmation has been sent to your email.</p>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button 
                            variant="outline" 
                            onClick={handleNewBooking}
                        >
                            Create Another Booking
                        </Button>
                        <Button
                            className="bg-[#47859e] hover:bg-[#3a7186]"
                            onClick={handleViewDashboard}
                        >
                            View Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <AppLayout breadcrumbs={[{ title: 'Create Booking', href: '/reservations/create' }]}>
                <Head title="New Booking" />
                <div className="container mx-auto select-none">
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
                                            <Label htmlFor="check-in">Check-in Date</Label>
                                            <Input
                                                id="check-in"
                                                type="date"
                                                value={data.check_in_date ? format(new Date(data.check_in_date), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => {
                                                    const dateValue = e.target.value ? new Date(e.target.value) : null;
                                                    setData('check_in_date', dateValue);
                                                    clearErrors('check_in_date');
                                                }}
                                                min={format(new Date(), 'yyyy-MM-dd')}
                                                onKeyDown={(e) => e.preventDefault()}
                                                className="max-w-[12rem]"
                                            />
                                            {errors.check_in_date && (
                                                <p className="text-sm text-red-500">{errors.check_in_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="check-out">Check-out Date</Label>
                                            <Input
                                                id="check-out"
                                                type="date"
                                                value={data.check_out_date ? format(new Date(data.check_out_date), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => {
                                                    const dateValue = e.target.value ? new Date(e.target.value) : null;
                                                    setData('check_out_date', dateValue);
                                                    clearErrors('check_out_date');
                                                }}
                                                min={data.check_in_date ? format(addDays(new Date(data.check_in_date), 1), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                                onKeyDown={(e) => e.preventDefault()}
                                                className="max-w-[12rem]"
                                            />
                                            {errors.check_out_date && (
                                                <p className="text-sm text-red-500">{errors.check_out_date}</p>
                                            )}
                                        </div>
                                        
                                        {/* Room Type Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="roomType">Room Type</Label>
                                            <Select
                                                value={data.room_type}
                                                onValueChange={(value) => handleInputChange('room_type', value)}
                                            >
                                                <SelectTrigger className={errors.room_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select room type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roomTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.room_type && (
                                                <p className="text-sm text-red-500">{errors.room_type}</p>
                                            )}
                                            {data.room_type && data.check_in_date && data.check_out_date && availableRoomNumbers.length === 0 && !isLoadingRooms && (
                                                <p className="text-sm text-amber-500">No {data.room_type}s available for the selected dates. Please try different dates or room type.</p>
                                            )}
                                            {data.room_type && data.check_in_date && data.check_out_date && availableRoomNumbers.length > 0 && !isLoadingRooms && (
                                                <p className="text-sm text-green-500">Found {availableRoomNumbers.length} available {data.room_type}{availableRoomNumbers.length > 1 ? 's' : ''}: {availableRoomNumbers.join(', ')}</p>
                                            )}
                                        </div>
                                        
                                        {/* Room Number Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="roomNumber">Room Number</Label>
                                            <Select
                                                value={data.room_number}
                                                onValueChange={(value) => handleInputChange('room_number', value)}
                                                disabled={!data.room_type || isLoadingRooms || availableRoomNumbers.length === 0}
                                            >
                                                <SelectTrigger className={errors.room_number ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={
                                                        !data.room_type ? "Select room type first" : 
                                                        isLoadingRooms ? "Loading..." : 
                                                        availableRoomNumbers.length === 0 ? "No rooms available" :
                                                        "Select room number"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoomNumbers.map((number) => (
                                                        <SelectItem key={number} value={number}>{number}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.room_number && (
                                                <p className="text-sm text-red-500">{errors.room_number}</p>
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
                                                    <SelectTrigger className={`flex-1 ${errors.number_of_guests && !numberOfGuests ? 'border-red-500' : ''}`}>
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
                                                        placeholder="number of guests"
                                                        value={data.number_of_guests}
                                                        onChange={e => handleInputChange('number_of_guests', e.target.value)}
                                                        className={`w-42 ${errors.number_of_guests ? 'border-red-500' : ''}`}
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
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="mr-2">Creating...</span>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </>
                                        ) : (
                                            'Create Reservation'
                                        )}
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